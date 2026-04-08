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
import { Search, Ban, CheckCircle, Mail, Building2 } from "lucide-react";
import { format } from "date-fns";

const roleLabels: Record<string, string> = {
  engineer: "Engineer",
  healthcare: "Healthcare",
  admin: "Admin",
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
    return matchSearch && matchRole;
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
          value={roleFilter || undefined}
          onValueChange={(v) => setRoleFilter(v)}
        >
          <SelectTrigger className="w-40 h-9">
            <SelectValue placeholder="All roles" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="engineer">Engineer</SelectItem>
            <SelectItem value="healthcare">Healthcare</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
          </SelectContent>
        </Select>
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
              {filtered.map((user) => (
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
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`h-7 text-xs gap-1 ${
                        user.isActive
                          ? "text-destructive hover:text-destructive"
                          : "text-emerald-400 hover:text-emerald-400"
                      }`}
                      onClick={() => handleToggleStatus(user)}
                    >
                      {user.isActive ? (
                        <>
                          <Ban className="h-3 w-3" />
                          Suspend
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-3 w-3" />
                          Activate
                        </>
                      )}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </motion.div>
    </div>
  );
}
