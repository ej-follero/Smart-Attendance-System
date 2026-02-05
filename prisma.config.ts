import 'dotenv/config';
import { defineConfig } from 'prisma/config';

const config = {
  schema: 'prisma/schema.prisma',
  datasource: {
    url: process.env.DATABASE_URL ?? '',
  },
  migrations: {
    path: 'prisma/migrations',
    seed: 'tsx prisma/seed.ts',
  },
};

export default defineConfig(config as unknown as Parameters<typeof defineConfig>[0]);
