import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { logAudit } from "@/lib/audit";

export async function GET() {
  try {
    const admin = await requireAdmin();
    
    const logs = await prisma.auditLog.findMany({
      orderBy: { timestamp: "desc" },
      take: 1000,
    });

    await logAudit({
      userId: admin.id,
      userName: `${admin.firstName} ${admin.lastName}`,
      userRole: admin.role,
      actionType: "admin_export_logs",
      targetEntity: "audit_log",
    });

    return NextResponse.json({ downloadUrl: "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(logs, null, 2)) });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
