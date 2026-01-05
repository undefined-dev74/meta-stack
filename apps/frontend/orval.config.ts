import { defineConfig } from 'orval';

export default defineConfig({
  api: {
    input: {
      target: '../backend/openapi.json',
    },
    output: {
      mode: 'tags-split',
      target: './lib/api/generated.ts',
      schemas: './lib/api/model',
      client: 'react-query',
      mock: false,
      override: {
        mutator: {
          path: './lib/api/customFetch.ts',
          name: 'customFetch',
        },
        query: {
          useQuery: true,
          useMutation: true,
          signal: true,
        },
      },
    },
  },
});
