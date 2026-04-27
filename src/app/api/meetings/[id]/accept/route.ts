import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth, sanitizeUser } from "@/lib/auth";
import { logAudit } from "@/lib/audit";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAuth();
    const id = (await params).id;
    const { slotId } = await req.json();

    const meeting = await prisma.meetingRequest.findUnique({
      where: { id },
      include: { post: true, requester: true, receiver: true },
    });

    if (!meeting) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (meeting.receiverId !== user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const proposedSlots = JSON.parse(meeting.proposedSlots || "[]");
    const selectedSlot = proposedSlots.find((s: any) => s.id === slotId);

    if (!selectedSlot) return NextResponse.json({ error: "Invalid slot" }, { status: 400 });

    const updated = await prisma.meetingRequest.update({
      where: { id },
      data: {
        status: "scheduled",
        selectedSlot: JSON.stringify(selectedSlot),
        meetingLink: `https://meet.healthai.edu/${Math.random().toString(36).substring(7)}`, // Mock link
      },
      include: { post: true, requester: true, receiver: true },
    });

    await prisma.notification.create({
      data: {
        userId: meeting.requesterId,
        type: "meeting_accepted",
        message: `${user.firstName} ${user.lastName} accepted your meeting request`,
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
