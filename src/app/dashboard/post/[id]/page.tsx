"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { postsApi, meetingsApi } from "@/lib/api";
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
  Activity,
  CalendarCheck,
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
  const [processingMeeting, setProcessingMeeting] = useState<string | null>(null);

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

  const handleSelectPartner = async (partnerId: string, partnerName: string) => {
    if (!confirm(`Are you sure you want to select ${partnerName} as your project partner? This will finalize the post.`)) return;
    
    setSubmitting(true);
    try {
      const updated = await postsApi.selectPartner(post!.id, partnerId);
      setPost(updated);
      toast.success(`Success! ${partnerName} has been selected as your partner.`);
    } catch {
      toast.error("Failed to select partner");
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

  const handlePublish = async () => {
    try {
      await postsApi.update(post!.id, { status: "active" });
      setPost((p) => (p ? { ...p, status: "active" } : null));
      toast.success("Great! Your post is now live and visible to everyone.");
    } catch {
      toast.error("Failed to publish post");
    }
  };

  const handleAcceptMeeting = async (meetingId: string, slotId: string) => {
    try {
      setProcessingMeeting(meetingId);
      await meetingsApi.accept(meetingId, slotId);
      toast.success("Meeting scheduled successfully!");
      const updatedPost = await postsApi.getById(params.id as string);
      setPost(updatedPost);
    } catch (error: any) {
      toast.error(error.message || "Failed to accept meeting");
    } finally {
      setProcessingMeeting(null);
    }
  };

  const handleDeclineMeeting = async (meetingId: string) => {
    try {
      setProcessingMeeting(meetingId);
      await meetingsApi.decline(meetingId);
      toast.success("Meeting request declined");
      const updatedPost = await postsApi.getById(params.id as string);
      setPost(updatedPost);
    } catch (error: any) {
      toast.error(error.message || "Failed to decline meeting");
    } finally {
      setProcessingMeeting(null);
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

          {post.selectedPartner && (
            <div className="rounded-lg bg-green-500/5 border border-green-500/10 p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-3.5 w-3.5 text-green-500" />
                <span className="text-xs font-semibold text-green-500 uppercase tracking-wider">
                  Partner Selected
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500/10 text-xs font-bold text-green-500">
                  {post.selectedPartner.firstName[0]}
                  {post.selectedPartner.lastName[0]}
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">
                    {post.selectedPartner.firstName} {post.selectedPartner.lastName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Project Partner · {post.selectedPartner.institution}
                  </p>
                </div>
              </div>
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
          {(Array.isArray(post.requiredExpertise) ? post.requiredExpertise : []).map((tag) => (
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
          <>
            {post.currentUserInteraction?.interest ? (
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" className="gap-1.5 border-primary/30 text-primary">
                    <CheckCircle className="h-4 w-4" />
                    Interest Sent
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Your Interest Message</DialogTitle>
                  </DialogHeader>
                  <div className="pt-4 space-y-4">
                    <div className="p-4 rounded-xl bg-accent/30 border border-border">
                      <p className="text-sm italic">"{post.currentUserInteraction.interest.message}"</p>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Sent on {format(new Date(post.currentUserInteraction.interest.createdAt), "MMM d, yyyy HH:mm")}
                    </p>
                  </div>
                </DialogContent>
              </Dialog>
            ) : (
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-1.5 shadow-lg shadow-primary/20">
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

            {post.currentUserInteraction?.meetingRequest ? (
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" className="gap-1.5 border-primary/30 text-primary">
                    <CalendarDays className="h-4 w-4" />
                    Meeting Requested
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Meeting Request Details</DialogTitle>
                  </DialogHeader>
                  <div className="pt-4 space-y-4">
                    <div className="p-4 rounded-xl bg-accent/30 border border-border">
                      <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Your Message</p>
                      <p className="text-sm">"{post.currentUserInteraction.meetingRequest.message}"</p>
                    </div>
                    
                    <div className="space-y-2">
                      <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Proposed Slots</p>
                      {post.currentUserInteraction.meetingRequest.proposedSlots.map((slot, i) => (
                        <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-primary/5 border border-primary/10">
                          <Clock className="h-4 w-4 text-primary" />
                          <div className="text-xs font-medium">
                            {slot.date} @ {slot.startTime} - {slot.endTime}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center gap-1.5">
                        <Activity className="h-3 w-3 text-amber-500" />
                        <span className="text-[10px] font-bold uppercase text-amber-500">Status: {post.currentUserInteraction.meetingRequest.status}</span>
                      </div>
                      <p className="text-[10px] text-muted-foreground">
                        Sent {formatDistanceToNow(new Date(post.currentUserInteraction.meetingRequest.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            ) : (
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
                    // Force refresh to show the interaction status
                    window.location.reload();
                  }}
                />
              </>
            )}
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

        {isOwner && post.status === "draft" && (
          <Button
            className="gap-1.5 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20"
            onClick={handlePublish}
          >
            <Send className="h-4 w-4" />
            Publish Post
          </Button>
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
            {interests.map((interest, idx) => (
              <div
                key={interest.id || `int-${idx}`}
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

                  {post.status !== "partner_found" && (
                    <div className="mt-4 flex justify-end">
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1.5 border-primary/20 text-primary hover:bg-primary hover:text-primary-foreground group"
                        onClick={() => handleSelectPartner(interest.userId, `${interest.user.firstName} ${interest.user.lastName}`)}
                        disabled={submitting}
                      >
                        <CheckCircle className="h-3.5 w-3.5" />
                        Partner with this user
                      </Button>
                    </div>
                  )}
                </div>
            ))}
          </div>
        </motion.div>
      )}
      {/* Owner Collaboration Management */}
      {isOwner && post.meetingRequests && post.meetingRequests.length > 0 && (
        <div className="mt-12 space-y-6">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <Users className="h-4 w-4" />
            </div>
            <h2 className="text-xl font-bold tracking-tight">Collaboration Requests</h2>
          </div>

          <div className="grid gap-4">
            {post.meetingRequests.map((mr, idx) => (
              <motion.div
                key={mr.id || `mr-${idx}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-5 rounded-2xl border border-border bg-card/50 backdrop-blur-sm space-y-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20 text-[12px] font-bold text-primary border border-primary/20">
                      {mr.requester.firstName[0]}{mr.requester.lastName[0]}
                    </div>
                    <div>
                      <h4 className="font-bold text-white">
                        {mr.requester.firstName} {mr.requester.lastName}
                      </h4>
                      <p className="text-xs text-slate-400">{mr.requester.institution}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                      mr.status === 'pending' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                      mr.status === 'scheduled' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                      'bg-slate-500/10 text-slate-400 border-slate-500/20'
                    }`}>
                      {mr.status}
                    </span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <p className="text-sm text-slate-300 italic leading-relaxed">"{mr.message}"</p>
                </div>

                {mr.status === 'pending' && (
                  <div className="space-y-4">
                    <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                      <Clock className="h-3.5 w-3.5" />
                      Proposed Time Slots (Confirm one)
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {mr.proposedSlots.map((slot, sIdx) => (
                        <Button
                          key={slot.id || `slot-${idx}-${sIdx}`}
                          variant="outline"
                          size="sm"
                          disabled={processingMeeting === mr.id}
                          onClick={() => handleAcceptMeeting(mr.id, slot.id)}
                          className="justify-start gap-3 h-auto py-3 px-4 bg-white/5 border-white/10 hover:border-primary hover:bg-primary/5 transition-all group relative overflow-hidden"
                        >
                          <Calendar className="h-4 w-4 text-primary" />
                          <div className="text-left">
                            <p className="text-[12px] font-bold text-white group-hover:text-primary transition-colors">{slot.date}</p>
                            <p className="text-[10px] text-slate-400 font-medium">{slot.startTime} - {slot.endTime}</p>
                          </div>
                          {processingMeeting === mr.id && (
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                              <div className="h-4 w-4 border-2 border-primary border-t-transparent animate-spin rounded-full" />
                            </div>
                          )}
                        </Button>
                      ))}
                    </div>
                    
                    <div className="flex justify-end pt-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={processingMeeting === mr.id}
                        onClick={() => handleDeclineMeeting(mr.id)}
                        className="text-destructive hover:bg-destructive/10 text-xs font-bold"
                      >
                        Decline Request
                      </Button>
                    </div>
                  </div>
                )}

                {mr.status === 'scheduled' && (
                  <div className="flex items-center gap-5 p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 shadow-xl shadow-emerald-500/5 transition-all hover:bg-emerald-500/15">
                    <div className="h-14 w-14 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-emerald-500 shrink-0 border border-emerald-500/30">
                      <CalendarCheck className="h-7 w-7" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em]">Confirmed Collaboration</p>
                        <div className="flex items-center gap-1.5 text-[10px] text-emerald-500/70 font-bold bg-emerald-500/5 px-2 py-0.5 rounded-full border border-emerald-500/10">
                          <Shield className="h-3 w-3" />
                          NDA SIGNED
                        </div>
                      </div>
                      <h5 className="text-lg font-bold text-white truncate mb-1">
                        {mr.requester.firstName} {mr.requester.lastName}
                      </h5>
                      <div className="flex items-center gap-3 text-sm font-medium text-slate-300">
                        <span className="flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5 text-emerald-500" />
                          {mr.selectedSlot?.date} @ {mr.selectedSlot?.startTime} - {mr.selectedSlot?.endTime}
                        </span>
                      </div>
                      
                      <div className="mt-4 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
                        <div className="flex-1 min-w-[200px]">
                          {mr.meetingLink ? (
                            <div className="flex items-center gap-2">
                              <code className="px-2 py-1 rounded bg-black/40 text-[10px] text-primary border border-primary/20 truncate flex-1">
                                {mr.meetingLink}
                              </code>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-7 text-[10px] font-bold text-slate-400 hover:text-white"
                                onClick={() => {
                                  const newLink = prompt("Update meeting link:", mr.meetingLink || "");
                                  if (newLink !== null) toast.success("Link updated!");
                                }}
                              >
                                Edit
                              </Button>
                            </div>
                          ) : (
                            <p className="text-xs text-slate-500 italic flex items-center gap-2">
                              <div className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                              Waiting for meeting link
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {!mr.meetingLink && (
                            <>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="h-9 text-[11px] font-bold border-white/10 hover:bg-white/5 text-slate-300"
                                onClick={() => toast.success("Request sent to " + mr.requester.firstName)}
                              >
                                Request Link
                              </Button>
                              <Button 
                                variant="primary" 
                                size="sm" 
                                className="h-9 text-[11px] font-black uppercase tracking-tight bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 px-4"
                                onClick={() => {
                                  const newLink = prompt("Enter meeting link (Zoom, Google Meet, etc.):");
                                  if (newLink) toast.success("Link set and shared!");
                                }}
                              >
                                Set Meeting Link
                              </Button>
                            </>
                          )}
                          {mr.meetingLink && (
                            <a 
                              href={mr.meetingLink} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-xs font-black uppercase tracking-tight hover:bg-primary/90 transition-all shadow-xl shadow-primary/20 group"
                            >
                              Join Video Call <ArrowLeft className="h-4 w-4 rotate-180 group-hover:translate-x-0.5 transition-transform" />
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
