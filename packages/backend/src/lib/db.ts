import dotenv from "dotenv";
dotenv.config({ path: "../../.env" });

import { Pool } from "pg";
import { Kysely, PostgresDialect } from "kysely";
import type { Database } from "@/types/Database.js";

const { DATABASE_USER, DATABASE_PASSWORD, DATABASE_DB, DATABASE_PORT } =
  process.env;

console.log(DATABASE_DB);

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
