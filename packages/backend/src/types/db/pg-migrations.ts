import type { Generated } from "kysely";
import type { Timestamp } from "@/types/db/database1.js";

export type PgMigrationsTable = {
  id: Generated<number>;
  name: string;
  run_on: Timestamp;
};
