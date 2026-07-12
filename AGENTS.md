# AI Assistant Guide — Kingdom of Bees

## Commands

```bash
# Backend
cd backend && npm run dev        # Start dev server (port 4000)
cd backend && npm run test        # Run tests (Jest)
cd backend && npm run lint        # Run linter

# Frontend Web
cd frontend-web && npm run dev   # Start Vite dev server (port 5173)
cd frontend-web && npm run test  # Run tests (Vitest)

# Admin Panel
cd admin-panel && npm run dev    # Start Vite dev server (port 5174)

# Mobile App
cd mobile-app && npm run start   # Start Expo
```

## Code Conventions

- **Language:** Arabic-first UI, TypeScript backend
- **Response format:** `{ success: boolean, message: string, data?: any }`
- **Imports:** All imports at top of file, no inline imports
- **Logging:** Use `logger.info()`, `logger.error()` — not `console.log`
- **Prisma:** Import from `../config/prisma` (singleton), never `new PrismaClient()`
- **Auth requests:** Use `AuthenticatedRequest` type, never `(req as any)`
- **API responses:** Use `ApiResponse.success()`, `ApiResponse.error()` from `utils/response.ts`

## Project Structure

```
backend/src/
  config/       — App configuration, Prisma singleton
  controllers/  — Route handlers (28 files)
  services/     — Business logic (24 files)
  repositories/ — Data access (10 files)
  middleware/   — Auth guards (4 files)
  routes/       — Express routers (17 files)
  utils/        — Logger, ApiResponse, stats
  types/        — TypeScript interfaces
  cron/         — Scheduled jobs
  tests/        — Jest tests
```

## Important

- Always run `npm run lint` and `tsc --noEmit` before committing
- The official Prisma schema is at `packages/db/prisma/schema.prisma`
- Backend uses `--schema=../packages/db/prisma/schema.prisma` for migrations
- Never expose real secrets in `.env` — use `.env.example`
