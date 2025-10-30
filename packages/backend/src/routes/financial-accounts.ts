import {
  NewFinancialAccountDtoSchema,
  UpdateFinancialAccountDtoSchema,
} from "@pinkka/schemas/financial-account-dto.js";
import { requireAuth } from "@/middlewares/require-auth.js";
import { FinancialAccountRepo } from "@/repositories/financial-account-repo.js";
import { error, fail, success } from "@/lib/response.js";
import { validateBody, validateIdParameter } from "@/lib/validator.js";
import { FinancialAccountMapper } from "@/mappers/financial-account-mapper.js";
import { createRouter } from "@/lib/create-router.js";
import { FinancialAccountService } from "@/services/financial-account-service.js";

const accounts = createRouter();
accounts.use("/accounts/*", requireAuth);

accounts.get("/accounts", async (c) => {
  const userId = c.get("user").id;

  try {
    const accounts = await FinancialAccountRepo.getAll({ userId });

    return success(
      c,
      accounts.map((account) => FinancialAccountMapper.fromDb(account)),
    );
  } catch {
    return error(c, "Failed to fetch accounts", { data: error });
  }
});

accounts.get("/accounts/:id", validateIdParameter, async (c) => {
  const userId = c.get("user").id;
  const { id } = c.req.param();

  const account = await FinancialAccountRepo.findOne({ id, userId });

  if (!account || account.is_deleted) {
    return error(c, `Financial account with id ${id} not found`, {
      status: 404,
    });
  }

  return success(c, FinancialAccountMapper.fromDb(account));
});

accounts.post(
  "/accounts",
  validateBody(NewFinancialAccountDtoSchema),
  async (c) => {
    const body = c.req.valid("json");
    const userId = c.get("user").id;

    try {
      const newFinancialAccount = await FinancialAccountService.create({
        data: body,
        userId,
      });

      return success(c, newFinancialAccount, 201);
    } catch (error_) {
      return error(c, "Failed to create financial account", { data: error_ });
    }
  },
);

accounts.put(
  "/accounts/:id",
  validateIdParameter,
  validateBody(UpdateFinancialAccountDtoSchema),
  async (c) => {
    const body = c.req.valid("json");
    const userId = c.get("user").id;
    const { id } = c.req.param();

    const account = await FinancialAccountRepo.findOne({ id, userId });

    if (!account || account.is_deleted) {
      return error(c, `Financial account with id ${id} not found`, {
        status: 404,
      });
    }

    // Check if account has transactions
    const transactions =
      await FinancialAccountRepo.findTransactionsForTransactionAccount({
        id,
        userId,
      });

    const hasTransactions = transactions.length > 0;

    // If there are transactions, prevent updating initial_balance
    if (hasTransactions && "initialBalance" in body) {
      return fail(c, {
        initialBalance:
          "Cannot update initialBalance for financial account with transactions",
      });
    }

    const updatedFinancialAccountData = {
      ...body,
      ...(!hasTransactions &&
        "initialBalance" in body && {
          balance: body.initialBalance,
        }),
    };

    try {
      const updatedAccount = await FinancialAccountRepo.update({
        id,
        userId,
        data: FinancialAccountMapper.updateDtoToDb(updatedFinancialAccountData),
      });

      return success(c, FinancialAccountMapper.fromDb(updatedAccount));
    } catch (error_) {
      return error(c, `Failed to update financial account with id ${id}`, {
        data: error_,
      });
    }
  },
);

accounts.delete("/accounts/:id", validateIdParameter, async (c) => {
  const userId = c.get("user").id;
  const { id } = c.req.param();

  const account = await FinancialAccountRepo.findOne({ id, userId });

  if (!account || account.is_deleted) {
    return error(c, `Financial account with id ${id} not found`, {
      status: 404,
    });
  }

  try {
    const deletedAccount = await FinancialAccountService.delete({
      id,
      userId,
    });

    return success(c, deletedAccount);
  } catch (error_) {
    return error(c, `Failed to delete financial account with id ${id}`, {
      data: error_,
    });
  }
});

export default accounts;
