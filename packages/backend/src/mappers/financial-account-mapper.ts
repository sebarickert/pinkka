import type {
  FinancialAccountDto,
  NewFinancialAccountDto,
  UpdateFinancialAccountDto,
} from "@pinkka/schemas/financial-account-dto.js";
import type {
  FinancialAccount,
  FinancialAccountUpdate,
  NewFinancialAccount,
} from "@/types/db/financial-account.js";

export const FinancialAccountMapper = {
  fromDb(db: FinancialAccount): FinancialAccountDto {
    return {
      id: db.id,
      userId: db.user_id,
      type: db.type,
      name: db.name,
      initialBalance: Number(Number(db.initial_balance).toFixed(2)),
      balance: Number(Number(db.balance).toFixed(2)),
      isDeleted: db.is_deleted,
      createdAt: db.created_at.toISOString(),
      updatedAt: db.updated_at.toISOString(),
    };
  },
  newDtoToDb(dto: NewFinancialAccountDto, userId: string): NewFinancialAccount {
    return {
      type: dto.type,
      name: dto.name,
      initial_balance: dto.initialBalance,
      balance: dto.initialBalance,
      is_deleted: false,
      user_id: userId,
    };
  },
  updateDtoToDb(
    dto: Partial<UpdateFinancialAccountDto>
  ): Partial<FinancialAccountUpdate> {
    return {
      ...(dto.type !== undefined && { type: dto.type }),
      ...(dto.name !== undefined && { name: dto.name }),
      ...(dto.initialBalance !== undefined && {
        initial_balance: dto.initialBalance,
        balance: dto.initialBalance,
      }),
      ...(dto.isDeleted !== undefined && { is_deleted: dto.isDeleted }),
    };
  },
};
