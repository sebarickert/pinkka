import type { Timestamp } from "@/types/Database.js";
import type { Generated, Insertable, Selectable, Updateable } from "kysely";

export interface CategoryTable {
  id: Generated<string>;
  user_id: string;
  name: string;
  created_at: Generated<Timestamp>;
  type: "income" | "expense" | "transfer";
  updated_at: Generated<Timestamp>;
  is_deleted: boolean;
}

export type Category = Selectable<CategoryTable>;
export type NewCategory = Insertable<CategoryTable>;
export type CategoryUpdate = Updateable<CategoryTable>;
