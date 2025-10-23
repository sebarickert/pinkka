import {type MigrationBuilder, type ColumnDefinitions} from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
	pgm.createType('financial_account_type', [
		'bank',
		'credit_card',
		'wallet',
		'investment',
		'loan',
	]);

	pgm.createType('transaction_type', ['expense', 'income', 'transfer']);

	pgm.createTable('financial_account', {
		id: {
			type: 'uuid',
			primaryKey: true,
			default: pgm.func('gen_random_uuid()'),
		},
		user_id: {
			type: 'uuid',
			references: 'user',
			notNull: true,
			onDelete: 'CASCADE',
		},
		name: {type: 'text', notNull: true},
		type: {type: 'financial_account_type', notNull: true},
		currency: {type: 'text', notNull: true},
		initial_balance: {type: 'numeric', notNull: true, default: 0},
		balance: {type: 'numeric', notNull: true, default: 0},
		pending_balance: {type: 'numeric', notNull: true, default: 0},
		is_deleted: {type: 'boolean', notNull: true, default: false},
		created_at: {
			type: 'timestamptz',
			notNull: true,
			default: pgm.func('CURRENT_TIMESTAMP'),
		},
		updated_at: {
			type: 'timestamptz',
			notNull: true,
			default: pgm.func('CURRENT_TIMESTAMP'),
		},
	});

	pgm.createTable('transaction', {
		id: {
			type: 'uuid',
			primaryKey: true,
			default: pgm.func('gen_random_uuid()'),
		},
		user_id: {
			type: 'uuid',
			references: 'user',
			notNull: true,
			onDelete: 'CASCADE',
		},
		to_account_id: {
			type: 'uuid',
			references: 'financial_account',
			onDelete: 'SET NULL',
		},
		from_account_id: {
			type: 'uuid',
			references: 'financial_account',
			onDelete: 'SET NULL',
		},
		type: {type: 'transaction_type', notNull: true},
		amount: {type: 'numeric', notNull: true},
		description: {type: 'text', notNull: true},
		date: {
			type: 'timestamptz',
			notNull: true,
			default: pgm.func('CURRENT_TIMESTAMP'),
		},
		created_at: {
			type: 'timestamptz',
			notNull: true,
			default: pgm.func('CURRENT_TIMESTAMP'),
		},
		updated_at: {
			type: 'timestamptz',
			notNull: true,
			default: pgm.func('CURRENT_TIMESTAMP'),
		},
	});

	pgm.createTable('category', {
		id: {
			type: 'uuid',
			primaryKey: true,
			default: pgm.func('gen_random_uuid()'),
		},
		user_id: {
			type: 'uuid',
			references: 'user',
			notNull: true,
			onDelete: 'CASCADE',
		},
		is_deleted: {type: 'boolean', notNull: true, default: false},
		type: {type: 'transaction_type', notNull: true},
		name: {type: 'text', notNull: true},
		created_at: {
			type: 'timestamptz',
			notNull: true,
			default: pgm.func('CURRENT_TIMESTAMP'),
		},
		updated_at: {
			type: 'timestamptz',
			notNull: true,
			default: pgm.func('CURRENT_TIMESTAMP'),
		},
	});

	pgm.createTable('transaction_category', {
		category_id: {
			type: 'uuid',
			references: 'category',
			notNull: true,
			onDelete: 'CASCADE',
		},
		transaction_id: {
			type: 'uuid',
			references: 'transaction',
			notNull: true,
			onDelete: 'CASCADE',
		},
	});
}
