import { Pool } from "pg";

const { DATABASE_USER, DATABASE_PASSWORD, DATABASE_DB, DATABASE_PORT } =
  process.env;

export const database = new Pool({
  user: DATABASE_USER,
  password: DATABASE_PASSWORD,
  database: DATABASE_DB,
  port: Number(DATABASE_PORT),
});
