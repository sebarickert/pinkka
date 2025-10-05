import { Pool } from "pg";
import { Kysely, PostgresDialect } from "kysely";
import type { Database } from "@/types/Database.js";

// const { DATABASE_USER, DATABASE_PASSWORD, DATABASE_DB, DATABASE_PORT } =
//   process.env;

const DATABASE_USER = "admin";
const DATABASE_PASSWORD = "admin";
const DATABASE_DB = "pinkka_db";
const DATABASE_PORT = 5432;

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
