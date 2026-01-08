from claude_agent_sdk import ClaudeAgentOptions
from claude_agent_sdk.client import ClaudeSDKClient

from app.core.workspace import WorkspaceManager
from app.hooks.base import ExecutionContext
from app.hooks.manager import HookManager
from app.schemas.request import TaskConfig


class AgentExecutor:
    def __init__(self, session_id: str, hooks: list):
        self.session_id = session_id
        self.hooks = HookManager(hooks)
        self.workspace = WorkspaceManager(
            mount_path="/Users/qychen/01-Develop/toto/test_workspace"
        )

    async def execute(self, prompt: str, config: TaskConfig):
        await self.workspace.prepare(config)
        ctx = ExecutionContext(self.session_id, str(self.workspace.root_path))

        try:
            await self.hooks.run_on_setup(ctx)

            options = ClaudeAgentOptions(
                cwd=ctx.cwd,
                setting_sources=["project"],
                mcp_servers=config.mcp_config,
                permission_mode="bypassPermissions",
            )

            async with ClaudeSDKClient(options=options) as client:
                await client.query(prompt)
                async for msg in client.receive_response():
                    await self.hooks.run_on_response(ctx, msg)

        except Exception as e:
            import traceback

            traceback.print_exc()
            await self.hooks.run_on_error(ctx, e)

        finally:
            await self.hooks.run_on_teardown(ctx)
            await self.workspace.cleanup()
