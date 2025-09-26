"""Add auth tables

Revision ID: 0005
Revises: 0004_create_apikey
Create Date: 2025-09-26

"""
from alembic import op
import sqlalchemy as sa
import sqlmodel


# revision identifiers, used by Alembic.
revision = '0005'
down_revision = '0004_create_apikey'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create user table
    op.create_table(
        'user',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('email', sqlmodel.sql.sqltypes.AutoString(), nullable=False),
        sa.Column('hashed_password', sqlmodel.sql.sqltypes.AutoString(), nullable=False),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('is_admin', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_user_email'), 'user', ['email'], unique=True)
    
    # Create devicetoken table
    op.create_table(
        'devicetoken',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('device_code', sqlmodel.sql.sqltypes.AutoString(), nullable=False),
        sa.Column('user_code', sqlmodel.sql.sqltypes.AutoString(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=True),
        sa.Column('status', sqlmodel.sql.sqltypes.AutoString(), nullable=False),
        sa.Column('access_token', sqlmodel.sql.sqltypes.AutoString(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('expires_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['user.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_devicetoken_device_code'), 'devicetoken', ['device_code'], unique=True)
    op.create_index(op.f('ix_devicetoken_user_code'), 'devicetoken', ['user_code'], unique=False)
    
    # Add user_id to providerconnection
    op.add_column('providerconnection', sa.Column('user_id', sa.Integer(), nullable=True))
    op.create_foreign_key(None, 'providerconnection', 'user', ['user_id'], ['id'])


def downgrade() -> None:
    op.drop_constraint(None, 'providerconnection', type_='foreignkey')
    op.drop_column('providerconnection', 'user_id')
    op.drop_index(op.f('ix_devicetoken_user_code'), table_name='devicetoken')
    op.drop_index(op.f('ix_devicetoken_device_code'), table_name='devicetoken')
    op.drop_table('devicetoken')
    op.drop_index(op.f('ix_user_email'), table_name='user')
    op.drop_table('user')
