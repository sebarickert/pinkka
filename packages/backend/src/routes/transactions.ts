import type { AuthType } from "@/lib/auth.js";
import { requireAuth } from "@/middlewares/requireAuth.js";
import { Hono } from "hono";
import * as TransactionRepo from "@/repositories/transactionRepo.js";
import * as CategoryRepo from "@/repositories/categoryRepo.js";
import * as TransactionCategoryRepo from "@/repositories/transactionCategoryRepo.js";
import { error, fail, success } from "@/lib/response.js";
import * as z from "zod";
import { mapZodErrors } from "@/lib/mapZodErrors.js";
import { validate } from "uuid";
import {
  NewTransactionDto,
  TransactionDto,
  UpdateTransactionDto,
} from "@pinkka/schemas/TransactionDto.js";

const transactions = new Hono<{ Variables: AuthType["Variables"] }>({
  strict: false,
});

transactions.get("/transactions", requireAuth, async (c) => {
  const user_id = c.get("user")!.id;

  try {
    const transactions = await TransactionRepo.findMany({ user_id });

    return success(c, transactions);
  } catch (err) {
    return error(c, "Failed to fetch transactions", { data: err });
  }
});

transactions.post("/transactions", requireAuth, async (c) => {
  let body;

  try {
    body = await c.req.json();
  } catch (err) {
    body = {};
  }

  const validation = z.array(NewTransactionDto).safeParse(body);

  if (!validation.success) {
    return fail(c, mapZodErrors(validation.error));
  }

  const user_id = c.get("user")!.id;

  const categoryIds = validation.data
    .map(({ category_id }) => category_id)
    .filter(Boolean) as string[];

  if (categoryIds.length > 0) {
    const existingCategories = await CategoryRepo.findMany({
      user_id,
      id: categoryIds,
    });

    const existingCategoryIds = new Set(existingCategories.map((c) => c.id));
    const invalidCategoryIds = categoryIds.filter(
      (id) => !existingCategoryIds.has(id)
    );

    if (invalidCategoryIds.length > 0) {
      return fail(c, {
        category_id: "One or more categories not found",
      });
    }

    const categoryMap = new Map(
      existingCategories.map((category) => [category.id, category])
    );

    const typeMismatch = validation.data.some(
      (transaction) =>
        transaction.category_id &&
        categoryMap.get(transaction.category_id)!.type !== transaction.type
    );

    if (typeMismatch) {
      return fail(c, {
        category_id: "One or more categories do not match transaction type",
      });
    }
  }

  try {
    const newTransactions = await TransactionRepo.createMany({
      // Omitting category_id from here, as it's handled in a separate table
      data: validation.data.map(({ category_id, ...data }) => ({
        ...data,
        user_id,
      })),
    });

    await Promise.all(
      newTransactions.map(async (transaction, index) => {
        const category_id = validation.data[index]?.category_id;

        if (category_id) {
          await TransactionCategoryRepo.create({
            data: {
              category_id,
              transaction_id: transaction.id,
            },
          });
        }
      })
    );

    return success(c, newTransactions, 201);
  } catch (err) {
    return error(c, "Failed to create transactions", { data: err });
  }
});

transactions.get("/transactions/:id", requireAuth, async (c) => {
  const user_id = c.get("user")!.id;
  const { id } = c.req.param();

  if (!validate(id)) {
    return error(c, "Invalid id format", { status: 400 });
  }

  const transaction = await TransactionRepo.findOne({ id, user_id });

  if (!transaction || transaction.is_deleted) {
    return error(c, `Transaction with id ${id} not found`, {
      status: 404,
    });
  }

  return success(c, transaction);
});

transactions.put("/transactions/:id", requireAuth, async (c) => {
  const user_id = c.get("user")!.id;
  const { id } = c.req.param();

  if (!validate(id)) {
    return error(c, "Invalid id format", { status: 400 });
  }

  const transaction = await TransactionRepo.findOne({ id, user_id });

  if (!transaction || transaction.is_deleted) {
    return error(c, `Transaction with id ${id} not found`, {
      status: 404,
    });
  }

  let body;

  try {
    body = await c.req.json();
  } catch (err) {
    body = {};
  }

  if (!body || Object.keys(body).length === 0) {
    return success(c, transaction);
  }

  const updateValidation = UpdateTransactionDto.safeParse(body);

  if (!updateValidation.success) {
    return fail(c, mapZodErrors(updateValidation.error));
  }

  const { category_id, ...transactionFields } = body;
  const mergedData = { ...transaction, ...transactionFields };

  const validation = TransactionDto.safeParse(mergedData);

  if (!validation.success) {
    return fail(c, mapZodErrors(validation.error));
  }

  // Handle category_id logic
  if (body.hasOwnProperty("category_id")) {
    if (category_id === null) {
      // If category_id is explicitly null, skip lookup/type check, just delete link below
    } else if (category_id) {
      // If category_id is present and not null, do lookup and type check
      const category = await CategoryRepo.findOne({ id: category_id, user_id });
      if (!category) {
        return error(c, `Category with id ${category_id} not found`, {
          status: 404,
        });
      }
      if (category.type !== mergedData.type) {
        return fail(c, {
          category_id: "Category type does not match transaction type",
        });
      }
    }
  }

  const hasFieldsToUpdate = Object.keys(transactionFields).length === 0;

  try {
    let updatedTransaction;

    if (!hasFieldsToUpdate) {
      updatedTransaction = await TransactionRepo.update({
        id,
        user_id,
        data: transactionFields,
      });
    } else {
      updatedTransaction = transaction;
    }

    if (body.hasOwnProperty("category_id")) {
      if (category_id) {
        await TransactionCategoryRepo.upsert({
          data: { transaction_id: id, category_id },
        });
      } else {
        await TransactionCategoryRepo.deleteLink({
          data: { transaction_id: id },
        });
      }
    }

    return success(c, updatedTransaction);
  } catch (err) {
    return error(c, `Failed to update transaction with id ${id}`, {
      data: err,
    });
  }
});

transactions.delete("/transactions/:id", requireAuth, async (c) => {
  const user_id = c.get("user")!.id;
  const { id } = c.req.param();

  if (!validate(id)) {
    return error(c, "Invalid id format", { status: 400 });
  }

  const transaction = await TransactionRepo.findOne({ id, user_id });

  if (!transaction || transaction.is_deleted) {
    return error(c, `Transaction with id ${id} not found`, {
      status: 404,
    });
  }

  try {
    const updatedTransaction = await TransactionRepo.update({
      id,
      user_id,
      data: { is_deleted: true },
    });

    return success(c, updatedTransaction);
  } catch (err) {
    return error(c, `Failed to delete transaction with id ${id}`, {
      data: err,
    });
  }
});

export default transactions;
