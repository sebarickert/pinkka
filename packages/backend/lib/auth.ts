import { database } from "@/lib/db.js";
import { betterAuth } from "better-auth";

export type AuthType = {
  Variables: {
    user: typeof auth.$Infer.Session.user | null;
    session: typeof auth.$Infer.Session.session | null;
  };
};

export const auth = betterAuth({
  database,
  // Allow requests from the frontend development server
  //   trustedOrigins: ['http://localhost:5173'],
  emailAndPassword: {
    enabled: true,
  },
});
