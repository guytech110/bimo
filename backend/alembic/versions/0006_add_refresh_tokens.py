"""Add refresh tokens table

Revision ID: 0006
Revises: 0005
Create Date: 2025-09-26

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '0006'
down_revision = '0005'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        'refreshtoken',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('token', sa.String(length=1024), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=True),
        sa.Column('revoked', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('expires_at', sa.DateTime(), nullable=True),
    )


def downgrade() -> None:
    op.drop_table('refreshtoken')


