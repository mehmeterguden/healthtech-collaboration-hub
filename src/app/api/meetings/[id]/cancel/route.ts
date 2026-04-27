import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth, sanitizeUser } from "@/lib/auth";
import { logAudit } from "@/lib/audit";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAuth();
    const id = (await params).id;

    const meeting = await prisma.meetingRequest.findUnique({
      where: { id },
      include: { post: true, requester: true, receiver: true },
    });

    if (!meeting) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (meeting.requesterId !== user.id && meeting.receiverId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const updated = await prisma.meetingRequest.update({
      where: { id },
      data: { status: "cancelled" },
      include: { post: true, requester: true, receiver: true },
    });

    const notifyId = meeting.requesterId === user.id ? meeting.receiverId : meeting.requesterId;
    await prisma.notification.create({
      data: {
        userId: notifyId,
        type: "meeting_declined",
        message: `${user.firstName} ${user.lastName} cancelled the meeting`,
        linkTo: "/dashboard/meetings",
      },
    });

    await logAudit({
      userId: user.id,
      userName: `${user.firstName} ${user.lastName}`,
      userRole: user.role,
      actionType: "meeting_cancel",
      targetEntity: "meeting",
      targetId: id,
    });

    return NextResponse.json({
      ...updated,
      requester: sanitizeUser(updated.requester),
      receiver: sanitizeUser(updated.receiver),
      proposedSlots: JSON.parse(updated.proposedSlots || "[]"),
      selectedSlot: updated.selectedSlot ? JSON.parse(updated.selectedSlot) : undefined,
    });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
