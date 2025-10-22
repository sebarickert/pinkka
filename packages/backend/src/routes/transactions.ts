import type { AuthType } from "@/lib/auth.js";
import { requireAuth } from "@/middlewares/requireAuth.js";
import { Hono } from "hono";
import * as TransactionRepo from "@/repositories/transactionRepo.js";
import * as CategoryRepo from "@/repositories/categoryRepo.js";
import { error, fail, success } from "@/lib/response.js";
import {
  NewTransactionDto,
  UpdateTransactionDto,
} from "@pinkka/schemas/TransactionDto.js";
import {
  createTransaction,
  deleteTransaction,
  updateTransaction,
} from "@/services/transactions.js";
import { transactionMapper } from "@/mappers/transactionMapper.js";
import { validateBody, validateIdParam } from "@/lib/validator.js";

const transactions = new Hono<{ Variables: AuthType["Variables"] }>();
transactions.use("/transactions/*", requireAuth);

transactions.get("/transactions/:id", validateIdParam, async (c) => {
  const user_id = c.get("user").id;
  const { id } = c.req.param();

  const transaction = await TransactionRepo.findOne({ id, user_id });

  if (!transaction) {
    return error(c, `Transaction with id ${id} not found`, {
      status: 404,
    });
  }

  return success(c, transactionMapper.fromDb(transaction));
});

transactions.get("/transactions", async (c) => {
  const user_id = c.get("user").id;

  try {
    const transactions = await TransactionRepo.findMany({ user_id });
    return success(c, transactions.map(transactionMapper.fromDb));
  } catch (err) {
    return error(c, "Failed to fetch transactions", { data: err });
  }
});

transactions.post(
  "/transactions",
  validateBody(NewTransactionDto),
  async (c) => {
    const body = c.req.valid("json");
    const user_id = c.get("user").id;
    const categoryId = body.category_id;

    if (categoryId) {
      const existingCategory = await CategoryRepo.findOne({
        id: categoryId,
        user_id,
      });

      if (!existingCategory) {
        return fail(c, {
          category_id: `Category with id ${categoryId} not found`,
        });
      }

      if (existingCategory.type !== body.type) {
        return fail(c, {
          category_id: "Category type does not match transaction type",
        });
      }
    }

    try {
      const newTransaction = await createTransaction({
        data: transactionMapper.newDtoToDb(body, user_id),
        category_id: categoryId,
      });

      return success(c, transactionMapper.fromDb(newTransaction), 201);
    } catch (err) {
      return error(c, "Failed to create transaction", { data: err });
    }
  }
);

transactions.put(
  "/transactions/:id",
  validateIdParam,
  validateBody(UpdateTransactionDto),
  async (c) => {
    const body = c.req.valid("json");
    const user_id = c.get("user").id;
    const { id } = c.req.param();

    const transaction = await TransactionRepo.findOne({ id, user_id });

    if (!transaction) {
      return error(c, `Transaction with id ${id} not found`, {
        status: 404,
      });
    }

    const hasEmptyBody = Object.keys(body).length === 0;

    if (hasEmptyBody) {
      return success(c, transaction);
    }

    const parsedTransaction = transactionMapper.fromDb(transaction);
    const { category_id, ...updatedFields } = body;

    const updatedTransaction = {
      ...parsedTransaction,
      ...updatedFields,
    };

    // Handle category_id logic
    if (body.hasOwnProperty("category_id")) {
      if (category_id === null) {
        // If category_id is explicitly null, skip lookup/type check, just delete link below
      } else if (category_id) {
        // If category_id is present and not null, do lookup and type check
        const category = await CategoryRepo.findOne({
          id: category_id,
          user_id,
        });
        if (!category) {
          return error(c, `Category with id ${category_id} not found`, {
            status: 404,
          });
        }
        if (category.type !== updatedTransaction.type) {
          return fail(c, {
            category_id: "Category type does not match transaction type",
          });
        }
      }
    }

    try {
      const updatedTransaction = await updateTransaction({
        data: transactionMapper.updateDtoToDb(updatedFields),
        category_id,
        transaction,
      });

      return success(c, transactionMapper.fromDb(updatedTransaction));
    } catch (err) {
      return error(c, `Failed to update transaction with id ${id}`, {
        data: err,
      });
    }
  }
);

transactions.delete("/transactions/:id", validateIdParam, async (c) => {
  const user_id = c.get("user").id;
  const { id } = c.req.param();

  const transaction = await TransactionRepo.findOne({ id, user_id });

  if (!transaction) {
    return error(c, `Transaction with id ${id} not found`, {
      status: 404,
    });
  }

  try {
    await deleteTransaction({
      id,
      user_id,
      transaction,
    });

    return success(c, `Transaction with id ${id} deleted`);
  } catch (err) {
    return error(c, `Failed to delete transaction with id ${id}`, {
      data: err,
    });
  }
});

export default transactions;
