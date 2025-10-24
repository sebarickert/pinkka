import {zValidator} from '@hono/zod-validator';
import {validator} from 'hono/validator';
import {validate} from 'uuid';
import * as z from 'zod';
import {error, fail} from '@/lib/response.js';

export function mapZodErrors<T extends z.ZodError>(errors: T) {
	const isArrayError = errors.issues.some(
		(error_) => typeof error_.path[0] === 'number',
	);

	if (isArrayError) {
		const result: Record<number, Record<string, string[]>> = {};
		for (const error_ of errors.issues) {
			const [index, field] = error_.path;
			if (typeof index !== 'number' || typeof field !== 'string') {
				continue;
			}

			result[index] ||= {};
			result[index][field] = [...(result[index][field] || []), error_.message];
		}

		return result;
	}

	return z.flattenError(errors).fieldErrors;
}

export const validateIdParameter = validator('param', (value, c) => {
	const {id} = value;

	if (!validate(id)) {
		return error(c, 'Invalid id format', {status: 400});
	}
});

export function validateBody<T extends z.ZodObject<any>>(schema: T) {
	return zValidator('json', schema, (result, c) => {
		if (!result.success) {
			// @ts-expect-error typing issue with zod errors
			return fail(c, mapZodErrors(result.error));
		}
	});
}
