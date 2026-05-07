import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { logAudit } from "@/lib/audit";

export async function POST(req: Request) {
  try {
    const { code } = await req.json();

    if (!code) {
      return NextResponse.json({ error: "Verification code is required" }, { status: 400 });
    }

    const user = await prisma.user.findFirst({
      where: { emailVerificationCode: code },
    });

    if (!user) {
      return NextResponse.json({ error: "Invalid verification code" }, { status: 400 });
    }

    if (user.isEmailVerified) {
      return NextResponse.json({ message: "Email already verified" }, { status: 200 });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { 
        isEmailVerified: true,
        emailVerificationCode: null, // Clear code after use
      },
    });

    await logAudit({
      userId: user.id,
      userName: `${user.firstName} ${user.lastName}`,
      userRole: user.role,
      actionType: "email_verify",
      targetEntity: "user",
      targetId: user.id,
    });

    return NextResponse.json({ message: "Email verified successfully" }, { status: 200 });
  } catch (error) {
    console.error("Verification error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
