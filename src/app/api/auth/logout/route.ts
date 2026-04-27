import { NextResponse } from "next/server";
import { clearSessionCookie } from "@/lib/auth";
import { logAudit } from "@/lib/audit";

export async function POST(req: Request) {
  const userId = req.headers.get("x-user-id");
  const userRole = req.headers.get("x-user-role");

  if (userId) {
    await logAudit({
      userId,
      userRole: userRole || undefined,
      actionType: "logout",
      targetEntity: "session",
    });
  }

  await clearSessionCookie();
  return NextResponse.json({ success: true });
}
