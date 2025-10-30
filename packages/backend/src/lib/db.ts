import { Pool } from "pg";
import { Kysely, PostgresDialect } from "kysely";
import type { Database } from "@/types/db/database.js";
import {
  DATABASE_DB,
  DATABASE_PASSWORD,
  DATABASE_PORT,
  DATABASE_USER,
} from "@/lib/env.js";

const dialect = new PostgresDialect({
  pool: new Pool({
    user: DATABASE_USER,
    password: DATABASE_PASSWORD,
    database: DATABASE_DB,
    port: Number(DATABASE_PORT),
  }),
});

export const db = new Kysely<Database>({
  dialect,
});
