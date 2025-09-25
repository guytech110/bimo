# Alembic Migration Notes (non-blocking)

This project currently uses SQLite with SQLModel create_all on startup. To align with the backend plan while avoiding any runtime change:

- We will introduce Alembic scaffolding in a future step without changing init_db behavior.
- Once ready to migrate to Postgres, we will:
  1) Initialize Alembic: `alembic init alembic`
  2) Configure `alembic.ini` sqlalchemy.url from `DATABASE_URL`
  3) Autogenerate baseline migration from current SQLModel metadata
  4) Switch `init_db` to rely on Alembic migrations (remove `create_all`), guarded by an env flag

Safe baseline models to include:
- ProviderConnection
- IdempotencyKey
- AuditLog

Until that switch, the app continues to function unchanged under SQLite.


