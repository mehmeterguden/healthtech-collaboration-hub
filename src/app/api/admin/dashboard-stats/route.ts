import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

export async function GET() {
  try {
    const user = await requireAuth();

    const [activePosts, pendingMeetings, totalMatches, profileViews] = await Promise.all([
      prisma.post.count({ where: { authorId: user.id, status: "active" } }),
      prisma.meetingRequest.count({ where: { receiverId: user.id, status: "pending" } }),
      prisma.meetingRequest.count({ 
        where: { 
          OR: [{ requesterId: user.id }, { receiverId: user.id }],
          status: "completed" 
        } 
      }),
      Promise.resolve(Math.floor(Math.random() * 100) + 10), // Mock profile views
    ]);

    return NextResponse.json({
      activePosts,
      pendingMeetings,
      totalMatches,
      profileViews,
    });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
