import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth, sanitizeUser } from "@/lib/auth";
import { logAudit } from "@/lib/audit";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const id = (await params).id;
    const interests = await prisma.interest.findMany({
      where: { postId: id },
      include: { user: true },
      orderBy: { createdAt: "desc" },
    });

    const sanitizedInterests = interests.map(i => ({
      ...i,
      user: sanitizeUser(i.user),
    }));

    return NextResponse.json(sanitizedInterests);
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAuth();
    const id = (await params).id;
    const { message } = await req.json();

    const post = await prisma.post.findUnique({ where: { id } });
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    if (post.authorId === user.id) {
      return NextResponse.json({ error: "Cannot express interest in your own post" }, { status: 400 });
    }

    const interest = await prisma.interest.create({
      data: {
        postId: id,
        userId: user.id,
        message,
      },
      include: { user: true },
    });

    await prisma.post.update({
      where: { id },
      data: { interestCount: { increment: 1 } },
    });

    await prisma.notification.create({
      data: {
        userId: post.authorId,
        type: "interest",
        message: `${user.firstName} ${user.lastName} expressed interest in your project`,
        linkTo: `/dashboard/post/${id}`,
      },
    });

    await logAudit({
      userId: user.id,
      userName: `${user.firstName} ${user.lastName}`,
      userRole: user.role,
      actionType: "interest_express",
      targetEntity: "post",
      targetId: id,
    });

    return NextResponse.json({
      ...interest,
      user: sanitizeUser(interest.user),
    }, { status: 201 });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json({ error: "Already expressed interest" }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
