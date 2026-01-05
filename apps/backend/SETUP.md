# Backend Setup Guide

## Prerequisites

- Node.js 20+ installed
- pnpm installed
- Docker and Docker Compose installed (for PostgreSQL)

## Quick Start

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Start PostgreSQL Database

Using Docker Compose (recommended):

```bash
docker-compose up -d
```

This will start PostgreSQL on port 5432 with:
- Database: `user_management`
- Username: `postgres`
- Password: `postgres`

To stop the database:
```bash
docker-compose down
```

To stop and remove all data:
```bash
docker-compose down -v
```

### 3. Setup Environment Variables

Copy the example environment file:

```bash
cp .env.example .env
```

The default `.env` file should contain:

```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/user_management
```

### 4. Push Database Schema

Push the Drizzle schema to the database:

```bash
pnpm db:push
```

This will create the `users` table in your PostgreSQL database.

### 5. Start the Development Server

```bash
pnpm dev
```

The server will start on http://localhost:3000

## Database Management

### View Database in Drizzle Studio

Drizzle Studio provides a GUI for viewing and editing your database:

```bash
pnpm db:studio
```

This will open Drizzle Studio in your browser.

### Generate Migrations (Optional)

If you prefer using migrations instead of push:

```bash
# Generate migration files
pnpm db:generate

# Apply migrations
pnpm db:migrate
```

### Connect to PostgreSQL Directly

Using psql:
```bash
docker exec -it user_management_db psql -U postgres -d user_management
```

Using any PostgreSQL client:
- Host: localhost
- Port: 5432
- Database: user_management
- Username: postgres
- Password: postgres

## API Endpoints

Once running, you can access:

- **API Documentation**: http://localhost:3000/docs
- **OpenAPI Spec**: http://localhost:3000/docs/json
- **POST /users**: Create a new user
- **GET /users**: Get all users

## Testing the API

### Create a User

```bash
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{"name": "John Doe", "email": "john@example.com"}'
```

### Get All Users

```bash
curl http://localhost:3000/users
```

### Test with Swagger UI

1. Open http://localhost:3000/docs
2. Expand the endpoint you want to test
3. Click "Try it out"
4. Fill in the request body
5. Click "Execute"

## Troubleshooting

### Database Connection Error

If you get a connection error, make sure:

1. PostgreSQL is running:
   ```bash
   docker-compose ps
   ```

2. The database is healthy:
   ```bash
   docker-compose logs postgres
   ```

3. Environment variables are correct in `.env`

### Port Already in Use

If port 5432 is already in use, modify `docker-compose.yml`:

```yaml
ports:
  - '5433:5432'  # Use different host port
```

Then update `.env`:
```
DATABASE_URL=postgresql://postgres:postgres@localhost:5433/user_management
```

### Reset Database

To reset the database completely:

```bash
# Stop and remove containers and volumes
docker-compose down -v

# Start fresh
docker-compose up -d

# Push schema again
pnpm db:push
```

## Production Deployment

For production, use a managed PostgreSQL service like:

- AWS RDS
- Google Cloud SQL
- Supabase
- Railway
- Render

Update your `DATABASE_URL` environment variable with the production database URL.

### Build for Production

```bash
# Build TypeScript
pnpm build

# Start production server
pnpm start
```

## Database Schema

The current schema includes a `users` table:

```typescript
{
  id: serial (primary key, auto-increment)
  name: varchar(255) (required)
  email: varchar(255) (required, unique)
  createdAt: timestamp (auto-generated)
  updatedAt: timestamp (auto-updated)
}
```

## Adding New Tables

1. Edit `src/db/schema.ts` to add new tables
2. Push changes: `pnpm db:push`
3. Update API endpoints in `src/app.ts`
4. Regenerate OpenAPI spec
5. Update frontend client

## Environment Variables Reference

| Variable | Description | Default |
|----------|-------------|---------|
| DATABASE_URL | PostgreSQL connection string | postgresql://postgres:postgres@localhost:5432/user_management |
| DB_HOST | Database host | localhost |
| DB_PORT | Database port | 5432 |
| DB_USER | Database user | postgres |
| DB_PASSWORD | Database password | postgres |
| DB_NAME | Database name | user_management |

## Next Steps

1. Start the frontend: See `/frontend/README.md`
2. Generate API client: `cd frontend && pnpm generate:api`
3. Test the full stack application
