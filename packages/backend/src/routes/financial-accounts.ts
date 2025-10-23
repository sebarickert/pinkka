import {
	NewFinancialAccountDto,
	UpdateFinancialAccountDto,
} from '@pinkka/schemas/FinancialAccountDto.js';
import {requireAuth} from '@/middlewares/require-auth.js';
import * as FinancialAccountRepo from '@/repositories/financial-account-repo.js';
import {error, fail, success} from '@/lib/response.js';
import {validateBody, validateIdParameter} from '@/lib/validator.js';
import {financialAccountMapper} from '@/mappers/financial-account-mapper.js';
import {createRouter} from '@/lib/create-router.js';

const accounts = createRouter();
accounts.use('/accounts/*', requireAuth);

accounts.get('/accounts', async c => {
	const user_id = c.get('user').id;

	try {
		const accounts = await FinancialAccountRepo.findMany({user_id});

		return success(c, accounts);
	} catch {
		return error(c, 'Failed to fetch accounts', {data: error});
	}
});

accounts.get('/accounts/:id', validateIdParameter, async c => {
	const user_id = c.get('user').id;
	const {id} = c.req.param();

	const account = await FinancialAccountRepo.findOne({id, user_id});

	if (!account || account.is_deleted) {
		return error(c, `Financial account with id ${id} not found`, {
			status: 404,
		});
	}

	return success(c, financialAccountMapper.fromDb(account));
});

accounts.post('/accounts', validateBody(NewFinancialAccountDto), async c => {
	const body = c.req.valid('json');
	const user_id = c.get('user').id;

	const newFinancialAccount = {
		...body,
		user_id,
		balance: body.initial_balance,
	};

	try {
		const newFinancialAccounts = await FinancialAccountRepo.create({
			data: financialAccountMapper.newDtoToDb(newFinancialAccount, user_id),
		});

		return success(c, financialAccountMapper.fromDb(newFinancialAccounts), 201);
	} catch (error_) {
		return error(c, 'Failed to create financial account', {data: error_});
	}
});

accounts.put(
	'/accounts/:id',
	validateIdParameter,
	validateBody(UpdateFinancialAccountDto),
	async c => {
		const body = c.req.valid('json');
		const user_id = c.get('user').id;
		const {id} = c.req.param();

		const account = await FinancialAccountRepo.findOne({id, user_id});

		if (!account || account.is_deleted) {
			return error(c, `Financial account with id ${id} not found`, {
				status: 404,
			});
		}

		// Check if account has transactions
		const transactions
      = await FinancialAccountRepo.findTransactionsForTransactionAccount({
      	id,
      	user_id,
      });

		const hasTransactions = transactions.length > 0;

		// If there are transactions, prevent updating initial_balance
		if (hasTransactions && 'initial_balance' in body) {
			return fail(c, {
				initial_balance:
          'Cannot update initial_balance for financial account with transactions',
			});
		}

		const updatedFinancialAccountData = {
			...body,
			...(!hasTransactions
				&& 'initial_balance' in body && {
				balance: body.initial_balance,
			}),
		};

		try {
			const updatedAccount = await FinancialAccountRepo.update({
				id,
				user_id,
				data: financialAccountMapper.updateDtoToDb(updatedFinancialAccountData),
			});

			return success(c, financialAccountMapper.fromDb(updatedAccount));
		} catch (error_) {
			return error(c, `Failed to update financial account with id ${id}`, {
				data: error_,
			});
		}
	},
);

accounts.delete('/accounts/:id', validateIdParameter, async c => {
	const user_id = c.get('user').id;
	const {id} = c.req.param();

	const account = await FinancialAccountRepo.findOne({id, user_id});

	if (!account || account.is_deleted) {
		return error(c, `Financial account with id ${id} not found`, {
			status: 404,
		});
	}

	try {
		const updatedAccount = await FinancialAccountRepo.update({
			id,
			user_id,
			data: {is_deleted: true},
		});

		return success(c, financialAccountMapper.fromDb(updatedAccount));
	} catch (error_) {
		return error(c, `Failed to delete financial account with id ${id}`, {
			data: error_,
		});
	}
});

export default accounts;
