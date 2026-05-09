"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuthStore, useUIStore } from "@/lib/store";
import {
  LayoutDashboard,
  FileText,
  PlusCircle,
  Calendar,
  User,
  Settings,
  LogOut,
  Activity,
  X,
  Layers,
  Bell,
  HelpCircle,
  ChevronRight,
  ShieldCheck,
  Stethoscope,
  Cpu,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const navGroups = [
  {
    label: "Platform",
    items: [
      { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
      { href: "/dashboard/posts", label: "Browse Feeds", icon: FileText },
    ],
  },
  {
    label: "Collaboration",
    items: [
      { href: "/dashboard/my-posts", label: "My Posts", icon: Layers },
      { href: "/dashboard/create-post", label: "Create Post", icon: PlusCircle },
      { href: "/dashboard/meetings", label: "My Meetings", icon: Calendar },
      { href: "/dashboard/messages", label: "Messages", icon: MessageSquare },
    ],
  },
  {
    label: "Account",
    items: [
      { href: "/dashboard/notifications", label: "Notifications", icon: Bell },
      { href: "/dashboard/profile", label: "Public Profile", icon: User },
      { href: "/dashboard/settings", label: "Settings", icon: Settings },
    ],
  },
  {
    label: "Support",
    items: [
      { href: "/dashboard/faq", label: "Help & FAQ", icon: HelpCircle },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const { sidebarOpen, setSidebarOpen } = useUIStore();

  const RoleIcon = user?.role === "healthcare" ? Stethoscope : user?.role === "admin" ? ShieldCheck : Cpu;

  return (
    <>
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <aside
        className={cn(
          "fixed left-0 top-0 z-50 flex h-full w-72 flex-col border-r border-border bg-sidebar/50 backdrop-blur-xl transition-all duration-300 ease-in-out lg:static lg:translate-x-0",
          sidebarOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
        )}
      >
        <div className="flex h-20 items-center justify-between px-6">
          <Link href="/dashboard" className="flex items-center gap-3 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform">
              <Activity className="h-5 w-5 text-primary-foreground" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-black tracking-tight gradient-text">HEALTH AI</span>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none">Co-Creation Hub</span>
            </div>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden h-9 w-9 rounded-full"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto py-6 custom-scrollbar">
          <nav className="px-4 space-y-8">
            {navGroups.map((group) => (
              <div key={group.label} className="space-y-2">
                <h3 className="px-4 text-[11px] font-bold text-muted-foreground/60 uppercase tracking-[0.2em]">
                  {group.label}
                </h3>
                <div className="space-y-1">
                  {group.items.map((item) => {
                    let actualHref = item.href;
                    if (item.label === "Public Profile" && user) {
                      actualHref = `/dashboard/profile/${user.slug}`;
                    }

                    const isActive =
                      pathname === actualHref ||
                      (item.href !== "/dashboard" && pathname.startsWith(item.href));
                    
                    return (
                      <Link
                        key={item.href}
                        href={actualHref}
                        onClick={() => setSidebarOpen(false)}
                        className={cn(
                          "group flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200 relative",
                          isActive
                            ? "bg-primary/10 text-primary"
                            : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                        )}
                      >
                        {isActive && (
                          <div className="absolute left-0 w-1 h-5 bg-primary rounded-r-full" />
                        )}
                        <item.icon className={cn(
                          "h-4.5 w-4.5 transition-transform group-hover:scale-110",
                          isActive ? "text-primary" : "text-muted-foreground/70 group-hover:text-foreground"
                        )} />
                        <span className="flex-1">{item.label}</span>
                        {isActive && <ChevronRight className="h-3.5 w-3.5 opacity-50" />}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </div>

        {user && (
          <div className="mt-auto p-4">
            <div className="rounded-2xl border border-border/50 bg-accent/30 p-3 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/20 text-sm font-bold text-primary border border-primary/20">
                    {user.firstName[0]}{user.lastName[0]}
                  </div>
                  <div className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-background bg-primary shadow-sm">
                    <RoleIcon className="h-3 w-3 text-primary-foreground" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold truncate text-foreground leading-tight">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="text-[11px] text-muted-foreground font-medium capitalize truncate">
                    {user.role === "healthcare" ? "Healthcare Expert" : user.role}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                  onClick={async () => {
                    try {
                      const { authApi } = await import("@/lib/api");
                      await authApi.logout();
                    } catch (err) {
                      console.error("Logout failed:", err);
                    }
                    logout();
                    window.location.href = "/login";
                  }}
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
