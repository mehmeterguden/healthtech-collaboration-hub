"use client";

import { useAuthStore, useNotificationStore, useUIStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Bell, Menu, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";

export function Topbar() {
  const user = useAuthStore((s) => s.user);
  const { notifications, unreadCount, markAsRead, markAllAsRead } =
    useNotificationStore();
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border bg-background/80 backdrop-blur-xl px-4 lg:px-6">
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden h-9 w-9"
        onClick={toggleSidebar}
      >
        <Menu className="h-5 w-5" />
      </Button>

      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search posts, users..."
          className="pl-9 bg-muted/50 border-transparent focus-visible:border-primary/50 h-9"
        />
      </div>

      <div className="flex items-center gap-3 ml-auto">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="relative h-9 w-9"
            >
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                  {unreadCount}
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-80 p-0">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <h4 className="text-sm font-semibold">Notifications</h4>
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-primary h-auto py-1"
                  onClick={markAllAsRead}
                >
                  Mark all read
                </Button>
              )}
            </div>
            <ScrollArea className="max-h-80">
              {notifications.length === 0 ? (
                <p className="p-4 text-center text-sm text-muted-foreground">
                  No notifications
                </p>
              ) : (
                notifications.map((n) => (
                  <button
                    key={n.id}
                    onClick={() => markAsRead(n.id)}
                    className="flex w-full items-start gap-3 border-b border-border/50 px-4 py-3 text-left transition-colors hover:bg-muted/50"
                  >
                    <div
                      className={`mt-1 h-2 w-2 rounded-full shrink-0 ${
                        n.read ? "bg-transparent" : "bg-primary"
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm leading-snug">{n.message}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(n.createdAt), {
                          addSuffix: true,
                        })}
                      </p>
                    </div>
                  </button>
                ))
              )}
            </ScrollArea>
          </PopoverContent>
        </Popover>

        {user && (
          <Link href={`/dashboard/profile/${user.slug}`}>
            <div className="flex items-center gap-2.5 rounded-full bg-muted/50 pl-1 pr-3 py-1 hover:bg-muted/80 transition-colors cursor-pointer">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                {user.firstName[0]}
                {user.lastName[0]}
              </div>
              <span className="text-sm font-medium hidden sm:block">
                {user.firstName}
              </span>
            </div>
          </Link>
        )}
      </div>
    </header>
  );
}
