import "server-only";

import { NextRequest, NextResponse } from "next/server";
import { turso } from "@/lib/turso";

export const SESSION_COOKIE_NAME = "etas_session";

export type UserRow = {
  id: string;
  username: string;
  pin: string | null;
};

export type SessionUser = {
  id: string;
  username: string;
};

export function normalizeUsername(username: string) {
  return username.trim().toLowerCase();
}

export async function findUserByUsername(username: string): Promise<UserRow | null> {
  const result = await turso.execute({
    sql: "SELECT id, username, pin FROM users WHERE username = ? LIMIT 1",
    args: [normalizeUsername(username)],
  });

  const row = result.rows[0] as
    | {
        id?: unknown;
        username?: unknown;
        pin?: unknown;
      }
    | undefined;

  if (!row) {
    return null;
  }

  return {
    id: String(row.id ?? ""),
    username: String(row.username ?? ""),
    pin: row.pin ? String(row.pin) : null,
  };
}

export function setSessionCookie(response: NextResponse, user: Pick<UserRow, "id" | "username">) {
  const sessionValue = JSON.stringify({
    id: user.id,
    username: user.username,
  });

  response.cookies.set(SESSION_COOKIE_NAME, sessionValue, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export function clearSessionCookie(response: NextResponse) {
  response.cookies.set(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

export function getSessionUser(request: NextRequest): SessionUser | null {
  const raw = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as { id?: unknown; username?: unknown };
    if (!parsed.id || !parsed.username) {
      return null;
    }
    return {
      id: String(parsed.id),
      username: String(parsed.username),
    };
  } catch {
    return null;
  }
}