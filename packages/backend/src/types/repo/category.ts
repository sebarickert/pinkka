import type {BaseRepoOptions} from '@/types/db/base-repo-options.js';
import type {CategoryUpdate, NewCategory} from '@/types/db/category.js';

export type CreateCategoryParameters = {
	data: NewCategory;
} & BaseRepoOptions;

export type FindOneCategoryParameters = {
	id: string;
	userId: string;
} & BaseRepoOptions;

export type GetAllCategoryParameters = {
	userId: string;
} & BaseRepoOptions;

export type UpdateCategoryParameters = {
	id: string;
	userId: string;
	data: CategoryUpdate;
} & BaseRepoOptions;

export type DeleteCategoryParameters = {
	id: string;
	userId: string;
} & BaseRepoOptions;

export type FindTransactionLinksCategoryParameters = {
	id: string;
} & BaseRepoOptions;
