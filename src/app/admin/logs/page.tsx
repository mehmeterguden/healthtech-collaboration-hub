"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { adminApi } from "@/lib/api";
import { ActivityLog } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
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
import { Search, Download, AlertTriangle, CheckCircle, Calendar } from "lucide-react";
import { format } from "date-fns";

const actionLabels: Record<string, string> = {
  login: "Login",
  logout: "Logout",
  post_create: "Post Created",
  post_edit: "Post Edited",
  post_close: "Post Closed",
  interest_express: "Interest Expressed",
  meeting_request: "Meeting Request",
  meeting_accept: "Meeting Accepted",
  meeting_decline: "Meeting Declined",
  user_suspend: "User Suspended",
};

const actionColors: Record<string, string> = {
  login: "text-blue-400 bg-blue-500/10",
  logout: "text-muted-foreground bg-muted",
  post_create: "text-emerald-400 bg-emerald-500/10",
  post_edit: "text-cyan-400 bg-cyan-500/10",
  post_close: "text-primary bg-primary/10",
  interest_express: "text-violet-400 bg-violet-500/10",
  meeting_request: "text-amber-400 bg-amber-500/10",
  meeting_accept: "text-emerald-400 bg-emerald-500/10",
  meeting_decline: "text-destructive bg-destructive/10",
  user_suspend: "text-destructive bg-destructive/10",
};

const roleColors: Record<string, string> = {
  engineer: "text-blue-400",
  healthcare: "text-emerald-400",
  admin: "text-destructive",
};

export default function AdminLogsPage() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("");
  const [selectedDate, setSelectedDate] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const data = await adminApi.getLogs({
          actionType: actionFilter || undefined,
        });
        setLogs(data);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [actionFilter]);

  const handleExport = async () => {
    try {
      const result = await adminApi.exportLogs();
      const link = document.createElement("a");
      link.href = result.downloadUrl;
      link.download = `healthai-audit-logs-${format(new Date(), "yyyy-MM-dd")}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Logs exported successfully");
    } catch {
      toast.error("Failed to export logs");
    }
  };

  const filtered = logs.filter((l) => {
    let matchSearch = true;
    if (search) {
      const q = search.toLowerCase();
      matchSearch = 
        l.userName.toLowerCase().includes(q) ||
        l.actionType.toLowerCase().includes(q) ||
        l.targetEntity.toLowerCase().includes(q);
    }
    
    let matchDate = true;
    if (selectedDate) {
      matchDate = format(new Date(l.timestamp), "yyyy-MM-dd") === selectedDate;
    }

    return matchSearch && matchDate;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Audit Logs</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Comprehensive activity logging and audit trail.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5"
          onClick={handleExport}
        >
          <Download className="h-3.5 w-3.5" />
          Export CSV
        </Button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search logs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9"
          />
        </div>
        <Select
          value={actionFilter || undefined}
          onValueChange={(v) => setActionFilter(v)}
        >
          <SelectTrigger className="w-48 h-9">
            <SelectValue placeholder="All actions" />
          </SelectTrigger>
          <SelectContent>
            {Object.keys(actionLabels).map((key) => (
              <SelectItem key={key} value={key}>
                {actionLabels[key]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={selectedDate || "all"}
          onValueChange={(v) => setSelectedDate(v === "all" ? "" : v)}
        >
          <SelectTrigger className="w-48 h-9 bg-card border-border text-foreground">
            <div className="flex items-center gap-2 truncate">
              <Calendar className="h-4 w-4 text-primary" />
              <SelectValue placeholder="Log Date" />
            </div>
          </SelectTrigger>
          <SelectContent className="bg-slate-900 border-slate-800 text-slate-200">
            <SelectItem value="all">All Dates</SelectItem>
            {Array.from(new Set(logs.map(l => format(new Date(l.timestamp), "yyyy-MM-dd"))))
              .sort((a, b) => b.localeCompare(a))
              .map(date => (
                <SelectItem key={date} value={date}>
                  {format(new Date(date), "MMM d, yyyy")}
                </SelectItem>
              ))
            }
          </SelectContent>
        </Select>

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
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-border bg-card overflow-hidden"
      >
        {loading ? (
          <div className="p-6 space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Target</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>IP Address</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                    {format(
                      new Date(log.timestamp),
                      "MMM d, yyyy HH:mm:ss"
                    )}
                  </TableCell>
                  <TableCell className="text-sm font-medium">
                    {log.userName}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`text-xs font-semibold capitalize ${
                        roleColors[log.userRole] || ""
                      }`}
                    >
                      {log.userRole}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                        actionColors[log.actionType] || "text-foreground bg-muted"
                      }`}
                    >
                      {actionLabels[log.actionType] || log.actionType}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm">
                    <span className="text-muted-foreground">
                      {log.targetEntity}
                    </span>
                    <span className="ml-1 font-mono text-xs text-muted-foreground/60">
                      {log.targetId}
                    </span>
                  </TableCell>
                  <TableCell>
                    {log.resultStatus === "success" ? (
                      <span className="flex items-center gap-1 text-xs text-emerald-400">
                        <CheckCircle className="h-3 w-3" />
                        Success
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs text-destructive">
                        <AlertTriangle className="h-3 w-3" />
                        Failure
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-xs font-mono text-muted-foreground">
                    {log.ipAddress || "—"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </motion.div>

      <div className="text-xs text-muted-foreground text-center">
        Showing {filtered.length} log entries · Retention period: 24 months
      </div>
    </div>
  );
}
