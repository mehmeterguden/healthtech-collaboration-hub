import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

export async function GET() {
  try {
    const user = await requireAuth();

    const [totalActivePosts, pendingIncoming, pendingOutgoing, totalMatches, totalUsers] = await Promise.all([
      prisma.post.count({ where: { status: "active" } }),
      prisma.meetingRequest.count({ where: { receiverId: user.id, status: "pending" } }),
      prisma.meetingRequest.count({ where: { requesterId: user.id, status: "pending" } }),
      prisma.meetingRequest.count({ 
        where: { 
          OR: [{ requesterId: user.id }, { receiverId: user.id }],
          status: { in: ["scheduled", "completed"] }
        } 
      }),
      prisma.user.count(),
    ]);

    const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
    const profileViews = dbUser?.profileViews || 0;

    return NextResponse.json({
      activePosts: totalActivePosts,
      pendingMeetings: pendingIncoming + pendingOutgoing,
      totalMatches,
      profileViews,
    });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
