import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const { code } = await req.json();
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (user.emailVerificationCode === code) {
      await prisma.user.update({
        where: { id: user.id },
        data: { isEmailVerified: true, emailVerificationCode: null },
      });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid verification code" }, { status: 400 });
  } catch (error) {
    console.error("Verification error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
