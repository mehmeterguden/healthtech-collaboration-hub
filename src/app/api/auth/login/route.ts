import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import { setSessionCookie, sanitizeUser } from "@/lib/auth";
import { logAudit } from "@/lib/audit";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Missing email or password" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    
    if (!user || !(await bcrypt.compare(password, user.password))) {
      await logAudit({
        userId: user?.id,
        userName: user ? `${user.firstName} ${user.lastName}` : "Unknown",
        userRole: user?.role,
        actionType: "login_failed",
        targetEntity: "session",
        resultStatus: "failure",
        ipAddress: req.headers.get("x-forwarded-for") || undefined,
      });
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    if (!user.isActive) {
      return NextResponse.json({ error: "Account is suspended" }, { status: 403 });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    await logAudit({
      userId: user.id,
      userName: `${user.firstName} ${user.lastName}`,
      userRole: user.role,
      actionType: "login",
      targetEntity: "session",
      ipAddress: req.headers.get("x-forwarded-for") || undefined,
    });

    const token = await setSessionCookie({ userId: user.id, email: user.email, role: user.role });

    return NextResponse.json({ user: sanitizeUser(user), token });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
