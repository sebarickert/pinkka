import { db } from "@/lib/db.js";
import { betterAuth } from "better-auth";
import { v4 as uuidv4 } from "uuid";

export type AuthUser = typeof auth.$Infer.Session.user;
export type AuthSession = typeof auth.$Infer.Session.session;

export type AuthType = {
  Variables: {
    user: AuthUser | null;
    session: AuthSession | null;
  };
};

export const auth = betterAuth({
  database: { db, case: "snake", type: "postgres" },
  advanced: {
    database: {
      generateId: () => uuidv4(),
    },
  },
  // Allow requests from the frontend development server
  trustedOrigins: [process.env.FRONTEND_URL!],
  emailAndPassword: {
    enabled: true,
  },
  user: {
    fields: {
      emailVerified: "email_verified",
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  },
  session: {
    fields: {
      userId: "user_id",
      expiresAt: "expires_at",
      createdAt: "created_at",
      updatedAt: "updated_at",
      ipAddress: "ip_address",
      userAgent: "user_agent",
    },
  },
  account: {
    fields: {
      userId: "user_id",
      accountId: "account_id",
      providerId: "provider_id",
      accessToken: "access_token",
      refreshToken: "refresh_token",
      idToken: "id_token",
      accessTokenExpiresAt: "access_token_expires_at",
      refreshTokenExpiresAt: "refresh_token_expires_at",
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  },
  verification: {
    fields: {
      expiresAt: "expires_at",
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  },
});
