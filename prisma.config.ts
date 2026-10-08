import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    // The CLI (migrate, db push, studio) needs a direct connection, so prefer
    // DIRECT_URL when it is set (e.g. behind a pooler). The app itself
    // connects with DATABASE_URL in lib/prisma.ts.
    url: process.env.DIRECT_URL || process.env.DATABASE_URL!,
  },
});
