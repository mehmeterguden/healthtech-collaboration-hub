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
} from "lucide-react";
import { Button } from "@/components/ui/button";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/posts", label: "Browse Posts", icon: FileText },
  { href: "/dashboard/my-posts", label: "My Posts", icon: Layers },
  { href: "/dashboard/create-post", label: "Create Post", icon: PlusCircle },
  { href: "/dashboard/meetings", label: "Meetings", icon: Calendar },
  { href: "/dashboard/notifications", label: "Notifications", icon: Bell },
  { href: "/dashboard/profile", label: "Profile", icon: User },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
  { href: "/dashboard/faq", label: "Help & FAQ", icon: HelpCircle },
];

export function Sidebar() {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const { sidebarOpen, setSidebarOpen } = useUIStore();

  return (
    <>
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <aside
        className={cn(
          "fixed left-0 top-0 z-50 flex h-full w-64 flex-col border-r border-border bg-sidebar transition-transform duration-300 lg:static lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-border px-5">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Activity className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-base font-bold gradient-text">HEALTH AI</span>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden h-8 w-8"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          {navItems.map((item) => {
            let actualHref = item.href;
            if (item.label === "Profile" && user) {
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
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-primary/10 text-primary glow"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <item.icon className={cn("h-4 w-4", isActive && "text-primary")} />
                {item.label}
              </Link>
            );
          })}

        </nav>

        {user && (
          <div className="border-t border-border p-4">
            <div className="flex items-center gap-3 rounded-lg px-2 py-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/20 text-sm font-semibold text-primary">
                {user.firstName[0]}
                {user.lastName[0]}
              </div>
              <div className="flex-1 truncate">
                <p className="text-sm font-medium truncate">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-destructive"
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
        )}
      </aside>
    </>
  );
}
