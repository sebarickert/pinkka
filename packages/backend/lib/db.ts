import { Pool } from "pg";

export const database = new Pool({
  user: "user",
  password: "password",
  database: "db",
  port: 5432,
});
