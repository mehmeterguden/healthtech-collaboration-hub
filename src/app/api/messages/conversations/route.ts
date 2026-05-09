import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth, sanitizeUser } from "@/lib/auth";

// GET /api/messages/conversations
// Returns:
//   1. All accepted/scheduled/completed meetings (can message each other) — canMessage: true
//   2. Interests on OUR posts that we accepted (selectedPartnerId) — canMessage: false (they use meetings)
//   3. Interests WE sent to others — canMessage: false (read-only view)
export async function GET() {
  try {
    const user = await requireAuth();

    // 1. Meetings where chat is allowed
    const meetings = await prisma.meetingRequest.findMany({
      where: {
        OR: [{ requesterId: user.id }, { receiverId: user.id }],
        status: { in: ["accepted", "scheduled", "completed"] },
      },
      include: {
        post: true,
        requester: true,
        receiver: true,
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
          include: { sender: true },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    const meetingConvs = meetings.map((m) => {
      const lastMessage = m.messages[0];
      const otherUser = m.requesterId === user.id ? m.receiver : m.requester;
      return {
        id: m.id,
        type: "meeting" as const,
        canMessage: true,
        status: m.status,
        post: m.post,
        otherUser: sanitizeUser(otherUser),
        meetingLink: m.meetingLink,
        selectedSlot: m.selectedSlot ? JSON.parse(m.selectedSlot) : null,
        createdAt: m.createdAt,
        updatedAt: m.updatedAt,
        lastMessage: lastMessage
          ? {
              content: lastMessage.content,
              senderId: lastMessage.senderId,
              senderName: lastMessage.sender.firstName,
              createdAt: lastMessage.createdAt,
            }
          : null,
      };
    });

    // 2. Interests on posts we OWN — people who expressed interest in our projects
    const ourPosts = await prisma.post.findMany({
      where: { authorId: user.id },
      select: { id: true },
    });
    const ourPostIds = ourPosts.map((p) => p.id);

    const incomingInterests = ourPostIds.length > 0
      ? await prisma.interest.findMany({
          where: { postId: { in: ourPostIds } },
          include: { user: true, post: true },
          orderBy: { createdAt: "desc" },
        })
      : [];

    const interestReceived = incomingInterests.map((interest) => ({
      id: `interest-in-${interest.id}`,
      type: "interest_received" as const,
      canMessage: true, // Allow post owners to respond to interest
      status: "interest",
      interestId: interest.id,
      post: interest.post,
      otherUser: sanitizeUser(interest.user),
      message: interest.message,
      createdAt: interest.createdAt,
      updatedAt: interest.createdAt,
      lastMessage: null,
    }));

    // 3. Interests WE sent (we expressed interest on others' posts)
    const sentInterests = await prisma.interest.findMany({
      where: { userId: user.id },
      include: {
        post: {
          include: { author: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const interestSent = sentInterests.map((interest) => ({
      id: `interest-out-${interest.id}`,
      type: "interest_sent" as const,
      canMessage: false,
      status: "interest",
      interestId: interest.id,
      post: interest.post,
      otherUser: sanitizeUser(interest.post.author),
      message: interest.message,
      createdAt: interest.createdAt,
      updatedAt: interest.createdAt,
      lastMessage: null,
    }));

    // Merge and sort all by updatedAt desc, deduplicate by otherUser+post (meetings take priority)
    const all = [...meetingConvs, ...interestReceived, ...interestSent];

    // Remove duplicates: if we already have a meeting with the same user+post, don't show the interest
    const meetingKeys = new Set(
      meetingConvs.map((m) => `${m.otherUser.id}-${m.post.id}`)
    );

    const deduplicated = all.filter((conv) => {
      if (conv.type === "meeting") return true;
      const key = `${conv.otherUser.id}-${conv.post.id}`;
      return !meetingKeys.has(key);
    });

    deduplicated.sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );

    return NextResponse.json(deduplicated);
  } catch (error) {
    console.error("Conversations error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
