import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";
import { auth } from "@/lib/server/auth";

export const dynamic = "force-dynamic";

/**
 * POST /api/auth/token — bridges a BetterAuth cookie session into a
 * role-based JWT that the Express API can verify (verifyToken middleware).
 */
export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user) {
    return Response.json({ success: false, message: "Not signed in" }, { status: 401 });
  }

  const user = session.user as typeof session.user & {
    role?: string;
    phone?: string;
    area?: string;
    bio?: string;
  };

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    return Response.json(
      { success: false, message: "JWT_SECRET is not configured" },
      { status: 500 }
    );
  }

  const token = jwt.sign(
    {
      sub: user.id,
      email: user.email,
      name: user.name,
      role: user.role === "technician" || user.role === "admin" ? user.role : "customer",
      image: user.image || null,
    },
    secret,
    { expiresIn: "6h" }
  );

  return Response.json({ success: true, message: "Token issued", data: { token, expiresIn: 60 * 60 * 6 } });
}
