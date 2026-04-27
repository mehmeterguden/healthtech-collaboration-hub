import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sanitizeUser } from "@/lib/auth";

export async function GET(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const slug = (await params).slug;

    const user = await prisma.user.findUnique({
      where: { slug },
      include: {
        posts: {
          where: { status: "active" },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!user || !user.isActive) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(sanitizeUser(user));
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
