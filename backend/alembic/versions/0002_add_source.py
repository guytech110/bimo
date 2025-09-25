"""Add nullable `source` columns to key usage tables.

This migration is intentionally conservative:
- adds a nullable `source` VARCHAR column (no enum type creation)
- adds a CHECK constraint to validate values ('dev','prod','billing')
- only runs the add if the table exists and the column is not present

This keeps the migration safe for SQLite and Postgres and avoids data
transformations during the change.
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy import inspect

revision = '0002'
down_revision = '0001'
branch_labels = None
depends_on = None

TABLES = [
    "api_logs",
    "provider_metrics_daily",
]

CHECK_SQL = "source IN ('dev','prod','billing')"


def upgrade():
    bind = op.get_bind()
    inspector = inspect(bind)
    existing_tables = inspector.get_table_names()

    for table in TABLES:
        if table not in existing_tables:
            # skip missing tables (safe)
            continue

        cols = [c['name'] for c in inspector.get_columns(table)]
        if 'source' in cols:
            continue

        # add nullable string column
        op.add_column(table, sa.Column('source', sa.String(length=16), nullable=True))
        # add check constraint to validate allowed values
        op.create_check_constraint(f"ck_{table}_source_enum", table, CHECK_SQL)


def downgrade():
    bind = op.get_bind()
    inspector = inspect(bind)
    existing_tables = inspector.get_table_names()

    for table in TABLES:
        if table not in existing_tables:
            continue

        cols = [c['name'] for c in inspector.get_columns(table)]
        if 'source' not in cols:
            continue

        # drop check constraint if present, then drop column
        try:
            op.drop_constraint(f"ck_{table}_source_enum", table_name=table, type_='check')
        except Exception:
            pass
        try:
            op.drop_column(table, 'source')
        except Exception:
            pass


