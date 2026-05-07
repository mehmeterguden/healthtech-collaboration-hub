import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { logAudit } from "@/lib/audit";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAuth();
    const id = (await params).id;
    const { partnerId } = await req.json();

    if (!partnerId) {
      return NextResponse.json({ error: "Partner ID is required" }, { status: 400 });
    }

    const post = await prisma.post.findUnique({ where: { id } });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    if (post.authorId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Update post status and selected partner
    const updatedPost = await prisma.post.update({
      where: { id },
      data: {
        status: "partner_found",
        selectedPartnerId: partnerId,
      },
      include: {
        selectedPartner: true,
      }
    });

    // Create notification for the selected partner
    await prisma.notification.create({
      data: {
        userId: partnerId,
        type: "partner_found",
        message: `Congratulations! You have been selected as a partner for the project: ${post.title}`,
        linkTo: `/dashboard/post/${post.id}`,
      },
    });

    // Audit log
    await logAudit({
      userId: user.id,
      userName: `${user.firstName} ${user.lastName}`,
      userRole: user.role,
      actionType: "select_partner",
      targetEntity: "post",
      targetId: id,
      details: JSON.stringify({ partnerId }),
    });

    return NextResponse.json(updatedPost);
  } catch (error) {
    console.error("Partner selection error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
