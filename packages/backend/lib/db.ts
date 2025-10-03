import { Pool } from "pg";

// const { DATABASE_USER, DATABASE_PASSWORD, DATABASE_DB, DATABASE_PORT } =
//   process.env;

const DATABASE_USER = "admin";
const DATABASE_PASSWORD = "admin";
const DATABASE_DB = "app_db";
const DATABASE_PORT = 5432;

export const database = new Pool({
  user: DATABASE_USER,
  password: DATABASE_PASSWORD,
  database: DATABASE_DB,
  port: Number(DATABASE_PORT),
});
