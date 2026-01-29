import uuid
from datetime import datetime, timezone

from sqlalchemy.orm import Session

from app.core.errors.error_codes import ErrorCode
from app.core.errors.exceptions import AppException
from app.repositories.scheduled_task_repository import ScheduledTaskRepository
from app.repositories.message_repository import MessageRepository
from app.repositories.run_repository import RunRepository
from app.repositories.session_repository import SessionRepository
from app.schemas.run import (
    RunClaimRequest,
    RunClaimResponse,
    RunFailRequest,
    RunResponse,
    RunStartRequest,
)
from app.services.usage_service import UsageService

usage_service = UsageService()


class RunService:
    """Service layer for run queue operations."""

    def _sync_scheduled_task_last_status(self, db: Session, run_id: uuid.UUID) -> None:
        """Sync AgentScheduledTask.last_run_status/last_error based on a run record."""
        db_run = RunRepository.get_by_id(db, run_id)
        if not db_run or not db_run.scheduled_task_id:
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

    def _extract_prompt_from_message(self, message_content: object) -> str | None:
        if not isinstance(message_content, dict):
            return None

        content_blocks = message_content.get("content")
        if not isinstance(content_blocks, list):
            return None

        for block in content_blocks:
            if not isinstance(block, dict):
                continue
            if "TextBlock" in str(block.get("_type", "")) and isinstance(
                block.get("text"), str
            ):
                return block["text"]
        return None

    def get_run(self, db: Session, run_id: uuid.UUID) -> RunResponse:
        db_run = RunRepository.get_by_id(db, run_id)
        if not db_run:
            raise AppException(
                error_code=ErrorCode.NOT_FOUND,
                message=f"Run not found: {run_id}",
            )
        run = RunResponse.model_validate(db_run)
        run.usage = usage_service.get_usage_summary_by_run(db, run_id)
        return run

    def list_runs(
        self,
        db: Session,
        session_id: uuid.UUID,
        limit: int = 100,
        offset: int = 0,
    ) -> list[RunResponse]:
        runs = RunRepository.list_by_session(db, session_id, limit=limit, offset=offset)
        responses = [RunResponse.model_validate(r) for r in runs]
        usage_by_run_id = usage_service.get_usage_summaries_by_run_ids(
            db, [r.id for r in runs]
        )
        for item in responses:
            item.usage = usage_by_run_id.get(item.run_id)
        return responses

    def claim_next_run(
        self, db: Session, request: RunClaimRequest
    ) -> RunClaimResponse | None:
        worker_id = request.worker_id.strip()
        if not worker_id:
            raise AppException(
                error_code=ErrorCode.BAD_REQUEST,
                message="worker_id cannot be empty",
            )

        schedule_modes = (
            [
                m.strip()
                for m in request.schedule_modes
                if isinstance(m, str) and m.strip()
            ]
            if request.schedule_modes
            else None
        )

        db_run = RunRepository.claim_next(
            session_db=db,
            worker_id=worker_id,
            lease_seconds=request.lease_seconds,
            schedule_modes=schedule_modes,
        )

        if not db_run:
            db.commit()
            return None

        db_session = SessionRepository.get_by_id(db, db_run.session_id)
        if not db_session:
            raise AppException(
                error_code=ErrorCode.NOT_FOUND,
                message=f"Session not found: {db_run.session_id}",
            )

        db_message = MessageRepository.get_by_id(db, db_run.user_message_id)
        if not db_message:
            raise AppException(
                error_code=ErrorCode.NOT_FOUND,
                message=f"Message not found: {db_run.user_message_id}",
            )

        prompt = (
            self._extract_prompt_from_message(db_message.content)
            or db_message.text_preview
        )

        if not prompt:
            raise AppException(
                error_code=ErrorCode.BAD_REQUEST,
                message="Unable to extract prompt from message",
            )

        db.commit()
        db.refresh(db_run)

        return RunClaimResponse(
            run=RunResponse.model_validate(db_run),
            user_id=db_session.user_id,
            prompt=prompt,
            config_snapshot=db_run.config_snapshot or db_session.config_snapshot,
            sdk_session_id=db_session.sdk_session_id,
        )

    def start_run(
        self, db: Session, run_id: uuid.UUID, request: RunStartRequest
    ) -> RunResponse:
        worker_id = request.worker_id.strip()
        if not worker_id:
            raise AppException(
                error_code=ErrorCode.BAD_REQUEST,
                message="worker_id cannot be empty",
            )

        db_run = RunRepository.get_by_id(db, run_id)
        if not db_run:
            raise AppException(
                error_code=ErrorCode.NOT_FOUND,
                message=f"Run not found: {run_id}",
            )

        if db_run.status in ["completed", "failed", "canceled"]:
            return RunResponse.model_validate(db_run)

        if db_run.status == "running":
            if db_run.claimed_by and db_run.claimed_by != worker_id:
                raise AppException(
                    error_code=ErrorCode.FORBIDDEN,
                    message="Run is claimed by another worker",
                )
            return RunResponse.model_validate(db_run)

        if db_run.status not in ["claimed", "queued"]:
            raise AppException(
                error_code=ErrorCode.BAD_REQUEST,
                message=f"Run status cannot be started: {db_run.status}",
            )

        if db_run.claimed_by and db_run.claimed_by != worker_id:
            raise AppException(
                error_code=ErrorCode.FORBIDDEN,
                message="Run is claimed by another worker",
            )

        now = datetime.now(timezone.utc)
        db_run.status = "running"
        db_run.started_at = now
        db_run.lease_expires_at = None
        db_run.attempts += 1

        db_session = SessionRepository.get_by_id(db, db_run.session_id)
        if not db_session:
            raise AppException(
                error_code=ErrorCode.NOT_FOUND,
                message=f"Session not found: {db_run.session_id}",
            )
        db_session.status = "running"

        self._sync_scheduled_task_last_status(db, db_run.id)
        db.commit()
        db.refresh(db_run)

        return RunResponse.model_validate(db_run)

    def fail_run(
        self,
        db: Session,
        run_id: uuid.UUID,
        request: RunFailRequest,
    ) -> RunResponse:
        worker_id = request.worker_id.strip()
        if not worker_id:
            raise AppException(
                error_code=ErrorCode.BAD_REQUEST,
                message="worker_id cannot be empty",
            )

        db_run = RunRepository.get_by_id(db, run_id)
        if not db_run:
            raise AppException(
                error_code=ErrorCode.NOT_FOUND,
                message=f"Run not found: {run_id}",
            )

        if db_run.claimed_by and db_run.claimed_by != worker_id:
            raise AppException(
                error_code=ErrorCode.FORBIDDEN,
                message="Run is claimed by another worker",
            )

        now = datetime.now(timezone.utc)
        db_run.status = "failed"
        db_run.last_error = request.error_message
        db_run.finished_at = now
        db_run.lease_expires_at = None

        db_session = SessionRepository.get_by_id(db, db_run.session_id)
        if db_session:
            db_session.status = "failed"

        self._sync_scheduled_task_last_status(db, db_run.id)
        db.commit()
        db.refresh(db_run)

        return RunResponse.model_validate(db_run)
