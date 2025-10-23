import type {
	Generated,
	GeneratedAlways,
	Insertable,
	Selectable,
	Updateable,
} from 'kysely';
import type {Timestamp} from '@/types/db/Database.js';

export type AccountTable = {
	access_token: string | null;
	access_token_expires_at: Timestamp | null;
	account_id: string;
	created_at: Generated<Date>;
	id: GeneratedAlways<string>;
	id_token: string | null;
	password: string | null;
	provider_id: string;
	refresh_token: string | null;
	refresh_token_expires_at: Timestamp | null;
	scope: string | null;
	updated_at: Generated<Date>;
	user_id: string;
};

export type Account = Selectable<AccountTable>;
export type NewAccount = Insertable<AccountTable>;
export type AccountUpdate = Updateable<AccountTable>;
