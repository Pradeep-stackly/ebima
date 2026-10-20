"""add order date status index

Revision ID: 1d3a9ebbf0a1
Revises: 4f2d55bf4f34
Create Date: 2026-10-20 15:59:10.269952

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '1d3a9ebbf0a1'
down_revision: Union[str, Sequence[str], None] = '4f2d55bf4f34'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.drop_index(op.f('ix_orders_order_date'), table_name='orders')
    op.create_index('ix_orders_order_date_status', 'orders', ['order_date', 'status'], unique=False)


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index('ix_orders_order_date_status', table_name='orders')
    op.create_index(op.f('ix_orders_order_date'), 'orders', ['order_date'], unique=False)
