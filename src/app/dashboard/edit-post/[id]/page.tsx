"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
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
import { Skeleton } from "@/components/ui/skeleton";
import { postsApi } from "@/lib/api";
import { useAuthStore } from "@/lib/store";
import { Post } from "@/types";
import { toast } from "sonner";
import {
  ArrowLeft,
  Save,
  FileText,
  MapPin,
  Calendar,
  Shield,
  Send,
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

export default function EditPostPage() {
  const params = useParams();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [post, setPost] = useState<Post | null>(null);
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
    city: "",
    country: "",
    expiryDate: "",
    autoClose: false,
    status: "active",
  });

  useEffect(() => {
    async function load() {
      try {
        const p = await postsApi.getById(params.id as string);
        setPost(p);

        // Check authorization
        if (p.authorId !== user?.id) {
          toast.error("You can only edit your own posts");
          router.push("/dashboard/my-posts");
          return;
        }

        setForm({
          title: p.title || "",
          domain: p.domain || "",
          description: p.description || "",
          expertise: (p.requiredExpertise || []).join(", "),
          projectStage: p.projectStage || "",
          commitmentLevel: p.commitmentLevel || "",
          collaborationType: p.collaborationType || "",
          confidentialityLevel: p.confidentialityLevel || "public",
          highLevelIdea: p.highLevelIdea || "",
          city: p.city || "",
          country: p.country || "",
          expiryDate: p.expiryDate
            ? new Date(p.expiryDate).toISOString().split("T")[0]
            : "",
          autoClose: p.autoClose || false,
          status: p.status || "active",
        });
      } catch {
        toast.error("Post not found");
        router.push("/dashboard/my-posts");
      } finally {
        setLoading(false);
      }
    }
    if (user) load();
  }, [params.id, user, router]);

  const updateForm = (key: string, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.domain || !form.description) {
      toast.error("Please fill in required fields");
      return;
    }

    setSaving(true);
    try {
      await postsApi.update(params.id as string, {
        title: form.title,
        domain: form.domain,
        description: form.description,
        requiredExpertise: form.expertise
          .split(",")
          .map((e) => e.trim())
          .filter(Boolean),
        projectStage: form.projectStage as any,
        commitmentLevel: form.commitmentLevel as any,
        collaborationType: form.collaborationType as any,
        confidentialityLevel: form.confidentialityLevel as any,
        highLevelIdea: form.highLevelIdea,
        city: form.city,
        country: form.country,
        expiryDate: form.expiryDate
          ? new Date(form.expiryDate).toISOString()
          : undefined,
        autoClose: form.autoClose,
        status: form.status as any,
      });
      toast.success("Post updated successfully!");
      router.push("/dashboard/my-posts");
    } catch {
      toast.error("Failed to update post");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAsDraft = async () => {
    setSaving(true);
    try {
      await postsApi.update(params.id as string, {
        title: form.title || "Untitled Draft",
        domain: form.domain || "General",
        description: form.description || "",
        status: "draft" as any,
        requiredExpertise: form.expertise
          .split(",")
          .map((e) => e.trim())
          .filter(Boolean),
        projectStage: form.projectStage as any,
        commitmentLevel: form.commitmentLevel as any,
        collaborationType: form.collaborationType as any,
        confidentialityLevel: form.confidentialityLevel as any,
        highLevelIdea: form.highLevelIdea,
        city: form.city,
        country: form.country,
      });
      toast.success("Post saved as draft");
      router.push("/dashboard/my-posts");
    } catch {
      toast.error("Failed to save draft");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (!post) return null;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/my-posts">
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Edit Post</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Update your project details and collaboration preferences
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
                <Label htmlFor="edit-title">Title *</Label>
                <Input
                  id="edit-title"
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
                <Label htmlFor="edit-description">Description *</Label>
                <Textarea
                  id="edit-description"
                  placeholder="Describe your project..."
                  value={form.description}
                  onChange={(e) => updateForm("description", e.target.value)}
                  className="min-h-28"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-expertise">Required Expertise</Label>
                <Input
                  id="edit-expertise"
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
                  onValueChange={(v) =>
                    updateForm("confidentialityLevel", v)
                  }
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

              <div className="space-y-2">
                <Label htmlFor="edit-idea">High-Level Idea</Label>
                <Textarea
                  id="edit-idea"
                  placeholder="Share a high-level idea without revealing sensitive details..."
                  value={form.highLevelIdea}
                  onChange={(e) =>
                    updateForm("highLevelIdea", e.target.value)
                  }
                  className="min-h-20"
                />
              </div>
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
                  <Label htmlFor="edit-city">City</Label>
                  <Input
                    id="edit-city"
                    placeholder="City"
                    value={form.city}
                    onChange={(e) => updateForm("city", e.target.value)}
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-country">Country</Label>
                  <Input
                    id="edit-country"
                    placeholder="Country"
                    value={form.country}
                    onChange={(e) => updateForm("country", e.target.value)}
                    className="h-11"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label
                    htmlFor="edit-expiry"
                    className="flex items-center gap-1.5"
                  >
                    <Calendar className="h-3.5 w-3.5" />
                    Expiry Date
                  </Label>
                  <Input
                    id="edit-expiry"
                    type="date"
                    value={form.expiryDate}
                    onChange={(e) =>
                      updateForm("expiryDate", e.target.value)
                    }
                    className="h-11"
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
                      Close when partner is found
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="rounded-xl border border-border bg-card p-6"
          >
            <div className="flex items-center gap-2 mb-5">
              <Shield className="h-4 w-4 text-primary" />
              <h2 className="text-base font-semibold">Post Management</h2>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Current Status</Label>
                <Select
                  value={form.status}
                  onValueChange={(v) => updateForm("status", v)}
                >
                  <SelectTrigger className="h-11 font-medium">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="meeting_scheduled">Meeting Scheduled</SelectItem>
                    <SelectItem value="partner_found">Partner Found</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-[10px] text-muted-foreground mt-1">
                  Changing status manually will affect how others see your project.
                </p>
              </div>
            </div>
          </motion.div>

          <div className="flex items-center justify-between pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleSaveAsDraft}
              disabled={saving}
              className="gap-1.5"
            >
              <Save className="h-4 w-4" />
              Save as Draft
            </Button>
            <div className="flex items-center gap-3">
              <Link href="/dashboard/my-posts">
                <Button variant="outline" type="button">
                  Cancel
                </Button>
              </Link>
              <Button
                type="submit"
                disabled={saving}
                className="gap-1.5 px-6"
              >
                {saving ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Saving...
                  </span>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Save Changes
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
