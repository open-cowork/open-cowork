from pydantic import BaseModel, Field


class SlashCommandResolveRequest(BaseModel):
    """Request to resolve enabled slash commands for execution."""

    names: list[str] = Field(default_factory=list)
