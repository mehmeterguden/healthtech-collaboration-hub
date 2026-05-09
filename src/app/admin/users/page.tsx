"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { adminApi } from "@/lib/api";
import { User } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Search, Ban, CheckCircle, Mail, Building2, Eye, Calendar, User as UserIcon, Activity, ArrowUpDown } from "lucide-react";
import { format } from "date-fns";
import { DatePicker } from "@/components/ui/date-picker";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const roleLabels: Record<string, string> = {
  engineer: "Engineer",
  healthcare: "Healthcare",
  admin: "Admin",
};

const statusLabels: Record<string, string> = {
  active: "Active",
  suspended: "Suspended",
};

const roleColors: Record<string, string> = {
  engineer: "bg-blue-500/10 text-blue-400",
  healthcare: "bg-emerald-500/10 text-emerald-400",
  admin: "bg-destructive/10 text-destructive",
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [viewUser, setViewUser] = useState<User | null>(null);
  const [sortBy, setSortBy] = useState("newest");

  useEffect(() => {
    async function load() {
      try {
        const data = await adminApi.getAllUsers();
        setUsers(data);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleToggleStatus = async (user: User) => {
    try {
      if (user.isActive) {
        await adminApi.suspendUser(user.id);
        setUsers((prev) =>
          prev.map((u) =>
            u.id === user.id ? { ...u, isActive: false } : u
          )
        );
        toast.success(`${user.firstName} ${user.lastName} suspended`);
      } else {
        await adminApi.activateUser(user.id);
        setUsers((prev) =>
          prev.map((u) =>
            u.id === user.id ? { ...u, isActive: true } : u
          )
        );
        toast.success(`${user.firstName} ${user.lastName} activated`);
      }
    } catch {
      toast.error("Failed to update user status");
    }
  };

  const filtered = users.filter((u) => {
    const matchSearch =
      !search ||
      `${u.firstName} ${u.lastName}`
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.institution.toLowerCase().includes(search.toLowerCase());
    const matchRole = !roleFilter || u.role === roleFilter;
    const matchStatus = !statusFilter || (statusFilter === "active" ? u.isActive : !u.isActive);
    
    let matchDate = true;
    if (selectedDate) {
      matchDate = format(new Date(u.createdAt), "yyyy-MM-dd") === selectedDate;
    }

    return matchSearch && matchRole && matchStatus && matchDate;
  });

  const sorted = [...filtered].sort((a, b) => {
    switch (sortBy) {
      case "newest": return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case "oldest": return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case "alphabetical": return `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`);
      case "institution": return (a.institution || "").localeCompare(b.institution || "");
      case "profile": return (b.profileCompleteness || 0) - (a.profileCompleteness || 0);
      default: return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">User Management</h1>
        <p className="text-sm text-muted-foreground mt-1">
          View, filter, and manage all registered users.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9"
          />
        </div>
        <Select
          value={roleFilter || "all"}
          onValueChange={(v) => setRoleFilter(v === "all" ? "" : v)}
        >
          <SelectTrigger className="w-40 h-9">
            <SelectValue placeholder="All roles" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="engineer">Engineer</SelectItem>
            <SelectItem value="healthcare">Healthcare</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={statusFilter || "all"}
          onValueChange={(v) => setStatusFilter(v === "all" ? "" : v)}
        >
          <SelectTrigger className="w-40 h-9">
            <SelectValue placeholder="All status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="suspended">Suspended</SelectItem>
          </SelectContent>
        </Select>

        <div className="w-56">
          <DatePicker
            date={selectedDate ? new Date(selectedDate) : undefined}
            setDate={(d) => setSelectedDate(d ? format(d, "yyyy-MM-dd") : "")}
            placeholder="Registration Date"
            label=""
          />
        </div>

        {selectedDate && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setSelectedDate("")}
            className="h-9 px-2 text-xs text-destructive hover:bg-destructive/10"
          >
            Clear Date
          </Button>
        )}
        <div className="flex items-center gap-2 ml-auto">
          <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground" />
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="h-9 w-44 text-xs">
              <SelectValue placeholder="Sort by..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
              <SelectItem value="alphabetical">A → Z (Name)</SelectItem>
              <SelectItem value="institution">Institution</SelectItem>
              <SelectItem value="profile">Profile Completeness</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-border bg-card overflow-hidden"
      >
        {loading ? (
          <div className="p-6 space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Institution</TableHead>
                <TableHead>Profile</TableHead>
                <TableHead>Activity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sorted.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary">
                        {user.firstName[0]}
                        {user.lastName[0]}
                      </div>
                      <div>
                        <p className="text-sm font-medium">
                          {user.firstName} {user.lastName}
                        </p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Mail className="h-2.5 w-2.5" />
                          {user.email}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                        roleColors[user.role]
                      }`}
                    >
                      {roleLabels[user.role]}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="flex items-center gap-1 text-sm">
                      <Building2 className="h-3 w-3 text-muted-foreground" />
                      {user.institution}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Progress
                        value={user.profileCompleteness}
                        className="h-1.5 w-16"
                      />
                      <span className="text-xs text-muted-foreground">
                        {user.profileCompleteness}%
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-xs">
                      <p>
                        {user.postCount} posts · {user.meetingCount} meetings
                      </p>
                      <p className="text-muted-foreground">
                        Last:{" "}
                        {format(new Date(user.lastLogin), "MMM d")}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center gap-1 text-[11px] font-semibold ${
                        user.isActive
                          ? "text-emerald-400"
                          : "text-destructive"
                      }`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          user.isActive
                            ? "bg-emerald-400"
                            : "bg-destructive"
                        }`}
                      />
                      {user.isActive ? "Active" : "Suspended"}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setViewUser(user)}
                        className="h-8 w-8 text-blue-500 hover:text-blue-600 hover:bg-blue-50"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className={`h-8 w-8 ${
                          user.isActive
                            ? "text-red-500 hover:text-red-600 hover:bg-red-50"
                            : "text-emerald-500 hover:text-emerald-600 hover:bg-emerald-50"
                        }`}
                        onClick={() => handleToggleStatus(user)}
                      >
                        {user.isActive ? (
                          <Ban className="h-4 w-4" />
                        ) : (
                          <CheckCircle className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </motion.div>

      {/* User Profile Modal */}
      <Dialog open={!!viewUser} onOpenChange={(open) => !open && setViewUser(null)}>
        <DialogContent className="max-w-3xl border-none bg-slate-900 text-white p-0 overflow-hidden">
          {viewUser && (
            <div className="flex flex-col">
              {/* Header */}
              <div className="p-8 bg-gradient-to-br from-blue-600 to-indigo-700">
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md text-2xl font-bold text-white border border-white/30">
                    {viewUser.firstName[0]}{viewUser.lastName[0]}
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h2 className="text-3xl font-bold text-white tracking-tight">
                        {viewUser.firstName} {viewUser.lastName}
                      </h2>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest ${roleColors[viewUser.role]}`}>
                        {roleLabels[viewUser.role]}
                      </span>
                    </div>
                    <p className="text-white/80 flex items-center gap-2">
                      <Mail className="h-4 w-4" /> {viewUser.email}
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-8">
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10 flex-1">
                    <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest mb-1">Institution</p>
                    <p className="text-white font-medium flex items-center gap-2">
                      <Building2 className="h-4 w-4" /> {viewUser.institution}
                    </p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10 flex-1">
                    <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest mb-1">Joined Date</p>
                    <p className="text-white font-medium flex items-center gap-2">
                      <Calendar className="h-4 w-4" /> {format(new Date(viewUser.createdAt), "MMMM d, yyyy")}
                    </p>
                  </div>
                </div>
              </div>

              {/* Body */}
              <div className="p-8 bg-slate-950/50 backdrop-blur-xl space-y-8">
                {/* Stats */}
                <div className="grid grid-cols-3 gap-6">
                  <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800/50">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-blue-500/20 rounded-lg">
                        <Activity className="h-4 w-4 text-blue-400" />
                      </div>
                      <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">Post Count</span>
                    </div>
                    <p className="text-2xl font-bold text-white">{viewUser.postCount}</p>
                  </div>
                  <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800/50">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-emerald-500/20 rounded-lg">
                        <CheckCircle className="h-4 w-4 text-emerald-400" />
                      </div>
                      <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">Meetings</span>
                    </div>
                    <p className="text-2xl font-bold text-white">{viewUser.meetingCount}</p>
                  </div>
                  <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800/50">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-primary/20 rounded-lg">
                        <UserIcon className="h-4 w-4 text-primary" />
                      </div>
                      <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">Completeness</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Progress value={viewUser.profileCompleteness} className="h-2 flex-1" />
                      <span className="text-sm font-bold text-white">{viewUser.profileCompleteness}%</span>
                    </div>
                  </div>
                </div>

                {/* Bio / About */}
                <div className="space-y-3">
                  <h4 className="text-slate-400 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                    <div className="h-px w-4 bg-slate-700" /> Professional Bio
                  </h4>
                  <div className="bg-slate-900/50 rounded-xl p-5 border border-slate-800/50 text-slate-300 leading-relaxed">
                    {viewUser.bio || "No professional bio provided yet."}
                  </div>
                </div>

                {/* Footer */}
                <div className="pt-8 border-t border-slate-800 flex justify-end gap-4">
                  <Button variant="ghost" onClick={() => setViewUser(null)} className="text-slate-400 hover:text-white">
                    Close
                  </Button>
                  <Button
                    variant={viewUser.isActive ? "destructive" : "default"}
                    onClick={() => {
                      handleToggleStatus(viewUser);
                      setViewUser(null);
                    }}
                    className={viewUser.isActive ? "bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white" : "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 hover:bg-emerald-500 hover:text-white"}
                  >
                    {viewUser.isActive ? "Suspend Account" : "Activate Account"}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
