"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { useAuthStore, useNotificationStore } from "@/lib/store";
import { Notification } from "@/types";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  Bell,
  CheckCircle,
  Heart,
  Calendar,
  Users,
  Handshake,
  XCircle,
  RefreshCw,
  CheckCheck,
  Trash2,
  Filter,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { cn } from "@/lib/utils";

const typeConfig: Record<
  string,
  { icon: React.ElementType; color: string; bg: string }
> = {
  interest: {
    icon: Heart,
    color: "text-pink-400",
    bg: "bg-pink-500/10",
  },
  meeting_request: {
    icon: Calendar,
    color: "text-amber-400",
    bg: "bg-amber-500/10",
  },
  meeting_accepted: {
    icon: CheckCircle,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
  },
  meeting_declined: {
    icon: XCircle,
    color: "text-rose-400",
    bg: "bg-rose-500/10",
  },
  partner_found: {
    icon: Handshake,
    color: "text-primary",
    bg: "bg-primary/10",
  },
};

const filterTabs = [
  { key: "all", label: "All" },
  { key: "unread", label: "Unread" },
  { key: "interest", label: "Interests" },
  { key: "meeting_request", label: "Meeting Requests" },
  { key: "meeting_accepted", label: "Accepted" },
  { key: "meeting_declined", label: "Declined" },
  { key: "partner_found", label: "Partner Found" },
];

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState("all");
  const { setNotifications: setStoreNotifications, markAsRead, markAllAsRead } =
    useNotificationStore();

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
        setStoreNotifications(data);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [setStoreNotifications]);

  useEffect(() => {
    load();
  }, [load]);

  const handleMarkAsRead = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}/read`, { method: "PATCH" });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
      markAsRead(id);
    } catch {
      toast.error("Failed to mark as read");
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await fetch("/api/notifications/read-all", { method: "PATCH" });
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      markAllAsRead();
      toast.success("All notifications marked as read");
    } catch {
      toast.error("Failed to mark all as read");
    }
  };

  const filtered =
    filter === "all"
      ? notifications
      : filter === "unread"
      ? notifications.filter((n) => !n.read)
      : notifications.filter((n) => n.type === filter);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Notifications</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Stay updated on your collaboration activities.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs"
              onClick={handleMarkAllAsRead}
            >
              <CheckCheck className="h-3.5 w-3.5" />
              Mark all read
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 text-muted-foreground"
            onClick={() => load(true)}
            disabled={refreshing}
          >
            <RefreshCw
              className={cn("h-3.5 w-3.5", refreshing && "animate-spin")}
            />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
              Total
            </span>
            <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center">
              <Bell className="h-3.5 w-3.5 text-primary" />
            </div>
          </div>
          <span className="text-2xl font-bold">{notifications.length}</span>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
              Unread
            </span>
            <div className="h-7 w-7 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <Bell className="h-3.5 w-3.5 text-amber-400" />
            </div>
          </div>
          <span className="text-2xl font-bold">{unreadCount}</span>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
              Interests
            </span>
            <div className="h-7 w-7 rounded-lg bg-pink-500/10 flex items-center justify-center">
              <Heart className="h-3.5 w-3.5 text-pink-400" />
            </div>
          </div>
          <span className="text-2xl font-bold">
            {notifications.filter((n) => n.type === "interest").length}
          </span>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
              Meetings
            </span>
            <div className="h-7 w-7 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <Calendar className="h-3.5 w-3.5 text-emerald-400" />
            </div>
          </div>
          <span className="text-2xl font-bold">
            {
              notifications.filter(
                (n) =>
                  n.type === "meeting_request" ||
                  n.type === "meeting_accepted"
              ).length
            }
          </span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1 rounded-xl bg-muted/30 border border-border p-1 overflow-x-auto">
        {filterTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={cn(
              "rounded-lg px-3 py-2 text-xs font-semibold transition-all whitespace-nowrap",
              filter === tab.key
                ? "bg-primary/10 text-primary border border-primary/20"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Notification List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-start gap-3">
                <Skeleton className="h-10 w-10 rounded-lg shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-20 text-center"
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted mb-4">
            <Bell className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="text-base font-semibold mb-1">No notifications</h3>
          <p className="text-sm text-muted-foreground max-w-xs">
            {filter === "unread"
              ? "You're all caught up! No unread notifications."
              : "When someone interacts with your posts or meetings, you'll see it here."}
          </p>
        </motion.div>
      ) : (
        <div className="space-y-2">
          {filtered.map((notification, i) => {
            const config = typeConfig[notification.type] || {
              icon: Bell,
              color: "text-muted-foreground",
              bg: "bg-muted",
            };
            const Icon = config.icon;

            return (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className={cn(
                  "group rounded-xl border bg-card p-4 transition-all hover:border-primary/20 cursor-pointer",
                  notification.read
                    ? "border-border"
                    : "border-primary/20 bg-primary/[0.02]"
                )}
                onClick={() => {
                  if (!notification.read) handleMarkAsRead(notification.id);
                }}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-lg shrink-0",
                      config.bg
                    )}
                  >
                    <Icon className={cn("h-4 w-4", config.color)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <p
                        className={cn(
                          "text-sm leading-snug",
                          !notification.read && "font-medium"
                        )}
                      >
                        {notification.message}
                      </p>
                      {!notification.read && (
                        <span className="h-2 w-2 rounded-full bg-primary shrink-0 mt-1.5" />
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(
                          new Date(notification.createdAt),
                          { addSuffix: true }
                        )}
                      </span>
                      <span
                        className={cn(
                          "text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded",
                          config.bg,
                          config.color
                        )}
                      >
                        {notification.type.replace("_", " ")}
                      </span>
                    </div>
                  </div>
                  {notification.linkTo && (
                    <Link
                      href={notification.linkTo}
                      className="text-xs text-primary hover:underline shrink-0"
                      onClick={(e) => e.stopPropagation()}
                    >
                      View →
                    </Link>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
