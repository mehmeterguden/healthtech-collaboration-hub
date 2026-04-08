"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { adminApi } from "@/lib/api";
import { PlatformStats } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Users,
  FileText,
  Calendar,
  TrendingUp,
  Activity,
  BarChart3,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Tooltip,
  Legend,
} from "recharts";

const PIE_COLORS = [
  "oklch(0.75 0.15 172)",
  "oklch(0.72 0.14 199)",
  "oklch(0.7 0.17 152)",
];

const BAR_COLOR = "oklch(0.75 0.15 172)";
const LINE_COLOR = "oklch(0.72 0.14 199)";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await adminApi.getStats();
        setStats(data);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const overviewCards = stats
    ? [
        {
          label: "Total Users",
          value: stats.totalUsers,
          icon: Users,
          color: "text-primary",
          bg: "bg-primary/10",
          change: "+18%",
        },
        {
          label: "Total Posts",
          value: stats.totalPosts,
          icon: FileText,
          color: "text-cyan-400",
          bg: "bg-cyan-500/10",
          change: "+12%",
        },
        {
          label: "Active Posts",
          value: stats.activePosts,
          icon: Activity,
          color: "text-emerald-400",
          bg: "bg-emerald-500/10",
          change: "+8%",
        },
        {
          label: "Total Meetings",
          value: stats.totalMeetings,
          icon: Calendar,
          color: "text-violet-400",
          bg: "bg-violet-500/10",
          change: "+24%",
        },
      ]
    : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Platform overview and analytics.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {loading
          ? [1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="rounded-xl border border-border bg-card p-5"
              >
                <Skeleton className="h-4 w-20 mb-3" />
                <Skeleton className="h-8 w-16" />
              </div>
            ))
          : overviewCards.map((card, i) => (
              <motion.div
                key={card.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="rounded-xl border border-border bg-card p-5 transition-all hover:border-primary/20"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    {card.label}
                  </span>
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-lg ${card.bg}`}
                  >
                    <card.icon className={`h-4 w-4 ${card.color}`} />
                  </div>
                </div>
                <div className="flex items-end gap-2">
                  <span className="text-2xl font-bold">{card.value}</span>
                  <span className="mb-0.5 flex items-center gap-0.5 text-xs font-medium text-emerald-400">
                    <TrendingUp className="h-3 w-3" />
                    {card.change}
                  </span>
                </div>
              </motion.div>
            ))}
      </div>

      {!loading && stats && (
        <div className="grid gap-6 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-xl border border-border bg-card p-6"
          >
            <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              Weekly Registrations
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={stats.weeklyRegistrations}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="oklch(0.3 0.01 250)"
                />
                <XAxis
                  dataKey="week"
                  tick={{ fontSize: 11, fill: "oklch(0.6 0.01 250)" }}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "oklch(0.6 0.01 250)" }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "oklch(0.16 0.015 250)",
                    border: "1px solid oklch(0.25 0.015 250)",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke={LINE_COLOR}
                  strokeWidth={2}
                  dot={{ fill: LINE_COLOR, r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="rounded-xl border border-border bg-card p-6"
          >
            <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              Role Distribution
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={stats.roleDistribution}
                  dataKey="count"
                  nameKey="role"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  innerRadius={55}
                  label={({ role, percent }) =>
                    `${role} ${(percent * 100).toFixed(0)}%`
                  }
                  labelLine={false}
                  stroke="none"
                >
                  {stats.roleDistribution.map((_, i) => (
                    <Cell
                      key={i}
                      fill={PIE_COLORS[i % PIE_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "oklch(0.16 0.015 250)",
                    border: "1px solid oklch(0.25 0.015 250)",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="rounded-xl border border-border bg-card p-6"
          >
            <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-primary" />
              Domain Distribution
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={stats.domainDistribution}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="oklch(0.3 0.01 250)"
                />
                <XAxis
                  dataKey="domain"
                  tick={{ fontSize: 10, fill: "oklch(0.6 0.01 250)" }}
                  angle={-30}
                  textAnchor="end"
                  height={60}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "oklch(0.6 0.01 250)" }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "oklch(0.16 0.015 250)",
                    border: "1px solid oklch(0.25 0.015 250)",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                />
                <Bar dataKey="count" fill={BAR_COLOR} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="rounded-xl border border-border bg-card p-6"
          >
            <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              Post Status Distribution
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={stats.statusDistribution} layout="vertical">
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="oklch(0.3 0.01 250)"
                />
                <XAxis
                  type="number"
                  tick={{ fontSize: 11, fill: "oklch(0.6 0.01 250)" }}
                />
                <YAxis
                  dataKey="status"
                  type="category"
                  tick={{ fontSize: 11, fill: "oklch(0.6 0.01 250)" }}
                  width={120}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "oklch(0.16 0.015 250)",
                    border: "1px solid oklch(0.25 0.015 250)",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                />
                <Bar
                  dataKey="count"
                  fill="oklch(0.7 0.17 152)"
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        </div>
      )}
    </div>
  );
}
