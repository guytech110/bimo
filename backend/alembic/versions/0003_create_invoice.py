"""Create invoices table for billing ingestion

This migration creates a simple `invoice` table to store ingested billing
records. It's conservative and nullable to avoid breaking existing data.
"""
from alembic import op
import sqlalchemy as sa

revision = '0003'
down_revision = '0002'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        'invoice',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('provider', sa.String(length=255), nullable=False),
        sa.Column('provider_invoice_id', sa.String(length=255), nullable=True),
        sa.Column('amount', sa.Float(), nullable=False, server_default='0'),
        sa.Column('currency', sa.String(length=16), nullable=True),
        sa.Column('period_start', sa.DateTime(), nullable=True),
        sa.Column('period_end', sa.DateTime(), nullable=True),
        sa.Column('source', sa.String(length=32), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
    )


def downgrade():
    op.drop_table('invoice')


