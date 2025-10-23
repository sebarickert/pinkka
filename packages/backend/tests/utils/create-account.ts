import type {NewFinancialAccountDto} from '@pinkka/schemas/FinancialAccountDto.js';
import type {UserWithSessionToken} from '@test-utils/create-test-user.js';
import {fetcher} from '@test-utils/fetcher.js';
import type {FinancialAccount} from '@/types/db/FinancialAccount.js';

export async function createAccount(
	newAccountPayload: Omit<NewFinancialAccountDto, 'is_deleted'>,
	user: UserWithSessionToken,
): Promise<FinancialAccount> {
	const res = await fetcher(
		'/api/accounts',
		{
			method: 'POST',
			body: JSON.stringify(newAccountPayload),
		},
		user.session_token,
	);

	const body = await res.json();

	return body.data;
}
