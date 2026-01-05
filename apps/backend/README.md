# OpenAPI-First Type-Safe API Backend

Enterprise-grade backend API with automatic OpenAPI specification generation using Fastify, Zod, and TypeScript.

## Stack

- **Server**: Fastify
- **Schema Validation**: Zod
- **OpenAPI Generator**: fastify-zod-openapi
- **API Documentation**: Swagger UI
- **Language**: TypeScript

## Features

- Automatic OpenAPI 3.1.0 specification generation
- Type-safe API endpoints with Zod validation
- Interactive API documentation with Swagger UI
- Single source of truth for API schemas
- Automatic request/response validation

## Installation

```bash
pnpm install
```

## Development

Start the development server:

```bash
pnpm dev
```

The server will start on `http://localhost:3000`

## Available Endpoints

### API Documentation

- **Swagger UI**: http://localhost:3000/docs
- **OpenAPI JSON**: http://localhost:3000/docs/json

### API Endpoints

#### POST /users
Create a new user

**Request Body**:
```json
{
  "name": "John Doe",
  "email": "john@example.com"
}
```

**Response (201)**:
```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com"
}
```

#### GET /users
Get all users

**Response (200)**:
```json
[
  {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com"
  }
]
```

## Testing the API

### Using curl

Create a user:
```bash
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{"name": "Aman", "email": "aman@test.com"}'
```

Get all users:
```bash
curl http://localhost:3000/users
```

### Using Swagger UI

1. Navigate to http://localhost:3000/docs
2. Expand the endpoint you want to test
3. Click "Try it out"
4. Fill in the request body
5. Click "Execute"

## Exporting OpenAPI Specification

To export the OpenAPI specification for frontend code generation:

```bash
curl http://localhost:3000/docs/json > openapi.json
```

Or with formatting:

```bash
curl http://localhost:3000/docs/json | python3 -m json.tool > openapi.json
```

## Project Structure

```
backend/
├── src/
│   └── app.ts          # Main application file
├── openapi.json        # Generated OpenAPI specification
├── package.json
├── tsconfig.json
└── README.md
```

## Adding New Endpoints

1. Define Zod schemas for request and response:

```typescript
const MyRequestSchema = z.object({
  field: z.string().meta({
    description: 'Field description',
    example: 'example value',
  }),
});

const MyResponseSchema = z.object({
  id: z.number(),
  field: z.string(),
});
```

2. Create the route:

```typescript
app.withTypeProvider<FastifyZodOpenApiTypeProvider>().route({
  method: 'POST',
  url: '/my-endpoint',
  schema: {
    description: 'Endpoint description',
    tags: ['my-tag'],
    body: MyRequestSchema,
    response: {
      200: {
        description: 'Success response',
        content: {
          'application/json': {
            schema: MyResponseSchema,
          },
        },
      },
    },
  } satisfies FastifyZodOpenApiSchema,
  handler: async (request, reply) => {
    // Handler logic
    reply.send({ id: 1, field: request.body.field });
  },
});
```

3. Regenerate the OpenAPI specification:

```bash
curl http://localhost:3000/docs/json > openapi.json
```

## Frontend Integration

The generated `openapi.json` file can be used with code generators like:

- **Orval**: Generate React Query hooks and TypeScript types
- **OpenAPI Generator**: Generate clients for various languages
- **tRPC**: Type-safe APIs

Example with Orval (in frontend project):

```bash
# Install Orval
pnpm add -D orval

# Generate API client
npx orval --input ../backend/openapi.json --output ./src/api/generated.ts
```

## Build for Production

```bash
pnpm build
pnpm start
```

## License

ISC
