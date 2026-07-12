# Internal SQLite DB Server

This is a minimal internal SQLite-backed HTTP server for local development and testing.

Files:
- `init_db.py` - create `data.db` and seed sample users.
- `server.py` - simple HTTP server exposing `/users` GET and POST endpoints.
- `.env.example` - example env variables.

Run locally:

```powershell
python infra\db\init_db.py
# then in another terminal
$env:DB_SERVER_PORT=4000; python infra\db\server.py
```

Requests:
- GET http://127.0.0.1:4000/users
- POST http://127.0.0.1:4000/users  (JSON body `{ "name": "X", "email": "x@e.com" }`)

