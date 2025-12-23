import type { Transaction } from "kysely";
import type { Database } from "@/types/db/database.js";

export type BaseRepoOptions = {
  sortBy?: string; // Default sorting field
  order?: "asc" | "desc"; // Default order
  month?: number; // Filter by month
  year?: number; // Filter by year
  limit?: number; // Pagination
  offset?: number; // Pagination
  includeDeleted?: boolean; // Whether to include soft-deleted records
  trx?: Transaction<Database>; // Transaction object
};

export type BaseServiceOptions = Omit<BaseRepoOptions, "trx">;
