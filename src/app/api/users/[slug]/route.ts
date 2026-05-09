import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sanitizeUser } from "@/lib/auth";

export async function GET(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const slug = (await params).slug;

    const user = await prisma.user.update({
      where: { slug },
      data: { profileViews: { increment: 1 } },
      include: {
        posts: {
          orderBy: { createdAt: "desc" },
        },
        _count: {
          select: {
            posts: true,
            sentRequests: true,
            receivedRequests: true,
          }
        }
      },
    });

    if (!user || !user.isActive) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const totalMeetings = await prisma.meetingRequest.count({
      where: {
        OR: [{ requesterId: user.id }, { receiverId: user.id }]
      }
    });

    const successfulMeetings = await prisma.meetingRequest.count({
      where: {
        OR: [{ requesterId: user.id }, { receiverId: user.id }],
        status: { in: ["scheduled", "completed"] }
      }
    });

    const matchRate = totalMeetings > 0 ? Math.round((successfulMeetings / totalMeetings) * 100) : 0;

    return NextResponse.json({
      ...sanitizeUser(user),
      posts: user.posts.map(p => ({
        ...p,
        requiredExpertise: JSON.parse(p.requiredExpertise || "[]")
      })),
      postCount: user._count.posts,
      meetingCount: totalMeetings,
      matchRate: matchRate,
    });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
