import type { AuthType } from "@/lib/auth.js";
import { error, fail, success } from "@/lib/response.js";
import { requireAuth } from "@/middlewares/requireAuth.js";
import { Hono } from "hono";
import * as CategoryRepo from "@/repositories/categoryRepo.js";
import { validate } from "uuid";
import { mapZodErrors } from "@/lib/mapZodErrors.js";
import {
  NewCategoryDto,
  UpdateCategoryDto,
} from "@pinkka/schemas/CategoryDto.js";

const categories = new Hono<{ Variables: AuthType["Variables"] }>({
  strict: false,
});

categories.get("/categories", requireAuth, async (c) => {
  const user_id = c.get("user")!.id;

  try {
    const categories = await CategoryRepo.findMany({ user_id });

    return success(c, categories);
  } catch (err) {
    return error(c, "Failed to fetch categories", { data: error });
  }
});

categories.get("/categories/:id", requireAuth, async (c) => {
  const user_id = c.get("user")!.id;
  const { id } = c.req.param();

  if (!validate(id)) {
    return error(c, "Invalid id format", { status: 400 });
  }

  const category = await CategoryRepo.findOne({ id, user_id });

  if (!category || category.is_deleted) {
    return error(c, `Category with id ${id} not found`, {
      status: 404,
    });
  }

  return success(c, category);
});

categories.post("/categories", requireAuth, async (c) => {
  let body;

  try {
    body = await c.req.json();
  } catch (err) {
    body = {};
  }

  const validation = NewCategoryDto.safeParse(body);

  if (!validation.success) {
    return fail(c, mapZodErrors(validation.error));
  }

  const user_id = c.get("user")!.id;

  try {
    const newCategory = await CategoryRepo.create({
      data: { ...validation.data, user_id, is_deleted: false },
    });

    return success(c, newCategory, 201);
  } catch (err) {
    return error(c, "Failed to create category", { data: err });
  }
});

categories.put("/categories/:id", requireAuth, async (c) => {
  const user_id = c.get("user")!.id;
  const { id } = c.req.param();

  if (!validate(id)) {
    return error(c, "Invalid id format", { status: 400 });
  }

  const category = await CategoryRepo.findOne({ id, user_id });

  if (!category || category.is_deleted) {
    return error(c, `Category with id ${id} not found`, {
      status: 404,
    });
  }

  let body;

  try {
    body = await c.req.json();
  } catch (err) {
    body = {};
  }

  const validation = UpdateCategoryDto.safeParse(body);

  if (!validation.success) {
    return fail(c, mapZodErrors(validation.error));
  }

  // Check if category has transactions
  const transactions = await CategoryRepo.findTransactionLinksForCategory({
    id,
  });
  const hasTransactions = transactions.length > 0;

  // If there are transactions, prevent updating type
  if (hasTransactions && "type" in validation.data) {
    return fail(c, {
      type: "Cannot update type for category with transactions",
    });
  }

  try {
    const updatedAccount = await CategoryRepo.update({
      id,
      user_id,
      data: validation.data,
    });

    return success(c, updatedAccount);
  } catch (err) {
    return error(c, `Failed to update category with id ${id}`, {
      data: err,
    });
  }
});

categories.delete("/categories/:id", requireAuth, async (c) => {
  const user_id = c.get("user")!.id;
  const { id } = c.req.param();

  if (!validate(id)) {
    return error(c, "Invalid id format", { status: 400 });
  }

  const category = await CategoryRepo.findOne({ id, user_id });

  if (!category || category.is_deleted) {
    return error(c, `Category with id ${id} not found`, {
      status: 404,
    });
  }

  try {
    const updatedCategory = await CategoryRepo.update({
      id,
      user_id,
      data: { is_deleted: true },
    });

    return success(c, updatedCategory);
  } catch (err) {
    return error(c, `Failed to delete category with id ${id}`, {
      data: err,
    });
  }
});

export default categories;
