"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { adminApi } from "@/lib/api";
import { Post } from "@/types";
import { PostStatusBadge } from "@/components/posts/post-status-badge";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Search, Trash2, Eye, AlertTriangle, ArrowUpDown, Calendar } from "lucide-react";
import { format } from "date-fns";
import { DatePicker } from "@/components/ui/date-picker";

export default function AdminPostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [domainFilter, setDomainFilter] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<Post | null>(null);
  const [viewPost, setViewPost] = useState<Post | null>(null);
  const [sortBy, setSortBy] = useState("newest");

  useEffect(() => {
    async function load() {
      try {
        const data = await adminApi.getAllPosts();
        setPosts(data);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await adminApi.removePost(deleteTarget.id);
      setPosts((prev) => prev.filter((p) => p.id !== deleteTarget.id));
      toast.success("Post removed successfully");
      setDeleteTarget(null);
    } catch {
      toast.error("Failed to remove post");
    }
  };

  const filtered = posts.filter((p) => {
    const matchSearch =
      !search ||
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.domain.toLowerCase().includes(search.toLowerCase()) ||
      p.author.firstName.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !statusFilter || p.status === statusFilter;
    const matchDomain = !domainFilter || p.domain === domainFilter;
    
    // Exact Date Filtering
    if (selectedDate) {
      const postDate = format(new Date(p.createdAt), "yyyy-MM-dd");
      if (postDate !== selectedDate) return false;
    }

    return matchSearch && matchStatus && matchDomain;
  });

  const sorted = [...filtered].sort((a, b) => {
    switch (sortBy) {
      case "newest": return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case "oldest": return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case "most_interest": return (b.interestCount || 0) - (a.interestCount || 0);
      case "alphabetical": return a.title.localeCompare(b.title);
      case "author": return `${a.author.firstName}`.localeCompare(`${b.author.firstName}`);
      default: return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });

  const uniqueDomains = Array.from(new Set(posts.map((p) => p.domain)));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Post Management</h1>
        <p className="text-sm text-muted-foreground mt-1">
          View, filter, and manage all platform posts.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search posts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9"
          />
        </div>
        <Select
          value={statusFilter || "all"}
          onValueChange={(v) => setStatusFilter(v === "all" ? "" : v)}
        >
          <SelectTrigger className="w-40 h-9">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="meeting_scheduled">Meeting Scheduled</SelectItem>
            <SelectItem value="partner_found">Partner Found</SelectItem>
            <SelectItem value="expired">Expired</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={domainFilter || "all"}
          onValueChange={(v) => setDomainFilter(v === "all" ? "" : v)}
        >
          <SelectTrigger className="w-44 h-9">
            <SelectValue placeholder="All Domains" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Domains</SelectItem>
            {uniqueDomains.map((d) => (
              <SelectItem key={d} value={d}>
                {d}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="w-52">
          <DatePicker
            date={selectedDate ? new Date(selectedDate) : undefined}
            setDate={(d) => setSelectedDate(d ? format(d, "yyyy-MM-dd") : "")}
            placeholder="Filter by date"
            label=""
          />
        </div>
        {selectedDate && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setSelectedDate("")}
            className="h-9 px-2 text-xs"
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
              <SelectItem value="most_interest">Most Interest</SelectItem>
              <SelectItem value="alphabetical">A → Z (Title)</SelectItem>
              <SelectItem value="author">Author Name</SelectItem>
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
                <TableHead>Title</TableHead>
                <TableHead>Author</TableHead>
                <TableHead>Domain</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>City</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sorted.map((post) => (
                <TableRow key={post.id}>
                  <TableCell className="font-medium max-w-48 truncate">
                    {post.title}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20 text-[10px] font-bold text-primary">
                        {post.author.firstName[0]}
                        {post.author.lastName[0]}
                      </div>
                      <span className="text-sm">
                        {post.author.firstName} {post.author.lastName}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{post.domain}</TableCell>
                  <TableCell>
                    <PostStatusBadge status={post.status} />
                  </TableCell>
                  <TableCell className="text-sm">{post.city}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {format(new Date(post.createdAt), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setViewPost(post)}
                        className="h-8 w-8 text-blue-500 hover:text-blue-600 hover:bg-blue-50"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteTarget(post)}
                        className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </motion.div>

      {/* View Post Modal */}
      <Dialog open={!!viewPost} onOpenChange={(open) => !open && setViewPost(null)}>
        <DialogContent className="max-w-3xl border-none bg-slate-900 text-white p-0 overflow-hidden">
          {viewPost && (
            <div className="flex flex-col">
              {/* Header with Gradient */}
              <div className="p-8 bg-gradient-to-br from-indigo-600 to-blue-700">
                <div className="flex justify-between items-start mb-4">
                  <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-bold uppercase tracking-[0.2em] text-white border border-white/30">
                    {viewPost.domain}
                  </span>
                  <PostStatusBadge status={viewPost.status} />
                </div>
                <h2 className="text-3xl font-bold text-white tracking-tight leading-tight">
                  {viewPost.title}
                </h2>
              </div>

              {/* Content */}
              <div className="p-8 space-y-8 bg-slate-950/50 backdrop-blur-xl">
                {/* Meta Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  <div className="space-y-1">
                    <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Author</p>
                    <p className="text-slate-200 font-medium text-lg">
                      {viewPost.author.firstName} {viewPost.author.lastName}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Created Date</p>
                    <p className="text-slate-200 font-medium">
                      {format(new Date(viewPost.createdAt), "MMM d, yyyy")}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Post ID</p>
                    <p className="text-slate-400 font-mono text-xs truncate">
                      {viewPost.id}
                    </p>
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-3">
                  <h4 className="text-slate-400 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                    <div className="h-px w-4 bg-slate-700" /> Description
                  </h4>
                  <div className="bg-slate-900/50 rounded-xl p-5 border border-slate-800/50 text-slate-300 leading-relaxed text-base">
                    {viewPost.description}
                  </div>
                </div>

                {/* Expertise */}
                {viewPost.requiredExpertise && viewPost.requiredExpertise.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-slate-400 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                      <div className="h-px w-4 bg-slate-700" /> Required Expertise
                    </h4>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {viewPost.requiredExpertise.map((exp: string, i: number) => (
                        <span key={i} className="px-4 py-1.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-lg text-xs font-semibold">
                          {exp}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Footer Actions */}
                <div className="pt-8 border-t border-slate-800 flex justify-end items-center gap-4">
                  <Button 
                    variant="ghost" 
                    onClick={() => setViewPost(null)}
                    className="text-slate-400 hover:text-white hover:bg-slate-800"
                  >
                    Close
                  </Button>
                  <Button 
                    variant="destructive" 
                    onClick={() => {
                      setDeleteTarget(viewPost);
                      setViewPost(null);
                    }}
                    className="bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white transition-all px-6"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Remove Post
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Remove Post
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <p className="text-sm text-muted-foreground">
              Are you sure you want to remove{" "}
              <span className="font-medium text-foreground">
                &ldquo;{deleteTarget?.title}&rdquo;
              </span>
              ? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setDeleteTarget(null)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                className="gap-1.5"
              >
                <Trash2 className="h-4 w-4" />
                Remove Post
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
