import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import { setSessionCookie, sanitizeUser } from "@/lib/auth";
import { logAudit } from "@/lib/audit";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password, role, firstName, lastName, institution, city, country } = body;

    if (!email || !password || !firstName || !lastName || !institution) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (!email.endsWith(".edu")) {
      return NextResponse.json({ error: "Only institutional .edu email addresses are allowed" }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: "Email already in use" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const slug = `${firstName.toLowerCase()}-${lastName.toLowerCase()}-${Math.random().toString(36).substring(2, 6)}`;

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: role || "engineer",
        firstName,
        lastName,
        institution,
        city: city || "",
        country: country || "",
        slug,
        emailVerificationCode: "123456", // Mock code for demo
      },
    });

    await logAudit({
      userId: user.id,
      userName: `${user.firstName} ${user.lastName}`,
      userRole: user.role,
      actionType: "register",
      targetEntity: "user",
      targetId: user.id,
      ipAddress: req.headers.get("x-forwarded-for") || undefined,
    });

    const token = await setSessionCookie({ userId: user.id, email: user.email, role: user.role });

    return NextResponse.json({ user: sanitizeUser(user), token }, { status: 201 });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
