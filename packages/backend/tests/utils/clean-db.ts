import {db} from '@/lib/db.js';

export async function cleanDb() {
	await db.deleteFrom('session').execute();
	await db.deleteFrom('account').execute();
	await db.deleteFrom('user').execute();
	await db.deleteFrom('verification').execute();
	await db.deleteFrom('financial_account').execute();
	await db.deleteFrom('transaction').execute();
	await db.deleteFrom('category').execute();
	await db.deleteFrom('transaction_category').execute();
}
