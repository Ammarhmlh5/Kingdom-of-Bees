# Postgres Local Setup (developer notes)

This folder contains helpers to run a local Postgres for development.

Quick options:

- Preferred (if Docker available):

  ```powershell
  cd infra/postgres
  docker-compose up -d
  ```

- If Docker is not installed on host, use the existing Vagrant VM (if you have Vagrant):

  ```powershell
  cd infra/vagrant_vm
  vagrant up
  vagrant ssh
  # inside the VM: cd /workspace/infra/postgres && docker-compose up -d
  ```

Helper scripts (Windows PowerShell):

- `start-postgres.ps1` — attempts to run `docker-compose up -d` if `docker` is on PATH.
- `prisma-push.ps1` — runs `npx prisma db push --accept-data-loss` in the platform package.

Environment

- Example DB URL is shown in `.env.example` in this folder. The platform package reads `DATABASE_URL_PLATFORM` from its own `.env`.

Troubleshooting

- If Prisma reports authentication errors, verify the DB host/port and credentials in `packages/db/packages/platform/.env`.
- If you cannot run Docker here, you can rely on the platform server fallback which appends raw events to `infra/postgres/project2/ingest_events.jsonl`.

