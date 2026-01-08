from fastapi import APIRouter, BackgroundTasks

from app.core.callback import CallbackClient
from app.core.engine import AgentExecutor
from app.hooks.callback import CallbackHook
from app.schemas.request import TaskRun

router = APIRouter(prefix="/v1/tasks")


@router.post("/execute")
async def run_task(req: TaskRun, background_tasks: BackgroundTasks):
    callback_client = CallbackClient(callback_url=req.callback_url)
    hooks = [CallbackHook(client=callback_client)]
    executor = AgentExecutor(req.session_id, hooks)

    background_tasks.add_task(executor.execute, prompt=req.prompt, config=req.config)

    return {"status": "accepted", "session_id": req.session_id}
