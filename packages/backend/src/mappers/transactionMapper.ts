import type { NewTransaction, Transaction } from "@/types/Transaction.js";
import type {
  NewTransactionDto,
  TransactionDto,
} from "@pinkka/schemas/TransactionDto.js";

export const transactionMapper = {
  fromDb(db: Transaction): TransactionDto {
    return {
      id: db.id,
      user_id: db.user_id,
      type: db.type,
      amount: Number(db.amount),
      description: db.description,
      date: db.date.toISOString(),
      from_account_id: db.from_account_id ?? null,
      to_account_id: db.to_account_id ?? null,
      created_at: db.created_at.toISOString(),
      updated_at: db.updated_at.toISOString(),
    };
  },
  newDtoToDb(dto: NewTransactionDto, user_id: string): NewTransaction {
    return {
      type: dto.type,
      amount: dto.amount,
      description: dto.description,
      date: new Date(dto.date),
      from_account_id: dto.from_account_id ?? null,
      to_account_id: dto.to_account_id ?? null,
      user_id,
    };
  },
};
