import eslintPluginZodX from 'eslint-plugin-zod-x';
import {type FlatXoConfig} from 'xo';

const xoConfig: FlatXoConfig = [
	eslintPluginZodX.configs.recommended,
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
		files: ['./packages/backend/migrations/*'],
		rules: {
			'unicorn/filename-case': 'off',
			'@typescript-eslint/naming-convention': 'off',
		},
	},
	{
		files: ['./packages/schemas/**/*'],
		rules: {
			'@typescript-eslint/naming-convention': 'off',
			'@typescript-eslint/no-unsafe-assignment': 'off',
			'@typescript-eslint/no-unsafe-call': 'off',
		},
	},
];

export default xoConfig;
