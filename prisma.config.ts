// Prisma configuration for Supabase
import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "npx tsx prisma/seed.ts",
  },
  datasource: {
    // Use direct connection for migrations (avoids PgBouncer prepared statement issues)
    url: process.env["DIRECT_URL"] || process.env["DATABASE_URL"],
  },
});
