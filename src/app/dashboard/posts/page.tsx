"use client";

import { useEffect, useState } from "react";
import { postsApi } from "@/lib/api";
import { Post } from "@/types";
import { PostCard } from "@/components/posts/post-card";
import { PostFilters } from "@/components/posts/post-filters";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthStore } from "@/lib/store";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { FileText } from "lucide-react";

export default function PostsPage() {
  const user = useAuthStore((s) => s.user);
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get("search") || "";
  
  const [allPosts, setAllPosts] = useState<Post[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: initialSearch,
    domain: "",
    city: "",
    country: "",
    stage: "",
    status: "",
  });

  // Sync filters with URL search params
  useEffect(() => {
    const query = searchParams.get("search") || "";
    if (query) {
      setFilters(prev => ({ ...prev, search: query }));
    }
  }, [searchParams]);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const result = await postsApi.getAll(); // Fetch everything
        setAllPosts(result);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  useEffect(() => {
    let result = [...allPosts];

    if (filters.search) {
      const s = filters.search.toLowerCase();
      result = result.filter(p => 
        p.title.toLowerCase().includes(s) || 
        p.description.toLowerCase().includes(s) ||
        p.domain.toLowerCase().includes(s)
      );
    }

    if (filters.domain) {
      result = result.filter(p => p.domain === filters.domain);
    }

    if (filters.city) {
      result = result.filter(p => p.city === filters.city);
    }

    if (filters.country) {
      result = result.filter(p => p.country === filters.country);
    }

    if (filters.stage) {
      result = result.filter(p => p.projectStage === filters.stage);
    }

    if (filters.status) {
      result = result.filter(p => p.status === filters.status);
    }

    setFilteredPosts(result);
  }, [filters, allPosts]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleClear = () => {
    setFilters({
      search: "",
      domain: "",
      city: "",
      country: "",
      stage: "",
      status: "",
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Browse Posts</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Discover collaboration opportunities across disciplines and institutions.
        </p>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        <div className="w-full lg:w-72 shrink-0">
          <PostFilters
            filters={filters}
            allPosts={allPosts}
            onFilterChange={handleFilterChange}
            onClear={handleClear}
          />
        </div>

        <div className="flex-1">
          {loading ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="rounded-xl border border-border bg-card p-5">
                  <Skeleton className="h-5 w-3/4 mb-3" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-2/3 mb-4" />
                  <div className="flex gap-2 mb-4">
                    <Skeleton className="h-5 w-16" />
                    <Skeleton className="h-5 w-20" />
                  </div>
                  <Skeleton className="h-3 w-1/2" />
                </div>
              ))}
            </div>
          ) : filteredPosts.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-20 text-center"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-4">
                <FileText className="h-5 w-5 text-muted-foreground" />
              </div>
              <h3 className="text-base font-semibold mb-1">No posts found</h3>
              <p className="text-sm text-muted-foreground">
                Try adjusting your filters to find more results.
              </p>
            </motion.div>
          ) : (
            <>
              <div className="mb-4 text-sm text-muted-foreground">
                {filteredPosts.length} post{filteredPosts.length !== 1 ? "s" : ""} found
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {filteredPosts.map((post, i) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    index={i}
                    currentCity={user?.city}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
