"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuthStore, useUIStore } from "@/lib/store";
import {
  LayoutDashboard,
  FileText,
  Users,
  ScrollText,
  LogOut,
  Shield,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const adminNavItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/posts", label: "Post Management", icon: FileText },
  { href: "/admin/users", label: "User Management", icon: Users },
  { href: "/admin/logs", label: "Audit Logs", icon: ScrollText },
];

export function AdminSidebar() {
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
          <Link href="/admin" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-destructive/90">
              <Shield className="h-4 w-4 text-white" />
            </div>
            <div>
              <span className="text-base font-bold gradient-text">HEALTH AI</span>
              <span className="ml-1.5 text-[10px] font-semibold text-destructive uppercase tracking-wider">
                Admin
              </span>
            </div>
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
          {adminNavItems.map((item) => {
            const isActive =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
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

        <div className="border-t border-border p-3">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-all"
          >
            <LayoutDashboard className="h-4 w-4" />
            Back to Dashboard
          </Link>
        </div>

        {user && (
          <div className="border-t border-border p-4">
            <div className="flex items-center gap-3 rounded-lg px-2 py-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-destructive/20 text-sm font-semibold text-destructive">
                {user.firstName[0]}
                {user.lastName[0]}
              </div>
              <div className="flex-1 truncate">
                <p className="text-sm font-medium truncate">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-xs text-muted-foreground">Administrator</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                onClick={() => {
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
