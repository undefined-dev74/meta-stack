# OpenAPI-First Type-Safe Frontend

Modern Next.js frontend with auto-generated type-safe API client using Orval and React Query.

## Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Data Fetching**: React Query (TanStack Query)
- **HTTP Client**: Axios
- **Code Generation**: Orval
- **Type Safety**: End-to-end type safety from backend to frontend

## Features

- Auto-generated type-safe API hooks from OpenAPI specification
- React Query integration for efficient data fetching and caching
- Server and client components with Next.js App Router
- Beautiful UI with Tailwind CSS
- Dark mode support
- Real-time API updates with automatic refetching
- Error handling and loading states
- DevTools for debugging queries

## Installation

```bash
pnpm install
```

## Development

1. Make sure the backend server is running on `http://localhost:3000`

2. Start the development server:

```bash
pnpm dev
```

3. Open [http://localhost:3001](http://localhost:3001) in your browser

## Project Structure

```
frontend/
├── app/
│   ├── layout.tsx          # Root layout with React Query provider
│   ├── page.tsx            # Home page with user management
│   └── globals.css         # Global styles with Tailwind
├── lib/
│   ├── api/
│   │   ├── customFetch.ts  # Axios instance and configuration
│   │   ├── users/          # Auto-generated user API hooks
│   │   └── model/          # Auto-generated TypeScript models
│   └── providers/
│       └── query-provider.tsx  # React Query provider
├── orval.config.ts         # Orval configuration
├── tailwind.config.ts      # Tailwind CSS configuration
├── tsconfig.json           # TypeScript configuration
└── package.json
```

## Auto-Generated API Workflow

### 1. Backend Changes

When the backend API changes:

1. Update the backend schema (Zod schemas in backend)
2. Backend automatically regenerates `openapi.json`

### 2. Regenerate Frontend Client

```bash
pnpm generate:api
```

This command runs Orval, which:
- Reads `../backend/openapi.json`
- Generates TypeScript types from schemas
- Creates type-safe React Query hooks
- Outputs to `lib/api/`

### 3. Use Generated Hooks

```tsx
import { useGetUsers, usePostUsers } from '@/lib/api/users/users';

function MyComponent() {
  // Type-safe query hook
  const { data: users, isLoading } = useGetUsers();

  // Type-safe mutation hook
  const createUser = usePostUsers({
    mutation: {
      onSuccess: () => {
        console.log('User created!');
      },
    },
  });

  // TypeScript knows the exact shape of the data
  createUser.mutate({
    data: {
      name: 'John Doe',
      email: 'john@example.com',
    },
  });

  return (
    <div>
      {users?.map((user) => (
        <div key={user.id}>
          {user.name} - {user.email}
        </div>
      ))}
    </div>
  );
}
```

## Type Safety Guarantees

### Request Type Safety

```tsx
// ✅ Correct - TypeScript approves
createUser.mutate({
  data: {
    name: 'John',
    email: 'john@example.com',
  },
});

// ❌ Error - TypeScript catches this
createUser.mutate({
  data: {
    name: 'John',
    // Missing required 'email' field
  },
});

// ❌ Error - TypeScript catches this
createUser.mutate({
  data: {
    name: 'John',
    email: 'invalid-email', // Type is correct, but validation happens at runtime
  },
});
```

### Response Type Safety

```tsx
const { data: users } = useGetUsers();

// TypeScript knows the exact shape
users?.forEach((user) => {
  console.log(user.id);    // ✅ number
  console.log(user.name);  // ✅ string
  console.log(user.email); // ✅ string
  console.log(user.age);   // ❌ TypeScript error - property doesn't exist
});
```

## Configuration

### Environment Variables

Create `.env.local`:

```bash
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### Orval Configuration

See [orval.config.ts](orval.config.ts):

```typescript
{
  input: '../backend/openapi.json',  // OpenAPI spec location
  output: {
    mode: 'tags-split',              // Split by OpenAPI tags
    target: './lib/api/generated.ts', // Output location
    client: 'react-query',           // Generate React Query hooks
    mutator: './lib/api/customFetch.ts', // Custom Axios instance
  }
}
```

### React Query Configuration

See [lib/providers/query-provider.tsx](lib/providers/query-provider.tsx):

```typescript
{
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,          // Cache for 1 minute
      refetchOnWindowFocus: false,   // Don't refetch on window focus
    },
  },
}
```

## API Client Customization

### Custom Headers

Edit [lib/api/customFetch.ts](lib/api/customFetch.ts):

```typescript
AXIOS_INSTANCE.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### Error Handling

```typescript
AXIOS_INSTANCE.interceptors.response.use(
  (response) => response,
  (error) => {
    // Global error handling
    if (error.response?.status === 401) {
      // Redirect to login
    }
    return Promise.reject(error);
  }
);
```

## React Query DevTools

The app includes React Query DevTools for debugging:

- Press the React Query icon in the bottom-left corner
- View all queries and their states
- Manually trigger refetches
- Inspect query data and errors

## Building for Production

```bash
pnpm build
pnpm start
```

## Best Practices

### 1. Always Regenerate After Backend Changes

```bash
# In backend
curl http://localhost:3000/docs/json > openapi.json

# In frontend
pnpm generate:api
```

### 2. Use Query Keys for Invalidation

```typescript
const queryClient = useQueryClient();

// Invalidate specific query
queryClient.invalidateQueries({ queryKey: ['getUsers'] });

// Invalidate all queries
queryClient.invalidateQueries();
```

### 3. Handle Loading and Error States

```typescript
const { data, isLoading, error } = useGetUsers();

if (isLoading) return <Spinner />;
if (error) return <Error message={error.message} />;
return <UserList users={data} />;
```

### 4. Use Optimistic Updates

```typescript
const createUser = usePostUsers({
  mutation: {
    onMutate: async (newUser) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['getUsers'] });

      // Snapshot previous value
      const previousUsers = queryClient.getQueryData(['getUsers']);

      // Optimistically update
      queryClient.setQueryData(['getUsers'], (old) => [...old, newUser]);

      return { previousUsers };
    },
    onError: (err, newUser, context) => {
      // Rollback on error
      queryClient.setQueryData(['getUsers'], context.previousUsers);
    },
  },
});
```

## Troubleshooting

### API Generation Fails

```bash
# Check if backend OpenAPI spec exists
ls -la ../backend/openapi.json

# Make sure backend is running
curl http://localhost:3000/docs/json

# Regenerate the spec
cd ../backend && pnpm dev
curl http://localhost:3000/docs/json > openapi.json
```

### Type Errors After Generation

```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
pnpm install

# Regenerate types
pnpm generate:api
```

### CORS Issues

Make sure the backend has CORS enabled for `http://localhost:3001`:

```typescript
// In backend/src/app.ts
await app.register(cors, {
  origin: 'http://localhost:3001',
});
```

## License

ISC
