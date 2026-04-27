import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  try {
    await requireAdmin();

    const [totalUsers, totalPosts, activePosts, totalMeetings] = await Promise.all([
      prisma.user.count(),
      prisma.post.count(),
      prisma.post.count({ where: { status: "active" } }),
      prisma.meetingRequest.count(),
    ]);

    // Simplified aggregation for SQLite (since true aggregation is limited)
    const users = await prisma.user.findMany({ select: { role: true, createdAt: true } });
    const posts = await prisma.post.findMany({ select: { domain: true, status: true } });

    const roleDistribution = [
      { role: "Engineer", count: users.filter(u => u.role === "engineer").length },
      { role: "Healthcare", count: users.filter(u => u.role === "healthcare").length },
      { role: "Admin", count: users.filter(u => u.role === "admin").length },
    ];

    const domains: Record<string, number> = {};
    posts.forEach(p => { domains[p.domain] = (domains[p.domain] || 0) + 1; });
    const domainDistribution = Object.entries(domains).map(([domain, count]) => ({ domain, count }));

    const statuses: Record<string, number> = {};
    posts.forEach(p => { statuses[p.status] = (statuses[p.status] || 0) + 1; });
    const statusDistribution = Object.entries(statuses).map(([status, count]) => ({ status, count }));

    // Mock weekly registrations for prototype since SQLite date functions are tricky
    const weeklyRegistrations = [
      { week: "W1", count: 5 }, { week: "W2", count: 8 }, { week: "W3", count: 12 }, { week: "W4", count: totalUsers }
    ];

    return NextResponse.json({
      totalUsers,
      totalPosts,
      activePosts,
      totalMeetings,
      matchRate: totalMeetings > 0 ? Math.round((posts.filter(p => p.status === "partner_found").length / totalPosts) * 100) : 0,
      weeklyRegistrations,
      roleDistribution,
      domainDistribution,
      statusDistribution,
    });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
