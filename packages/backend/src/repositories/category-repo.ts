import {db} from '@/lib/db.js';
import type {BaseQueryOptions} from '@/repositories/financial-account-repo.js';
import type {
	Category,
	CategoryUpdate,
	NewCategory,
} from '@/types/db/category.js';

type CreateCategoryParameters = {
	data: NewCategory;
} & BaseQueryOptions;

export async function create({
	data,
}: CreateCategoryParameters): Promise<Category> {
	return db
		.insertInto('category')
		.values(data)
		.returningAll()
		.executeTakeFirstOrThrow();
}

type FindOneCategoryParameters = {
	id: string;
	user_id: string;
} & BaseQueryOptions;

export async function findOne({
	id,
	user_id,
}: FindOneCategoryParameters): Promise<Category | undefined> {
	return db
		.selectFrom('category')
		.where('id', '=', id)
		.where('user_id', '=', user_id)
		.selectAll()
		.executeTakeFirst();
}

type FindManyCategoryParameters = {
	id: string[];
	user_id: string;
} & BaseQueryOptions;

export async function findMany({
	id,
	user_id,
}: FindManyCategoryParameters): Promise<Category[]> {
	return db
		.selectFrom('category')
		.where('user_id', '=', user_id)
		.where('is_deleted', '=', false)
		.where('id', 'in', id)
		.selectAll()
		.execute();
}

type GetAllCategoryParameters = {
	userId: string;
} & BaseQueryOptions;

export async function getAll({
	userId,
}: GetAllCategoryParameters): Promise<Category[]> {
	return db
		.selectFrom('category')
		.where('user_id', '=', userId)
		.where('is_deleted', '=', false)
		.selectAll()
		.execute();
}

type UpdateCategoryParameters = {
	id: string;
	user_id: string;
	data: CategoryUpdate;
} & BaseQueryOptions;

export async function update({
	id,
	user_id,
	data,
}: UpdateCategoryParameters): Promise<Category> {
	return db
		.updateTable('category')
		.where('id', '=', id)
		.where('user_id', '=', user_id)
		.set(data)
		.returningAll()
		.executeTakeFirstOrThrow();
}

type FindTransactionLinksCategoryParameters = {
	id: string;
} & BaseQueryOptions;

export async function findTransactionLinksForCategory({
	id,
}: FindTransactionLinksCategoryParameters) {
	return db
		.selectFrom('transaction_category')
		.where('category_id', '=', id)
		.selectAll()
		.execute();
}
