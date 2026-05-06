"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useAuthStore } from "@/lib/store";
import { usersApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  Save,
  Shield,
  Bell,
  Lock,
  Trash2,
  Download,
  User,
  AlertTriangle,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function SettingsPage() {
  const user = useAuthStore((s) => s.user);
  const updateUser = useAuthStore((s) => s.updateUser);
  const logout = useAuthStore((s) => s.logout);
  const [loading, setLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [form, setForm] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    bio: user?.bio || "",
    city: user?.city || "",
    country: user?.country || "",
    institution: user?.institution || "",
  });
  const [notifications, setNotifications] = useState({
    emailInterest: true,
    emailMeeting: true,
    emailUpdates: false,
  });
  const [pwForm, setPwForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [pwLoading, setPwLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      await usersApi.updateProfile(form);
      updateUser(form);
      toast.success("Profile updated successfully");
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const result = await usersApi.exportData();
      // Trigger a download by opening the data URI
      const link = document.createElement("a");
      link.href = result.downloadUrl;
      link.download = "healthai-my-data.json";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Data exported successfully!");
    } catch {
      toast.error("Failed to export data");
    }
  };

  const handleDelete = async () => {
    try {
      await usersApi.deleteAccount();
      toast.success("Account deleted");
      logout();
      window.location.href = "/";
    } catch {
      toast.error("Failed to delete account");
    }
  };

  const handleChangePassword = async () => {
    if (!pwForm.currentPassword || !pwForm.newPassword) {
      toast.error("Please fill in all password fields");
      return;
    }
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    if (pwForm.newPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    setPwLoading(true);
    try {
      const res = await fetch("/api/users/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: pwForm.currentPassword,
          newPassword: pwForm.newPassword,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to change password");
      }
      toast.success("Password updated successfully");
      setPwForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err: any) {
      toast.error(err.message || "Failed to change password");
    } finally {
      setPwLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your account settings and preferences.
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-border bg-card p-6"
      >
        <div className="flex items-center gap-2 mb-5">
          <User className="h-4 w-4 text-primary" />
          <h2 className="text-base font-semibold">Personal Information</h2>
        </div>

        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="s-firstName">First Name</Label>
              <Input
                id="s-firstName"
                value={form.firstName}
                onChange={(e) =>
                  setForm((p) => ({ ...p, firstName: e.target.value }))
                }
                className="h-10"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="s-lastName">Last Name</Label>
              <Input
                id="s-lastName"
                value={form.lastName}
                onChange={(e) =>
                  setForm((p) => ({ ...p, lastName: e.target.value }))
                }
                className="h-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="s-institution">Institution</Label>
            <Input
              id="s-institution"
              value={form.institution}
              onChange={(e) =>
                setForm((p) => ({ ...p, institution: e.target.value }))
              }
              className="h-10"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="s-city">City</Label>
              <Input
                id="s-city"
                value={form.city}
                onChange={(e) =>
                  setForm((p) => ({ ...p, city: e.target.value }))
                }
                className="h-10"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="s-country">Country</Label>
              <Input
                id="s-country"
                value={form.country}
                onChange={(e) =>
                  setForm((p) => ({ ...p, country: e.target.value }))
                }
                className="h-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="s-bio">Bio</Label>
            <Textarea
              id="s-bio"
              value={form.bio}
              onChange={(e) =>
                setForm((p) => ({ ...p, bio: e.target.value }))
              }
              className="min-h-20"
            />
          </div>

          <div className="flex justify-end">
            <Button
              onClick={handleSave}
              disabled={loading}
              className="gap-1.5"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Saving...
                </span>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="rounded-xl border border-border bg-card p-6"
      >
        <div className="flex items-center gap-2 mb-5">
          <Lock className="h-4 w-4 text-primary" />
          <h2 className="text-base font-semibold">Change Password</h2>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="current-pw">Current Password</Label>
            <Input
              id="current-pw"
              type="password"
              className="h-10"
              value={pwForm.currentPassword}
              onChange={(e) =>
                setPwForm((p) => ({ ...p, currentPassword: e.target.value }))
              }
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="new-pw">New Password</Label>
              <Input
                id="new-pw"
                type="password"
                className="h-10"
                value={pwForm.newPassword}
                onChange={(e) =>
                  setPwForm((p) => ({ ...p, newPassword: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-pw">Confirm New Password</Label>
              <Input
                id="confirm-pw"
                type="password"
                className="h-10"
                value={pwForm.confirmPassword}
                onChange={(e) =>
                  setPwForm((p) => ({ ...p, confirmPassword: e.target.value }))
                }
              />
            </div>
          </div>
          <div className="flex justify-end">
            <Button
              variant="outline"
              className="gap-1.5"
              onClick={handleChangePassword}
              disabled={pwLoading}
            >
              {pwLoading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Updating...
                </span>
              ) : (
                <>
                  <Lock className="h-4 w-4" />
                  Update Password
                </>
              )}
            </Button>
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
          <Bell className="h-4 w-4 text-primary" />
          <h2 className="text-base font-semibold">Notification Preferences</h2>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Interest Notifications</p>
              <p className="text-xs text-muted-foreground">
                Get notified when someone expresses interest in your post
              </p>
            </div>
            <Switch
              checked={notifications.emailInterest}
              onCheckedChange={(v) =>
                setNotifications((p) => ({ ...p, emailInterest: v }))
              }
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Meeting Notifications</p>
              <p className="text-xs text-muted-foreground">
                Get notified about meeting requests and updates
              </p>
            </div>
            <Switch
              checked={notifications.emailMeeting}
              onCheckedChange={(v) =>
                setNotifications((p) => ({ ...p, emailMeeting: v }))
              }
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Platform Updates</p>
              <p className="text-xs text-muted-foreground">
                Receive emails about new features and improvements
              </p>
            </div>
            <Switch
              checked={notifications.emailUpdates}
              onCheckedChange={(v) =>
                setNotifications((p) => ({ ...p, emailUpdates: v }))
              }
            />
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="rounded-xl border border-border bg-card p-6"
      >
        <div className="flex items-center gap-2 mb-5">
          <Shield className="h-4 w-4 text-primary" />
          <h2 className="text-base font-semibold">Privacy & Data</h2>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Export My Data</p>
              <p className="text-xs text-muted-foreground">
                Download all your data in JSON format (GDPR)
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={handleExport}
            >
              <Download className="h-3.5 w-3.5" />
              Export
            </Button>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-destructive">
                Delete Account
              </p>
              <p className="text-xs text-muted-foreground">
                Permanently delete your account and all data
              </p>
            </div>
            <Dialog
              open={deleteDialogOpen}
              onOpenChange={setDeleteDialogOpen}
            >
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 border-destructive/30 text-destructive hover:bg-destructive hover:text-white"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2 text-destructive">
                    <AlertTriangle className="h-5 w-5" />
                    Delete Account
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-2">
                  <p className="text-sm text-muted-foreground">
                    This action is irreversible. All your data, posts, and
                    meeting history will be permanently deleted.
                  </p>
                  <div className="flex justify-end gap-3">
                    <Button
                      variant="outline"
                      onClick={() => setDeleteDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={handleDelete}
                      className="gap-1.5"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete Permanently
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
