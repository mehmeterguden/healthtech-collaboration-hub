"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "@/lib/store";
import { usersApi } from "@/lib/api";
import { useParams } from "next/navigation";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Post } from "@/types";
import { PostStatusBadge } from "@/components/posts/post-status-badge";
import Link from "next/link";
import { toast } from "sonner";
import {
  MapPin,
  Building2,
  Mail,
  Calendar,
  FileText,
  Handshake,
  BarChart3,
  Edit,
  Save,
  Activity,
  Award,
  ChevronRight,
  Plus,
  X,
} from "lucide-react";
import { format } from "date-fns";

export default function ProfilePage() {
  const params = useParams();
  const slug = params?.slug as string;
  const authUser = useAuthStore((s) => s.user);
  const updateUser = useAuthStore((s) => s.updateUser);

  const [isEditing, setIsEditing] = useState(false);
  const [profileUser, setProfileUser] = useState<any>(null);
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [editForm, setEditForm] = useState({
    firstName: "",
    lastName: "",
    bio: "",
    city: "",
    country: "",
    institution: "",
    expertise: [] as string[],
  });

  useEffect(() => {
    async function load() {
      try {
        if (slug) {
          const user = await usersApi.getBySlug(slug);
          setProfileUser(user);
          setUserPosts((user as any).posts || []);
        } else if (authUser) {
          const user = await usersApi.getBySlug(authUser.slug);
          setProfileUser(user);
          setUserPosts((user as any).posts || []);
        }
      } catch (error) {
        console.error("Failed to load profile", error);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [slug, authUser]);

  if (loading) return (
    <div className="flex h-[400px] items-center justify-center">
      <div className="flex flex-col items-center gap-2">
        <Activity className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground font-medium">Loading profile...</p>
      </div>
    </div>
  );

  if (!profileUser) return <div className="text-center p-8">User not found</div>;

  const isOwnProfile = authUser?.id === profileUser.id;

  const handleEditToggle = () => {
    if (!isEditing) {
      setEditForm({
        firstName: profileUser.firstName,
        lastName: profileUser.lastName,
        bio: profileUser.bio || "",
        city: profileUser.city || "",
        country: profileUser.country || "",
        institution: profileUser.institution || "",
        expertise: Array.isArray(profileUser.expertise) ? [...profileUser.expertise] : [],
      });
    }
    setIsEditing(!isEditing);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updatedUser = await usersApi.updateProfile(editForm);
      setProfileUser({
        ...profileUser,
        ...updatedUser,
        // Keep calculated stats that might not be in basic profile update response
        postCount: profileUser.postCount,
        meetingCount: profileUser.meetingCount,
        matchRate: profileUser.matchRate,
      });
      if (isOwnProfile) {
        updateUser(editForm);
      }
      setIsEditing(false);
      toast.success("Profile updated successfully");
    } catch (err: any) {
      toast.error(err.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const profileStats = [
    { label: "Posts Created", value: profileUser.postCount, icon: FileText, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "Meetings Held", value: profileUser.meetingCount, icon: Calendar, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { label: "Match Rate", value: `${profileUser.matchRate}%`, icon: Handshake, color: "text-purple-500", bg: "bg-purple-500/10" },
  ];

  return (
    <div className="mx-auto max-w-4xl space-y-8 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Profile</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isOwnProfile ? "Manage your profile details and privacy." : `Viewing ${profileUser.firstName}'s public profile.`}
          </p>
        </div>
        {isOwnProfile && (
          <Button 
            variant={isEditing ? "default" : "outline"}
            size="sm" 
            className="gap-2 rounded-full px-5 shadow-sm transition-all"
            onClick={isEditing ? handleSave : handleEditToggle}
            disabled={saving}
          >
            {saving ? (
              <>
                <Activity className="h-4 w-4 animate-spin" /> Saving...
              </>
            ) : isEditing ? (
              <>
                <Save className="h-4 w-4" /> Save Details
              </>
            ) : (
              <>
                <Edit className="h-4 w-4" /> Edit Profile
              </>
            )}
          </Button>
        )}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden shadow-sm"
      >
        <div className="relative h-36 bg-gradient-to-r from-primary/30 via-indigo-500/20 to-emerald-500/20">
          <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10 mix-blend-overlay"></div>
          <div className="absolute -bottom-12 left-8">
            <div className="flex h-24 w-24 items-center justify-center rounded-2xl border-4 border-card bg-gradient-to-br from-primary to-primary/80 text-3xl font-bold text-primary-foreground shadow-xl ring-2 ring-background/50">
              {profileUser.firstName[0]}
              {profileUser.lastName[0]}
            </div>
          </div>
          {profileUser.role === "admin" && (
            <div className="absolute top-4 right-4 rounded-full bg-primary/20 px-3 py-1 backdrop-blur-md border border-primary/20">
              <span className="text-xs font-bold text-primary flex items-center gap-1">
                <Award className="w-3.5 h-3.5" /> Platform Admin
              </span>
            </div>
          )}
        </div>

        <div className="px-8 pt-16 pb-8">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="w-full max-w-xl">
              <AnimatePresence mode="wait">
                {isEditing ? (
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }} 
                    animate={{ opacity: 1, x: 0 }} 
                    exit={{ opacity: 0, x: -10 }}
                    className="flex gap-3 mb-3"
                  >
                    <Input 
                      value={editForm.firstName} 
                      onChange={e => setEditForm({...editForm, firstName: e.target.value})} 
                      placeholder="First Name"
                      disabled={saving}
                      className="text-lg font-semibold bg-background/50 backdrop-blur-md h-12 rounded-xl"
                    />
                    <Input 
                      value={editForm.lastName} 
                      onChange={e => setEditForm({...editForm, lastName: e.target.value})} 
                      placeholder="Last Name"
                      disabled={saving}
                      className="text-lg font-semibold bg-background/50 backdrop-blur-md h-12 rounded-xl"
                    />
                  </motion.div>
                ) : (
                  <motion.h2 
                    initial={{ opacity: 0, x: 10 }} 
                    animate={{ opacity: 1, x: 0 }} 
                    exit={{ opacity: 0, x: 10 }}
                    className="text-2xl font-extrabold tracking-tight"
                  >
                    {profileUser.firstName} {profileUser.lastName}
                  </motion.h2>
                )}
              </AnimatePresence>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-sm text-primary font-medium tracking-wide capitalize bg-primary/10 px-2.5 py-0.5 rounded-full inline-flex">
                  {profileUser.role === "healthcare" ? "Healthcare Professional" : profileUser.role}
                </p>
                {profileUser.isActive && (
                  <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-500">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse"></span>
                    Online
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="mt-6">
            {isEditing ? (
              <Textarea 
                value={editForm.bio} 
                onChange={e => setEditForm({...editForm, bio: e.target.value})}
                placeholder="Write a short bio about your expertise..."
                disabled={saving}
                className="text-sm leading-relaxed bg-background/50 backdrop-blur-md rounded-xl resize-none"
                rows={4}
              />
            ) : (
              <p className="text-[15px] text-muted-foreground leading-relaxed max-w-3xl">
                {profileUser.bio}
              </p>
            )}
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/40 border border-transparent hover:border-border transition-colors">
              <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
                <Mail className="h-4 w-4 text-blue-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest mb-0.5">Contact Email</p>
                <p className="text-sm font-medium truncate">{profileUser.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/40 border border-transparent hover:border-border transition-colors">
              <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center shrink-0">
                <Building2 className="h-4 w-4 text-purple-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest mb-0.5">Institution</p>
                {isEditing ? (
                  <Input 
                    value={editForm.institution} 
                    onChange={e => setEditForm({...editForm, institution: e.target.value})}
                    className="h-7 text-xs bg-background/50 mt-1" 
                    placeholder="Institution"
                    disabled={saving}
                  />
                ) : (
                  <p className="text-sm font-medium truncate">{profileUser.institution}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/40 border border-transparent hover:border-border transition-colors md:col-span-2">
              <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
                <MapPin className="h-4 w-4 text-emerald-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest mb-0.5">Location</p>
                {isEditing ? (
                  <div className="flex gap-2 mt-1">
                    <Input 
                      value={editForm.city} 
                      onChange={e => setEditForm({...editForm, city: e.target.value})}
                      className="h-7 w-32 text-xs bg-background/50" 
                      placeholder="City"
                      disabled={saving}
                    />
                    <Input 
                      value={editForm.country} 
                      onChange={e => setEditForm({...editForm, country: e.target.value})}
                      className="h-7 w-32 text-xs bg-background/50" 
                      placeholder="Country"
                      disabled={saving}
                    />
                  </div>
                ) : (
                  <p className="text-sm font-medium truncate">{profileUser.city}, {profileUser.country}</p>
                )}
              </div>
            </div>
          </div>

          <div className="mt-8">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">Expertise & Domains</h3>
            <div className="flex flex-wrap gap-2">
              {isEditing ? (
                <>
                  {editForm.expertise.map((tag, index) => (
                    <span
                      key={`${tag}-${index}`}
                      className="rounded-lg bg-primary/10 border border-primary/30 px-3 py-1.5 text-xs font-semibold text-primary flex items-center gap-1.5"
                    >
                      {tag}
                      <button 
                        onClick={() => setEditForm({...editForm, expertise: editForm.expertise.filter((_, i) => i !== index)})}
                        className="hover:text-destructive transition-colors"
                        disabled={saving}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                  <div className="flex items-center gap-2">
                    <Input 
                      placeholder="Add tag..."
                      className="h-8 text-xs w-28 bg-background/50"
                      disabled={saving}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          const val = (e.target as HTMLInputElement).value.trim();
                          if (val && !editForm.expertise.includes(val)) {
                            setEditForm({...editForm, expertise: [...editForm.expertise, val]});
                            (e.target as HTMLInputElement).value = "";
                          }
                        }
                      }}
                    />
                  </div>
                </>
              ) : (
                profileUser.expertise.map((tag: string) => (
                  <span
                    key={tag}
                    className="rounded-lg bg-primary/5 border border-primary/20 px-3 py-1.5 text-xs font-semibold text-primary transition-all hover:bg-primary/10 hover:border-primary/30 shadow-sm"
                  >
                    {tag}
                  </span>
                ))
              )}
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid gap-6 sm:grid-cols-3">
        {profileStats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.1 }}
            className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-6 text-center hover:shadow-md transition-shadow"
          >
            <div className={`mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl ${stat.bg}`}>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </div>
            <p className="text-3xl font-extrabold tracking-tight">{stat.value}</p>
            <p className="text-xs font-semibold text-muted-foreground mt-1 uppercase tracking-wider">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {isOwnProfile && profileUser.profileCompleteness < 100 && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-2xl border border-primary/20 bg-primary/5 p-6 shadow-sm md:col-span-2"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="flex items-center gap-2 text-base font-bold text-primary">
                  <BarChart3 className="h-4 w-4" />
                  Profile Completeness
                </h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  Complete your profile to gain more visibility on the platform.
                </p>
              </div>
              <span className="text-lg font-black text-primary bg-primary/10 px-3 py-1 rounded-full">
                {profileUser.profileCompleteness}%
              </span>
            </div>
            <Progress value={profileUser.profileCompleteness} className="h-3 rounded-full bg-primary/10" />
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-6 md:col-span-2"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
            <div>
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" /> 
                {isOwnProfile ? "Your Active Developments" : "Active Developments"}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">Posts and proposals created by {isOwnProfile ? 'you' : profileUser.firstName}.</p>
            </div>
            {isOwnProfile && (
              <Link href="/dashboard/create-post">
                <Button size="sm" className="rounded-full gap-1 shadow-sm">
                  New Project <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            )}
          </div>

          <div className="space-y-3">
            {userPosts.length === 0 ? (
              <div className="text-center py-8 rounded-xl border border-dashed border-border bg-muted/20">
                <p className="text-sm text-muted-foreground font-medium">No projects found.</p>
              </div>
            ) : (
              userPosts.map((post) => (
                <Link key={post.id} href={`/dashboard/post/${post.id}`}>
                  <div className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-border/40 bg-card hover:border-primary/30 hover:bg-primary/5 transition-all cursor-pointer">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold truncate group-hover:text-primary transition-colors">{post.title}</h4>
                      <p className="text-xs text-muted-foreground truncate mt-1">
                        {post.domain} • Posted {format(new Date(post.createdAt), "MMM d, yyyy")}
                      </p>
                    </div>
                    <div className="shrink-0">
                      <PostStatusBadge status={post.status} />
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-6 md:col-span-2"
        >
          <h3 className="text-base font-bold mb-5 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-muted-foreground" />
            Platform Activity Summary
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-muted/30 border border-transparent">
              <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-1">
                Member Since
              </p>
              <p className="text-sm font-semibold">
                {format(new Date(profileUser.createdAt), "MMMM d, yyyy")}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-muted/30 border border-transparent">
              <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-1">
                Last Login
              </p>
              <p className="text-sm font-semibold">
                {profileUser.lastLogin 
                  ? format(new Date(profileUser.lastLogin), "MMMM d, yyyy 'at' HH:mm")
                  : "Never"}
              </p>
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
