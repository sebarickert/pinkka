import type {
  Generated,
  GeneratedAlways,
  Insertable,
  Selectable,
  Updateable,
} from "kysely";

export type CategoryTable = {
  id: GeneratedAlways<string>;
  user_id: string;
  name: string;
  created_at: Generated<Date>;
  type: "income" | "expense" | "transfer";
  updated_at: Generated<Date>;
  is_deleted: boolean;
};

export type Category = Selectable<CategoryTable>;
export type NewCategory = Insertable<CategoryTable>;
export type CategoryUpdate = Updateable<CategoryTable>;
