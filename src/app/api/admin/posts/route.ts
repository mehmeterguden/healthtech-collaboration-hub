import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin, sanitizeUser } from "@/lib/auth";
import { logAudit } from "@/lib/audit";

export async function GET() {
  try {
    await requireAdmin();
    const posts = await prisma.post.findMany({
      include: { author: true },
      orderBy: { createdAt: "desc" },
    });

    const sanitizedPosts = posts.map(post => ({
      ...post,
      author: sanitizeUser(post.author),
      requiredExpertise: JSON.parse(post.requiredExpertise || "[]"),
    }));

    return NextResponse.json(sanitizedPosts);
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
