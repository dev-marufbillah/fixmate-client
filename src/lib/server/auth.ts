import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { getDb } from "./db";

const baseURL = process.env.BETTER_AUTH_URL || "http://localhost:3000";

/**
 * BetterAuth config — owns the `user` collection (our users collection),
 * with role / phone / area / bio stored via additionalFields.
 */
export const auth = betterAuth({
  baseURL,
  secret: process.env.BETTER_AUTH_SECRET,
  database: mongodbAdapter(getDb()),
  emailAndPassword: {
    enabled: true,
    // Assignment rules: at least 6 characters (complexity is enforced on the sign-up form).
    minPasswordLength: 6,
  },
  // Social login (Google + GitHub) — a provider activates only when its OAuth
  // credentials exist in .env.local (see SETUP-AND-DEPLOY.md). Social users
  // default to the 'customer' role via the create hook below.
  socialProviders: {
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? {
          google: {
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          },
        }
      : {}),
    ...(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET
      ? {
          github: {
            clientId: process.env.GITHUB_CLIENT_ID,
            clientSecret: process.env.GITHUB_CLIENT_SECRET,
          },
        }
      : {}),
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "customer",
        input: true,
        returned: true,
      },
      phone: { type: "string", required: false, input: true, returned: true },
      area: { type: "string", required: false, input: true, returned: true },
      bio: { type: "string", required: false, input: true, returned: true },
    },
  },
  databaseHooks: {
    user: {
      create: {
        // Nobody can sign up as admin — anything except customer/technician becomes customer.
        async before(user) {
          const role = user.role === "technician" ? "technician" : "customer";
          return { data: { ...user, role } };
        },
      },
      update: {
        // Security: roles are NEVER changed through BetterAuth's /update-user.
        // Only the verified admin API (PATCH /api/admin/users/:id/role) may do it.
        async before(data) {
          if (data && typeof data === "object" && "role" in data) {
            return false;
          }
        },
      },
    },
  },
  // Trust exactly where we run. The wildcard covers sandbox preview origins
  // (https://<port>-<id>.e2b.app) — delete it when you move to your own domain.
  trustedOrigins: [baseURL, "https://*.e2b.app"],
});
