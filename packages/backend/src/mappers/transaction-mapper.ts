import type {
  NewTransactionDto,
  TransactionDto,
  UpdateTransactionDto,
} from "@pinkka/schemas/transaction-dto.js";
import type {
  NewTransaction,
  Transaction,
  TransactionUpdate,
} from "@/types/db/transaction.js";

export const TransactionMapper = {
  fromDb(db: Transaction): TransactionDto {
    return {
      id: db.id,
      userId: db.user_id,
      type: db.type,
      amount: Number(Number(db.amount).toFixed(2)),
      description: db.description,
      date: db.date.toISOString(),
      fromAccountId: db.from_account_id ?? null,
      toAccountId: db.to_account_id ?? null,
      createdAt: db.created_at.toISOString(),
      updatedAt: db.updated_at.toISOString(),
    };
  },
  newDtoToDb(dto: NewTransactionDto, user_id: string): NewTransaction {
    return {
      type: dto.type,
      amount: dto.amount,
      description: dto.description,
      date: new Date(dto.date),
      from_account_id: dto.fromAccountId ?? null,
      to_account_id: dto.toAccountId ?? null,
      user_id,
    };
  },
  updateDtoToDb(
    dto: Partial<UpdateTransactionDto>
  ): Partial<TransactionUpdate> {
    return {
      ...(dto.amount !== undefined && { amount: dto.amount }),
      ...(dto.description !== undefined && { description: dto.description }),
      ...(dto.date !== undefined && { date: new Date(dto.date) }),
      ...(dto.fromAccountId !== undefined && {
        from_account_id: dto.fromAccountId,
      }),
      ...(dto.toAccountId !== undefined && {
        to_account_id: dto.toAccountId,
      }),
    };
  },
};
