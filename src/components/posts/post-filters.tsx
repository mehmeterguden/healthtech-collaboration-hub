"use client";

import { PostStatus, ProjectStage } from "@/types";
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
import { Search, X } from "lucide-react";

interface PostFiltersProps {
  filters: {
    search: string;
    domain: string;
    city: string;
    country: string;
    stage: string;
    status: string;
  };
  onFilterChange: (key: string, value: string) => void;
  onClear: () => void;
}

const domains = [
  "Cardiology Imaging",
  "Cardiology",
  "Neurology",
  "Surgical Robotics",
  "Biomedical Engineering",
  "Oncology",
  "Medical Imaging",
  "IoT Healthcare",
];

const countries = ["United States", "Germany", "Italy", "South Korea"];
const cities = ["Palo Alto", "Cambridge", "Berlin", "Munich", "Milan", "Daejeon"];

const stageOptions: { value: ProjectStage; label: string }[] = [
  { value: "idea", label: "Idea" },
  { value: "concept_validation", label: "Concept Validation" },
  { value: "prototype", label: "Prototype" },
  { value: "pilot_testing", label: "Pilot Testing" },
  { value: "pre_deployment", label: "Pre-Deployment" },
];

const statusOptions: { value: PostStatus; label: string }[] = [
  { value: "active", label: "Active" },
  { value: "draft", label: "Draft" },
  { value: "meeting_scheduled", label: "Meeting Scheduled" },
  { value: "partner_found", label: "Partner Found" },
  { value: "expired", label: "Expired" },
];

export function PostFilters({
  filters,
  onFilterChange,
  onClear,
}: PostFiltersProps) {
  const hasFilters = Object.values(filters).some((v) => v !== "");

  return (
    <div className="space-y-5 rounded-xl border border-border bg-card p-5">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Filters</h3>
        {hasFilters && (
          <Button
            variant="ghost"
            size="sm"
            className="h-auto py-1 text-xs text-destructive hover:text-destructive"
            onClick={onClear}
          >
            <X className="mr-1 h-3 w-3" />
            Clear All
          </Button>
        )}
      </div>

      <div className="space-y-4">
        <div>
          <Label className="text-xs text-muted-foreground mb-1.5 block">
            Search
          </Label>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search posts..."
              value={filters.search}
              onChange={(e) => onFilterChange("search", e.target.value)}
              className="pl-8 h-9 text-sm"
            />
          </div>
        </div>

        <div>
          <Label className="text-xs text-muted-foreground mb-1.5 block">
            Domain
          </Label>
          <Select
            value={filters.domain || undefined}
            onValueChange={(v) => onFilterChange("domain", v)}
          >
            <SelectTrigger className="h-9 text-sm">
              <SelectValue placeholder="All domains" />
            </SelectTrigger>
            <SelectContent>
              {domains.map((d) => (
                <SelectItem key={d} value={d}>
                  {d}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-xs text-muted-foreground mb-1.5 block">
            Country
          </Label>
          <Select
            value={filters.country || undefined}
            onValueChange={(v) => onFilterChange("country", v)}
          >
            <SelectTrigger className="h-9 text-sm">
              <SelectValue placeholder="All countries" />
            </SelectTrigger>
            <SelectContent>
              {countries.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-xs text-muted-foreground mb-1.5 block">
            City
          </Label>
          <Select
            value={filters.city || undefined}
            onValueChange={(v) => onFilterChange("city", v)}
          >
            <SelectTrigger className="h-9 text-sm">
              <SelectValue placeholder="All cities" />
            </SelectTrigger>
            <SelectContent>
              {cities.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-xs text-muted-foreground mb-1.5 block">
            Project Stage
          </Label>
          <Select
            value={filters.stage || undefined}
            onValueChange={(v) => onFilterChange("stage", v)}
          >
            <SelectTrigger className="h-9 text-sm">
              <SelectValue placeholder="All stages" />
            </SelectTrigger>
            <SelectContent>
              {stageOptions.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-xs text-muted-foreground mb-1.5 block">
            Status
          </Label>
          <Select
            value={filters.status || undefined}
            onValueChange={(v) => onFilterChange("status", v)}
          >
            <SelectTrigger className="h-9 text-sm">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
