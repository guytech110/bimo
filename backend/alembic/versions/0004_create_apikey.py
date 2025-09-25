"""Create apikeys table for RBAC and per-key rate limits

Conservative migration creating ApiKey table used for RBAC.
"""
from alembic import op
import sqlalchemy as sa

revision = '0004'
down_revision = '0003'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        'apikey',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('key', sa.String(length=255), nullable=False, unique=True),
        sa.Column('org_id', sa.String(length=255), nullable=True),
        sa.Column('role', sa.String(length=32), nullable=True),
        sa.Column('rate_limit', sa.String(length=64), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
    )


def downgrade():
    op.drop_table('apikey')


