import type { Timestamp } from "@/types/Database.js";
import type { Generated } from "kysely";

export interface PgMigrationsTable {
  id: Generated<number>;
  name: string;
  run_on: Timestamp;
}
