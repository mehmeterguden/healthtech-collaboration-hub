import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import bcrypt from "bcryptjs";
import { logAudit } from "@/lib/audit";

export async function POST(req: Request) {
  try {
    const user = await requireAuth();
    const { currentPassword, newPassword } = await req.json();

    const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
    if (!dbUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const isValid = await bcrypt.compare(currentPassword, dbUser.password);
    if (!isValid) return NextResponse.json({ error: "Invalid current password" }, { status: 400 });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    await logAudit({
      userId: user.id,
      userName: `${user.firstName} ${user.lastName}`,
      userRole: user.role,
      actionType: "password_change",
      targetEntity: "user",
      targetId: user.id,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
