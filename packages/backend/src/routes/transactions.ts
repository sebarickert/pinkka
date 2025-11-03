import {
  NewTransactionDtoSchema,
  UpdateTransactionDtoSchema,
} from "@pinkka/schemas/transaction-dto.js";
import { requireAuth } from "@/middlewares/require-auth.js";
import { TransactionRepo } from "@/repositories/transaction-repo.js";
import { CategoryRepo } from "@/repositories/category-repo.js";
import { error, fail, success } from "@/lib/response.js";
import { TransactionMapper } from "@/mappers/transaction-mapper.js";
import { validateBody, validateIdParameter } from "@/lib/validator.js";
import { createRouter } from "@/lib/create-router.js";
import { TransactionService } from "@/services/transaction-service.js";

const transactions = createRouter();
transactions.use("/transactions/*", requireAuth);

transactions.get("/transactions/:id", validateIdParameter, async (c) => {
  const userId = c.get("user").id;
  const { id } = c.req.param();

  const transaction = await TransactionRepo.findOne({ id, userId });

  if (!transaction) {
    return error(c, `Transaction with id ${id} not found`, {
      status: 404,
    });
  }

  return success(c, TransactionMapper.fromDb(transaction));
});

transactions.get("/transactions", async (c) => {
  const userId = c.get("user").id;
  const { limit, year, month, accountId } = c.req.query();

  try {
    const transactions = await TransactionRepo.getAll({
      userId,
      limit: limit ? Number(limit) : undefined,
      year: year ? Number(year) : undefined,
      month: month ? Number(month) : undefined,
      accountId,
    });

    return success(
      c,
      transactions.map((transaction) => TransactionMapper.fromDb(transaction))
    );
  } catch (error_) {
    return error(c, "Failed to fetch transactions", { data: error_ });
  }
});

transactions.post(
  "/transactions",
  validateBody(NewTransactionDtoSchema),
  async (c) => {
    const body = c.req.valid("json");
    const userId = c.get("user").id;
    const { categoryId } = body;

    if (categoryId) {
      const existingCategory = await CategoryRepo.findOne({
        id: categoryId,
        userId,
      });

      if (!existingCategory) {
        return fail(c, {
          categoryId: `Category with id ${categoryId} not found`,
        });
      }

      if (existingCategory.type !== body.type) {
        return fail(c, {
          categoryId: "Category type does not match transaction type",
        });
      }
    }

    try {
      const newTransaction = await TransactionService.create({
        data: body,
        userId,
      });

      return success(c, newTransaction, 201);
    } catch (error_) {
      return error(c, "Failed to create transaction", { data: error_ });
    }
  }
);

transactions.put(
  "/transactions/:id",
  validateIdParameter,
  validateBody(UpdateTransactionDtoSchema),
  async (c) => {
    const body = c.req.valid("json");
    const userId = c.get("user").id;
    const { id } = c.req.param();

    const transaction = await TransactionRepo.findOne({ id, userId });

    if (!transaction) {
      return error(c, `Transaction with id ${id} not found`, {
        status: 404,
      });
    }

    const hasEmptyBody = Object.keys(body).length === 0;

    if (hasEmptyBody) {
      return success(c, transaction);
    }

    const parsedTransaction = TransactionMapper.fromDb(transaction);
    const { categoryId, ...updatedFields } = body;

    const mergedTransaction = {
      ...parsedTransaction,
      ...updatedFields,
    };

    // Handle category_id logic
    if (Object.hasOwn(body, "categoryId")) {
      if (categoryId === null) {
        // If category_id is explicitly null, skip lookup/type check, just delete link below
      } else if (categoryId) {
        // If category_id is present and not null, do lookup and type check
        const category = await CategoryRepo.findOne({
          id: categoryId,
          userId,
        });
        if (!category) {
          return error(c, `Category with id ${categoryId} not found`, {
            status: 404,
          });
        }

        if (category.type !== mergedTransaction.type) {
          return fail(c, {
            categoryId: "Category type does not match transaction type",
          });
        }
      }
    }

    try {
      const updatedTransaction = await TransactionService.update({
        data: body,
        transaction,
      });

      return success(c, updatedTransaction);
    } catch (error_) {
      return error(c, `Failed to update transaction with id ${id}`, {
        data: error_,
      });
    }
  }
);

transactions.delete("/transactions/:id", validateIdParameter, async (c) => {
  const userId = c.get("user").id;
  const { id } = c.req.param();

  const transaction = await TransactionRepo.findOne({ id, userId });

  if (!transaction) {
    return error(c, `Transaction with id ${id} not found`, {
      status: 404,
    });
  }

  try {
    await TransactionService.delete({ id, userId, transaction });
    return success(c, `Transaction with id ${id} deleted`);
  } catch (error_) {
    return error(c, `Failed to delete transaction with id ${id}`, {
      data: error_,
    });
  }
});

export default transactions;
