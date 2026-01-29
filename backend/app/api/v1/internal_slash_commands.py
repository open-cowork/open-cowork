from fastapi import APIRouter, Depends, Header
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session

from app.core.deps import get_current_user_id, get_db
from app.core.errors.error_codes import ErrorCode
from app.core.errors.exceptions import AppException
from app.core.settings import get_settings
from app.schemas.response import Response, ResponseSchema
from app.schemas.slash_command_config import SlashCommandResolveRequest
from app.services.slash_command_config_service import SlashCommandConfigService

router = APIRouter(prefix="/internal", tags=["internal"])

service = SlashCommandConfigService()


def require_internal_token(
    x_internal_token: str | None = Header(default=None, alias="X-Internal-Token"),
) -> None:
    settings = get_settings()
    if not settings.internal_api_token:
        raise AppException(
            error_code=ErrorCode.FORBIDDEN,
            message="Internal API token is not configured",
        )
    if not x_internal_token or x_internal_token != settings.internal_api_token:
        raise AppException(
            error_code=ErrorCode.FORBIDDEN,
            message="Invalid internal token",
        )


@router.post(
    "/slash-commands/resolve",
    response_model=ResponseSchema[dict[str, str]],
)
async def resolve_slash_commands(
    request: SlashCommandResolveRequest,
    _: None = Depends(require_internal_token),
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
) -> JSONResponse:
    resolved = service.resolve_user_commands(db, user_id=user_id, names=request.names)
    return Response.success(data=resolved, message="Slash commands resolved")
