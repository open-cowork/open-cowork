import json

from sqlalchemy.orm import Session

from app.models.slash_command import SlashCommand
from app.repositories.slash_command_repository import SlashCommandRepository


def _json_string(value: str) -> str:
    # JSON strings are valid YAML scalars, and handle escaping reliably.
    return json.dumps(value)


def _sanitize_raw_markdown(markdown: str) -> str:
    """Remove unsupported keys (e.g. model) from YAML front matter."""
    if not markdown:
        return ""

    text = markdown
    if text.startswith("\ufeff"):
        text = text[1:]

    lines = text.splitlines()
    if not lines or lines[0].strip() != "---":
        return markdown

    end_idx = None
    for i in range(1, len(lines)):
        if lines[i].strip() == "---":
            end_idx = i
            break
    if end_idx is None:
        return markdown

    front = lines[1:end_idx]
    body = lines[end_idx + 1 :]

    filtered_front: list[str] = []
    for line in front:
        if line.strip().lower().startswith("model:"):
            continue
        filtered_front.append(line)

    rebuilt = ["---", *filtered_front, "---", *body]
    result = "\n".join(rebuilt).rstrip() + "\n"
    return result


class SlashCommandConfigService:
    def resolve_user_commands(
        self,
        db: Session,
        *,
        user_id: str,
        names: list[str] | None = None,
    ) -> dict[str, str]:
        name_set = {n.strip() for n in (names or []) if n and n.strip()} or None

        commands = SlashCommandRepository.list_enabled_by_user(db, user_id=user_id)
        rendered: dict[str, str] = {}
        for cmd in commands:
            if name_set is not None and cmd.name not in name_set:
                continue
            rendered[cmd.name] = self._render_command(cmd)
        return rendered

    def _render_command(self, command: SlashCommand) -> str:
        mode = (command.mode or "").strip() or "raw"
        if mode == "structured":
            return self._render_structured(command)
        return _sanitize_raw_markdown(command.raw_markdown or "")

    @staticmethod
    def _render_structured(command: SlashCommand) -> str:
        front_lines: list[str] = []
        if command.allowed_tools:
            front_lines.append(f"allowed-tools: {_json_string(command.allowed_tools)}")
        if command.description:
            front_lines.append(f"description: {_json_string(command.description)}")
        if command.argument_hint:
            front_lines.append(f"argument-hint: {_json_string(command.argument_hint)}")

        body = (command.content or "").rstrip()
        if front_lines:
            front = "\n".join(front_lines)
            return f"---\n{front}\n---\n\n{body}\n"
        return body + "\n"
