import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth, sanitizeUser, clearSessionCookie } from "@/lib/auth";
import { logAudit } from "@/lib/audit";

export async function GET(req: Request) {
  try {
    const user = await requireAuth();
    return NextResponse.json(sanitizeUser(user));
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const user = await requireAuth();
    const body = await req.json();

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        firstName: body.firstName,
        lastName: body.lastName,
        bio: body.bio,
        city: body.city,
        country: body.country,
        institution: body.institution,
        expertise: body.expertise ? JSON.stringify(body.expertise) : undefined,
      },
    });

    await logAudit({
      userId: user.id,
      userName: `${updated.firstName} ${updated.lastName}`,
      userRole: user.role,
      actionType: "profile_update",
      targetEntity: "user",
      targetId: user.id,
    });

    return NextResponse.json(sanitizeUser(updated));
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const user = await requireAuth();

    await prisma.user.delete({
      where: { id: user.id },
    });

    await logAudit({
      userId: user.id,
      userName: `${user.firstName} ${user.lastName}`,
      userRole: user.role,
      actionType: "account_delete",
      targetEntity: "user",
      targetId: user.id,
    });

    await clearSessionCookie();

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
