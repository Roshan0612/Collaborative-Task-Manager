# Collaborative Task Manager

Full-stack task management app (React + Tailwind, Node/Express + TypeScript, Prisma + PostgreSQL, Socket.IO).

## Stack Choices
- **Database**: PostgreSQL (Dockerized). Chosen for relational schemas and enums matching Task Priority/Status.
- **ORM**: Prisma 7.
- **Auth**: JWT in HttpOnly cookies.
- **Real-time**: Socket.IO for task updates and assignment notifications.
- **Server State**: @tanstack/react-query.

## Local Setup

### Prerequisites
- Docker Desktop running
- Node.js 18+

### One-command run (Docker Compose)
```bash
docker compose up --build
```
- Frontend: http://localhost:5173
- Backend: http://localhost:5000
- DB: postgres at localhost:5432 (internal hostname `db` from containers)

### Environment
- Backend reads `DATABASE_URL` from compose; in local dev `.env` uses Postgres:
  `postgresql://postgres:postgres@localhost:5432/collaborative_task_manager?schema=public`

## API Contract (key endpoints)
- `POST /api/v1/auth/register` { name, email, password } -> { user }
- `POST /api/v1/auth/login` { email, password } -> { user } (JWT set in HttpOnly cookie)
- `GET /api/v1/tasks?status=&priority=&sort=` -> Task[]
- `GET /api/v1/tasks/:id` -> Task
- `POST /api/v1/tasks` -> Task (DTO validated)
- `PUT /api/v1/tasks/:id` -> Task (DTO validated)
- `DELETE /api/v1/tasks/:id` -> 204
- `GET /api/v1/tasks/dashboard` -> { mine, overdue }

## Architecture
- **Controllers**: `auth.controller`, task routes
- **Services**: `auth.service`, `task.service` (business logic, emits socket events)
- **Repositories**: `user.repository`, `task.repository` (Prisma data access)
- **DTOs**: Zod schemas in `task.service` and `auth.validator`
- **Middleware**: `auth.middleware` (JWT from HttpOnly cookie)

## Real-time (Socket.IO)
- Server emits: `task:created`, `task:updated`, `task:deleted`, `task:assigned`
- Client connects via `socket.ts` and updates React Query caches / UI.

## Testing
- Jest unit tests in `backend/tests/task.service.test.ts` (DTO validation). Add more for business logic as needed.

## Deployment
- **Frontend**: Vercel/Netlify (build `vite`, preview or serve via nginx)
- **Backend**: Render/Railway (set envs: `DATABASE_URL`, `JWT_SECRET`, `CLIENT_ORIGIN`)
- **DB**: Render/Railway Postgres. Run `prisma migrate deploy` on start.

## Notes
- Tailwind configured; add pages/forms per spec (Login/Register, Dashboard, Task CRUD).
- If port 5432 is busy, change `db` port mapping in compose.
