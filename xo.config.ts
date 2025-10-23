import {type FlatXoConfig} from 'xo';

const xoConfig: FlatXoConfig = [
	{
		prettier: true,
		rules: {
			'@typescript-eslint/no-restricted-types': 'off',
		},
	},
	{
		files: ['./packages/backend/src/mappers/*.ts'],
		rules: {
			'@typescript-eslint/naming-convention': [
				'error',
				{selector: 'default', format: ['strictCamelCase', 'snake_case']},
			],
		},
	},
	{
		files: ['./packages/backend/migrations/*.ts'],
		rules: {
			'unicorn/filename-case': 'off',
			'@typescript-eslint/naming-convention': 'off',
		},
	},
];

export default xoConfig;
