"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { postsApi } from "@/lib/api";
import { Post, Interest } from "@/types";
import { PostStatusBadge } from "@/components/posts/post-status-badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { useAuthStore } from "@/lib/store";
import { toast } from "sonner";
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Briefcase,
  Users,
  Clock,
  Shield,
  MessageSquare,
  Heart,
  CheckCircle,
  Send,
  CalendarDays,
  Edit,
} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { RequestMeetingModal } from "@/components/meetings/request-meeting-modal";

const stageLabels: Record<string, string> = {
  idea: "Idea",
  concept_validation: "Concept Validation",
  prototype: "Prototype",
  pilot_testing: "Pilot Testing",
  pre_deployment: "Pre-Deployment",
};

const commitmentLabels: Record<string, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  full_time: "Full-Time",
};

const collabLabels: Record<string, string> = {
  advisor: "Advisor",
  co_founder: "Co-Founder",
  research_partner: "Research Partner",
};

const confidentialityLabels: Record<string, string> = {
  public: "Public Short Pitch",
  meeting_only: "Details in Meeting Only",
};

const statusSteps = [
  { key: "draft", label: "Draft" },
  { key: "active", label: "Active" },
  { key: "meeting_scheduled", label: "Meeting Scheduled" },
  { key: "partner_found", label: "Partner Found" },
];

export default function PostDetailPage() {
  const params = useParams();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const [post, setPost] = useState<Post | null>(null);
  const [interests, setInterests] = useState<Interest[]>([]);
  const [loading, setLoading] = useState(true);
  const [interestMessage, setInterestMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [meetingModalOpen, setMeetingModalOpen] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const [p, ints] = await Promise.all([
          postsApi.getById(params.id as string),
          postsApi.getInterests(params.id as string),
        ]);
        setPost(p);
        setInterests(ints);
      } catch {
        toast.error("Post not found");
        router.push("/dashboard/posts");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [params.id, router]);

  const handleExpressInterest = async () => {
    if (!interestMessage.trim()) {
      toast.error("Please write a message");
      return;
    }
    setSubmitting(true);
    try {
      await postsApi.expressInterest(post!.id, interestMessage);
      toast.success("Interest expressed successfully!");
      setDialogOpen(false);
      setInterestMessage("");
    } finally {
      setSubmitting(false);
    }
  };

  const handleMarkPartnerFound = async () => {
    try {
      await postsApi.update(post!.id, { status: "partner_found" });
      setPost((p) => (p ? { ...p, status: "partner_found" } : null));
      toast.success("Congratulations! Post marked as Partner Found");
    } catch {
      toast.error("Failed to update post");
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-60 w-full" />
      </div>
    );
  }

  if (!post) return null;

  const isOwner = user?.id === post.authorId;
  const currentStatusIndex = statusSteps.findIndex(
    (s) => s.key === post.status
  );

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/posts">
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-start justify-between gap-4">
            <h1 className="text-2xl font-bold tracking-tight">
              {post.title}
            </h1>
            <PostStatusBadge status={post.status} />
          </div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-border bg-card p-6"
      >
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            {statusSteps.map((step, i) => (
              <div key={step.key} className="flex items-center gap-2 flex-1">
                <div
                  className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold shrink-0 ${
                    i <= currentStatusIndex
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {i < currentStatusIndex ? (
                    <CheckCircle className="h-3.5 w-3.5" />
                  ) : (
                    i + 1
                  )}
                </div>
                <span
                  className={`text-xs font-medium hidden sm:block ${
                    i <= currentStatusIndex
                      ? "text-foreground"
                      : "text-muted-foreground"
                  }`}
                >
                  {step.label}
                </span>
                {i < statusSteps.length - 1 && (
                  <div
                    className={`flex-1 h-px ${
                      i < currentStatusIndex ? "bg-primary" : "bg-muted"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <Separator className="mb-6" />

        <div className="space-y-4">
          <p className="text-sm leading-relaxed">{post.description}</p>

          {post.highLevelIdea && (
            <div className="rounded-lg bg-primary/5 border border-primary/10 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="h-3.5 w-3.5 text-primary" />
                <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                  High-Level Idea
                </span>
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {post.highLevelIdea}
              </p>
            </div>
          )}
        </div>

        <Separator className="my-6" />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </div>
            <div>
              <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                Domain
              </p>
              <p className="text-sm font-medium">{post.domain}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </div>
            <div>
              <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                Location
              </p>
              <p className="text-sm font-medium">
                {post.city}, {post.country}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </div>
            <div>
              <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                Stage
              </p>
              <p className="text-sm font-medium">
                {stageLabels[post.projectStage]}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
              <Users className="h-4 w-4 text-muted-foreground" />
            </div>
            <div>
              <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                Collaboration
              </p>
              <p className="text-sm font-medium">
                {collabLabels[post.collaborationType]}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
              <Clock className="h-4 w-4 text-muted-foreground" />
            </div>
            <div>
              <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                Commitment
              </p>
              <p className="text-sm font-medium">
                {commitmentLabels[post.commitmentLevel]}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
              <Shield className="h-4 w-4 text-muted-foreground" />
            </div>
            <div>
              <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                Confidentiality
              </p>
              <p className="text-sm font-medium">
                {confidentialityLabels[post.confidentialityLevel]}
              </p>
            </div>
          </div>
        </div>

        <Separator className="my-6" />

        <div className="flex flex-wrap gap-1.5">
          {post.requiredExpertise.map((tag) => (
            <span
              key={tag}
              className="rounded-md bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="mt-6 flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <Link 
              href={`/dashboard/profile/${post.author.slug}`}
              className="flex items-center gap-2 hover:underline"
            >
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20 text-[10px] font-bold text-primary">
                {post.author.firstName[0]}
                {post.author.lastName[0]}
              </div>
              <span>
                {post.author.firstName} {post.author.lastName}
              </span>
            </Link>
            <span className="text-muted-foreground/50">·</span>
            <span>{post.author.institution}</span>
          </div>
          <span>
            Posted {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
          </span>
        </div>
      </motion.div>

      <div className="flex items-center gap-3">
        {!isOwner && post.status === "active" && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-1.5">
                <Heart className="h-4 w-4" />
                Express Interest
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Express Interest</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <p className="text-sm text-muted-foreground">
                  Send a short message to the post author explaining why you're
                  interested in collaborating.
                </p>
                <Textarea
                  placeholder="I'm interested because..."
                  value={interestMessage}
                  onChange={(e) => setInterestMessage(e.target.value)}
                  className="min-h-24"
                />
                <div className="flex justify-end">
                  <Button
                    onClick={handleExpressInterest}
                    disabled={submitting}
                    className="gap-1.5"
                  >
                    {submitting ? (
                      <span className="flex items-center gap-2">
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        Sending...
                      </span>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        Send Interest
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {!isOwner && post.status === "active" && (
          <>
            <Button 
              variant="outline" 
              className="gap-1.5 border-primary/20 text-primary hover:bg-primary/5"
              onClick={() => setMeetingModalOpen(true)}
            >
              <CalendarDays className="h-4 w-4" />
              Request Meeting
            </Button>
            
            <RequestMeetingModal
              open={meetingModalOpen}
              onOpenChange={setMeetingModalOpen}
              postId={post.id}
              receiverId={post.authorId}
              onSuccess={() => {
                // Optionally refresh or show a message
              }}
            />
          </>
        )}

        {isOwner && post.status !== "partner_found" && post.status !== "expired" && (
          <Link href={`/dashboard/edit-post/${post.id}`}>
            <Button
              variant="outline"
              className="gap-1.5"
            >
              <Edit className="h-4 w-4" />
              Edit Post
            </Button>
          </Link>
        )}

        {isOwner && post.status !== "partner_found" && post.status !== "expired" && (
          <Button
            variant="outline"
            className="gap-1.5 border-primary/30 text-primary hover:bg-primary hover:text-primary-foreground"
            onClick={handleMarkPartnerFound}
          >
            <CheckCircle className="h-4 w-4" />
            Mark as Partner Found
          </Button>
        )}
      </div>

      {isOwner && interests.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-xl border border-border bg-card p-6"
        >
          <h3 className="text-base font-semibold mb-4 flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-primary" />
            Interested People ({interests.length})
          </h3>
          <div className="space-y-4">
            {interests.map((interest) => (
              <div
                key={interest.id}
                className="rounded-lg border border-border p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <Link 
                    href={`/dashboard/profile/${interest.user.slug}`}
                    className="flex items-center gap-2 hover:underline"
                  >
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/20 text-[10px] font-bold text-primary">
                      {interest.user.firstName[0]}
                      {interest.user.lastName[0]}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {interest.user.firstName} {interest.user.lastName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {interest.user.institution}
                      </p>
                    </div>
                  </Link>
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(interest.createdAt), "MMM d, yyyy")}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {interest.message}
                </p>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
