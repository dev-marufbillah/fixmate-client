import { auth } from "@/lib/server/auth";
import { toNextJsHandler } from "better-auth/next-js";

export const dynamic = "force-dynamic";

const handler = toNextJsHandler(auth.handler);

export const { GET, POST, PATCH, PUT, DELETE } = handler;
