import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { logAudit } from "@/lib/audit";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await requireAuth();
    const { meetingLink } = await req.json();

    const meeting = await prisma.meetingRequest.findUnique({
      where: { id },
      include: {
        requester: true,
        receiver: true,
        post: true,
      },
    });

    if (!meeting) {
      return NextResponse.json({ error: "Meeting not found" }, { status: 404 });
    }

    if (meeting.requesterId !== user.id && meeting.receiverId !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const updatedMeeting = await prisma.meetingRequest.update({
      where: { id },
      data: { meetingLink },
      include: {
        requester: true,
        receiver: true,
        post: true,
      },
    });

    // Notify the other party
    const otherUserId = meeting.requesterId === user.id ? meeting.receiverId : meeting.requesterId;
    await prisma.notification.create({
      data: {
        userId: otherUserId,
        type: "meeting_link_updated",
        message: `${user.firstName} updated the meeting link for "${meeting.post.title}"`,
        linkTo: "/dashboard/meetings",
      },
    });

    // Also notify the sender just in case (as requested "bildiri de gitsin ikisine de")
    await prisma.notification.create({
      data: {
        userId: user.id,
        type: "meeting_link_updated",
        message: `You updated the meeting link for "${meeting.post.title}"`,
        linkTo: "/dashboard/meetings",
      },
    });

    await logAudit({
      userId: user.id,
      userName: `${user.firstName} ${user.lastName}`,
      userRole: user.role,
      actionType: "update_meeting_link",
      targetEntity: "meeting",
      targetId: meeting.id,
      details: `Meeting link updated: ${meetingLink}`,
    });

    return NextResponse.json({
      ...updatedMeeting,
      proposedSlots: JSON.parse(updatedMeeting.proposedSlots || "[]"),
      selectedSlot: updatedMeeting.selectedSlot ? JSON.parse(updatedMeeting.selectedSlot) : undefined,
    });
  } catch (error) {
    console.error("Update meeting link error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
