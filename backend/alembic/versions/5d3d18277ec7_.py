"""empty message

Revision ID: 5d3d18277ec7
Revises: 604f9cc61bd7
Create Date: 2026-01-31 14:59:36.079384

"""

from typing import Sequence, Union

import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "5d3d18277ec7"
down_revision: Union[str, Sequence[str], None] = "604f9cc61bd7"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column(
        "user_mcp_installs",
        sa.Column(
            "is_deleted",
            sa.Boolean(),
            server_default=sa.text("false"),
            nullable=False,
        ),
    )
    op.add_column(
        "user_skill_installs",
        sa.Column(
            "is_deleted",
            sa.Boolean(),
            server_default=sa.text("false"),
            nullable=False,
        ),
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column("user_skill_installs", "is_deleted")
    op.drop_column("user_mcp_installs", "is_deleted")
