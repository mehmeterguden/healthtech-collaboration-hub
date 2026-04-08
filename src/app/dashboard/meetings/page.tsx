"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { meetingsApi } from "@/lib/api";
import { MeetingRequest, MeetingStatus } from "@/types";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PostStatusBadge } from "@/components/posts/post-status-badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  Calendar,
  Clock,
  Check,
  X,
  Video,
  MessageSquare,
  FileText,
  Ban,
} from "lucide-react";
import { format } from "date-fns";

const statusConfig: Record<
  MeetingStatus,
  { label: string; color: string; bg: string }
> = {
  pending: { label: "Pending", color: "text-amber-400", bg: "bg-amber-500/10" },
  accepted: { label: "Accepted", color: "text-blue-400", bg: "bg-blue-500/10" },
  declined: { label: "Declined", color: "text-destructive", bg: "bg-destructive/10" },
  scheduled: { label: "Scheduled", color: "text-emerald-400", bg: "bg-emerald-500/10" },
  completed: { label: "Completed", color: "text-primary", bg: "bg-primary/10" },
  cancelled: { label: "Cancelled", color: "text-muted-foreground", bg: "bg-muted" },
};

export default function MeetingsPage() {
  const [meetings, setMeetings] = useState<MeetingRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await meetingsApi.getAll();
        setMeetings(data);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleAccept = async (meetingId: string, slotId: string) => {
    try {
      const updated = await meetingsApi.accept(meetingId, slotId);
      setMeetings((prev) =>
        prev.map((m) => (m.id === meetingId ? updated : m))
      );
      toast.success("Meeting accepted!");
    } catch {
      toast.error("Failed to accept meeting");
    }
  };

  const handleDecline = async (meetingId: string) => {
    try {
      const updated = await meetingsApi.decline(meetingId);
      setMeetings((prev) =>
        prev.map((m) => (m.id === meetingId ? updated : m))
      );
      toast.success("Meeting declined");
    } catch {
      toast.error("Failed to decline meeting");
    }
  };

  const handleCancel = async (meetingId: string) => {
    try {
      const updated = await meetingsApi.cancel(meetingId);
      setMeetings((prev) =>
        prev.map((m) => (m.id === meetingId ? updated : m))
      );
      toast.success("Meeting cancelled");
    } catch {
      toast.error("Failed to cancel meeting");
    }
  };

  const filterMeetings = (tab: string) => {
    switch (tab) {
      case "incoming":
        return meetings.filter(
          (m) => m.receiverId === "u1" && m.status === "pending"
        );
      case "outgoing":
        return meetings.filter(
          (m) => m.requesterId === "u1" && m.status === "pending"
        );
      case "scheduled":
        return meetings.filter(
          (m) => m.status === "scheduled" || m.status === "accepted"
        );
      case "past":
        return meetings.filter(
          (m) =>
            m.status === "completed" ||
            m.status === "declined" ||
            m.status === "cancelled"
        );
      default:
        return meetings;
    }
  };

  const handleJoin = (meeting: MeetingRequest) => {
    if (meeting.meetingLink) {
      window.open(meeting.meetingLink, "_blank");
      toast.success("Opening meeting link...");
    } else {
      toast.info("Meeting link not yet available", {
        description: "The host will provide the link shortly before the meeting start time.",
      });
    }
  };

  const renderMeetingCard = (meeting: MeetingRequest) => {
    const config = statusConfig[meeting.status];
    const otherPerson =
      meeting.requesterId === "u1" ? meeting.receiver : meeting.requester;
    const isOwner = meeting.receiverId === "u1";

    return (
      <motion.div
        key={meeting.id}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ y: -4 }}
        className="group relative rounded-2xl border border-border bg-card p-6 shadow-sm transition-all hover:shadow-md hover:border-primary/20 overflow-hidden"
      >
        {/* Status Background Glow */}
        <div className={`absolute -right-12 -top-12 h-24 w-24 rounded-full blur-3xl opacity-10 transition-opacity group-hover:opacity-20 ${config.bg.replace('bg-', 'bg-')}`} />

        <div className="flex items-start justify-between gap-4 mb-5">
          <div className="flex items-center gap-3">
            <Link href={`/dashboard/profile/${otherPerson.slug}`}>
              <div className="relative hover:opacity-80 transition">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary font-bold text-lg ring-1 ring-primary/20">
                  {otherPerson.firstName[0]}
                  {otherPerson.lastName[0]}
                </div>
                <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-card bg-emerald-500" title="Online" />
              </div>
            </Link>
            <div>
              <Link href={`/dashboard/profile/${otherPerson.slug}`} className="hover:underline hover:text-primary transition-colors">
                <p className="text-sm font-bold tracking-tight">
                  {otherPerson.firstName} {otherPerson.lastName}
                </p>
              </Link>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                <span className="truncate max-w-[150px]">{otherPerson.institution}</span>
                <span>•</span>
                <span className="capitalize">{otherPerson.role}</span>
              </div>
            </div>
          </div>
          <div className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${config.color} ${config.bg} border border-current/10`}>
             <div className={`h-1.5 w-1.5 rounded-full animate-pulse ${config.color.replace('text-', 'bg-')}`} />
            {config.label}
          </div>
        </div>

        <div className="space-y-4">
          <div className="p-3 rounded-xl bg-accent/30 border border-border/50">
            <div className="flex items-center gap-2 mb-1.5 text-xs font-semibold text-primary">
              <FileText className="h-3.5 w-3.5" />
              Project Context
            </div>
            <p className="text-sm font-medium line-clamp-1 mb-1">{meeting.post.title}</p>
            <p className="text-xs text-muted-foreground italic line-clamp-2 leading-relaxed opacity-80">
              "{meeting.message}"
            </p>
          </div>

          {meeting.selectedSlot && (
             <div className="flex items-center gap-4 py-2 px-1">
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mb-1">Date</span>
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <Calendar className="h-4 w-4 text-primary" />
                    {format(new Date(meeting.selectedSlot.date), "EEEE, MMMM do")}
                  </div>
                </div>
                <div className="h-8 w-px bg-border mx-2" />
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mb-1">Time</span>
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <Clock className="h-4 w-4 text-primary" />
                    {meeting.selectedSlot.startTime} — {meeting.selectedSlot.endTime}
                  </div>
                </div>
             </div>
          )}

          {meeting.status === "pending" && isOwner && (
            <div className="space-y-3 pt-2">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Select a Time Slot to Confirm</p>
              <div className="grid grid-cols-1 gap-2">
                {meeting.proposedSlots.map((slot) => (
                  <button
                    key={slot.id}
                    onClick={() => handleAccept(meeting.id, slot.id)}
                    className="flex items-center justify-between group/slot w-full text-left p-3 rounded-xl border border-border hover:border-primary/50 hover:bg-primary/5 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-accent flex items-center justify-center group-hover/slot:bg-primary group-hover/slot:text-primary-foreground transition-colors">
                        <Calendar className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold">{format(new Date(slot.date), "MMM d, yyyy")}</p>
                        <p className="text-[10px] text-muted-foreground">{slot.startTime} - {slot.endTime}</p>
                      </div>
                    </div>
                    <Check className="h-4 w-4 text-primary opacity-0 group-hover/slot:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-4 gap-3">
             <div className="flex items-center gap-3">
                {meeting.ndaAccepted && (
                  <div className="flex items-center gap-1.5 rounded-lg bg-emerald-500/10 px-2.5 py-1.5 text-[10px] font-bold text-emerald-500 border border-emerald-500/20">
                    <Check className="h-3 w-3 shadow-glow" />
                    NDA SIGNED
                  </div>
                )}
             </div>
             
             <div className="flex items-center gap-2">
                {meeting.status === "pending" && isOwner && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-9 px-4 text-xs font-bold text-destructive hover:bg-destructive/5"
                    onClick={() => handleDecline(meeting.id)}
                  >
                    DECLINE
                  </Button>
                )}
                
                {meeting.status === "scheduled" && (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-9 px-4 text-[10px] font-bold text-muted-foreground hover:bg-accent"
                      onClick={() => handleCancel(meeting.id)}
                    >
                      CANCEL
                    </Button>
                    <Button 
                      size="sm" 
                      className="h-9 px-6 text-xs font-bold gap-2 shadow-lg shadow-primary/20 glow"
                      onClick={() => handleJoin(meeting)}
                    >
                      <Video className="h-3.5 w-3.5" />
                      JOIN MEETING
                    </Button>
                  </>
                )}
                
                {meeting.status === "completed" && (
                   <Button variant="outline" size="sm" className="h-9 text-[10px] font-bold gap-2">
                      <MessageSquare className="h-3.5 w-3.5" />
                      FOLLOW UP
                   </Button>
                )}
             </div>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Meetings</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your meeting requests and scheduled meetings.
        </p>
      </div>

      <Tabs defaultValue="incoming">
        <TabsList>
          <TabsTrigger value="incoming">
            Incoming
            {filterMeetings("incoming").length > 0 && (
              <span className="ml-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
                {filterMeetings("incoming").length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="outgoing">Outgoing</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
          <TabsTrigger value="past">Past</TabsTrigger>
        </TabsList>

        {["incoming", "outgoing", "scheduled", "past"].map((tab) => (
          <TabsContent key={tab} value={tab}>
            {loading ? (
              <div className="grid gap-4 md:grid-cols-2">
                {[1, 2].map((i) => (
                  <div
                    key={i}
                    className="rounded-xl border border-border bg-card p-5"
                  >
                    <Skeleton className="h-10 w-full mb-3" />
                    <Skeleton className="h-4 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2 mb-4" />
                    <Skeleton className="h-8 w-full" />
                  </div>
                ))}
              </div>
            ) : filterMeetings(tab).length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16 text-center">
                <Calendar className="h-8 w-8 text-muted-foreground mb-3" />
                <h3 className="text-sm font-semibold mb-1">
                  No {tab} meetings
                </h3>
                <p className="text-xs text-muted-foreground">
                  {tab === "incoming"
                    ? "You have no pending meeting requests."
                    : tab === "outgoing"
                    ? "You haven't sent any meeting requests."
                    : tab === "scheduled"
                    ? "No upcoming meetings scheduled."
                    : "No past meetings to display."}
                </p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {filterMeetings(tab).map(renderMeetingCard)}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
