import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const users = await prisma.user.findMany({ take: 1 });
    return NextResponse.json({
      ok: true,
      usersCount: users.length,
      user: users.length > 0
        ? { id: String(users[0].id), username: users[0].username }
        : null,
    });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: String(e) },
      { status: 500 },
    );
  }
}
