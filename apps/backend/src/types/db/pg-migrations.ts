import type { Generated } from "kysely";
import type { Timestamp } from "@/types/db/database.js";

export type PgMigrationsTable = {
  id: Generated<number>;
  name: string;
  run_on: Timestamp;
};
