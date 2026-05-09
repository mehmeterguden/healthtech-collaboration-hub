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
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const adminNavItems = [
  { href: "/admin", label: "Admin Overview", icon: LayoutDashboard },
  { href: "/admin/posts", label: "Content Control", icon: FileText },
  { href: "/admin/users", label: "User Accounts", icon: Users },
  { href: "/admin/logs", label: "System Audit Logs", icon: ScrollText },
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
          <Link href="/admin" className="flex items-center gap-3 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-destructive shadow-lg shadow-destructive/20 group-hover:scale-105 transition-transform">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-black tracking-tight gradient-text">HEALTH AI</span>
              <span className="text-[10px] font-bold text-destructive uppercase tracking-widest leading-none">Control Panel</span>
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
          <nav className="px-4 space-y-2">
            <h3 className="px-4 text-[11px] font-bold text-muted-foreground/60 uppercase tracking-[0.2em] mb-4">
              Management
            </h3>
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
                    "group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 relative",
                    isActive
                      ? "bg-destructive/10 text-destructive"
                      : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                  )}
                >
                  {isActive && (
                    <div className="absolute left-0 w-1 h-5 bg-destructive rounded-r-full" />
                  )}
                  <item.icon className={cn(
                    "h-4.5 w-4.5 transition-transform group-hover:scale-110",
                    isActive ? "text-destructive" : "text-muted-foreground/70 group-hover:text-foreground"
                  )} />
                  <span className="flex-1">{item.label}</span>
                  {isActive && <ChevronRight className="h-3.5 w-3.5 opacity-50" />}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="px-4 py-4">
          <Link href="/dashboard">
            <Button 
              variant="outline" 
              className="w-full justify-start gap-3 rounded-xl border-border/50 bg-background/50 hover:bg-accent h-11"
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="text-sm font-bold">Standard Dashboard</span>
            </Button>
          </Link>
        </div>

        {user && (
          <div className="p-4 border-t border-border/50">
            <div className="rounded-2xl bg-destructive/5 p-3 border border-destructive/10">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-destructive/20 text-sm font-bold text-destructive border border-destructive/20">
                    {user.firstName[0]}{user.lastName[0]}
                  </div>
                  <div className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-background bg-destructive shadow-sm">
                    <ShieldCheck className="h-3 w-3 text-white" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold truncate text-foreground leading-tight">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="text-[11px] text-destructive font-bold uppercase tracking-tighter truncate opacity-80">
                    Administrator
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                  onClick={() => {
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
