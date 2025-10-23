import {type ColumnDefinitions, type MigrationBuilder} from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
	pgm.createTable('user', {
		id: {type: 'uuid', primaryKey: true},
		name: {type: 'text', notNull: true},
		email: {type: 'text', notNull: true, unique: true},
		email_verified: {type: 'boolean', notNull: true},
		image: {type: 'text'},
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

	pgm.createTable('session', {
		id: {type: 'uuid', primaryKey: true},
		expires_at: {type: 'timestamptz', notNull: true},
		token: {type: 'text', notNull: true, unique: true},
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
		ip_address: {type: 'text'},
		user_agent: {type: 'text'},
		user_id: {
			type: 'uuid',
			notNull: true,
			references: 'user',
			onDelete: 'CASCADE',
		},
	});

	pgm.createTable('account', {
		id: {type: 'uuid', primaryKey: true},
		account_id: {type: 'text', notNull: true},
		provider_id: {type: 'text', notNull: true},
		user_id: {
			type: 'uuid',
			notNull: true,
			references: 'user',
			onDelete: 'CASCADE',
		},
		access_token: {type: 'text'},
		refresh_token: {type: 'text'},
		id_token: {type: 'text'},
		access_token_expires_at: {type: 'timestamptz'},
		refresh_token_expires_at: {type: 'timestamptz'},
		scope: {type: 'text'},
		password: {type: 'text'},
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

	pgm.createTable('verification', {
		id: {type: 'uuid', primaryKey: true},
		identifier: {type: 'text', notNull: true},
		value: {type: 'text', notNull: true},
		expires_at: {type: 'timestamptz', notNull: true},
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
}
