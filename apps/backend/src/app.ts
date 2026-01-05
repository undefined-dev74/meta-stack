import 'dotenv/config';
import fastify from 'fastify';
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUI from '@fastify/swagger-ui';
import {
  type FastifyZodOpenApiSchema,
  type FastifyZodOpenApiTypeProvider,
  fastifyZodOpenApiPlugin,
  fastifyZodOpenApiTransformers,
  serializerCompiler,
  validatorCompiler,
} from 'fastify-zod-openapi';
import { z } from 'zod';
import { db, users } from './db';
import { eq } from 'drizzle-orm';

const app = fastify();

const PORT = 3000;

async function main() {
  // Set validator and serializer compilers
  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);

  // Register Zod OpenAPI plugin
  await app.register(fastifyZodOpenApiPlugin);

  // Register Swagger with transformers
  await app.register(fastifySwagger, {
    openapi: {
      openapi: '3.1.0',
      info: {
        title: 'User API',
        description: 'Type-safe API with auto-generated OpenAPI specification',
        version: '1.0.0',
      },
      servers: [
        {
          url: `http://localhost:${PORT}`,
          description: 'Development server',
        },
      ],
    },
    ...fastifyZodOpenApiTransformers,
  });

  // Register Swagger UI
  await app.register(fastifySwaggerUI, {
    routePrefix: '/docs',
    uiConfig: {
      docExpansion: 'list',
      deepLinking: true,
    },
  });

  // Define Zod schemas for request and response
  const CreateUserRequestSchema = z.object({
    name: z.string().min(1).meta({
      description: 'User name',
      example: 'John Doe',
    }),
    email: z.string().email().meta({
      description: 'User email address',
      example: 'john@example.com',
    }),
  });

  const UserResponseSchema = z.object({
    id: z.number().int().positive().meta({
      description: 'User ID',
      example: 1,
    }),
    name: z.string().meta({
      description: 'User name',
      example: 'John Doe',
    }),
    email: z.string().email().meta({
      description: 'User email address',
      example: 'john@example.com',
    }),
  });

  const ErrorResponseSchema = z.object({
    error: z.string().meta({
      description: 'Error type',
      example: 'Bad Request',
    }),
    message: z.string().meta({
      description: 'Error message',
      example: 'Validation failed',
    }),
  });

  // POST /users endpoint - Create a new user in the database
  app.withTypeProvider<FastifyZodOpenApiTypeProvider>().route({
    method: 'POST',
    url: '/users',
    schema: {
      description: 'Create a new user',
      tags: ['users'],
      body: CreateUserRequestSchema,
      response: {
        201: {
          description: 'User created successfully',
          content: {
            'application/json': {
              schema: UserResponseSchema,
            },
          },
        },
        400: {
          description: 'Bad request - validation error',
          content: {
            'application/json': {
              schema: ErrorResponseSchema,
            },
          },
        },
      },
    } satisfies FastifyZodOpenApiSchema,
    handler: async (request, reply) => {
      try {
        const { name, email } = request.body;

        // Insert new user into database using Drizzle ORM
        const [newUser] = await db
          .insert(users)
          .values({
            name,
            email,
          })
          .returning();

        reply.code(201).send({
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
        });
      } catch (error: any) {
        // Log the error for debugging
        console.error('Error creating user:', error);

        // Handle duplicate email error
        if (error.code === '23505') {
          reply.code(400).send({
            error: 'Bad Request',
            message: 'Email already exists',
          });
        } else {
          reply.code(400).send({
            error: 'Bad Request',
            message: error.message || 'Failed to create user',
          });
        }
      }
    },
  });

  // GET /users endpoint - Fetch all users from the database
  app.withTypeProvider<FastifyZodOpenApiTypeProvider>().route({
    method: 'GET',
    url: '/users',
    schema: {
      description: 'Get all users',
      tags: ['users'],
      response: {
        200: {
          description: 'List of users',
          content: {
            'application/json': {
              schema: z.array(UserResponseSchema),
            },
          },
        },
      },
    } satisfies FastifyZodOpenApiSchema,
    handler: async (_request, reply) => {
      try {
        // Fetch all users from database using Drizzle ORM
        const allUsers = await db.select().from(users);

        // Map database results to response format
        const userList = allUsers.map((user) => ({
          id: user.id,
          name: user.name,
          email: user.email,
        }));

        reply.send(userList);
      } catch (error) {
        // On error, return empty array
        reply.send([]);
      }
    },
  });

  // Start the server
  try {
    await app.listen({ port: PORT, host: '0.0.0.0' });
    console.log(`🚀 Server running at http://localhost:${PORT}`);
    console.log(`📚 Swagger UI available at http://localhost:${PORT}/docs`);
    console.log(`📄 OpenAPI JSON available at http://localhost:${PORT}/docs/json`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

main();
