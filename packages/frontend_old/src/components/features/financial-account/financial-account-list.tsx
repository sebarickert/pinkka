import type { FinancialAccountDto } from "@pinkka/schemas/financial-account-dto";
import { useState, type FC } from "react";
import { QueryClient, useQuery } from "@tanstack/react-query";
import { FinancialAccountService } from "@/services/financial-account-service";

type Props = {
  initialData: FinancialAccountDto[];
};

export const FinancialAccountList: FC<Props> = ({ initialData }) => {
  // Const [queryClient] = useState(
  // 	() =>
  // 		new QueryClient({
  // 			defaultOptions: {
  // 				queries: {
  // 					staleTime: 60 * 1000,
  // 				},
  // 			},
  // 		}),
  // );

  const { data: accounts } = useQuery(
    {
      queryKey: ["financial-accounts"],
      queryFn: async () => FinancialAccountService.getAll(),
      initialData,
    },
    // QueryClient,
  );

  return (
    <div>
      {accounts.map((account) => (
        <div key={account.id}>
          <h1>
            {account.name} - {account.balance}
          </h1>
        </div>
      ))}
    </div>
  );
};
