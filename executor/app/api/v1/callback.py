from fastapi import APIRouter

from app.schemas.callback import AgentReportCallback

router = APIRouter(prefix="/v1/callback")


@router.post("/receive")
async def receive_callback(report: AgentReportCallback) -> dict:
    """Receive callback report from agent execution.

    Args:
        report: The agent execution report containing state and progress.

    Returns:
        Confirmation message with session ID.
    """
    print(
        f"[Callback] Session: {report.session_id} | Status: {report.status} | Progress: {report.progress}%"
    )

    if report.state_patch and report.state_patch.workspace_state:
        ws = report.state_patch.workspace_state
        print(
            f"[Workspace] {ws.repository} ({ws.branch}): +{ws.total_added_lines}/-{ws.total_deleted_lines}, {len(ws.file_changes)} files changed"
        )

    return {
        "status": "received",
        "session_id": report.session_id,
        "message": "Callback received and logged",
    }


@router.get("/health")
async def health_check() -> dict:
    """Health check endpoint.

    Returns:
        Service health status.
    """
    return {"status": "healthy", "service": "callback-receiver"}
