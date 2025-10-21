import type { AuthType } from "@/lib/auth.js";
import { error, fail, success } from "@/lib/response.js";
import { requireAuth } from "@/middlewares/requireAuth.js";
import { Hono } from "hono";
import * as CategoryRepo from "@/repositories/categoryRepo.js";
import {
  NewCategoryDto,
  UpdateCategoryDto,
} from "@pinkka/schemas/CategoryDto.js";
import { categoryMapper } from "@/mappers/categoryMapper.js";
import { validateBody, validateIdParam } from "@/lib/validator.js";

const categories = new Hono<{ Variables: AuthType["Variables"] }>();
categories.use("/categories/*", requireAuth);

categories.get("/categories", async (c) => {
  const user_id = c.get("user").id;

  try {
    const categories = await CategoryRepo.getAll({ user_id });

    return success(c, categories.map(categoryMapper.fromDb));
  } catch (err) {
    return error(c, "Failed to fetch categories", { data: error });
  }
});

categories.get("/categories/:id", validateIdParam, async (c) => {
  const user_id = c.get("user").id;
  const { id } = c.req.param();

  const category = await CategoryRepo.findOne({ id, user_id });

  if (!category || category.is_deleted) {
    return error(c, `Category with id ${id} not found`, {
      status: 404,
    });
  }

  return success(c, categoryMapper.fromDb(category));
});

categories.post("/categories", validateBody(NewCategoryDto), async (c) => {
  const body = c.req.valid("json");
  const user_id = c.get("user").id;

  try {
    const newCategory = await CategoryRepo.create({
      data: categoryMapper.newDtoToDb(body, user_id),
    });

    return success(c, categoryMapper.fromDb(newCategory), 201);
  } catch (err) {
    return error(c, "Failed to create category", { data: err });
  }
});

categories.put(
  "/categories/:id",
  validateIdParam,
  validateBody(UpdateCategoryDto),
  async (c) => {
    const body = c.req.valid("json");
    const user_id = c.get("user").id;
    const { id } = c.req.param();

    const category = await CategoryRepo.findOne({ id, user_id });

    if (!category || category.is_deleted) {
      return error(c, `Category with id ${id} not found`, {
        status: 404,
      });
    }

    // Check if category has transactions
    const transactions = await CategoryRepo.findTransactionLinksForCategory({
      id,
    });
    const hasTransactions = transactions.length > 0;

    // If there are transactions, prevent updating type
    if (hasTransactions && "type" in body) {
      return fail(c, {
        type: "Cannot update type for category with transactions",
      });
    }

    try {
      const updatedCategory = await CategoryRepo.update({
        id,
        user_id,
        data: categoryMapper.updateDtoToDb(body),
      });

      return success(c, categoryMapper.fromDb(updatedCategory));
    } catch (err) {
      return error(c, `Failed to update category with id ${id}`, {
        data: err,
      });
    }
  }
);

categories.delete("/categories/:id", validateIdParam, async (c) => {
  const user_id = c.get("user").id;
  const { id } = c.req.param();

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

    return success(c, categoryMapper.fromDb(updatedCategory));
  } catch (err) {
    return error(c, `Failed to delete category with id ${id}`, {
      data: err,
    });
  }
});

export default categories;
