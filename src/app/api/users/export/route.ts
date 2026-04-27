import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth, sanitizeUser } from "@/lib/auth";
import { logAudit } from "@/lib/audit";

export async function GET(req: Request) {
  try {
    const user = await requireAuth();

    const fullData = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        posts: true,
        interests: true,
        sentRequests: true,
        receivedRequests: true,
      },
    });

    await logAudit({
      userId: user.id,
      userName: `${user.firstName} ${user.lastName}`,
      userRole: user.role,
      actionType: "data_export",
      targetEntity: "user",
      targetId: user.id,
    });

    // In a real app, you might save this to S3 and return a presigned URL
    // For this prototype, we'll return the JSON directly which the frontend can download
    return NextResponse.json({ downloadUrl: "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(fullData, null, 2)) });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
