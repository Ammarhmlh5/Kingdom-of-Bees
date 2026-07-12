# Quick README for applying the Supabase schema

This folder contains SQL and a small script to create the minimal tables used by the platform.

Files:
- infra/supabase/init_schema.sql — SQL that creates user_profile and sync_event.
- packages/db/packages/platform/tools/apply_supabase_sql.cjs — Node script that connects to a Postgres
  database and applies the SQL. It requires pg installed in packages/db/packages/platform.

How to run (safe option):
1. In Supabase dashboard, open Project → Settings → Database → Connection string and copy the
   Connection string (URI) or a postgresql:// URL.
2. Run from repository root:

`powershell
# set connection string only for this command (recommended)
 = 'postgresql://postgres:password@db.host:5432/postgres'
Push-Location 'packages/db/packages/platform'; node tools/apply_supabase_sql.cjs
`

Notes:
- Alternatively, open infra/supabase/init_schema.sql and paste into the Supabase SQL editor.
- If you prefer, I can run the apply step for you if you provide the connection string (service role or DB user),
  or I can produce an instruction set for doing it manually.
