import {type FinancialAccountDto} from '@pinkka/schemas/financial-account-dto.js';

export const FinancialAccountService = {
	async getAll(cookie?: string): Promise<FinancialAccountDto[]> {
		const response = await fetch('http://localhost:3000/api/accounts', {
			headers: {
				...(cookie ? {Cookie: cookie} : {}),
			},
		});

		if (!response.ok) {
			return [];
		}

		const {data: accounts} = await response.json();

		return accounts;
	},
};
