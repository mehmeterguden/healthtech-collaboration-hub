"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { postsApi } from "@/lib/api";
import { useAuthStore } from "@/lib/store";
import { toast } from "sonner";
import { format } from "date-fns";
import { DatePicker } from "@/components/ui/date-picker";
import {
  ArrowLeft,
  Send,
  FileText,
  MapPin,
  Calendar,
  Shield,
  Save,
} from "lucide-react";
import Link from "next/link";

const domains = [
  "Cardiology Imaging",
  "Cardiology",
  "Neurology",
  "Surgical Robotics",
  "Biomedical Engineering",
  "Oncology",
  "Medical Imaging",
  "IoT Healthcare",
  "Telemedicine",
  "Genomics",
];

export default function CreatePostPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    domain: "",
    description: "",
    expertise: "",
    projectStage: "",
    commitmentLevel: "",
    collaborationType: "",
    confidentialityLevel: "public",
    highLevelIdea: "",
    city: user?.city || "",
    country: user?.country || "",
    expiryDate: "",
    autoClose: false,
  });

  const updateForm = (key: string, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.domain || !form.description) {
      toast.error("Please fill in required fields");
      return;
    }

    setLoading(true);
    try {
      await postsApi.create({
        title: form.title,
        domain: form.domain,
        description: form.description,
        requiredExpertise: form.expertise
          .split(",")
          .map((e) => e.trim())
          .filter(Boolean),
        projectStage: form.projectStage as
          | "idea"
          | "concept_validation"
          | "prototype"
          | "pilot_testing"
          | "pre_deployment",
        commitmentLevel: form.commitmentLevel as
          | "low"
          | "medium"
          | "high"
          | "full_time",
        collaborationType: form.collaborationType as
          | "advisor"
          | "co_founder"
          | "research_partner",
        confidentialityLevel: form.confidentialityLevel as
          | "public"
          | "meeting_only",
        highLevelIdea: form.highLevelIdea,
        city: form.city,
        country: form.country,
        expiryDate: form.expiryDate
          ? new Date(form.expiryDate).toISOString()
          : undefined,
        autoClose: form.autoClose,
      });
      toast.success("Post created successfully!");
      router.push("/dashboard/posts");
    } catch {
      toast.error("Failed to create post");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAsDraft = async () => {
    setLoading(true);
    try {
      await postsApi.create({
        title: form.title || "Untitled Draft",
        domain: form.domain || "General",
        description: form.description || "",
        requiredExpertise: form.expertise
          .split(",")
          .map((e) => e.trim())
          .filter(Boolean),
        projectStage: (form.projectStage || "idea") as any,
        commitmentLevel: (form.commitmentLevel || "medium") as any,
        collaborationType: (form.collaborationType || "research_partner") as any,
        confidentialityLevel: form.confidentialityLevel as any,
        highLevelIdea: form.highLevelIdea,
        city: form.city,
        country: form.country,
        status: "draft" as any,
      });
      toast.success("Post saved as draft!");
      router.push("/dashboard/my-posts");
    } catch {
      toast.error("Failed to save draft");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/posts">
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Create Post</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Share your project and find the right partner
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-border bg-card p-6"
          >
            <div className="flex items-center gap-2 mb-5">
              <FileText className="h-4 w-4 text-primary" />
              <h2 className="text-base font-semibold">Basic Information</h2>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g., AI-Powered Cardiac Arrhythmia Detection"
                  value={form.title}
                  onChange={(e) => updateForm("title", e.target.value)}
                  className="h-11"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Working Domain *</Label>
                  <Select
                    value={form.domain || undefined}
                    onValueChange={(v) => updateForm("domain", v)}
                  >
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Select domain" />
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

                <div className="space-y-2">
                  <Label>Project Stage *</Label>
                  <Select
                    value={form.projectStage || undefined}
                    onValueChange={(v) => updateForm("projectStage", v)}
                  >
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Select stage" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="idea">Idea</SelectItem>
                      <SelectItem value="concept_validation">
                        Concept Validation
                      </SelectItem>
                      <SelectItem value="prototype">Prototype</SelectItem>
                      <SelectItem value="pilot_testing">
                        Pilot Testing
                      </SelectItem>
                      <SelectItem value="pre_deployment">
                        Pre-Deployment
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your project, what you're building, and what kind of partner you're looking for..."
                  value={form.description}
                  onChange={(e) => updateForm("description", e.target.value)}
                  className="min-h-28"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="expertise">Required Expertise</Label>
                <Input
                  id="expertise"
                  placeholder="e.g., Cardiology, ECG Analysis, Clinical Validation (comma-separated)"
                  value={form.expertise}
                  onChange={(e) => updateForm("expertise", e.target.value)}
                  className="h-11"
                />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-xl border border-border bg-card p-6"
          >
            <div className="flex items-center gap-2 mb-5">
              <Shield className="h-4 w-4 text-primary" />
              <h2 className="text-base font-semibold">
                Collaboration Details
              </h2>
            </div>

            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Commitment Level</Label>
                  <Select
                    value={form.commitmentLevel || undefined}
                    onValueChange={(v) => updateForm("commitmentLevel", v)}
                  >
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="full_time">Full-Time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Collaboration Type</Label>
                  <Select
                    value={form.collaborationType || undefined}
                    onValueChange={(v) => updateForm("collaborationType", v)}
                  >
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="advisor">Advisor</SelectItem>
                      <SelectItem value="co_founder">Co-Founder</SelectItem>
                      <SelectItem value="research_partner">
                        Research Partner
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Confidentiality Level</Label>
                <Select
                  value={form.confidentialityLevel}
                  onValueChange={(v) => updateForm("confidentialityLevel", v)}
                >
                  <SelectTrigger className="h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">
                      Public Short Pitch
                    </SelectItem>
                    <SelectItem value="meeting_only">
                      Details Discussed in Meeting Only
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {user?.role === "engineer" && (
                <div className="space-y-2">
                  <Label htmlFor="idea">High-Level Idea</Label>
                  <Textarea
                    id="idea"
                    placeholder="Share a high-level idea without revealing sensitive details..."
                    value={form.highLevelIdea}
                    onChange={(e) => updateForm("highLevelIdea", e.target.value)}
                    className="min-h-20"
                  />
                </div>
              )}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-xl border border-border bg-card p-6"
          >
            <div className="flex items-center gap-2 mb-5">
              <MapPin className="h-4 w-4 text-primary" />
              <h2 className="text-base font-semibold">Location & Expiry</h2>
            </div>

            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="post-city">City</Label>
                  <Input
                    id="post-city"
                    placeholder="City"
                    value={form.city}
                    onChange={(e) => updateForm("city", e.target.value)}
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="post-country">Country</Label>
                  <Input
                    id="post-country"
                    placeholder="Country"
                    value={form.country}
                    onChange={(e) => updateForm("country", e.target.value)}
                    className="h-11"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="expiry" className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    Expiry Date
                  </Label>
                  <DatePicker
                    date={form.expiryDate ? new Date(form.expiryDate) : undefined}
                    setDate={(d) => updateForm("expiryDate", d ? format(d, "yyyy-MM-dd") : "")}
                    placeholder="Select expiry date"
                    label="Expiry Date"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="block">Auto-Close</Label>
                  <div className="flex items-center gap-3 h-11">
                    <Switch
                      checked={form.autoClose}
                      onCheckedChange={(v) => updateForm("autoClose", v)}
                    />
                    <span className="text-sm text-muted-foreground">
                      Close automatically when partner is found
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          <div className="flex items-center justify-between pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleSaveAsDraft}
              disabled={loading}
              className="gap-1.5"
            >
              <Save className="h-4 w-4" />
              Save as Draft
            </Button>
            <div className="flex items-center gap-3">
              <Link href="/dashboard/posts">
                <Button variant="outline" type="button">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" disabled={loading} className="gap-1.5 px-6">
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Publishing...
                  </span>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Publish Post
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
