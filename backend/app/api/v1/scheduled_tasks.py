import uuid

from fastapi import APIRouter, Depends, Query
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session

from app.core.deps import get_current_user_id, get_db
from app.schemas.response import Response, ResponseSchema
from app.schemas.run import RunResponse
from app.schemas.scheduled_task import (
    ScheduledTaskCreateRequest,
    ScheduledTaskResponse,
    ScheduledTaskTriggerResponse,
    ScheduledTaskUpdateRequest,
)
from app.services.scheduled_task_service import ScheduledTaskService
from app.repositories.run_repository import RunRepository
from app.repositories.scheduled_task_repository import ScheduledTaskRepository
from app.services.usage_service import UsageService
from app.core.errors.error_codes import ErrorCode
from app.core.errors.exceptions import AppException

router = APIRouter(prefix="/scheduled-tasks", tags=["scheduled-tasks"])

scheduled_task_service = ScheduledTaskService()
usage_service = UsageService()


@router.post("", response_model=ResponseSchema[ScheduledTaskResponse])
async def create_scheduled_task(
    request: ScheduledTaskCreateRequest,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
) -> JSONResponse:
    result = scheduled_task_service.create_task(db, user_id, request)
    return Response.success(data=result, message="Scheduled task created")


@router.get("", response_model=ResponseSchema[list[ScheduledTaskResponse]])
async def list_scheduled_tasks(
    user_id: str = Depends(get_current_user_id),
    limit: int = 100,
    offset: int = 0,
    db: Session = Depends(get_db),
) -> JSONResponse:
    result = scheduled_task_service.list_tasks(db, user_id, limit=limit, offset=offset)
    return Response.success(data=result, message="Scheduled tasks retrieved")


@router.get("/{task_id}", response_model=ResponseSchema[ScheduledTaskResponse])
async def get_scheduled_task(
    task_id: uuid.UUID,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
) -> JSONResponse:
    result = scheduled_task_service.get_task(db, user_id, task_id)
    return Response.success(data=result, message="Scheduled task retrieved")


@router.patch("/{task_id}", response_model=ResponseSchema[ScheduledTaskResponse])
async def update_scheduled_task(
    task_id: uuid.UUID,
    request: ScheduledTaskUpdateRequest,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
) -> JSONResponse:
    result = scheduled_task_service.update_task(db, user_id, task_id, request)
    return Response.success(data=result, message="Scheduled task updated")


@router.delete("/{task_id}", response_model=ResponseSchema[dict])
async def delete_scheduled_task(
    task_id: uuid.UUID,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
) -> JSONResponse:
    scheduled_task_service.delete_task(db, user_id, task_id)
    return Response.success(data={"id": task_id}, message="Scheduled task deleted")


@router.post(
    "/{task_id}/trigger", response_model=ResponseSchema[ScheduledTaskTriggerResponse]
)
async def trigger_scheduled_task(
    task_id: uuid.UUID,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
) -> JSONResponse:
    result = scheduled_task_service.trigger_task(db, user_id, task_id)
    return Response.success(data=result, message="Scheduled task triggered")


@router.get("/{task_id}/runs", response_model=ResponseSchema[list[RunResponse]])
async def list_scheduled_task_runs(
    task_id: uuid.UUID,
    user_id: str = Depends(get_current_user_id),
    limit: int = Query(default=100, ge=1, le=500),
    offset: int = Query(default=0, ge=0),
    db: Session = Depends(get_db),
) -> JSONResponse:
    db_task = ScheduledTaskRepository.get_by_id(db, task_id)
    if not db_task:
        raise AppException(
            error_code=ErrorCode.NOT_FOUND,
            message=f"Scheduled task not found: {task_id}",
        )
    if db_task.user_id != user_id:
        raise AppException(
            error_code=ErrorCode.FORBIDDEN,
            message="Scheduled task does not belong to the user",
        )
    runs = RunRepository.list_by_scheduled_task(db, task_id, limit=limit, offset=offset)
    usage_by_run_id = usage_service.get_usage_summaries_by_run_ids(
        db, [r.id for r in runs]
    )
    return Response.success(
        data=[
            RunResponse.model_validate(r).model_copy(
                update={"usage": usage_by_run_id.get(r.id)}
            )
            for r in runs
        ],
        message="Scheduled task runs retrieved",
    )
