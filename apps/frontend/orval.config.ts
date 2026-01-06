import { defineConfig } from 'orval';

export default defineConfig({
  app: {
    input: {
      target: '../backend/openapi.json',
      override: {
        transformer: (input) => input, 
      },
    },
    output: {
      mode: 'tags-split',
      workspace: './lib/api/generated/hooks',
      target: './',
      schemas: '../types',
      client: 'react-query',
      mock: false,
      indexFiles: true,
      override: {
        mutator: {
          path: '../../axios-instance.ts',
          name: 'customInstance',
        },
        useTypeOverInterfaces: true,
        query: {
          useQuery: true,
          useMutation: true,
          signal: true,
        },
        operationName: (operation, route, verb) => {
          if (operation.operationId) return operation.operationId;
          
          const cleanRoute = route
            .replace(/\{([^}]+)\}/g, "By$1")
            .replace(/[/-]/g, " ")
            .trim();
          
          const words = cleanRoute.split(" ").filter(Boolean);
          const pascalWords = words.map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
          
          return verb.toLowerCase() + pascalWords.join("");
        },
      },
    },
  },
  zod: {
    input: {
      target: '../backend/openapi.json',
    },
    output: {
      mode: 'tags-split',
      workspace: './lib/api/generated/schemas',
      target: './',
      client: 'zod',
      indexFiles: true,
      override: {
        useTypeOverInterfaces: true,
        operationName: (operation, route, verb) => {
          if (operation.operationId) return operation.operationId;
          
          const cleanRoute = route
            .replace(/\{([^}]+)\}/g, "By$1")
            .replace(/[/-]/g, " ")
            .trim();
          
          const words = cleanRoute.split(" ").filter(Boolean);
          const pascalWords = words.map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
          
          return verb.toLowerCase() + pascalWords.join("");
        },
      },
    },
  },
});
