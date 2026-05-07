import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth, sanitizeUser } from "@/lib/auth";
import { logAudit } from "@/lib/audit";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const id = (await params).id;
    const user = await requireAuth().catch(() => null);
    
    const post = await prisma.post.findUnique({
      where: { id },
      include: { 
        author: true,
        selectedPartner: true,
        meetingRequests: {
          include: {
            requester: true
          },
          orderBy: { createdAt: 'desc' }
        }
      },
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    let userInterest = null;
    let userMeetingRequest = null;
    
    if (user) {
      userInterest = await prisma.interest.findUnique({
        where: { 
          postId_userId: { 
            postId: id, 
            userId: user.id 
          } 
        }
      });
      
      userMeetingRequest = await prisma.meetingRequest.findFirst({
        where: { 
          postId: id, 
          requesterId: user.id 
        },
        orderBy: { createdAt: 'desc' }
      });
    }

    return NextResponse.json({
      ...post,
      author: sanitizeUser(post.author),
      selectedPartner: post.selectedPartner ? sanitizeUser(post.selectedPartner) : null,
      requiredExpertise: typeof post.requiredExpertise === "string" 
        ? JSON.parse(post.requiredExpertise || "[]") 
        : (Array.isArray(post.requiredExpertise) ? post.requiredExpertise : []),
      currentUserInteraction: {
        interest: userInterest,
        meetingRequest: userMeetingRequest ? {
          ...userMeetingRequest,
          proposedSlots: JSON.parse(userMeetingRequest.proposedSlots || "[]")
        } : null
      },
      meetingRequests: user && post.authorId === user.id 
        ? post.meetingRequests.map(mr => ({
            ...mr,
            proposedSlots: JSON.parse(mr.proposedSlots || "[]"),
            selectedSlot: mr.selectedSlot ? JSON.parse(mr.selectedSlot) : null,
            requester: sanitizeUser(mr.requester)
          }))
        : []
    });
  } catch (error) {
    console.error("Post detail fetch error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAuth();
    const id = (await params).id;
    const body = await req.json();

    const post = await prisma.post.findUnique({ where: { id } });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    if (post.authorId !== user.id && user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const updatedPost = await prisma.post.update({
      where: { id },
      data: {
        ...body,
        requiredExpertise: body.requiredExpertise ? JSON.stringify(body.requiredExpertise) : undefined,
        expiryDate: body.expiryDate ? new Date(body.expiryDate) : undefined,
      },
      include: { author: true },
    });

    await logAudit({
      userId: user.id,
      userName: `${user.firstName} ${user.lastName}`,
      userRole: user.role,
      actionType: "post_update",
      targetEntity: "post",
      targetId: id,
    });

    return NextResponse.json({
      ...updatedPost,
      author: sanitizeUser(updatedPost.author),
      requiredExpertise: JSON.parse(updatedPost.requiredExpertise || "[]"),
    });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAuth();
    const id = (await params).id;

    const post = await prisma.post.findUnique({ where: { id } });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    if (post.authorId !== user.id && user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.post.delete({ where: { id } });

    await logAudit({
      userId: user.id,
      userName: `${user.firstName} ${user.lastName}`,
      userRole: user.role,
      actionType: "post_delete",
      targetEntity: "post",
      targetId: id,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
