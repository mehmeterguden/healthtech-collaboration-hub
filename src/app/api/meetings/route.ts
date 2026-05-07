import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth, sanitizeUser } from "@/lib/auth";
import { logAudit } from "@/lib/audit";

export async function GET(req: Request) {
  try {
    const user = await requireAuth();

    const meetings = await prisma.meetingRequest.findMany({
      where: {
        OR: [
          { requesterId: user.id },
          { receiverId: user.id },
        ],
      },
      include: {
        post: true,
        requester: true,
        receiver: true,
      },
      orderBy: { updatedAt: "desc" },
    });

    const sanitizedMeetings = meetings.map(m => ({
      ...m,
      requester: sanitizeUser(m.requester),
      receiver: sanitizeUser(m.receiver),
      proposedSlots: JSON.parse(m.proposedSlots || "[]"),
      selectedSlot: m.selectedSlot ? JSON.parse(m.selectedSlot) : undefined,
    }));

    return NextResponse.json(sanitizedMeetings);
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireAuth();
    const { postId, receiverId, message, proposedSlots, ndaAccepted } = await req.json();

    if (!postId || !receiverId || !message || !proposedSlots || proposedSlots.length === 0) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (!ndaAccepted) {
      return NextResponse.json({ error: "NDA acceptance is required" }, { status: 400 });
    }

    const meeting = await prisma.meetingRequest.create({
      data: {
        postId,
        requesterId: user.id,
        receiverId,
        message,
        proposedSlots: JSON.stringify(proposedSlots),
        ndaAccepted: true,
      },
      include: {
        post: true,
        requester: true,
        receiver: true,
      },
    });

    await prisma.notification.create({
      data: {
        userId: receiverId,
        type: "meeting_request",
        message: `${user.firstName} ${user.lastName} requested a meeting`,
        linkTo: "/dashboard/meetings",
      },
    });

    await logAudit({
      userId: user.id,
      userName: `${user.firstName} ${user.lastName}`,
      userRole: user.role,
      actionType: "meeting_request",
      targetEntity: "meeting",
      targetId: meeting.id,
    });

    return NextResponse.json({
      ...meeting,
      requester: sanitizeUser(meeting.requester),
      receiver: sanitizeUser(meeting.receiver),
      proposedSlots: JSON.parse(meeting.proposedSlots || "[]"),
    }, { status: 201 });
  } catch (error) {
    console.error("Meeting create error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
