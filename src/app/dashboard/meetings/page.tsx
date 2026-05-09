"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { meetingsApi } from "@/lib/api";
import { MeetingRequest, MeetingStatus } from "@/types";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { useAuthStore } from "@/lib/store";
import {
  Calendar, Clock, Video, FileText, Shield, Ban,
  CheckCircle2, XCircle, Hourglass, Users, ArrowRight,
  RefreshCw, Inbox, Send, Star, History, ExternalLink,
  ChevronRight, Building2, MapPin, AlertCircle,
} from "lucide-react";
import { format, formatDistanceToNow, isPast, differenceInHours, differenceInMinutes } from "date-fns";
import { cn } from "@/lib/utils";

type Tab = "incoming" | "outgoing" | "scheduled" | "past";

const STATUS_CONFIG: Record<MeetingStatus, { label: string; color: string; bg: string; border: string }> = {
  pending:   { label: "Pending",   color: "text-amber-400",   bg: "bg-amber-500/10",    border: "border-amber-500/20" },
  accepted:  { label: "Accepted",  color: "text-blue-400",    bg: "bg-blue-500/10",     border: "border-blue-500/20" },
  declined:  { label: "Declined",  color: "text-rose-400",    bg: "bg-rose-500/10",     border: "border-rose-500/20" },
  scheduled: { label: "Scheduled", color: "text-emerald-400", bg: "bg-emerald-500/10",  border: "border-emerald-500/20" },
  completed: { label: "Completed", color: "text-primary",     bg: "bg-primary/10",      border: "border-primary/20" },
  cancelled: { label: "Cancelled", color: "text-slate-400",   bg: "bg-slate-500/10",    border: "border-slate-500/20" },
};

const TAB_CONFIG: { id: Tab; label: string; icon: React.ElementType; desc: string }[] = [
  { id: "incoming",  label: "Incoming",  icon: Inbox,   desc: "Requests awaiting your response" },
  { id: "outgoing",  label: "Outgoing",  icon: Send,    desc: "Requests you've sent" },
  { id: "scheduled", label: "Scheduled", icon: Calendar, desc: "Confirmed upcoming meetings" },
  { id: "past",      label: "Past",      icon: History,  desc: "Completed & cancelled meetings" },
];

function Countdown({ slot }: { slot: { date: string; startTime: string } }) {
  const meetingDate = new Date(`${slot.date}T${slot.startTime}`);
  const hoursLeft = differenceInHours(meetingDate, new Date());
  const minsLeft = differenceInMinutes(meetingDate, new Date()) % 60;
  if (isPast(meetingDate)) return <span className="text-xs text-slate-500 font-medium">Meeting time passed</span>;
  return (
    <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
      <Hourglass className="h-3 w-3 animate-pulse" />
      {hoursLeft > 24
        ? <span>In {Math.floor(hoursLeft / 24)}d {hoursLeft % 24}h</span>
        : <span>In {hoursLeft}h {minsLeft}m</span>
      }
    </div>
  );
}

function SlotBadge({ slot, selected, onClick }: { slot: any; selected: boolean; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col gap-0.5 rounded-xl border px-3 py-2 text-left text-xs transition-all",
        selected
          ? "border-primary/50 bg-primary/10 text-primary shadow-[0_0_12px_rgba(0,200,150,0.15)]"
          : "border-white/10 bg-white/[0.03] text-muted-foreground hover:border-white/20 hover:bg-white/[0.06]",
        onClick ? "cursor-pointer" : "cursor-default"
      )}
    >
      <span className="font-bold">{format(new Date(slot.date), "MMM d, yyyy")}</span>
      <span className="opacity-80">{slot.startTime} — {slot.endTime}</span>
    </button>
  );
}

function MeetingCard({
  meeting,
  tab,
  userId,
  onAccept,
  onDecline,
  onCancel,
  onComplete,
  onUpdateLink,
}: {
  meeting: MeetingRequest;
  tab: Tab;
  userId: string;
  onAccept: (id: string, slotId: string, custom?: any) => void;
  onDecline: (id: string) => void;
  onCancel: (id: string) => void;
  onComplete: (id: string) => void;
  onUpdateLink: (id: string, link: string) => void;
}) {
  const isReceiver = meeting.receiverId === userId;
  const other = isReceiver ? meeting.requester : meeting.receiver;
  const cfg = STATUS_CONFIG[meeting.status];
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [customDate, setCustomDate] = useState("");
  const [customTime, setCustomTime] = useState("10:00");
  const [showCustom, setShowCustom] = useState(false);

  const slots: any[] = meeting.proposedSlots ?? [];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      whileHover={{ y: -3 }}
      className="group relative rounded-2xl border border-white/5 bg-slate-900/50 backdrop-blur-sm p-5 shadow-xl transition-all hover:border-white/10 hover:shadow-primary/5 overflow-hidden"
    >
      {/* glow blob */}
      <div className={cn("absolute -right-12 -top-12 h-32 w-32 rounded-full blur-[60px] opacity-15 group-hover:opacity-25 transition-opacity", cfg.bg)} />

      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-4 relative z-10">
        <div className="flex items-center gap-3">
          <div className="relative shrink-0">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/15 text-primary font-bold text-base">
              {other.firstName[0]}{other.lastName?.[0] ?? ""}
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-slate-900 bg-emerald-500" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white group-hover:text-primary transition-colors leading-tight">
              {other.firstName} {other.lastName}
            </h3>
            <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
              <Building2 className="h-3 w-3 text-muted-foreground/60 shrink-0" />
              <span className="text-[11px] text-muted-foreground">{other.institution}</span>
              <span className={cn("text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-md border", cfg.color, cfg.bg, cfg.border)}>
                {other.role}
              </span>
            </div>
          </div>
        </div>
        <div className={cn("shrink-0 flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[9px] font-black uppercase tracking-widest border", cfg.color, cfg.bg, cfg.border)}>
          <span className={cn("h-1.5 w-1.5 rounded-full", cfg.color.replace("text-","bg-"), meeting.status === "pending" && "animate-pulse")} />
          {cfg.label}
        </div>
      </div>

      {/* Project */}
      <div className="rounded-xl bg-white/[0.03] border border-white/5 p-3 mb-3 relative z-10">
        <div className="flex items-center gap-1.5 mb-1">
          <FileText className="h-3 w-3 text-primary/70" />
          <span className="text-[9px] font-bold text-primary/70 uppercase tracking-widest">Project</span>
        </div>
        <p className="text-xs font-semibold text-slate-200 leading-snug mb-1">{meeting.post.title}</p>
        <p className="text-[11px] text-muted-foreground italic line-clamp-2">"{meeting.message}"</p>
      </div>

      {/* Proposed slots (for receiver on pending) */}
      {tab === "incoming" && meeting.status === "pending" && slots.length > 0 && (
        <div className="mb-3 relative z-10">
          <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Proposed Time Slots</p>
          <div className="flex flex-wrap gap-2">
            {slots.map((s) => (
              <SlotBadge key={s.id} slot={s} selected={selectedSlotId === s.id} onClick={() => setSelectedSlotId(s.id)} />
            ))}
          </div>
          <button
            onClick={() => setShowCustom((p) => !p)}
            className="mt-2 text-[10px] text-primary/70 hover:text-primary transition-colors"
          >
            {showCustom ? "Hide custom slot" : "+ Propose a different time"}
          </button>
          {showCustom && (
            <div className="mt-3">
              <DatePicker 
                date={customDate ? new Date(customDate) : undefined} 
                setDate={(d) => setCustomDate(d ? format(d, "yyyy-MM-dd") : "")}
                showTime
                time={customTime}
                setTime={setCustomTime}
                label="Custom Slot"
                placeholder="Pick a date"
                className="flex-col sm:flex-row"
              />
            </div>
          )}
        </div>
      )}

      {/* Outgoing proposed slots (read-only) */}
      {tab === "outgoing" && slots.length > 0 && (
        <div className="mb-3 relative z-10">
          <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Your Proposed Slots</p>
          <div className="flex flex-wrap gap-2">
            {slots.map((s) => <SlotBadge key={s.id} slot={s} selected={false} />)}
          </div>
        </div>
      )}

      {/* Confirmed slot */}
      {meeting.selectedSlot && (
        <div className="flex items-center gap-4 py-2 px-3 rounded-xl bg-emerald-500/5 border border-emerald-500/15 mb-3 relative z-10">
          <div>
            <p className="text-[9px] font-bold text-muted-foreground uppercase">Confirmed Date</p>
            <div className="flex items-center gap-1.5 text-xs font-bold text-white mt-0.5">
              <Calendar className="h-3 w-3 text-emerald-400" />
              {format(new Date(meeting.selectedSlot.date), "MMMM d, yyyy")}
            </div>
          </div>
          <div className="h-8 w-px bg-white/10" />
          <div>
            <p className="text-[9px] font-bold text-muted-foreground uppercase">Time</p>
            <div className="flex items-center gap-1.5 text-xs font-bold text-white mt-0.5">
              <Clock className="h-3 w-3 text-emerald-400" />
              {meeting.selectedSlot.startTime} — {meeting.selectedSlot.endTime}
            </div>
          </div>
          {!isPast(new Date(`${meeting.selectedSlot.date}T${meeting.selectedSlot.startTime}`)) && (
            <div className="ml-auto">
              <Countdown slot={meeting.selectedSlot} />
            </div>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-white/5 relative z-10">
        <div className="flex items-center gap-2">
          {meeting.ndaAccepted && (
            <div className="flex items-center gap-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 text-[9px] font-black text-emerald-500">
              <Shield className="h-3 w-3" />NDA
            </div>
          )}
          <span className="text-[10px] text-muted-foreground/60">
            {formatDistanceToNow(new Date(meeting.createdAt), { addSuffix: true })}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Incoming pending: accept / decline */}
          {tab === "incoming" && meeting.status === "pending" && (
            <>
              <Button variant="ghost" size="sm"
                className="h-8 px-3 text-[10px] font-bold text-rose-400 hover:bg-rose-500/10"
                onClick={() => onDecline(meeting.id)}>
                <XCircle className="h-3 w-3 mr-1" />Decline
              </Button>
              <Button size="sm"
                className="h-8 px-4 text-[10px] font-black bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20"
                onClick={() => {
                  if (showCustom && customDate) {
                    onAccept(meeting.id, "custom", { date: customDate, startTime: customTime, endTime: "" });
                  } else if (selectedSlotId) {
                    onAccept(meeting.id, selectedSlotId);
                  } else {
                    toast.error("Select a time slot first");
                  }
                }}>
                <CheckCircle2 className="h-3 w-3 mr-1" />Confirm
              </Button>
            </>
          )}

          {/* Outgoing pending: cancel */}
          {tab === "outgoing" && meeting.status === "pending" && (
            <Button variant="ghost" size="sm"
              className="h-8 px-3 text-[10px] font-bold text-slate-400 hover:bg-white/5"
              onClick={() => onCancel(meeting.id)}>
              <Ban className="h-3 w-3 mr-1" />Withdraw
            </Button>
          )}

          {/* Scheduled: join + cancel + complete */}
          {tab === "scheduled" && meeting.status === "scheduled" && (
            <div className="flex gap-2">
              <Button variant="ghost" size="sm"
                className="h-8 px-3 text-[10px] font-bold text-slate-400 hover:bg-white/5"
                onClick={() => onCancel(meeting.id)}>
                <Ban className="h-3 w-3 mr-1" />Cancel
              </Button>
              <Button variant="ghost" size="sm"
                className="h-8 px-3 text-[10px] font-bold text-primary/70 hover:bg-primary/10 hover:text-primary"
                onClick={() => {
                  const link = prompt("Enter meeting link (Zoom, Meet, etc.):", meeting.meetingLink || "");
                  if (link !== null) onUpdateLink(meeting.id, link);
                }}>
                <Video className="h-3 w-3 mr-1" />{meeting.meetingLink ? "Update Link" : "Add Link"}
              </Button>
              <Button variant="ghost" size="sm"
                className="h-8 px-3 text-[10px] font-bold text-primary/70 hover:bg-primary/10 hover:text-primary"
                onClick={() => onComplete(meeting.id)}>
                <CheckCircle2 className="h-3 w-3 mr-1" />Mark Done
              </Button>
              {meeting.meetingLink && (
                <Button size="sm"
                  className="h-8 px-4 text-[10px] font-black gap-1 bg-primary shadow-primary/20 shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all"
                  onClick={() => { window.open(meeting.meetingLink, "_blank"); toast.success("Opening meeting..."); }}>
                  <Video className="h-3 w-3" />Join
                </Button>
              )}
            </div>
          )}

          {/* Past: show link if completed */}
          {tab === "past" && meeting.status === "completed" && meeting.meetingLink && (
            <a href={meeting.meetingLink} target="_blank" rel="noreferrer"
              className="flex items-center gap-1 text-[10px] text-primary/70 hover:text-primary transition-colors">
              <ExternalLink className="h-3 w-3" />View Link
            </a>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default function MeetingsPage() {
  const [meetings, setMeetings] = useState<MeetingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("incoming");
  const [refreshing, setRefreshing] = useState(false);
  const user = useAuthStore((s) => s.user);

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const data = await meetingsApi.getAll();
      setMeetings(data);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filterMeetings = (tab: Tab): MeetingRequest[] => {
    if (!user) return [];
    switch (tab) {
      case "incoming":  return meetings.filter((m) => m.receiverId === user.id && m.status === "pending");
      case "outgoing":  return meetings.filter((m) => m.requesterId === user.id && m.status === "pending");
      case "scheduled": return meetings.filter((m) => (m.status === "scheduled" || m.status === "accepted") && (m.requesterId === user.id || m.receiverId === user.id));
      case "past":      return meetings.filter((m) => ["completed","declined","cancelled"].includes(m.status) && (m.requesterId === user.id || m.receiverId === user.id));
      default: return [];
    }
  };

  const update = (updated: MeetingRequest) =>
    setMeetings((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));

  const handleAccept = async (id: string, slotId: string, custom?: any) => {
    try { update(await meetingsApi.accept(id, slotId, custom)); toast.success("Meeting confirmed & scheduled!"); }
    catch { toast.error("Failed to confirm meeting"); }
  };
  const handleDecline = async (id: string) => {
    try { update(await meetingsApi.decline(id)); toast.success("Request declined"); }
    catch { toast.error("Failed to decline"); }
  };
  const handleCancel = async (id: string) => {
    try { update(await meetingsApi.cancel(id)); toast.success("Meeting cancelled"); }
    catch { toast.error("Failed to cancel"); }
  };
  const handleComplete = async (id: string) => {
    try { update(await meetingsApi.complete(id)); toast.success("Meeting marked as completed!"); }
    catch { toast.error("Failed to mark complete"); }
  };
  const handleUpdateLink = async (id: string, link: string) => {
    try { update(await meetingsApi.updateLink(id, link)); toast.success("Meeting link updated!"); }
    catch { toast.error("Failed to update link"); }
  };

  // stats
  const incoming = meetings.filter((m) => user && m.receiverId === user.id && m.status === "pending").length;
  const outgoing = meetings.filter((m) => user && m.requesterId === user.id && m.status === "pending").length;
  const scheduled = meetings.filter((m) => user && (m.status === "scheduled" || m.status === "accepted") && (m.requesterId === user.id || m.receiverId === user.id)).length;
  const completed = meetings.filter((m) => user && m.status === "completed" && (m.requesterId === user.id || m.receiverId === user.id)).length;

  const statItems = [
    { label: "Incoming", value: incoming, icon: Inbox,   color: "text-amber-400",   bg: "bg-amber-500/10" },
    { label: "Outgoing", value: outgoing, icon: Send,    color: "text-cyan-400",    bg: "bg-cyan-500/10" },
    { label: "Scheduled", value: scheduled, icon: Calendar, color: "text-emerald-400", bg: "bg-emerald-500/10" },
    { label: "Completed", value: completed, icon: Star,   color: "text-primary",     bg: "bg-primary/10" },
  ];

  const tabItems = filterMeetings(activeTab);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Meetings</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your collaboration requests and scheduled sessions.</p>
        </div>
        <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground hover:text-white" onClick={() => load(true)} disabled={refreshing}>
          <RefreshCw className={cn("h-3.5 w-3.5", refreshing && "animate-spin")} />Refresh
        </Button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {statItems.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
            onClick={() => setActiveTab(TAB_CONFIG.find(t => t.label === s.label)?.id ?? "incoming")}
            className={cn("rounded-xl border border-white/5 bg-slate-900/40 p-4 cursor-pointer transition-all hover:border-white/10 hover:bg-slate-900/60",
              activeTab === (TAB_CONFIG.find(t => t.label === s.label)?.id) && "border-primary/20 bg-primary/5")}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{s.label}</span>
              <div className={cn("h-7 w-7 rounded-lg flex items-center justify-center", s.bg)}>
                <s.icon className={cn("h-3.5 w-3.5", s.color)} />
              </div>
            </div>
            <div className="flex items-end gap-1">
              <span className="text-2xl font-bold">{loading ? "—" : s.value}</span>
              {s.value > 0 && <span className={cn("text-xs font-bold mb-0.5", s.color)}>active</span>}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Tab Bar */}
      <div className="flex gap-1 rounded-xl bg-slate-900/40 border border-white/5 p-1">
        {TAB_CONFIG.map((t) => {
          const count = filterMeetings(t.id).length;
          return (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className={cn("relative flex-1 flex items-center justify-center gap-2 rounded-lg py-2.5 text-xs font-semibold transition-all",
                activeTab === t.id
                  ? "bg-primary/10 text-primary shadow-sm border border-primary/20"
                  : "text-muted-foreground hover:text-white hover:bg-white/5")}>
              <t.icon className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{t.label}</span>
              {count > 0 && (
                <span className={cn("flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[9px] font-black",
                  activeTab === t.id ? "bg-primary text-primary-foreground" : "bg-amber-500/20 text-amber-400")}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab description */}
      <div className="flex items-center gap-2 -mt-3">
        <ChevronRight className="h-3.5 w-3.5 text-primary/50" />
        <p className="text-xs text-muted-foreground">{TAB_CONFIG.find(t => t.id === activeTab)?.desc}</p>
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {loading ? (
          <div className="grid gap-4 md:grid-cols-2">
            {[1, 2].map((i) => (
              <div key={i} className="rounded-2xl border border-white/5 bg-slate-900/40 p-5 space-y-3">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-11 w-11 rounded-xl" />
                  <div className="space-y-2 flex-1"><Skeleton className="h-4 w-32" /><Skeleton className="h-3 w-48" /></div>
                </div>
                <Skeleton className="h-20 w-full rounded-xl" />
                <div className="flex gap-2"><Skeleton className="h-7 w-24 rounded-lg" /><Skeleton className="h-7 w-24 rounded-lg" /></div>
                <Skeleton className="h-9 w-full rounded-xl" />
              </div>
            ))}
          </div>
        ) : tabItems.length === 0 ? (
          <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 py-20 text-center">
            {activeTab === "incoming" && <Inbox className="h-10 w-10 text-muted-foreground/30 mb-4" />}
            {activeTab === "outgoing" && <Send className="h-10 w-10 text-muted-foreground/30 mb-4" />}
            {activeTab === "scheduled" && <Calendar className="h-10 w-10 text-muted-foreground/30 mb-4" />}
            {activeTab === "past" && <History className="h-10 w-10 text-muted-foreground/30 mb-4" />}
            <h3 className="text-sm font-semibold mb-1">No {activeTab} meetings</h3>
            <p className="text-xs text-muted-foreground max-w-xs">
              {activeTab === "incoming" ? "No pending requests waiting for your response."
                : activeTab === "outgoing" ? "You haven't sent any meeting requests yet. Browse posts to get started."
                : activeTab === "scheduled" ? "No confirmed meetings yet. Accept an incoming request to schedule one."
                : "Your completed and cancelled meetings will appear here."}
            </p>
            {activeTab === "outgoing" && (
              <a href="/dashboard/posts" className="mt-4 flex items-center gap-1.5 text-xs text-primary hover:underline">
                Browse Posts <ArrowRight className="h-3 w-3" />
              </a>
            )}
          </motion.div>
        ) : (
          <motion.div key={activeTab} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="grid gap-4 md:grid-cols-2">
            <AnimatePresence>
              {tabItems.map((m) => (
                <MeetingCard key={m.id} meeting={m} tab={activeTab} userId={user!.id}
                  onAccept={handleAccept} onDecline={handleDecline}
                  onCancel={handleCancel} onComplete={handleComplete} 
                  onUpdateLink={handleUpdateLink} />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
