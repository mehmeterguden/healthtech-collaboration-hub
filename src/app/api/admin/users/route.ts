import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin, sanitizeUser } from "@/lib/auth";

export async function GET() {
  try {
    await requireAdmin();
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(users.map(sanitizeUser));
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
