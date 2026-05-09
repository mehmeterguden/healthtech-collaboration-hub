import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth, sanitizeUser } from "@/lib/auth";

// GET /api/messages?meetingId=xxx
// Returns all messages for a meeting — only if the user is a participant
export async function GET(req: Request) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(req.url);
    const meetingId = searchParams.get("meetingId");

    if (!meetingId) {
      return NextResponse.json({ error: "meetingId is required" }, { status: 400 });
    }

    // Handle virtual interest-based conversation
    if (meetingId.startsWith("interest-in-")) {
      const interestId = meetingId.replace("interest-in-", "");
      const interest = await prisma.interest.findUnique({
        where: { id: interestId },
        include: { user: true, post: true },
      });

      if (!interest) {
        return NextResponse.json({ error: "Interest not found" }, { status: 404 });
      }

      // Verify the user is the owner of the post
      if (interest.post.authorId !== user.id) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }

      // Return the initial interest message as a "virtual" message
      return NextResponse.json([
        {
          id: `virtual-${interest.id}`,
          content: interest.message,
          createdAt: interest.createdAt,
          senderId: interest.userId,
          sender: sanitizeUser(interest.user),
        }
      ]);
    }

    // Regular meeting messages
    const meeting = await prisma.meetingRequest.findUnique({
      where: { id: meetingId },
    });

    if (!meeting) {
      return NextResponse.json({ error: "Meeting not found" }, { status: 404 });
    }

    if (meeting.requesterId !== user.id && meeting.receiverId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const messages = await prisma.message.findMany({
      where: { meetingId },
      include: { sender: true },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json(
      messages.map((m) => ({
        ...m,
        sender: sanitizeUser(m.sender),
      }))
    );
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/messages
// Send a message in a meeting chat
export async function POST(req: Request) {
  try {
    const user = await requireAuth();
    const { meetingId, content } = await req.json();

    if (!meetingId || !content?.trim()) {
      return NextResponse.json({ error: "meetingId and content are required" }, { status: 400 });
    }

    let targetMeetingId = meetingId;

    // If it's a virtual interest conversation, "activate" it by creating a MeetingRequest
    if (meetingId.startsWith("interest-in-")) {
      const interestId = meetingId.replace("interest-in-", "");
      const interest = await prisma.interest.findUnique({
        where: { id: interestId },
        include: { post: true },
      });

      if (!interest) {
        return NextResponse.json({ error: "Interest not found" }, { status: 404 });
      }

      // Verify the user is the owner of the post
      if (interest.post.authorId !== user.id) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }

      // Create a MeetingRequest with status "accepted" (chat enabled)
      const meeting = await prisma.meetingRequest.create({
        data: {
          postId: interest.postId,
          requesterId: interest.userId,
          receiverId: user.id,
          message: interest.message,
          status: "accepted",
          ndaAccepted: true,
          proposedSlots: "[]", // No slots yet
        }
      });
      targetMeetingId = meeting.id;

      // Also create the initial message from the requester (the interest message)
      await prisma.message.create({
        data: {
          meetingId: targetMeetingId,
          senderId: interest.userId,
          content: interest.message,
          createdAt: interest.createdAt,
        }
      });
    }

    // Verify user is a participant
    const meeting = await prisma.meetingRequest.findUnique({
      where: { id: targetMeetingId },
      include: { requester: true, receiver: true },
    });

    if (!meeting) {
      return NextResponse.json({ error: "Meeting not found" }, { status: 404 });
    }

    if (meeting.requesterId !== user.id && meeting.receiverId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const message = await prisma.message.create({
      data: {
        meetingId: targetMeetingId,
        senderId: user.id,
        content: content.trim(),
      },
      include: { sender: true },
    });

    // Notify the other participant
    const otherId = meeting.requesterId === user.id ? meeting.receiverId : meeting.requesterId;
    await prisma.notification.create({
      data: {
        userId: otherId,
        type: "meeting_request",
        message: `${user.firstName} ${user.lastName} sent you a message`,
        linkTo: `/dashboard/messages/${targetMeetingId}`,
      },
    });

    return NextResponse.json({
      ...message,
      sender: sanitizeUser(message.sender),
    }, { status: 201 });
  } catch (error) {
    console.error("POST message error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
