import { Post, PostStatus, ProjectStage } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, X, MapPin, Briefcase, Globe, Layers, Activity } from "lucide-react";
import { useMemo } from "react";

interface PostFiltersProps {
  filters: {
    search: string;
    domain: string;
    city: string;
    country: string;
    stage: string;
    status: string;
  };
  allPosts: Post[];
  onFilterChange: (key: string, value: string) => void;
  onClear: () => void;
}

export function PostFilters({
  filters,
  allPosts,
  onFilterChange,
  onClear,
}: PostFiltersProps) {
  const hasFilters = Object.values(filters).some((v) => v !== "");

  // Helper to calculate available options for a field based on other active filters
  const getOptionsFor = (field: keyof Post | 'projectStage', otherFilters: any) => {
    let filtered = [...allPosts];
    
    // Apply other filters
    Object.entries(otherFilters).forEach(([key, value]) => {
      if (!value) return;
      if (key === 'search') {
        const s = (value as string).toLowerCase();
        filtered = filtered.filter(p => 
          p.title.toLowerCase().includes(s) || 
          p.description.toLowerCase().includes(s) ||
          p.domain.toLowerCase().includes(s)
        );
      } else if (key === 'stage') {
        filtered = filtered.filter(p => p.projectStage === value);
      } else {
        filtered = filtered.filter(p => (p as any)[key] === value);
      }
    });

    // Extract unique values and counts
    const counts: Record<string, number> = {};
    filtered.forEach(p => {
      const val = field === 'projectStage' ? p.projectStage : (p as any)[field];
      if (val) {
        counts[val] = (counts[val] || 0) + 1;
      }
    });

    return Object.entries(counts)
      .map(([value, count]) => ({ value, count }))
      .sort((a, b) => b.count - a.count);
  };

  const domainOptions = useMemo(() => 
    getOptionsFor('domain', { city: filters.city, country: filters.country, stage: filters.stage, status: filters.status, search: filters.search }),
    [allPosts, filters.city, filters.country, filters.stage, filters.status, filters.search]
  );

  const countryOptions = useMemo(() => 
    getOptionsFor('country', { domain: filters.domain, city: filters.city, stage: filters.stage, status: filters.status, search: filters.search }),
    [allPosts, filters.domain, filters.city, filters.stage, filters.status, filters.search]
  );

  const cityOptions = useMemo(() => 
    getOptionsFor('city', { domain: filters.domain, country: filters.country, stage: filters.stage, status: filters.status, search: filters.search }),
    [allPosts, filters.domain, filters.country, filters.stage, filters.status, filters.search]
  );

  const stageOptions = useMemo(() => 
    getOptionsFor('projectStage', { domain: filters.domain, country: filters.country, city: filters.city, status: filters.status, search: filters.search }),
    [allPosts, filters.domain, filters.country, filters.city, filters.status, filters.search]
  );

  const statusOptions = useMemo(() => 
    getOptionsFor('status', { domain: filters.domain, country: filters.country, city: filters.city, stage: filters.stage, search: filters.search }),
    [allPosts, filters.domain, filters.country, filters.city, filters.stage, filters.search]
  );

  const stageLabels: Record<string, string> = {
    idea: "Idea",
    concept_validation: "Concept Validation",
    prototype: "Prototype",
    pilot_testing: "Pilot Testing",
    pre_deployment: "Pre-Deployment",
  };

  const statusLabels: Record<string, string> = {
    active: "Active",
    draft: "Draft",
    meeting_scheduled: "Meeting Scheduled",
    partner_found: "Partner Found",
    expired: "Expired",
  };

  return (
    <div className="space-y-5 rounded-2xl border border-border bg-card/50 backdrop-blur-sm p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold flex items-center gap-2">
          <Layers className="h-4 w-4 text-primary" />
          Filter Projects
        </h3>
        {hasFilters && (
          <Button
            variant="ghost"
            size="sm"
            className="h-auto py-1 px-2 text-[10px] uppercase font-bold text-muted-foreground hover:text-primary transition-colors"
            onClick={onClear}
          >
            Clear All
          </Button>
        )}
      </div>

      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label className="text-[10px] uppercase font-bold text-muted-foreground ml-1">
            Search Keyword
          </Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Title, description..."
              value={filters.search}
              onChange={(e) => onFilterChange("search", e.target.value)}
              className="pl-9 h-10 text-sm bg-background/50 border-border/50 focus:border-primary/50 transition-all rounded-xl"
            />
          </div>
        </div>

        {/* Domain Filter */}
        <div className="space-y-1.5">
          <Label className="text-[10px] uppercase font-bold text-muted-foreground ml-1 flex items-center gap-1.5">
            <Briefcase className="h-3 w-3" /> Domain
          </Label>
          <Select
            value={filters.domain || "all"}
            onValueChange={(v) => onFilterChange("domain", v === "all" ? "" : v)}
          >
            <SelectTrigger className="h-10 text-sm bg-background/50 border-border/50 rounded-xl">
              <SelectValue placeholder="All Domains" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="all">All Domains</SelectItem>
              {domainOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.value} <span className="text-[10px] text-muted-foreground ml-1">({opt.count})</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Country Filter */}
        <div className="space-y-1.5">
          <Label className="text-[10px] uppercase font-bold text-muted-foreground ml-1 flex items-center gap-1.5">
            <Globe className="h-3 w-3" /> Country
          </Label>
          <Select
            value={filters.country || "all"}
            onValueChange={(v) => onFilterChange("country", v === "all" ? "" : v)}
          >
            <SelectTrigger className="h-10 text-sm bg-background/50 border-border/50 rounded-xl">
              <SelectValue placeholder="All Countries" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="all">All Countries</SelectItem>
              {countryOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.value} <span className="text-[10px] text-muted-foreground ml-1">({opt.count})</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* City Filter */}
        <div className="space-y-1.5">
          <Label className="text-[10px] uppercase font-bold text-muted-foreground ml-1 flex items-center gap-1.5">
            <MapPin className="h-3 w-3" /> City
          </Label>
          <Select
            value={filters.city || "all"}
            onValueChange={(v) => onFilterChange("city", v === "all" ? "" : v)}
          >
            <SelectTrigger className="h-10 text-sm bg-background/50 border-border/50 rounded-xl">
              <SelectValue placeholder="All Cities" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="all">All Cities</SelectItem>
              {cityOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.value} <span className="text-[10px] text-muted-foreground ml-1">({opt.count})</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Stage Filter */}
        <div className="space-y-1.5">
          <Label className="text-[10px] uppercase font-bold text-muted-foreground ml-1 flex items-center gap-1.5">
            <Layers className="h-3 w-3" /> Stage
          </Label>
          <Select
            value={filters.stage || "all"}
            onValueChange={(v) => onFilterChange("stage", v === "all" ? "" : v)}
          >
            <SelectTrigger className="h-10 text-sm bg-background/50 border-border/50 rounded-xl">
              <SelectValue placeholder="All Stages" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="all">All Stages</SelectItem>
              {stageOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {stageLabels[opt.value] || opt.value} <span className="text-[10px] text-muted-foreground ml-1">({opt.count})</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Status Filter */}
        <div className="space-y-1.5">
          <Label className="text-[10px] uppercase font-bold text-muted-foreground ml-1 flex items-center gap-1.5">
            <Activity className="h-3 w-3" /> Status
          </Label>
          <Select
            value={filters.status || "all"}
            onValueChange={(v) => onFilterChange("status", v === "all" ? "" : v)}
          >
            <SelectTrigger className="h-10 text-sm bg-background/50 border-border/50 rounded-xl">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="all">All Statuses</SelectItem>
              {statusOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {statusLabels[opt.value] || opt.value} <span className="text-[10px] text-muted-foreground ml-1">({opt.count})</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
