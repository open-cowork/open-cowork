import logging
import uuid
from typing import Any

from sqlalchemy.orm import Session

from app.repositories.usage_log_repository import UsageLogRepository
from app.schemas.usage import UsageResponse

logger = logging.getLogger(__name__)


class UsageService:
    """Service layer for usage statistics."""

    @staticmethod
    def _aggregate_logs(logs) -> UsageResponse:
        if not logs:
            return UsageResponse(
                total_cost_usd=None,
                total_duration_ms=None,
                usage_json=None,
            )

        # Aggregate scalar fields
        total_cost_usd = 0.0
        total_duration_ms = 0

        # Aggregate usage_json fields
        aggregated_usage: dict[str, Any] = {}

        for log in logs:
            if log.total_cost_usd is not None:
                total_cost_usd += float(log.total_cost_usd)
            if log.duration_ms is not None:
                total_duration_ms += log.duration_ms

            # Merge usage_json fields
            if log.usage_json:
                for key, value in log.usage_json.items():
                    if isinstance(value, int | float):
                        aggregated_usage[key] = aggregated_usage.get(key, 0) + value
                    else:
                        # For non-numeric fields, keep the last value
                        aggregated_usage[key] = value

        return UsageResponse(
            total_cost_usd=total_cost_usd,
            total_duration_ms=total_duration_ms,
            usage_json=aggregated_usage if aggregated_usage else None,
        )

    def get_usage_summary(self, db: Session, session_id: uuid.UUID) -> UsageResponse:
        """Gets aggregated usage statistics for a session.

        Args:
            db: Database session
            session_id: Session ID

        Returns:
            Aggregated usage statistics
        """
        logs = UsageLogRepository.list_by_session(db, session_id)

        usage = self._aggregate_logs(logs)

        if usage.total_cost_usd is not None or usage.total_duration_ms is not None:
            logger.debug(
                f"Retrieved usage summary for session {session_id}: "
                f"cost=${(usage.total_cost_usd or 0):.6f}, "
                f"duration={(usage.total_duration_ms or 0)}ms"
            )

        return usage

    def get_usage_summary_by_run(
        self, db: Session, run_id: uuid.UUID
    ) -> UsageResponse | None:
        logs = UsageLogRepository.list_by_run(db, run_id)
        if not logs:
            return None
        return self._aggregate_logs(logs)

    def get_usage_summaries_by_run_ids(
        self, db: Session, run_ids: list[uuid.UUID]
    ) -> dict[uuid.UUID, UsageResponse]:
        logs = UsageLogRepository.list_by_run_ids(db, run_ids)
        if not logs:
            return {}

        by_run: dict[uuid.UUID, list] = {}
        for log in logs:
            if log.run_id is None:
                continue
            by_run.setdefault(log.run_id, []).append(log)

        return {rid: self._aggregate_logs(items) for rid, items in by_run.items()}
