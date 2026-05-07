import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth, sanitizeUser } from "@/lib/auth";
import { logAudit } from "@/lib/audit";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAuth();
    const id = (await params).id;
    const { slotId, customSlot } = await req.json();

    const meeting = await prisma.meetingRequest.findUnique({
      where: { id },
      include: { post: true, requester: true, receiver: true },
    });

    if (!meeting) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (meeting.receiverId !== user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    let selectedSlot = null;
    if (slotId === "custom" && customSlot) {
      selectedSlot = customSlot;
    } else {
      const proposedSlots = JSON.parse(meeting.proposedSlots || "[]");
      selectedSlot = proposedSlots.find((s: any) => s.id === slotId);
    }

    if (!selectedSlot) return NextResponse.json({ error: "Invalid slot" }, { status: 400 });

    const updated = await prisma.meetingRequest.update({
      where: { id },
      data: {
        status: "scheduled",
        selectedSlot: JSON.stringify(selectedSlot),
        meetingLink: null, // No automatic link
      },
      include: { post: true, requester: true, receiver: true },
    });

    // Automatically update post status to meeting_scheduled
    await prisma.post.update({
      where: { id: meeting.postId },
      data: { status: "meeting_scheduled" },
    });

    const timeStr = `${selectedSlot.date} at ${selectedSlot.startTime}`;

    // Notification for Requester
    await prisma.notification.create({
      data: {
        userId: meeting.requesterId,
        type: "meeting_accepted",
        message: `Meeting Confirmed: ${user.firstName} accepted your request for ${timeStr}`,
        linkTo: "/dashboard/meetings",
      },
    });

    // Notification for Receiver (Self confirmation)
    await prisma.notification.create({
      data: {
        userId: user.id,
        type: "meeting_scheduled",
        message: `You scheduled a meeting with ${meeting.requester.firstName} for ${timeStr}`,
        linkTo: "/dashboard/meetings",
      },
    });

    await logAudit({
      userId: user.id,
      userName: `${user.firstName} ${user.lastName}`,
      userRole: user.role,
      actionType: "meeting_accept",
      targetEntity: "meeting",
      targetId: id,
    });

    return NextResponse.json({
      ...updated,
      requester: sanitizeUser(updated.requester),
      receiver: sanitizeUser(updated.receiver),
      proposedSlots: JSON.parse(updated.proposedSlots || "[]"),
      selectedSlot: JSON.parse(updated.selectedSlot || "null"),
    });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
