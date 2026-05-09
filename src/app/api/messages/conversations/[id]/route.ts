import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

// DELETE /api/messages/conversations/[id]
// Deletes a conversation (MeetingRequest or Interest)
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: "Conversation ID is required" }, { status: 400 });
    }

    if (id.startsWith("interest-in-") || id.startsWith("interest-out-")) {
      const interestId = id.replace("interest-in-", "").replace("interest-out-", "");
      const interest = await prisma.interest.findUnique({
        where: { id: interestId },
        include: { post: true },
      });

      if (!interest) {
        return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
      }

      // Verify ownership
      if (interest.userId !== user.id && interest.post.authorId !== user.id) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }

      await prisma.interest.delete({
        where: { id: interestId },
      });
    } else {
      // Regular MeetingRequest
      const meeting = await prisma.meetingRequest.findUnique({
        where: { id },
      });

      if (!meeting) {
        return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
      }

      // Verify participation
      if (meeting.requesterId !== user.id && meeting.receiverId !== user.id) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }

      await prisma.meetingRequest.delete({
        where: { id },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete conversation error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
