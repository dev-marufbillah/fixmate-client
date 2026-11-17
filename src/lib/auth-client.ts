"use client";

import { createAuthClient } from "better-auth/react";
import { Role } from "./types";

export const authClient = createAuthClient();

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  role?: Role;
  phone?: string;
  area?: string;
  bio?: string;
  createdAt?: string;
}
