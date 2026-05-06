"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useAuthStore } from "@/lib/store";
import { usersApi, postsApi } from "@/lib/api";
import { DashboardStats, Post } from "@/types";
import { PostCard } from "@/components/posts/post-card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  FileText,
  Calendar,
  Handshake,
  Eye,
  PlusCircle,
  ArrowRight,
  TrendingUp,
} from "lucide-react";

const statCards = [
  { key: "activePosts", label: "Active Posts", icon: FileText, color: "text-emerald-400", bg: "bg-emerald-500/10" },
  { key: "pendingMeetings", label: "Pending Meetings", icon: Calendar, color: "text-cyan-400", bg: "bg-cyan-500/10" },
  { key: "totalMatches", label: "Total Matches", icon: Handshake, color: "text-primary", bg: "bg-primary/10" },
  { key: "profileViews", label: "Profile Views", icon: Eye, color: "text-violet-400", bg: "bg-violet-500/10" },
];

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentPosts, setRecentPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!user) return;
      try {
        const [s, posts] = await Promise.all([
          usersApi.getDashboardStats(),
          postsApi.getAll(),
        ]);
        setStats(s);
        
        // Recommended posts: Active posts from other users
        const othersPosts = posts.filter(p => p.authorId !== user.id && p.status === "active");
        const recommended = othersPosts.filter(p => p.author.role !== user.role);
        
        // If not enough from opposite role, take any active posts from others
        const finalRecommended = recommended.length >= 3 
          ? recommended 
          : [...recommended, ...othersPosts.filter(p => p.author.role === user.role)].slice(0, 3);
          
        setRecentPosts(finalRecommended);
      } catch (err) {
        console.error("Dashboard load error:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Welcome back, <span className="gradient-text">{user?.firstName}</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Here&apos;s an overview of your activity and recommended matches.
          </p>
        </div>
        <Link href="/dashboard/create-post">
          <Button className="gap-1.5 mt-3 sm:mt-0">
            <PlusCircle className="h-4 w-4" />
            New Post
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card, i) => (
          <motion.div
            key={card.key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="rounded-xl border border-border bg-card p-5 transition-all hover:border-primary/20"
          >
            {loading ? (
              <div className="space-y-3">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-8 w-12" />
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    {card.label}
                  </span>
                  <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${card.bg}`}>
                    <card.icon className={`h-4 w-4 ${card.color}`} />
                  </div>
                </div>
                <div className="flex items-end gap-2">
                  <span className="text-2xl font-bold">
                    {stats?.[card.key as keyof DashboardStats] || 0}
                  </span>
                </div>
              </>
            )}
          </motion.div>
        ))}
      </div>

      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Recommended Posts</h2>
          <Link href="/dashboard/posts">
            <Button variant="ghost" size="sm" className="gap-1 text-primary">
              View All
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>

        {loading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-xl border border-border bg-card p-5">
                <Skeleton className="h-5 w-3/4 mb-3" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3 mb-4" />
                <div className="flex gap-2">
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-5 w-20" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {recentPosts.map((post, i) => (
              <PostCard
                key={post.id}
                post={post}
                index={i}
                currentCity={user?.city}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
