import type { FinancialAccountDto } from "@pinkka/schemas/financial-account-dto.js";
import { FinancialAccountMapper } from "@/mappers/financial-account-mapper.js";
import { FinancialAccountRepo } from "@/repositories/financial-account-repo.js";
import type {
  CreateFinancialAccountServiceParameters,
  DeleteFinancialAccountServiceParameters,
  UpdateAccountBalancesForTransactionServiceParameters,
} from "@/types/service/financial-account.js";

export const FinancialAccountService = {
  async create(
    parameters: CreateFinancialAccountServiceParameters,
  ): Promise<FinancialAccountDto> {
    const financialAccount = await FinancialAccountRepo.create({
      data: FinancialAccountMapper.newDtoToDb(
        parameters.data,
        parameters.userId,
      ),
    });

    return FinancialAccountMapper.fromDb(financialAccount);
  },
  async delete(
    parameters: DeleteFinancialAccountServiceParameters,
  ): Promise<FinancialAccountDto> {
    const financialAccount = await FinancialAccountRepo.delete({
      id: parameters.id,
      userId: parameters.userId,
    });

    return FinancialAccountMapper.fromDb(financialAccount);
  },
  async updateAccountBalancesForTransaction(
    parameters: UpdateAccountBalancesForTransactionServiceParameters,
  ) {
    const { transaction, amount, trx } = parameters;

    if (transaction.type === "income" && transaction.to_account_id) {
      await FinancialAccountRepo.incrementBalance({
        id: transaction.to_account_id,
        userId: transaction.user_id,
        amount,
        trx,
      });
    }

    if (transaction.type === "expense" && transaction.from_account_id) {
      await FinancialAccountRepo.decrementBalance({
        id: transaction.from_account_id,
        userId: transaction.user_id,
        amount,
        trx,
      });
    }

    if (
      transaction.type === "transfer" &&
      transaction.from_account_id &&
      transaction.to_account_id
    ) {
      await Promise.all([
        FinancialAccountRepo.decrementBalance({
          id: transaction.from_account_id,
          userId: transaction.user_id,
          amount,
          trx,
        }),
        FinancialAccountRepo.incrementBalance({
          id: transaction.to_account_id,
          userId: transaction.user_id,
          amount,
          trx,
        }),
      ]);
    }
  },
};
