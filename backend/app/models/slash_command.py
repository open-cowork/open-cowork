from sqlalchemy import Boolean, String, Text, UniqueConstraint, text
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base, TimestampMixin


class SlashCommand(Base, TimestampMixin):
    __tablename__ = "slash_commands"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    user_id: Mapped[str] = mapped_column(String(255), index=True, nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    mode: Mapped[str] = mapped_column(
        String(20),
        default="raw",
        server_default=text("'raw'"),
        nullable=False,
    )
    enabled: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        server_default=text("true"),
        nullable=False,
    )

    description: Mapped[str | None] = mapped_column(String(255), nullable=True)
    argument_hint: Mapped[str | None] = mapped_column(String(255), nullable=True)
    allowed_tools: Mapped[str | None] = mapped_column(Text, nullable=True)

    # When mode="structured", the command body is stored in `content` and the YAML front matter
    # is rendered from the structured fields above.
    content: Mapped[str | None] = mapped_column(Text, nullable=True)
    # When mode="raw", the command is stored as a full Markdown file (including optional front matter).
    raw_markdown: Mapped[str | None] = mapped_column(Text, nullable=True)

    __table_args__ = (
        UniqueConstraint("user_id", "name", name="uq_slash_command_user_name"),
    )
