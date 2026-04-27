import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    await requireAdmin();
    
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const actionType = searchParams.get("actionType");

    const where: any = {};
    if (userId) where.userId = userId;
    if (actionType) where.actionType = actionType;

    const logs = await prisma.auditLog.findMany({
      where,
      orderBy: { timestamp: "desc" },
      take: 100,
    });

    return NextResponse.json(logs);
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
