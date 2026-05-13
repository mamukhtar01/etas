import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import {
  findUserByUsername,
  normalizeUsername,
  setSessionCookie,
} from "@/lib/auth";
import { ensureUsersSchema, turso } from "@/lib/turso";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    await ensureUsersSchema();

    const payload = (await request.json()) as {
      username?: string;
      pin?: string;
    };

    const usernameRaw = payload.username?.trim() ?? "";
    const pin = payload.pin?.trim() ?? "";

    if (!usernameRaw || !pin) {
      return NextResponse.json(
        { error: "Username and PIN are required." },
        { status: 400 },
      );
    }

    const username = normalizeUsername(usernameRaw);
    const user = await findUserByUsername(username);

    if (!user) {
      const id = randomUUID();

      await turso.execute({
        sql: "INSERT INTO users (id, username, pin, role) VALUES (?, ?, ?, ?)",
        args: [id, username, pin, "user"],
      });

      const response = NextResponse.json({ data: { id, username } });
      setSessionCookie(response, { id, username });
      return response;
    }

    if (!user.pin || user.pin !== pin) {
      return NextResponse.json(
        { error: "Invalid username or PIN." },
        { status: 401 },
      );
    }

    const response = NextResponse.json({
      data: { id: user.id, username: user.username },
    });

    setSessionCookie(response, user);
    return response;
  } catch (error) {
    console.error("POST /api/auth/login failed", error);
    return NextResponse.json({ error: "Login failed." }, { status: 500 });
  }
}