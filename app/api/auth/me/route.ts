import { NextRequest, NextResponse } from "next/server";
import { findUserById, getSessionUser } from "@/lib/auth";
import { ensureUsersSchema } from "@/lib/turso";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const sessionUser = getSessionUser(request);
  if (!sessionUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await ensureUsersSchema();
  const user = await findUserById(sessionUser.id);

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({
    data: {
      id: user.id,
      username: user.username,
      role: user.role,
    },
  });
}