import logging
import uuid
from datetime import datetime, timezone
from typing import Any

from sqlalchemy.orm import Session

from app.models.agent_run import AgentRun
from app.repositories.scheduled_task_repository import ScheduledTaskRepository
from app.repositories.message_repository import MessageRepository
from app.repositories.tool_execution_repository import ToolExecutionRepository
from app.repositories.usage_log_repository import UsageLogRepository
from app.schemas.callback import (
    AgentCallbackRequest,
    CallbackResponse,
    CallbackStatus,
)
from app.schemas.session import SessionUpdateRequest
from app.services.session_service import SessionService

logger = logging.getLogger(__name__)


class CallbackService:
    """Service layer for processing executor callbacks."""

    def _sync_scheduled_task_last_status(self, db: Session, db_run: AgentRun) -> None:
        """Keep AgentScheduledTask.last_run_status in sync with the latest run state.

        The UI relies on AgentScheduledTask.last_run_status/last_error to show execution
        results without scanning the whole run history.
        """
        if not db_run.scheduled_task_id:
            return

        db_task = ScheduledTaskRepository.get_by_id(db, db_run.scheduled_task_id)
        if not db_task:
            return

        # Avoid older runs overriding the latest run status.
        if db_task.last_run_id and db_task.last_run_id != db_run.id:
            return

        db_task.last_run_id = db_run.id
        db_task.last_run_status = db_run.status

        if db_run.status == "failed":
            db_task.last_error = db_run.last_error or db_task.last_error
        elif db_run.status == "completed":
            db_task.last_error = None

    def _extract_sdk_session_id_from_message(
        self, message: dict[str, Any]
    ) -> str | None:
        message_type = message.get("_type", "")

        if "ResultMessage" in message_type and isinstance(
            message.get("session_id"), str
        ):
            return message["session_id"]

        if "SystemMessage" in message_type and message.get("subtype") == "init":
            data = message.get("data", {})
            if not isinstance(data, dict):
                return None
            inner = data.get("data")
            if isinstance(inner, dict) and isinstance(inner.get("session_id"), str):
                return inner["session_id"]
            if isinstance(data.get("session_id"), str):
                return data["session_id"]

        return None

    def _extract_role_from_message(self, message: dict[str, Any]) -> str:
        message_type = message.get("_type", "")

        if "AssistantMessage" in message_type:
            return "assistant"
        elif "UserMessage" in message_type:
            return "user"
        elif "SystemMessage" in message_type:
            return "system"

        logger.warning(
            "unknown_message_type_default_role",
            extra={"message_type": message_type, "default_role": "assistant"},
        )
        return "assistant"

    def _extract_tool_executions(
        self,
        session_db: Session,
        message: dict[str, Any],
        session_id: uuid.UUID,
        message_id: int,
    ) -> None:
        content = message.get("content", [])
        if not isinstance(content, list):
            return

        for block in content:
            if not isinstance(block, dict):
                continue

            block_type = block.get("_type", "")

            if "ToolUseBlock" in block_type:
                tool_use_id = block.get("id")
                tool_name = block.get("name")
                tool_input = block.get("input")

                if not tool_use_id or not tool_name:
                    continue

                existing = ToolExecutionRepository.get_by_session_and_tool_use_id(
                    session_db=session_db,
                    session_id=session_id,
                    tool_use_id=tool_use_id,
                )
                if existing:
                    existing.tool_name = tool_name
                    existing.tool_input = tool_input
                    existing.message_id = message_id
                    logger.debug(
                        f"Updated tool execution (tool_use_id={tool_use_id}) in message {message_id}"
                    )
                    continue

                ToolExecutionRepository.create(
                    session_db=session_db,
                    session_id=session_id,
                    message_id=message_id,
                    tool_use_id=tool_use_id,
                    tool_name=tool_name,
                    tool_input=tool_input,
                )
                logger.debug(
                    f"Created tool execution (tool_use_id={tool_use_id}, tool={tool_name}) in message {message_id}"
                )

            elif "ToolResultBlock" in block_type:
                tool_use_id = block.get("tool_use_id")
                result_content = block.get("content")
                is_error = block.get("is_error", False)

                if not tool_use_id:
                    continue

                tool_output = {"content": result_content} if result_content else None
                existing = ToolExecutionRepository.get_by_session_and_tool_use_id(
                    session_db=session_db,
                    session_id=session_id,
                    tool_use_id=tool_use_id,
                )

                if not existing:
                    ToolExecutionRepository.create(
                        session_db=session_db,
                        session_id=session_id,
                        message_id=message_id,
                        tool_use_id=tool_use_id,
                        tool_name="unknown",
                        tool_output=tool_output,
                        result_message_id=message_id,
                        is_error=bool(is_error),
                    )
                    logger.debug(
                        f"Created tool execution placeholder (tool_use_id={tool_use_id}) in message {message_id}"
                    )
                    continue

                existing.tool_output = tool_output
                existing.result_message_id = message_id
                existing.is_error = bool(is_error)

                if existing.duration_ms is None and existing.created_at is not None:
                    duration = datetime.now(timezone.utc) - existing.created_at
                    existing.duration_ms = int(duration.total_seconds() * 1000)

                logger.debug(
                    f"Updated tool execution result (tool_use_id={tool_use_id}) in message {message_id}"
                )

    def _extract_and_persist_usage(
        self, db: Session, session_id: uuid.UUID, message: dict[str, Any]
    ) -> None:
        """Extracts and persists usage data from a ResultMessage."""
        message_type = message.get("_type", "")

        if "ResultMessage" not in message_type:
            return

        usage_data = message.get("usage")
        if not usage_data or not isinstance(usage_data, dict):
            logger.debug(f"No usage data in ResultMessage for session {session_id}")
            return

        total_cost_usd = message.get("total_cost_usd")
        duration_ms = message.get("duration_ms")

        db_run = (
            db.query(AgentRun)
            .filter(AgentRun.session_id == session_id)
            .filter(AgentRun.status.in_(["claimed", "running"]))
            .order_by(AgentRun.created_at.desc())
            .first()
        )

        UsageLogRepository.create(
            session_db=db,
            session_id=session_id,
            run_id=db_run.id if db_run else None,
            total_cost_usd=total_cost_usd,
            duration_ms=duration_ms,
            usage_json=usage_data,
        )
        db.commit()

        input_tokens = usage_data.get("input_tokens")
        output_tokens = usage_data.get("output_tokens")

        logger.info(
            "usage_log_persisted",
            extra={
                "session_id": str(session_id),
                "run_id": str(db_run.id) if db_run else None,
                "cost_usd": total_cost_usd,
                "input_tokens": input_tokens,
                "output_tokens": output_tokens,
                "duration_ms": duration_ms,
            },
        )

    def _persist_message_and_tools(
        self, db: Session, session_id: uuid.UUID, message: dict[str, Any]
    ) -> None:
        role = self._extract_role_from_message(message)

        text_preview = None
        content = message.get("content", [])
        if isinstance(content, list) and len(content) > 0:
            for block in content:
                if isinstance(block, dict) and "TextBlock" in block.get("_type", ""):
                    text_preview = block.get("text", "")[:500]
                    break

        db_message = MessageRepository.create(
            session_db=db,
            session_id=session_id,
            role=role,
            content=message,
            text_preview=text_preview,
        )

        db.flush()

        self._extract_tool_executions(db, message, session_id, db_message.id)

        db.commit()
        logger.debug(
            "message_persisted",
            extra={
                "session_id": str(session_id),
                "message_id": db_message.id,
                "role": role,
            },
        )

    def process_agent_callback(
        self, db: Session, callback: AgentCallbackRequest
    ) -> CallbackResponse:
        session_service = SessionService()
        db_session = session_service.find_session_by_sdk_id_or_uuid(
            db, callback.session_id
        )

        if not db_session:
            logger.warning(
                "callback_session_not_found",
                extra={"callback_session_id": callback.session_id},
            )
            return CallbackResponse(
                session_id=callback.session_id,
                status="callback_received",
                message="Session not found yet",
            )

        derived_sdk_session_id = callback.sdk_session_id
        if (
            not derived_sdk_session_id
            and callback.new_message
            and isinstance(callback.new_message, dict)
        ):
            derived_sdk_session_id = self._extract_sdk_session_id_from_message(
                callback.new_message
            )

        update_data: dict[str, Any] = {}

        if (
            derived_sdk_session_id
            and derived_sdk_session_id != db_session.sdk_session_id
        ):
            update_data["sdk_session_id"] = derived_sdk_session_id

        if callback.status in [CallbackStatus.COMPLETED, CallbackStatus.FAILED]:
            update_data["status"] = callback.status.value

        if callback.state_patch is not None:
            update_data["state_patch"] = callback.state_patch.model_dump(mode="json")

        if callback.workspace_files_prefix is not None:
            update_data["workspace_files_prefix"] = callback.workspace_files_prefix
        if callback.workspace_manifest_key is not None:
            update_data["workspace_manifest_key"] = callback.workspace_manifest_key
        if callback.workspace_archive_key is not None:
            update_data["workspace_archive_key"] = callback.workspace_archive_key
        if callback.workspace_export_status is not None:
            update_data["workspace_export_status"] = callback.workspace_export_status

        if update_data:
            db_session = session_service.update_session(
                db, db_session.id, SessionUpdateRequest(**update_data)
            )
            if "sdk_session_id" in update_data:
                logger.info(
                    "session_sdk_session_id_updated",
                    extra={
                        "session_id": str(db_session.id),
                        "sdk_session_id": derived_sdk_session_id,
                    },
                )
            if "status" in update_data:
                logger.info(
                    "session_status_updated_via_callback",
                    extra={
                        "session_id": str(db_session.id),
                        "status": callback.status.value,
                        "callback_session_id": callback.session_id,
                    },
                )

        if callback.new_message:
            self._persist_message_and_tools(db, db_session.id, callback.new_message)
            # Extract and persist usage data if this is a ResultMessage
            self._extract_and_persist_usage(db, db_session.id, callback.new_message)

        db_run = (
            db.query(AgentRun)
            .filter(AgentRun.session_id == db_session.id)
            .filter(AgentRun.status.in_(["claimed", "running"]))
            .order_by(AgentRun.created_at.desc())
            .first()
        )

        if db_run:
            db_run.progress = int(callback.progress or 0)

            if callback.status == CallbackStatus.RUNNING and db_run.status == "claimed":
                db_run.status = "running"
                if db_run.started_at is None:
                    db_run.started_at = datetime.now(timezone.utc)

            if callback.status in [CallbackStatus.COMPLETED, CallbackStatus.FAILED]:
                db_run.status = callback.status.value
                db_run.finished_at = datetime.now(timezone.utc)
                if callback.status == CallbackStatus.COMPLETED:
                    db_run.progress = 100

            self._sync_scheduled_task_last_status(db, db_run)
            db.commit()

        return CallbackResponse(
            session_id=str(db_session.id),
            status=db_session.status,
            callback_status=callback.status,
        )
