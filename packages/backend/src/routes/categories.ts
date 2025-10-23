import {
	NewCategoryDtoSchema,
	UpdateCategoryDtoSchema,
} from '@pinkka/schemas/category-dto.js';
import {error, fail, success} from '@/lib/response.js';
import {requireAuth} from '@/middlewares/require-auth.js';
import * as CategoryRepo from '@/repositories/category-repo.js';
import {categoryMapper} from '@/mappers/category-mapper.js';
import {validateBody, validateIdParameter} from '@/lib/validator.js';
import {createRouter} from '@/lib/create-router.js';

const categories = createRouter();
categories.use('/categories/*', requireAuth);

categories.get('/categories', async (c) => {
	const userId = c.get('user').id;

	try {
		const categories = await CategoryRepo.getAll({userId});

		return success(
			c,
			categories.map((category) => categoryMapper.fromDb(category)),
		);
	} catch {
		return error(c, 'Failed to fetch categories', {data: error});
	}
});

categories.get('/categories/:id', validateIdParameter, async (c) => {
	const userId = c.get('user').id;
	const {id} = c.req.param();

	const category = await CategoryRepo.findOne({id, userId});

	if (!category || category.is_deleted) {
		return error(c, `Category with id ${id} not found`, {
			status: 404,
		});
	}

	return success(c, categoryMapper.fromDb(category));
});

categories.post(
	'/categories',
	validateBody(NewCategoryDtoSchema),
	async (c) => {
		const body = c.req.valid('json');
		const userId = c.get('user').id;

		try {
			const newCategory = await CategoryRepo.create({
				data: categoryMapper.newDtoToDb(body, userId),
			});

			return success(c, categoryMapper.fromDb(newCategory), 201);
		} catch (error_) {
			return error(c, 'Failed to create category', {data: error_});
		}
	},
);

categories.put(
	'/categories/:id',
	validateIdParameter,
	validateBody(UpdateCategoryDtoSchema),
	async (c) => {
		const body = c.req.valid('json');
		const userId = c.get('user').id;
		const {id} = c.req.param();

		const category = await CategoryRepo.findOne({id, userId});

		if (!category || category.is_deleted) {
			return error(c, `Category with id ${id} not found`, {
				status: 404,
			});
		}

		// Check if category has transactions
		const transactions = await CategoryRepo.findTransactionLinksForCategory({
			id,
		});
		const hasTransactions = transactions.length > 0;

		// If there are transactions, prevent updating type
		if (hasTransactions && 'type' in body) {
			return fail(c, {
				type: 'Cannot update type for category with transactions',
			});
		}

		try {
			const updatedCategory = await CategoryRepo.update({
				id,
				userId,
				data: categoryMapper.updateDtoToDb(body),
			});

			return success(c, categoryMapper.fromDb(updatedCategory));
		} catch (error_) {
			return error(c, `Failed to update category with id ${id}`, {
				data: error_,
			});
		}
	},
);

categories.delete('/categories/:id', validateIdParameter, async (c) => {
	const userId = c.get('user').id;
	const {id} = c.req.param();

	const category = await CategoryRepo.findOne({id, userId});

	if (!category || category.is_deleted) {
		return error(c, `Category with id ${id} not found`, {
			status: 404,
		});
	}

	try {
		const updatedCategory = await CategoryRepo.update({
			id,
			userId,
			data: categoryMapper.updateDtoToDb({isDeleted: true}),
		});

		return success(c, categoryMapper.fromDb(updatedCategory));
	} catch (error_) {
		return error(c, `Failed to delete category with id ${id}`, {
			data: error_,
		});
	}
});

export default categories;
