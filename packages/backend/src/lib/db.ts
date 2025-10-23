import dotenv from 'dotenv';
import {Pool} from 'pg';
import {Kysely, PostgresDialect} from 'kysely';
import type {Database} from '@/types/db/Database.js';

dotenv.config({path: '../../.env'});

const {DATABASE_USER, DATABASE_PASSWORD, DATABASE_DB, DATABASE_PORT}
  = process.env;

const dialect = new PostgresDialect({
	pool: new Pool({
		user: DATABASE_USER,
		password: DATABASE_PASSWORD,
		database: DATABASE_DB,
		port: Number(DATABASE_PORT),
	}),
});

export const db = new Kysely<Database>({
	dialect,
});
