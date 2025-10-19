import type { AuthType } from "@/lib/auth.js";
import { requireAuth } from "@/middlewares/requireAuth.js";
import { Hono } from "hono";
import * as FinancialAccountRepo from "@/repositories/financialAccountRepo.js";
import { error, fail, success } from "@/lib/response.js";
import {
  NewFinancialAccountDto,
  UpdateFinancialAccountDto,
} from "@pinkka/schemas/FinancialAccountDto.js";
import * as z from "zod";
import { mapZodErrors } from "@/lib/mapZodErrors.js";
import { validate } from "uuid";

const accounts = new Hono<{ Variables: AuthType["Variables"] }>({
  strict: false,
});

accounts.get("/accounts", requireAuth, async (c) => {
  const user_id = c.get("user")!.id;

  try {
    const accounts = await FinancialAccountRepo.findMany({ user_id });

    return success(c, accounts);
  } catch (err) {
    return error(c, "Failed to fetch accounts", { data: error });
  }
});

accounts.get("/accounts/:id", requireAuth, async (c) => {
  const user_id = c.get("user")!.id;
  const { id } = c.req.param();

  if (!validate(id)) {
    return error(c, "Invalid id format", { status: 400 });
  }

  const account = await FinancialAccountRepo.findOne({ id, user_id });

  if (!account || account.is_deleted) {
    return error(c, `Financial account with id ${id} not found`, {
      status: 404,
    });
  }

  return success(c, account);
});

accounts.post("/accounts", requireAuth, async (c) => {
  let body;

  try {
    body = await c.req.json();
  } catch (err) {
    body = {};
  }

  const isArray = Array.isArray(body);

  const validation = isArray
    ? z.array(NewFinancialAccountDto).safeParse(body)
    : NewFinancialAccountDto.safeParse(body);

  if (!validation.success) {
    return fail(c, mapZodErrors(validation.error));
  }

  const user_id = c.get("user")!.id;

  const mappedValidationData = [...[validation.data].flat()].map((data) => ({
    ...data,
    user_id,
    balance: data.initial_balance,
    pending_balance: data.initial_balance,
  }));

  try {
    let newFinancialAccounts;

    if (mappedValidationData.length === 1) {
      newFinancialAccounts = await FinancialAccountRepo.create({
        data: mappedValidationData[0],
      });
    } else {
      newFinancialAccounts = await FinancialAccountRepo.createMany({
        data: mappedValidationData,
      });
    }

    return success(c, newFinancialAccounts, 201);
  } catch (err) {
    return error(c, "Failed to create financial account", { data: err });
  }
});

accounts.put("/accounts/:id", requireAuth, async (c) => {
  const user_id = c.get("user")!.id;
  const { id } = c.req.param();

  if (!validate(id)) {
    return error(c, "Invalid id format", { status: 400 });
  }

  const account = await FinancialAccountRepo.findOne({ id, user_id });

  if (!account || account.is_deleted) {
    return error(c, `Financial account with id ${id} not found`, {
      status: 404,
    });
  }

  let body;

  try {
    body = await c.req.json();
  } catch (err) {
    body = {};
  }

  const validation = UpdateFinancialAccountDto.safeParse(body);

  if (!validation.success) {
    return fail(c, mapZodErrors(validation.error));
  }

  // Check if account has transactions
  const transactions =
    await FinancialAccountRepo.findTransactionsForTransactionAccount({
      id,
      user_id,
    });
  const hasTransactions = transactions.length > 0;

  // If there are transactions, prevent updating initial_balance
  if (hasTransactions && "initial_balance" in validation.data) {
    return fail(c, {
      initial_balance:
        "Cannot update initial_balance for financial account with transactions",
    });
  }

  const updatedFinancialAccountData = {
    ...validation.data,
    ...(!hasTransactions &&
      "initial_balance" in validation.data && {
        balance: validation.data.initial_balance,
        pending_balance: validation.data.initial_balance,
      }),
  };

  try {
    const updatedAccount = await FinancialAccountRepo.update({
      id,
      user_id,
      data: updatedFinancialAccountData,
    });

    return success(c, updatedAccount);
  } catch (err) {
    return error(c, `Failed to update financial account with id ${id}`, {
      data: err,
    });
  }
});

accounts.delete("/accounts/:id", requireAuth, async (c) => {
  const user_id = c.get("user")!.id;
  const { id } = c.req.param();

  if (!validate(id)) {
    return error(c, "Invalid id format", { status: 400 });
  }

  const account = await FinancialAccountRepo.findOne({ id, user_id });

  if (!account || account.is_deleted) {
    return error(c, `Financial account with id ${id} not found`, {
      status: 404,
    });
  }

  try {
    const updatedAccount = await FinancialAccountRepo.update({
      id,
      user_id,
      data: { is_deleted: true },
    });

    return success(c, updatedAccount);
  } catch (err) {
    return error(c, `Failed to delete financial account with id ${id}`, {
      data: err,
    });
  }
});

export default accounts;
