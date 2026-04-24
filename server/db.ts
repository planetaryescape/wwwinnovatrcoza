import { drizzle as drizzleNeon } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";

const databaseUrl = process.env.DATABASE_URL!;
const isLocalPostgres =
  process.env.DIG_IN_CONTAINER === "1" ||
  /@(localhost|127\.0\.0\.1|postgres)(:\d+)?\//i.test(databaseUrl);

let db: ReturnType<typeof drizzleNeon>;
if (isLocalPostgres) {
  const [{ drizzle: drizzlePostgres }, { default: postgres }] = await Promise.all([
    import("drizzle-orm/postgres-js"),
    import("postgres"),
  ]);
  db = drizzlePostgres(
    postgres(databaseUrl, {
      max: 10,
      connection: {
        search_path: "public",
      },
    }),
  ) as unknown as ReturnType<typeof drizzleNeon>;
} else {
  db = drizzleNeon(neon(databaseUrl));
}

export { db };
