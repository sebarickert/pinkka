import type {NewCategoryDto} from '@pinkka/schemas/CategoryDto.js';
import type {UserWithSessionToken} from '@test-utils/create-test-user.js';
import {fetcher} from '@test-utils/fetcher.js';
import {expect} from 'vitest';
import type {Category} from '@/types/db/category.js';

export async function createCategory(
	newCategoryPayload: Omit<NewCategoryDto, 'is_deleted'>,
	user: UserWithSessionToken,
): Promise<Category> {
	const res = await fetcher(
		'/api/categories',
		{
			method: 'POST',
			body: JSON.stringify(newCategoryPayload),
		},
		user.session_token,
	);

	const body = await res.json();

	expect(res.status).toEqual(201);
	expect(body.status).toEqual('success');

	return body.data;
}
