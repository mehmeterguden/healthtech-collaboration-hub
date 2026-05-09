"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "@/lib/store";
import { messagesApi } from "@/lib/api";
import { Conversation, Message } from "@/types";
import { format, formatDistanceToNow, isToday, isYesterday } from "date-fns";
import { cn } from "@/lib/utils";
import {
  MessageSquare,
  Send,
  ArrowLeft,
  Clock,
  Shield,
  Video,
  Building2,
  MapPin,
  Wifi,
  WifiOff,
  CheckCheck,
  Inbox,
  RefreshCw,
  ChevronRight,
  Calendar,
  Lock,
  Heart,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Link from "next/link";

function formatChatTime(date: string) {
  const d = new Date(date);
  if (isToday(d)) return format(d, "HH:mm");
  if (isYesterday(d)) return "Yesterday";
  return format(d, "MMM d");
}

function getStatusLabel(type: string, status: string) {
  if (type === "interest_received") return { label: "Interest Received", color: "text-violet-400", bg: "bg-violet-500/10" };
  if (type === "interest_sent") return { label: "Interest Sent", color: "text-amber-400", bg: "bg-amber-500/10" };
  switch (status) {
    case "accepted": return { label: "Accepted", color: "text-blue-400", bg: "bg-blue-500/10" };
    case "scheduled": return { label: "Scheduled", color: "text-emerald-400", bg: "bg-emerald-500/10" };
    case "completed": return { label: "Completed", color: "text-primary", bg: "bg-primary/10" };
    default: return { label: status, color: "text-muted-foreground", bg: "bg-muted/30" };
  }
}

function ConversationItem({
  conv,
  active,
  currentUserId,
  onClick,
}: {
  conv: Conversation;
  active: boolean;
  currentUserId: string;
  onClick: () => void;
}) {
  const statusCfg = getStatusLabel(conv.type, conv.status);
  const other = conv.otherUser;

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left p-4 rounded-2xl border transition-all duration-200 group relative",
        active
          ? "border-primary/30 bg-primary/5 shadow-sm"
          : "border-transparent hover:border-border/50 hover:bg-accent/30"
      )}
    >
      <div className="flex items-center gap-3">
        {/* Avatar */}
        <div className="relative shrink-0">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/15 text-primary font-bold text-base">
            {other.firstName[0]}{other.lastName[0]}
          </div>
          {conv.status === "scheduled" && (
            <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-background bg-emerald-500 flex items-center justify-center">
              <div className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
            </div>
          )}
          {!conv.canMessage && conv.type.startsWith("interest") && (
            <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-background bg-muted-foreground flex items-center justify-center">
              <Lock className="h-2 w-2 text-background" />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-0.5">
            <p className={cn("text-sm font-bold truncate flex items-center gap-1", active && "text-primary")}>
              {other.firstName} {other.lastName}
            </p>
            <div className="flex flex-col items-end gap-1 shrink-0 ml-2">
              <span className="text-[10px] text-muted-foreground/60 leading-none">
                {formatChatTime(conv.updatedAt)}
              </span>
              <span className={cn("text-[7px] font-black uppercase tracking-widest px-1 py-0.5 rounded-[4px] leading-none", statusCfg.color, statusCfg.bg)}>
                {statusCfg.label}
              </span>
            </div>
          </div>
          <p className="text-[11px] text-muted-foreground truncate leading-tight">
            {conv.post.title}
          </p>
          
          <div className="mt-1">
            {conv.type === "meeting" ? (
              conv.lastMessage ? (
                <p className="text-xs text-muted-foreground/70 truncate">
                  {conv.lastMessage.senderId === currentUserId ? (
                    <span className="flex items-center gap-1">
                      <CheckCheck className="h-3 w-3 text-primary/60 inline" />
                      {conv.lastMessage.content}
                    </span>
                  ) : (
                    conv.lastMessage.content
                  )}
                </p>
              ) : (
                <p className="text-xs text-muted-foreground/50 italic">No messages yet — say hi!</p>
              )
            ) : (
              <p className="text-[11px] text-muted-foreground/60 italic flex items-center gap-1">
                <Heart className="h-3 w-3" /> 
                {conv.type === "interest_received" ? "Expressed interest in your project" : "You expressed interest"}
              </p>
            )}
          </div>
        </div>
      </div>
    </button>
  );
}

function MessageBubble({
  msg,
  isMine,
  showAvatar,
  onDelete,
}: {
  msg: Message;
  isMine: boolean;
  showAvatar: boolean;
  onDelete?: (id: string) => void;
}) {
  const [canDelete, setCanDelete] = useState(false);

  useEffect(() => {
    if (!isMine) return;
    const check = () => {
      const age = Date.now() - new Date(msg.createdAt).getTime();
      setCanDelete(age < 2 * 60 * 1000);
    };
    check();
    const timer = setInterval(check, 10000);
    return () => clearInterval(timer);
  }, [msg.createdAt, isMine]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className={cn("flex items-end gap-2 max-w-[80%] group", isMine ? "ml-auto flex-row-reverse" : "")}
    >
      {/* Avatar */}
      {!isMine && (
        <div className={cn("shrink-0 mb-1", showAvatar ? "visible" : "invisible")}>
          <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-primary/20 text-primary font-bold text-[10px] border border-primary/15">
            {msg.sender.firstName[0]}{msg.sender.lastName[0]}
          </div>
        </div>
      )}

      <div className={cn("flex flex-col gap-0.5 relative", isMine ? "items-end" : "items-start")}>
        <div
          className={cn(
            "rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm relative",
            isMine
              ? "bg-primary text-primary-foreground rounded-br-sm"
              : "bg-card border border-border/50 text-foreground rounded-bl-sm"
          )}
        >
          {msg.content}
          
          {isMine && canDelete && (
            <button
              onClick={() => onDelete?.(msg.id)}
              className="absolute -left-8 top-1/2 -translate-y-1/2 p-1.5 rounded-lg bg-destructive/10 text-destructive opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive hover:text-white"
              title="Delete message (available for 2 mins)"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          )}
        </div>
        <span className="text-[9px] text-muted-foreground/50 px-1">
          {format(new Date(msg.createdAt), "HH:mm")}
        </span>
      </div>
    </motion.div>
  );
}

function DateDivider({ date }: { date: string }) {
  const d = new Date(date);
  const label = isToday(d) ? "Today" : isYesterday(d) ? "Yesterday" : format(d, "MMMM d, yyyy");
  return (
    <div className="flex items-center gap-3 py-2">
      <div className="flex-1 h-px bg-border/30" />
      <span className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest">{label}</span>
      <div className="flex-1 h-px bg-border/30" />
    </div>
  );
}

export default function MessagesPage() {
  const user = useAuthStore((s) => s.user);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loadingConvs, setLoadingConvs] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [sending, setSending] = useState(false);
  const [mobileView, setMobileView] = useState<"list" | "chat">("list");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<NodeJS.Timeout | null>(null);

  const scrollToBottom = useCallback((smooth = true) => {
    messagesEndRef.current?.scrollIntoView({ behavior: smooth ? "smooth" : "auto" });
  }, []);

  const loadConversations = useCallback(async () => {
    try {
      const data = await messagesApi.getConversations();
      setConversations(data);
    } catch {
      // silent
    } finally {
      setLoadingConvs(false);
    }
  }, []);

  const loadMessages = useCallback(async (meetingId: string, silent = false) => {
    if (!silent) setLoadingMsgs(true);
    try {
      const data = await messagesApi.getMessages(meetingId);
      setMessages(data);
      setTimeout(() => scrollToBottom(!silent), 50);
    } catch {
      // silent
    } finally {
      setLoadingMsgs(false);
    }
  }, [scrollToBottom]);

  useEffect(() => {
    async function init() {
      await loadConversations();
      // Handle meetingId from query params
      const searchParams = new URLSearchParams(window.location.search);
      const meetingId = searchParams.get("meetingId");
      if (meetingId) {
        setActiveConvId(meetingId);
        setMobileView("chat");
      }
    }
    init();
  }, [loadConversations]);

  const activeConv = conversations.find((c) => c.id === activeConvId);

  useEffect(() => {
    if (!activeConv) return;
    
    // Load initial messages (virtual or real)
    loadMessages(activeConv.id);
    
    // Only poll for new messages if the conversation is active (not interest_sent)
    if (activeConv.canMessage) {
      pollRef.current = setInterval(() => {
        loadMessages(activeConv.id, true);
      }, 3000);
    }

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [activeConv, loadMessages]);

  const handleSelectConv = (id: string) => {
    setActiveConvId(id);
    setMessages([]);
    setMobileView("chat");
  };

  const handleSend = async () => {
    if (!input.trim() || !activeConvId || sending || !activeConv?.canMessage) return;
    const content = input.trim();
    setInput("");
    setSending(true);

    // Optimistic UI
    const optimistic: Message = {
      id: `tmp-${Date.now()}`,
      meetingId: activeConvId,
      senderId: user!.id,
      sender: user as any,
      content,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimistic]);
    setTimeout(() => scrollToBottom(), 50);

    try {
      const saved = await messagesApi.sendMessage(activeConvId, content);
      
      // If the meetingId changed (e.g. from interest-in-xxx to a real ID), 
      // we need to refresh everything and update the active ID
      if (saved.meetingId !== activeConvId) {
        await loadConversations();
        setActiveConvId(saved.meetingId);
      } else {
        setMessages((prev) =>
          prev.map((m) => (m.id === optimistic.id ? saved : m))
        );
        loadConversations();
      }
    } catch {
      setMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
      setInput(content);
      toast.error("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const handleDeleteMessage = async (id: string) => {
    try {
      await messagesApi.deleteMessage(id);
      setMessages((prev) => prev.filter((m) => m.id !== id));
      toast.success("Message deleted");
    } catch (err: any) {
      toast.error(err.message || "Failed to delete message");
    }
  };

  const handleDeleteConversation = async (id: string) => {
    if (!confirm("Are you sure you want to delete this entire conversation? This action cannot be undone.")) return;
    try {
      await messagesApi.deleteConversation(id);
      setConversations((prev) => prev.filter((c) => c.id !== id));
      setActiveConvId(null);
      toast.success("Conversation deleted");
    } catch (err: any) {
      toast.error(err.message || "Failed to delete conversation");
    }
  };

  // Group messages by date
  const groupedMessages: { date: string; messages: Message[] }[] = [];
  messages.forEach((msg) => {
    const dateKey = format(new Date(msg.createdAt), "yyyy-MM-dd");
    const existing = groupedMessages.find((g) => g.date === dateKey);
    if (existing) {
      existing.messages.push(msg);
    } else {
      groupedMessages.push({ date: dateKey, messages: [msg] });
    }
  });

  return (
    <div className="flex h-[calc(100vh-6rem)] gap-0 overflow-hidden rounded-2xl border border-border/50 bg-card/30 backdrop-blur-sm">
      {/* Sidebar: Conversations List */}
      <div
        className={cn(
          "flex flex-col border-r border-border/50 transition-all duration-300",
          "w-full md:w-80 lg:w-96 md:flex shrink-0",
          mobileView === "chat" ? "hidden md:flex" : "flex"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border/50">
          <div>
            <h1 className="text-lg font-black tracking-tight">Messages</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Your active collaboration chats
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-xl"
            onClick={() => { setLoadingConvs(true); loadConversations(); }}
          >
            <RefreshCw className={cn("h-3.5 w-3.5", loadingConvs && "animate-spin")} />
          </Button>
        </div>

        {/* Conversations */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {loadingConvs ? (
            <div className="space-y-3 p-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-3 p-3 rounded-2xl animate-pulse">
                  <div className="h-12 w-12 rounded-2xl bg-muted/40 shrink-0" />
                  <div className="flex-1 space-y-2 pt-1">
                    <div className="h-3.5 bg-muted/40 rounded w-2/3" />
                    <div className="h-2.5 bg-muted/30 rounded w-full" />
                    <div className="h-2.5 bg-muted/20 rounded w-3/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-16 text-center px-6">
              <div className="h-16 w-16 rounded-2xl bg-muted/20 flex items-center justify-center mb-4">
                <MessageSquare className="h-8 w-8 text-muted-foreground/30" />
              </div>
              <h3 className="text-sm font-bold mb-2">No conversations yet</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Interests and accepted meetings will appear here.
              </p>
              <Link href="/dashboard/posts" className="mt-4 flex items-center gap-1 text-xs text-primary hover:underline">
                Browse Posts <ChevronRight className="h-3 w-3" />
              </Link>
            </div>
          ) : (
            <>
              {conversations.map((conv) => (
                <ConversationItem
                  key={conv.id}
                  conv={conv}
                  active={conv.id === activeConvId}
                  currentUserId={user!.id}
                  onClick={() => handleSelectConv(conv.id)}
                />
              ))}
            </>
          )}
        </div>

        {/* Info note */}
        <div className="p-3 border-t border-border/30">
          <div className="flex items-center gap-2 rounded-xl bg-primary/5 border border-primary/10 px-3 py-2">
            <Shield className="h-3.5 w-3.5 text-primary/70 shrink-0" />
            <p className="text-[10px] text-muted-foreground leading-snug">
              Direct messaging is only available after a meeting request is scheduled or accepted.
            </p>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div
        className={cn(
          "flex flex-col flex-1 transition-all duration-300",
          mobileView === "list" ? "hidden md:flex" : "flex"
        )}
      >
        {activeConv ? (
          <>
            {/* Chat Header */}
            <div className="flex items-center gap-4 p-4 border-b border-border/50 bg-card/50 backdrop-blur-sm">
              {/* Back button (mobile) */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden h-8 w-8 rounded-xl shrink-0"
                onClick={() => setMobileView("list")}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>

              {/* Avatar */}
              <div className="relative shrink-0">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary/25 to-primary/5 border border-primary/20 text-primary font-bold">
                  {activeConv.otherUser.firstName[0]}{activeConv.otherUser.lastName[0]}
                </div>
                {activeConv.status === "scheduled" && (
                  <div className="absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full border-2 border-background bg-emerald-500" />
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-bold text-sm truncate">
                    {activeConv.otherUser.firstName} {activeConv.otherUser.lastName}
                  </p>
                  <span className={cn(
                    "text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-md shrink-0",
                    getStatusLabel(activeConv.type, activeConv.status).color,
                    getStatusLabel(activeConv.type, activeConv.status).bg
                  )}>
                    {getStatusLabel(activeConv.type, activeConv.status).label}
                  </span>
                </div>
                <div className="flex items-center gap-3 mt-0.5">
                  <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                    <Building2 className="h-3 w-3" /> {activeConv.otherUser.institution || "—"}
                  </span>
                  {activeConv.selectedSlot && (
                    <span className="text-[11px] text-emerald-400 flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {format(new Date(activeConv.selectedSlot.date), "MMM d")} · {activeConv.selectedSlot.startTime}
                    </span>
                  )}
                </div>
              </div>

              {/* Join meeting button */}
              {activeConv.meetingLink && activeConv.status === "scheduled" && (
                <Button
                  size="sm"
                  className="rounded-xl gap-1.5 text-xs font-bold shadow-lg shadow-primary/20 shrink-0"
                  onClick={() => window.open(activeConv.meetingLink, "_blank")}
                >
                  <Video className="h-3.5 w-3.5" /> Join
                </Button>
              )}

              {/* Delete conversation button */}
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0"
                onClick={() => handleDeleteConversation(activeConv.id)}
                title="Delete Conversation"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            {/* Project context bar */}
            <div className="flex items-center gap-2 px-4 py-2.5 bg-muted/20 border-b border-border/30">
              <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
              <span className="text-[11px] text-muted-foreground">
                Re: <span className="font-semibold text-foreground">{activeConv.post.title}</span>
                <span className="text-muted-foreground/60"> · {activeConv.post.domain}</span>
              </span>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1 relative">
              {!activeConv.canMessage ? (
                // Read-only Interest View
                <div className="flex flex-col items-center justify-center h-full max-w-md mx-auto text-center">
                  <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mb-6">
                    <Lock className="h-8 w-8 text-muted-foreground/50" />
                  </div>
                  
                  {activeConv.type === "interest_received" ? (
                    <>
                      <h3 className="text-lg font-bold mb-2">{activeConv.otherUser.firstName} is interested in your project!</h3>
                      <p className="text-sm text-muted-foreground mb-6">
                        They have expressed interest in collaborating on "{activeConv.post.title}". To start messaging them directly, please schedule a meeting with them first.
                      </p>
                      
                      {activeConv.message && (
                        <div className="w-full text-left p-4 rounded-xl bg-card border border-border/50 mb-6">
                          <p className="text-xs font-bold text-muted-foreground mb-2 uppercase tracking-wider">Their Message</p>
                          <p className="text-sm italic">"{activeConv.message}"</p>
                        </div>
                      )}
                      
                      <Link href="/dashboard/meetings">
                        <Button className="rounded-xl">Go to Meetings <ChevronRight className="ml-2 h-4 w-4"/></Button>
                      </Link>
                    </>
                  ) : (
                    <>
                      <h3 className="text-lg font-bold mb-2">You expressed interest</h3>
                      <p className="text-sm text-muted-foreground mb-6">
                        You have expressed interest in {activeConv.otherUser.firstName}'s project "{activeConv.post.title}". Wait for them to schedule a meeting with you to unlock messaging.
                      </p>
                      
                      {activeConv.message && (
                        <div className="w-full text-left p-4 rounded-xl bg-card border border-border/50 mb-6">
                          <p className="text-xs font-bold text-muted-foreground mb-2 uppercase tracking-wider">Your Message</p>
                          <p className="text-sm italic">"{activeConv.message}"</p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              ) : (
                // Actual Chat View
                loadingMsgs && messages.length === 0 ? (
                  <div className="flex flex-col gap-4 py-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className={cn("flex gap-2", i % 2 === 0 ? "flex-row-reverse" : "")}>
                        <div className="h-7 w-7 rounded-xl bg-muted/30 shrink-0 animate-pulse" />
                        <div className={cn("rounded-2xl bg-muted/20 animate-pulse", i % 2 === 0 ? "w-48 h-10" : "w-64 h-14")} />
                      </div>
                    ))}
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full py-12 text-center">
                    <div className="h-16 w-16 rounded-2xl bg-primary/5 border border-primary/10 flex items-center justify-center mb-4">
                      <MessageSquare className="h-8 w-8 text-primary/30" />
                    </div>
                    <p className="text-sm font-bold mb-1">Start the conversation</p>
                    <p className="text-xs text-muted-foreground max-w-xs">
                      Say hello to {activeConv.otherUser.firstName}! This is a private and secure channel.
                    </p>
                  </div>
                ) : (
                  <>
                    {groupedMessages.map((group) => (
                      <div key={group.date} className="space-y-2">
                        <DateDivider date={`${group.date}T00:00:00`} />
                        {group.messages.map((msg, idx) => {
                          const prevMsg = group.messages[idx - 1];
                          const showAvatar = !prevMsg || prevMsg.senderId !== msg.senderId;
                          return (
                            <MessageBubble
                              key={msg.id}
                              msg={msg}
                              isMine={msg.senderId === user!.id}
                              showAvatar={showAvatar}
                              onDelete={handleDeleteMessage}
                            />
                          );
                        })}
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </>
                )
              )}
            </div>

            {/* Input - Only show if canMessage */}
            {activeConv.canMessage && (
              <div className="p-4 border-t border-border/50 bg-card/50">
                <div className="flex items-end gap-3">
                  <div className="flex-1 rounded-2xl border border-border/60 bg-background/50 focus-within:border-primary/40 transition-colors">
                    <textarea
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSend();
                        }
                      }}
                      placeholder={`Message ${activeConv.otherUser.firstName}...`}
                      rows={1}
                      className="w-full bg-transparent px-4 py-3 text-sm resize-none focus:outline-none max-h-32 custom-scrollbar"
                      style={{ minHeight: "44px" }}
                    />
                  </div>
                  <Button
                    onClick={handleSend}
                    disabled={!input.trim() || sending}
                    className="h-11 w-11 rounded-2xl p-0 shadow-lg shadow-primary/20 shrink-0"
                  >
                    {sending ? (
                      <div className="h-4 w-4 border-2 border-primary-foreground/50 border-t-primary-foreground rounded-full animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <p className="text-[10px] text-muted-foreground/40 text-center mt-2">
                  Press Enter to send · Shift+Enter for new line
                </p>
              </div>
            )}
          </>
        ) : (
          /* Empty state — no conversation selected */
          <div className="flex flex-col items-center justify-center h-full text-center px-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="flex flex-col items-center"
            >
              <div className="relative mb-6">
                <div className="h-24 w-24 rounded-3xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <MessageSquare className="h-12 w-12 text-primary/40" />
                </div>
                <div className="absolute -top-2 -right-2 h-8 w-8 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                  <Wifi className="h-4 w-4 text-emerald-400" />
                </div>
              </div>
              <h2 className="text-xl font-black mb-2 tracking-tight">Your Collaboration Inbox</h2>
              <p className="text-sm text-muted-foreground max-w-sm leading-relaxed mb-6">
                Select an item from the left. Interests you received and sent will appear here, and accepted meetings will unlock direct messaging.
              </p>
              <div className="grid grid-cols-1 gap-2 w-full max-w-xs text-left">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-card/50 border border-border/50">
                  <CheckCheck className="h-4 w-4 text-emerald-400 shrink-0" />
                  <p className="text-xs text-muted-foreground">End-to-end private collaboration space</p>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-card/50 border border-border/50">
                  <Shield className="h-4 w-4 text-primary/70 shrink-0" />
                  <p className="text-xs text-muted-foreground">NDA-protected conversations</p>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-card/50 border border-border/50">
                  <Lock className="h-4 w-4 text-amber-400 shrink-0" />
                  <p className="text-xs text-muted-foreground">Messaging unlocked after meetings</p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
