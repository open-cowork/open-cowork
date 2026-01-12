import uuid
from typing import TYPE_CHECKING, Any

from sqlalchemy import JSON, BigInteger, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models import Base, TimestampMixin

if TYPE_CHECKING:
    from app.models.agent_session import AgentSession
    from app.models.tool_execution import ToolExecution


class AgentMessage(Base, TimestampMixin):
    __tablename__ = "agent_messages"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    session_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("agent_sessions.id", ondelete="CASCADE"), nullable=False
    )
    role: Mapped[str] = mapped_column(String(50), nullable=False)
    content: Mapped[dict[str, Any]] = mapped_column(JSON, nullable=False)
    text_preview: Mapped[str | None] = mapped_column(Text, nullable=True)

    session: Mapped["AgentSession"] = relationship(back_populates="messages")
    tool_executions: Mapped[list["ToolExecution"]] = relationship(
        back_populates="message", cascade="all, delete-orphan"
    )
