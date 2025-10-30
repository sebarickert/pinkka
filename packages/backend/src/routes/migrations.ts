// Disabled rules for this file due to the nature of data migration tasks

/* eslint-disable no-await-in-loop */
import {
  FinancerMigrationDataSchema,
  type AccountTypeEnum,
  type FinancerMigrationData,
} from "@pinkka/schemas/financer-migration-data.js";
import type { FinancialAccountType } from "@pinkka/schemas/financial-account-dto.js";
import { error, fail, success } from "@/lib/response.js";
import { requireAuth } from "@/middlewares/require-auth.js";
import { createRouter } from "@/lib/create-router.js";
import { FinancialAccountService } from "@/services/financial-account-service.js";
import { TransactionService } from "@/services/transaction-service.js";
import { db } from "@/lib/db.js";
import { requireAdminRole } from "@/middlewares/require-admin.js";

function mapAccountType(type: AccountTypeEnum): FinancialAccountType {
  switch (type) {
    case "CASH": {
      return "wallet";
    }

    case "CREDIT": {
      return "credit_card";
    }

    case "INVESTMENT": {
      return "investment";
    }

    case "LOAN": {
      return "loan";
    }

    default: {
      return "bank";
    }
  }
}

const migrations = createRouter();
migrations.use("/migrations/*", requireAuth, requireAdminRole);

migrations.post("/migrations/financer", async (c) => {
  const userId = c.get("user").id;
  const formData = await c.req.formData();
  const file = formData.get("document");

  if (!file || typeof file === "string") {
    return fail(c, { document: ["No document provided or file is not valid"] });
  }

  const text = await file.text();
  const body = JSON.parse(text) as FinancerMigrationData;
  const validation = FinancerMigrationDataSchema.safeParse(body);

  if (!validation.success) {
    return fail(c, { document: ["Invalid document format"] });
  }

  try {
    const { accounts, transactions } = validation.data;

    await db.transaction().execute(async (trx) => {
      await trx.deleteFrom("category").where("user_id", "=", userId).execute();
      await trx
        .deleteFrom("transaction")
        .where("user_id", "=", userId)
        .execute();
      await trx
        .deleteFrom("financial_account")
        .where("user_id", "=", userId)
        .execute();

      // Calculate initial balances for each account
      const accountInitialBalances: Record<string, number> = {};
      for (const account of accounts) {
        let sum = 0;
        for (const transaction of transactions) {
          // If account is fromAccount, subtract amount
          if (transaction.fromAccount === account.id) {
            sum -= Number(transaction.amount);
          }

          // If account is toAccount, add amount
          if (transaction.toAccount === account.id) {
            sum += Number(transaction.amount);
          }
        }

        // Initial balance = final balance - sum of all transactions
        accountInitialBalances[account.id] = Number(account.balance) - sum;
      }

      const newAccounts = [];
      for (const account of accounts) {
        const newAccount = await FinancialAccountService.create({
          data: {
            name: account.name,
            type: mapAccountType(account.type),
            initialBalance: accountInitialBalances[account.id],
          },
          userId,
          trx,
        });
        newAccounts.push(newAccount);
      }

      const accountIdMapping = new Map<string, string>();
      for (const [index, account] of accounts.entries()) {
        accountIdMapping.set(account.id, newAccounts[index].id);
      }

      // Delete accounts that are marked as deleted in the original data
      for (const [index, account] of accounts.entries()) {
        if (account.isDeleted) {
          await FinancialAccountService.delete({
            id: newAccounts[index].id,
            userId,
            trx,
          });
        }
      }

      const newTransactions = [];
      for (const transaction of transactions) {
        const isIncome = Boolean(
          transaction.toAccount && !transaction.fromAccount,
        );
        const isExpense = Boolean(
          transaction.fromAccount && !transaction.toAccount,
        );

        const type = isIncome ? "income" : isExpense ? "expense" : "transfer";

        const newTransaction = await TransactionService.create({
          data: {
            amount: Number(transaction.amount),
            type,
            date: transaction.date,
            fromAccountId: transaction.fromAccount
              ? accountIdMapping.get(transaction.fromAccount)!
              : undefined,
            toAccountId: transaction.toAccount
              ? accountIdMapping.get(transaction.toAccount)!
              : undefined,
            description: transaction.description,
          },
          userId,
          trx,
        });
        newTransactions.push(newTransaction);
      }
    });

    return success(c, "Successfully migrated financer data", 201);
  } catch (error_) {
    return error(c, "Failed to migrate financer data", { data: error_ });
  }
});

export default migrations;
