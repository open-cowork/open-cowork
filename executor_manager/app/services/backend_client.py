import httpx

from app.core.settings import get_settings


class BackendClient:
    """Client for communicating with the Backend service."""

    def __init__(self) -> None:
        self.settings = get_settings()
        self.base_url = self.settings.backend_url

    async def create_session(self, user_id: str, config: dict) -> dict:
        """Create a session, returns session info dict with session_id and sdk_session_id."""
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.base_url}/api/v1/sessions",
                json={"user_id": user_id, "config": config},
            )
            response.raise_for_status()
            data = response.json()
            return data["data"]

    async def update_session_status(self, session_id: str, status: str) -> None:
        """Update session status."""
        async with httpx.AsyncClient() as client:
            response = await client.patch(
                f"{self.base_url}/api/v1/sessions/{session_id}",
                json={"status": status},
            )
            response.raise_for_status()

    async def forward_callback(self, callback_data: dict) -> None:
        """Forward Executor callback to Backend."""
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.base_url}/api/v1/callback",
                json=callback_data,
            )
            response.raise_for_status()

    async def claim_run(
        self,
        worker_id: str,
        lease_seconds: int = 30,
        schedule_modes: list[str] | None = None,
    ) -> dict | None:
        """Claim next run from backend queue."""
        payload: dict = {"worker_id": worker_id, "lease_seconds": lease_seconds}
        if schedule_modes:
            payload["schedule_modes"] = schedule_modes

        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.base_url}/api/v1/runs/claim",
                json=payload,
            )
            response.raise_for_status()
            data = response.json()
            return data.get("data")

    async def start_run(self, run_id: str, worker_id: str) -> dict:
        """Mark run as running."""
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.base_url}/api/v1/runs/{run_id}/start",
                json={"worker_id": worker_id},
            )
            response.raise_for_status()
            data = response.json()
            return data["data"]

    async def fail_run(
        self, run_id: str, worker_id: str, error_message: str | None = None
    ) -> dict:
        """Mark run as failed."""
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.base_url}/api/v1/runs/{run_id}/fail",
                json={"worker_id": worker_id, "error_message": error_message},
            )
            response.raise_for_status()
            data = response.json()
            return data["data"]

    async def get_env_map(self, user_id: str) -> dict[str, str]:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.base_url}/api/v1/internal/env-vars/map",
                headers={
                    "X-Internal-Token": self.settings.internal_api_token,
                    "X-User-Id": user_id,
                },
            )
            response.raise_for_status()
            data = response.json()
            return data.get("data", {}) or {}

    async def list_skill_presets(self, include_inactive: bool = False) -> list[dict]:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.base_url}/api/v1/skill-presets",
                params={"include_inactive": str(include_inactive).lower()},
            )
            response.raise_for_status()
            data = response.json()
            return data.get("data", [])

    async def create_user_input_request(self, payload: dict) -> dict:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.base_url}/api/v1/internal/user-input-requests",
                json=payload,
                headers={"X-Internal-Token": self.settings.internal_api_token},
            )
            response.raise_for_status()
            data = response.json()
            return data["data"]

    async def get_user_input_request(self, request_id: str) -> dict:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.base_url}/api/v1/internal/user-input-requests/{request_id}",
                headers={"X-Internal-Token": self.settings.internal_api_token},
            )
            response.raise_for_status()
            data = response.json()
            return data["data"]
