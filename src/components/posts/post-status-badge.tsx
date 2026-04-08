"use client";

import { PostStatus } from "@/types";
import { cn } from "@/lib/utils";

const statusConfig: Record<
  PostStatus,
  { label: string; className: string }
> = {
  draft: {
    label: "Draft",
    className: "bg-muted text-muted-foreground",
  },
  active: {
    label: "Active",
    className: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30",
  },
  meeting_scheduled: {
    label: "Meeting Scheduled",
    className: "bg-cyan-500/15 text-cyan-400 border border-cyan-500/30",
  },
  partner_found: {
    label: "Partner Found",
    className: "bg-primary/15 text-primary border border-primary/30",
  },
  expired: {
    label: "Expired",
    className: "bg-destructive/15 text-destructive border border-destructive/30",
  },
};

export function PostStatusBadge({ status }: { status: PostStatus }) {
  const config = statusConfig[status];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold tracking-wide uppercase",
        config.className
      )}
    >
      <span
        className={cn("mr-1.5 h-1.5 w-1.5 rounded-full", {
          "bg-muted-foreground": status === "draft",
          "bg-emerald-400": status === "active",
          "bg-cyan-400": status === "meeting_scheduled",
          "bg-primary": status === "partner_found",
          "bg-destructive": status === "expired",
        })}
      />
      {config.label}
    </span>
  );
}
