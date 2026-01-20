import re
from datetime import datetime, timedelta, timezone
from typing import Any

from app.core.errors.error_codes import ErrorCode
from app.core.errors.exceptions import AppException
from app.services.backend_client import BackendClient


_ENV_PATTERN = re.compile(r"\$\{([^}]+)\}")


def _resolve_env_value(value: Any, env_map: dict[str, str]) -> Any:
    if isinstance(value, str):
        matches = _ENV_PATTERN.findall(value)
        if not matches:
            return value
        resolved = value
        for token in matches:
            if token.startswith("env:"):
                var = token[4:]
                default = None
            else:
                parts = token.split(":-", 1)
                var = parts[0]
                default = parts[1] if len(parts) > 1 else None

            if var in env_map:
                value_str = env_map[var]
            elif default is not None:
                value_str = default
            else:
                raise AppException(
                    error_code=ErrorCode.ENV_VAR_NOT_FOUND,
                    message=f"Env var not found: {var}",
                )

            resolved = resolved.replace(f"${{{token}}}", value_str)
        return resolved
    if isinstance(value, list):
        return [_resolve_env_value(v, env_map) for v in value]
    if isinstance(value, dict):
        return {k: _resolve_env_value(v, env_map) for k, v in value.items()}
    return value


class ConfigResolver:
    def __init__(self, backend_client: BackendClient | None = None) -> None:
        self.backend_client = backend_client or BackendClient()
        self._cache_until: datetime | None = None
        self._skill_presets: dict[str, dict] = {}

    async def resolve(self, user_id: str, config_snapshot: dict) -> dict:
        await self._ensure_cache()
        env_map = await self._get_env_map(user_id)

        mcp_config = config_snapshot.get("mcp_config") or {}
        skill_files = config_snapshot.get("skill_files") or {}
        input_files = config_snapshot.get("input_files") or []

        resolved_mcp = self._resolve_mcp(mcp_config, env_map)
        resolved_skills = self._resolve_skills(skill_files, env_map)
        resolved_inputs = _resolve_env_value(input_files, env_map)

        resolved = dict(config_snapshot)
        resolved["mcp_config"] = resolved_mcp
        resolved["skill_files"] = resolved_skills
        resolved["input_files"] = resolved_inputs
        return resolved

    async def _ensure_cache(self) -> None:
        now = datetime.now(timezone.utc)
        if self._cache_until and now < self._cache_until:
            return
        skill_presets = await self.backend_client.list_skill_presets(
            include_inactive=True
        )
        self._skill_presets = {p["name"]: p for p in skill_presets}
        self._cache_until = now + timedelta(seconds=60)

    async def _get_env_map(self, user_id: str) -> dict[str, str]:
        return await self.backend_client.get_env_map(user_id=user_id)

    def _resolve_mcp(self, mcp_config: dict, env_map: dict[str, str]) -> dict:
        resolved: dict = {}
        for name, config in mcp_config.items():
            if not isinstance(config, dict):
                resolved[name] = config
                continue
            resolved[name] = _resolve_env_value(config, env_map)
        return resolved

    def _resolve_skills(self, skills: dict, env_map: dict[str, str]) -> dict:
        resolved: dict = {}
        for name, config in skills.items():
            if not isinstance(config, dict):
                continue
            if config.get("enabled") is False:
                resolved[name] = {"enabled": False}
                continue
            ref = config.get("$ref")
            if ref:
                preset_name = ref.split(":", 1)[-1]
                preset = self._skill_presets.get(preset_name)
                if not preset or not preset.get("is_active", True):
                    raise AppException(
                        error_code=ErrorCode.SKILL_PRESET_NOT_FOUND,
                        message=f"Skill preset not found: {preset_name}",
                    )
                base = {"enabled": True, "entry": preset.get("entry")}
                default_config = preset.get("default_config") or {}
                base["config"] = default_config
                override = {k: v for k, v in config.items() if k != "$ref"}
                base.update(override)
                resolved[name] = _resolve_env_value(base, env_map)
            else:
                resolved[name] = _resolve_env_value(config, env_map)
        return resolved
