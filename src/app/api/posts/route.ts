import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth, sanitizeUser } from "@/lib/auth";
import { logAudit } from "@/lib/audit";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search");
    const domain = searchParams.get("domain");
    const city = searchParams.get("city");
    const country = searchParams.get("country");
    const stage = searchParams.get("stage");
    const status = searchParams.get("status");

    const where: any = {};

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
        { domain: { contains: search } },
      ];
    }
    if (domain) where.domain = { contains: domain };
    if (city) where.city = { contains: city };
    if (country) where.country = { contains: country };
    if (stage) where.projectStage = stage;
    if (status) where.status = status;

    const posts = await prisma.post.findMany({
      where,
      include: {
        author: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const sanitizedPosts = posts.map(post => ({
      ...post,
      author: sanitizeUser(post.author),
      requiredExpertise: JSON.parse(post.requiredExpertise || "[]"),
    }));

    return NextResponse.json(sanitizedPosts);
  } catch (error) {
    console.error("Failed to fetch posts:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireAuth();
    const body = await req.json();

    const newPost = await prisma.post.create({
      data: {
        authorId: user.id,
        title: body.title,
        domain: body.domain,
        description: body.description,
        requiredExpertise: JSON.stringify(body.requiredExpertise || []),
        projectStage: body.projectStage || "idea",
        commitmentLevel: body.commitmentLevel || "medium",
        collaborationType: body.collaborationType || "research_partner",
        confidentialityLevel: body.confidentialityLevel || "public",
        highLevelIdea: body.highLevelIdea,
        city: body.city || "",
        country: body.country || "",
        expiryDate: body.expiryDate ? new Date(body.expiryDate) : null,
        status: body.status || "active",
        autoClose: body.autoClose || false,
      },
      include: {
        author: true,
      },
    });

    await logAudit({
      userId: user.id,
      userName: `${user.firstName} ${user.lastName}`,
      userRole: user.role,
      actionType: "post_create",
      targetEntity: "post",
      targetId: newPost.id,
    });

    return NextResponse.json({
      ...newPost,
      author: sanitizeUser(newPost.author),
      requiredExpertise: JSON.parse(newPost.requiredExpertise || "[]"),
    }, { status: 201 });
  } catch (error) {
    console.error("Failed to create post:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
