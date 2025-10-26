import {betterAuth} from 'better-auth';
import {v4 as uuidv4} from 'uuid';
import {admin} from 'better-auth/plugins/admin';
import {db} from '@/lib/db.js';
import {FRONTEND_URL} from '@/lib/env.js';

export type AuthUser = typeof auth.$Infer.Session.user;
export type AuthSession = typeof auth.$Infer.Session.session;

export type AuthType = {
	Variables: {
		user: AuthUser;
		session: AuthSession;
	};
};

// https://github.com/better-auth/better-auth/issues/4789
export const auth = betterAuth({
	database: {db, case: 'snake', type: 'postgres'},
	plugins: [admin()],
	advanced: {
		database: {
			generateId: () => uuidv4(),
		},
	},
	// Allow requests from the frontend development server
	trustedOrigins: [FRONTEND_URL ?? ''],
	emailAndPassword: {
		enabled: true,
	},
	user: {
		fields: {
			emailVerified: 'email_verified',
			createdAt: 'created_at',
			updatedAt: 'updated_at',
			banReason: 'ban_reason',
			banExpires: 'ban_expires',
		},
	},
	session: {
		fields: {
			userId: 'user_id',
			expiresAt: 'expires_at',
			createdAt: 'created_at',
			updatedAt: 'updated_at',
			ipAddress: 'ip_address',
			userAgent: 'user_agent',
			impersonatedBy: 'impersonated_by',
		},
	},
	account: {
		fields: {
			userId: 'user_id',
			accountId: 'account_id',
			providerId: 'provider_id',
			accessToken: 'access_token',
			refreshToken: 'refresh_token',
			idToken: 'id_token',
			accessTokenExpiresAt: 'access_token_expires_at',
			refreshTokenExpiresAt: 'refresh_token_expires_at',
			createdAt: 'created_at',
			updatedAt: 'updated_at',
		},
	},
	verification: {
		fields: {
			expiresAt: 'expires_at',
			createdAt: 'created_at',
			updatedAt: 'updated_at',
		},
	},
});
