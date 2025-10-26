import {beforeEach, describe, expect, test} from 'vitest';
import {cleanDb} from '@/test-utils/clean-db.js';
import {
	createTestUser,
	type UserWithSessionToken,
} from '@/test-utils/create-test-user.js';
import financerFixture from '@/fixtures/my-financer-data-20251026.json' with {type: 'json'};
import {BACKEND_URL, FRONTEND_URL} from '@/lib/env.js';
import {db} from '@/lib/db.js';

describe('Migration Tests', () => {
	let user: UserWithSessionToken;

	beforeEach(async () => {
		await cleanDb();
		user = await createTestUser();
	});

	test('should have admin role to perform migration', async () => {
		const response = await fetch(`${BACKEND_URL}/api/migrations/financer`, {
			method: 'POST',
			headers: {
				Origin: FRONTEND_URL!,
				Cookie: `better-auth.session_token=${user.sessionToken}`,
			},
		});

		expect(response.status).toEqual(401);
	});

	test('should migrate data from Financer app', async () => {
		await db
			.updateTable('user')
			.set({role: 'admin'})
			.where('id', '=', user.id)
			.execute();

		const blob = new Blob([JSON.stringify(financerFixture)], {
			type: 'application/json',
		});

		const formData = new FormData();
		formData.append('document', blob);

		const response = await fetch(`${BACKEND_URL}/api/migrations/financer`, {
			method: 'POST',
			body: formData,
			headers: {
				Origin: FRONTEND_URL!,
				Cookie: `better-auth.session_token=${user.sessionToken}`,
			},
		});

		expect(response.status).toEqual(201);

		const accounts = await db
			.selectFrom('financial_account')
			.where('user_id', '=', user.id)
			.selectAll()
			.execute();

		const activeAccounts = accounts.filter((account) => !account.is_deleted);
		const deletedAccounts = accounts.filter((account) => account.is_deleted);

		expect(activeAccounts.length).toEqual(7); // There were 7 active accounts in the fixture
		expect(deletedAccounts.length).toEqual(6); // There were 6 deleted accounts in the fixture

		expect(
			accounts.find((a) => a.name === 'Säästötili (Nordea)')?.type,
		).toEqual('bank');
		expect(accounts.find((a) => a.name === 'Puskuri (Nordea)')?.type).toEqual(
			'bank',
		);
		expect(
			accounts.find((a) => a.name === 'Luottokortti (Norwegian)')?.type,
		).toEqual('credit_card');
		expect(accounts.find((a) => a.name === 'Käteinen')?.type).toEqual('wallet');
		expect(accounts.find((a) => a.name === 'Autolaina (Liisa)')?.type).toEqual(
			'loan',
		);
		expect(accounts.find((a) => a.name === 'Nordnet')?.type).toEqual(
			'investment',
		);

		for (const fixtureAccount of financerFixture.accounts) {
			const migrated = accounts.find((a) => a.name === fixtureAccount.name);

			expect(Number(migrated?.balance)).toBeCloseTo(
				Number(fixtureAccount.balance),
				2,
			);
		}
	});
});
