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
  trustedOrigins: [baseURL],
});
