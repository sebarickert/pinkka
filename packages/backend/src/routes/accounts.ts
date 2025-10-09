import type { AuthType } from "@/lib/auth.js";
import { requireAuth } from "@/middlewares/requireAuth.js";
import { Hono } from "hono";
import * as FinancialAccountRepo from "@/repositories/financialAccountRepo.js";
import { error, fail, success } from "@/lib/response.js";
import { NewFinancialAccountDto } from "@pinkka/schemas/FinancialAccountDto.js";
import * as z from "zod";

const accounts = new Hono<{ Variables: AuthType["Variables"] }>({
  strict: false,
});

accounts.get("/accounts", (c) => {
  return c.json({ message: "Many accounts" });
});

accounts.post("/accounts", requireAuth, async (c) => {
  const body = await c.req.json();

  const validation = NewFinancialAccountDto.safeParse(body);

  if (!validation.success) {
    return fail(c, z.flattenError(validation.error).fieldErrors);
  }

  try {
    const newFinancialAccount = await FinancialAccountRepo.create({
      ...validation.data,
      current_balance: validation.data.initial_balance,
      pending_balance: validation.data.initial_balance,
    });

    return success(c, newFinancialAccount, 201);
  } catch (err) {
    return error(c, "Failed to create financial account", { data: err });
  }
});

export default accounts;
