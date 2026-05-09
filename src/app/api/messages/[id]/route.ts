import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

// DELETE /api/messages/[id]
// Deletes a message only if it belongs to the user and is less than 2 minutes old
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id: messageId } = await params;

    if (!messageId) {
      return NextResponse.json({ error: "Message ID is required" }, { status: 400 });
    }

    const message = await prisma.message.findUnique({
      where: { id: messageId },
    });

    if (!message) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }

    // Check ownership
    if (message.senderId !== user.id) {
      return NextResponse.json({ error: "You can only delete your own messages" }, { status: 403 });
    }

    // Check time limit (2 minutes = 120,000 ms)
    const now = new Date();
    const messageAge = now.getTime() - new Date(message.createdAt).getTime();
    const limit = 2 * 60 * 1000;

    if (messageAge > limit) {
      return NextResponse.json(
        { error: "Messages can only be deleted within 2 minutes of sending" },
        { status: 403 }
      );
    }

    await prisma.message.delete({
      where: { id: messageId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete message error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
