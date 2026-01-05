# User Management Monorepo

Full-stack type-safe application with OpenAPI-first development workflow using Turborepo.

## Architecture

```
monorepo/
├── apps/
│   ├── backend/          # Fastify API with Drizzle ORM
│   └── frontend/         # Next.js 16 with React Query
├── packages/            # Shared packages (future)
├── turbo.json          # Turborepo configuration
└── pnpm-workspace.yaml # PNPM workspace config
```

## Tech Stack

### Backend
- **Runtime**: Node.js 20+
- **Framework**: Fastify
- **Validation**: Zod
- **ORM**: Drizzle ORM
- **Database**: PostgreSQL 18
- **API Docs**: Swagger UI + OpenAPI 3.1.0

### Frontend
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Data Fetching**: React Query (TanStack Query)
- **Code Generation**: Orval

## Prerequisites

- Node.js 20+
- pnpm
- Docker & Docker Compose

## Quick Start

### 1. Install Dependencies

```bash
pnpm install
```

This will install dependencies for all apps in the monorepo.

### 2. Start PostgreSQL Database

```bash
cd apps/backend
docker-compose up -d
```

### 3. Push Database Schema

```bash
pnpm db:push
```

### 4. Start Development Servers

```bash
pnpm dev
```

This starts both backend and frontend concurrently:
- Backend: http://localhost:3000
- Frontend: http://localhost:3001
- Swagger UI: http://localhost:3000/docs

## Available Scripts

| Script | Description |
|--------|-------------|
| `pnpm dev` | Start all apps in development mode |
| `pnpm build` | Build all apps |
| `pnpm lint` | Lint all apps |
| `pnpm test` | Run tests for all apps |
| `pnpm db:push` | Push database schema (backend only) |
| `pnpm db:studio` | Open Drizzle Studio (backend only) |
| `pnpm generate:api` | Generate API client (frontend only) |

## Workspace Commands

Run commands in specific apps:

```bash
# Backend only
pnpm --filter backend dev
pnpm --filter backend db:push

# Frontend only
pnpm --filter frontend dev
pnpm --filter frontend generate:api
```

## Development Workflow

### 1. Update Backend API

```bash
# 1. Edit Zod schemas in apps/backend/src/app.ts
# 2. Backend automatically regenerates OpenAPI spec
# 3. Export the spec
curl http://localhost:3000/docs/json > apps/backend/openapi.json
```

### 2. Regenerate Frontend Client

```bash
# Generate type-safe hooks and models
pnpm --filter frontend generate:api
```

### 3. Use in Frontend

```typescript
import { useGetUsers, usePostUsers } from '@/lib/api/users/users';

function MyComponent() {
  const { data: users } = useGetUsers();
  const createUser = usePostUsers();

  // Fully type-safe!
  createUser.mutate({
    data: { name: 'John', email: 'john@example.com' }
  });
}
```

## Project Structure

### Backend (`apps/backend/`)
```
backend/
├── src/
│   ├── app.ts           # Fastify app with routes
│   └── db/
│       ├── index.ts     # Database connection
│       └── schema.ts    # Drizzle schema
├── docker-compose.yml   # PostgreSQL container
├── drizzle.config.ts    # Drizzle configuration
└── openapi.json         # Generated OpenAPI spec
```

### Frontend (`apps/frontend/`)
```
frontend/
├── app/
│   ├── layout.tsx       # Root layout
│   ├── page.tsx         # Home page
│   └── globals.css      # Global styles
├── lib/
│   ├── api/             # Auto-generated API client
│   └── providers/       # React Query provider
└── orval.config.ts      # Orval configuration
```

## Database Management

### View Data in Drizzle Studio

```bash
pnpm db:studio
```

### Reset Database

```bash
cd apps/backend
docker-compose down -v
docker-compose up -d
pnpm db:push
```

## Environment Variables

### Backend (`apps/backend/.env`)
```
DATABASE_URL=postgresql://postgres:User%40123@localhost:5434/user_management
POSTGRES_HOST=localhost
POSTGRES_PORT=5434
POSTGRES_USER=postgres
POSTGRES_PASSWORD=User@123
POSTGRES_DATABASE=user_management
```

### Frontend (`apps/frontend/.env.local`)
```
NEXT_PUBLIC_API_URL=http://localhost:3000
```

## Production Deployment

### Build All Apps

```bash
pnpm build
```

### Deploy Backend

```bash
cd apps/backend
# Update .env with production DATABASE_URL
pnpm start
```

### Deploy Frontend

```bash
cd apps/frontend
pnpm start
```

Or deploy to Vercel:
```bash
cd apps/frontend
vercel
```

## Turborepo Features

- **Caching**: Turbo caches build outputs for faster rebuilds
- **Parallel Execution**: Runs tasks across apps concurrently
- **Dependency Graph**: Automatically runs dependencies first
- **Remote Caching**: Share cache with team (optional)

## Adding New Apps

```bash
# Create new app
mkdir apps/my-new-app
cd apps/my-new-app
pnpm init

# Add to workspace (already configured in pnpm-workspace.yaml)
# Start using it
pnpm --filter my-new-app dev
```

## Troubleshooting

### Port Already in Use

Backend (3000):
```bash
lsof -ti:3000 | xargs kill -9
```

Frontend (3001):
```bash
lsof -ti:3001 | xargs kill -9
```

### Database Connection Error

1. Check if PostgreSQL is running:
   ```bash
   docker ps | grep user_management
   ```

2. Check logs:
   ```bash
   docker logs user_management_db
   ```

3. Verify credentials in `.env` match `docker-compose.yml`

### Turbo Cache Issues

Clear Turbo cache:
```bash
rm -rf .turbo
pnpm dev
```

## Learn More

- [Turborepo Docs](https://turbo.build)
- [Next.js Docs](https://nextjs.org/docs)
- [Fastify Docs](https://fastify.dev)
- [Drizzle ORM Docs](https://orm.drizzle.team)
- [React Query Docs](https://tanstack.com/query)

## License

ISC
