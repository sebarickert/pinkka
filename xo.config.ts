import eslintPluginZodX from 'eslint-plugin-zod-x';
import {type FlatXoConfig} from 'xo';
import pluginQuery from '@tanstack/eslint-plugin-query';

const xoConfig: FlatXoConfig = [
	eslintPluginZodX.configs.recommended,
	...pluginQuery.configs['flat/recommended'],
	{
		prettier: true,
		rules: {
			'@typescript-eslint/no-restricted-types': 'off',
			'@typescript-eslint/naming-convention': 'off',
			'import-x/no-unassigned-import': ['error', {allow: ['dotenv/config']}],
			'n/prefer-global/process': ['error', 'always'],
		},
	},
	{
		files: ['./packages/backend/migrations/*'],
		rules: {
			'unicorn/filename-case': 'off',
		},
	},
	{
		files: ['./packages/schemas/**/*'],
		rules: {
			'@typescript-eslint/no-unsafe-assignment': 'off',
			'@typescript-eslint/no-unsafe-call': 'off',
		},
	},
];

export default xoConfig;
