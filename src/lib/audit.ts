import { prisma } from "./db";

export async function logAudit(data: {
  userId?: string | null;
  userName?: string;
  userRole?: string;
  actionType: string;
  targetEntity: string;
  targetId?: string;
  resultStatus?: "success" | "failure";
  details?: any;
  ipAddress?: string;
}) {
  try {
    await prisma.auditLog.create({
      data: {
        userId: data.userId || null,
        userName: data.userName || "Unknown",
        userRole: data.userRole || "",
        actionType: data.actionType,
        targetEntity: data.targetEntity,
        targetId: data.targetId || "",
        resultStatus: data.resultStatus || "success",
        details: data.details ? JSON.stringify(data.details) : null,
        ipAddress: data.ipAddress || null,
      },
    });
  } catch (error) {
    console.error("Failed to log audit event:", error);
  }
}
