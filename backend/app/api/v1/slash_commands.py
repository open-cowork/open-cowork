from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session

from app.core.deps import get_current_user_id, get_db
from app.schemas.response import Response, ResponseSchema
from app.schemas.slash_command import (
    SlashCommandCreateRequest,
    SlashCommandResponse,
    SlashCommandUpdateRequest,
)
from app.services.slash_command_service import SlashCommandService

router = APIRouter(prefix="/slash-commands", tags=["slash-commands"])

service = SlashCommandService()


@router.get("", response_model=ResponseSchema[list[SlashCommandResponse]])
async def list_slash_commands(
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
) -> JSONResponse:
    result = service.list_commands(db, user_id=user_id)
    return Response.success(data=result, message="Slash commands retrieved")


@router.get("/{command_id}", response_model=ResponseSchema[SlashCommandResponse])
async def get_slash_command(
    command_id: int,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
) -> JSONResponse:
    result = service.get_command(db, user_id=user_id, command_id=command_id)
    return Response.success(data=result, message="Slash command retrieved")


@router.post("", response_model=ResponseSchema[SlashCommandResponse])
async def create_slash_command(
    request: SlashCommandCreateRequest,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
) -> JSONResponse:
    result = service.create_command(db, user_id=user_id, request=request)
    return Response.success(data=result, message="Slash command created")


@router.patch("/{command_id}", response_model=ResponseSchema[SlashCommandResponse])
async def update_slash_command(
    command_id: int,
    request: SlashCommandUpdateRequest,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
) -> JSONResponse:
    result = service.update_command(
        db,
        user_id=user_id,
        command_id=command_id,
        request=request,
    )
    return Response.success(data=result, message="Slash command updated")


@router.delete("/{command_id}", response_model=ResponseSchema[dict])
async def delete_slash_command(
    command_id: int,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
) -> JSONResponse:
    service.delete_command(db, user_id=user_id, command_id=command_id)
    return Response.success(data={"id": command_id}, message="Slash command deleted")
