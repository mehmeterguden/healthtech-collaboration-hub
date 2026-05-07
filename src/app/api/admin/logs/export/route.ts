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

    const csvHeader = "ID,Timestamp,User,Role,Action,Target,Status,IP\n";
    const csvRows = logs.map(l => 
      `"${l.id}","${new Date(l.timestamp).toISOString()}","${l.userName}","${l.userRole}","${l.actionType}","${l.targetEntity}","${l.resultStatus}","${l.ipAddress || ""}"`
    ).join("\n");
    
    const csvContent = csvHeader + csvRows;

    return NextResponse.json({ 
      downloadUrl: "data:text/csv;charset=utf-8," + encodeURIComponent(csvContent) 
    });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
