import { drizzle as drizzleNeon } from "drizzle-orm/neon-http";
import { drizzle as drizzlePostgres } from "drizzle-orm/postgres-js";
import { neon } from "@neondatabase/serverless";
import postgres from "postgres";

const databaseUrl = process.env.DATABASE_URL!;
const isLocalPostgres =
  process.env.DIG_IN_CONTAINER === "1" ||
  /@(localhost|127\.0\.0\.1|postgres)(:\d+)?\//i.test(databaseUrl);

const db = isLocalPostgres
  ? drizzlePostgres(
      postgres(databaseUrl, {
        max: 10,
        connection: {
          search_path: "public",
        },
      }),
    )
  : drizzleNeon(neon(databaseUrl));

export { db };
