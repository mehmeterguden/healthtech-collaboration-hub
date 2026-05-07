"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { postsApi } from "@/lib/api";
import { Post } from "@/types";
import { PostStatusBadge } from "@/components/posts/post-status-badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthStore } from "@/lib/store";
import { toast } from "sonner";
import {
  PlusCircle,
  FileText,
  Edit,
  Trash2,
  CheckCircle,
  Eye,
  Calendar,
  Briefcase,
  MapPin,
  AlertTriangle,
  Users,
  Clock,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { format, formatDistanceToNow } from "date-fns";

const statusTabs = [
  { key: "all", label: "All Posts" },
  { key: "draft", label: "Drafts" },
  { key: "active", label: "Active" },
  { key: "meeting_scheduled", label: "Meeting Scheduled" },
  { key: "partner_found", label: "Partner Found" },
];

const stageLabels: Record<string, string> = {
  idea: "Idea",
  concept_validation: "Concept Validation",
  prototype: "Prototype",
  pilot_testing: "Pilot Testing",
  pre_deployment: "Pre-Deployment",
};

export default function MyPostsPage() {
  const user = useAuthStore((s) => s.user);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [deleteTarget, setDeleteTarget] = useState<Post | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const allPosts = await postsApi.getAll();
        const myPosts = allPosts.filter((p) => p.authorId === user?.id);
        setPosts(myPosts);
      } finally {
        setLoading(false);
      }
    }
    if (user) load();
  }, [user]);

  const filteredPosts =
    activeTab === "all"
      ? posts
      : posts.filter((p) => p.status === activeTab);

  const handleMarkPartnerFound = async (post: Post) => {
    try {
      const updated = await postsApi.update(post.id, {
        status: "partner_found",
      });
      setPosts((prev) =>
        prev.map((p) => (p.id === post.id ? { ...p, ...updated } : p))
      );
      toast.success("Post marked as Partner Found!");
    } catch {
      toast.error("Failed to update post");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await postsApi.delete(deleteTarget.id);
      setPosts((prev) => prev.filter((p) => p.id !== deleteTarget.id));
      toast.success("Post deleted successfully");
      setDeleteTarget(null);
    } catch {
      toast.error("Failed to delete post");
    } finally {
      setDeleting(false);
    }
  };

  const statusCounts = {
    all: posts.length,
    draft: posts.filter((p) => p.status === "draft").length,
    active: posts.filter((p) => p.status === "active").length,
    meeting_scheduled: posts.filter((p) => p.status === "meeting_scheduled")
      .length,
    partner_found: posts.filter((p) => p.status === "partner_found").length,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Posts</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your project announcements and track their progress.
          </p>
        </div>
        <Link href="/dashboard/create-post">
          <Button className="gap-1.5">
            <PlusCircle className="h-4 w-4" />
            New Post
          </Button>
        </Link>
      </div>

      {/* Status Tab Bar */}
      <div className="flex gap-1 rounded-xl bg-muted/30 border border-border p-1 overflow-x-auto">
        {statusTabs.map((tab) => {
          const count =
            statusCounts[tab.key as keyof typeof statusCounts] || 0;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`relative flex items-center gap-2 rounded-lg px-4 py-2.5 text-xs font-semibold transition-all whitespace-nowrap ${
                activeTab === tab.key
                  ? "bg-primary/10 text-primary shadow-sm border border-primary/20"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              {tab.label}
              {count > 0 && (
                <span
                  className={`flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[9px] font-black ${
                    activeTab === tab.key
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Content */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="rounded-xl border border-border bg-card p-5"
            >
              <div className="flex items-start justify-between">
                <div className="space-y-3 flex-1">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
                <Skeleton className="h-6 w-20 ml-4" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredPosts.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-20 text-center"
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted mb-4">
            <FileText className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="text-base font-semibold mb-1">
            {activeTab === "all"
              ? "No posts yet"
              : `No ${activeTab.replace("_", " ")} posts`}
          </h3>
          <p className="text-sm text-muted-foreground max-w-xs mb-4">
            {activeTab === "all"
              ? "Create your first post to start finding collaboration partners."
              : "Posts with this status will appear here."}
          </p>
          {activeTab === "all" && (
            <Link href="/dashboard/create-post">
              <Button className="gap-1.5" size="sm">
                <PlusCircle className="h-3.5 w-3.5" />
                Create Your First Post
              </Button>
            </Link>
          )}
        </motion.div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-3"
          >
            {filteredPosts.map((post, i) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="group rounded-xl border border-border bg-card p-5 transition-all hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <Link
                        href={`/dashboard/post/${post.id}`}
                        className="text-base font-semibold hover:text-primary transition-colors truncate"
                      >
                        {post.title}
                      </Link>
                      <PostStatusBadge status={post.status} />
                    </div>

                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                      {post.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <Briefcase className="h-3 w-3" />
                        {post.domain}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <MapPin className="h-3 w-3" />
                        {post.city}, {post.country}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Calendar className="h-3 w-3" />
                        {stageLabels[post.projectStage]}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Users className="h-3 w-3" />
                        {post.interestCount} interested
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock className="h-3 w-3" />
                        {formatDistanceToNow(new Date(post.createdAt), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>

                    {/* Expertise tags */}
                    {post.requiredExpertise?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {post.requiredExpertise.slice(0, 4).map((tag) => (
                          <span
                            key={tag}
                            className="rounded-md bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary"
                          >
                            {tag}
                          </span>
                        ))}
                        {post.requiredExpertise.length > 4 && (
                          <span className="text-[10px] text-muted-foreground">
                            +{post.requiredExpertise.length - 4} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    <Link href={`/dashboard/post/${post.id}`}>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        title="View Post"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                    </Link>

                    <Link href={`/dashboard/edit-post/${post.id}`}>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        title="Edit Post"
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </Button>
                    </Link>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-primary hover:text-primary"
                      title="Quick Mark: Partner Found"
                      onClick={() => handleMarkPartnerFound(post)}
                    >
                      <CheckCircle className="h-3.5 w-3.5" />
                    </Button>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      title="Delete Post"
                      onClick={() => setDeleteTarget(post)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Delete Post
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <p className="text-sm text-muted-foreground">
              Are you sure you want to delete{" "}
              <span className="font-medium text-foreground">
                &ldquo;{deleteTarget?.title}&rdquo;
              </span>
              ? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setDeleteTarget(null)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={deleting}
                className="gap-1.5"
              >
                {deleting ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Deleting...
                  </span>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4" />
                    Delete Post
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
