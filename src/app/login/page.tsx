"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Activity, ArrowRight, Eye, EyeOff, Mail, Lock, Zap } from "lucide-react";
import { authApi } from "@/lib/api";
import { useAuthStore } from "@/lib/store";
import { toast } from "sonner";

const DEMO_ACCOUNTS = [
  { role: "Engineer", email: "engineer@healthai.edu", color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20 hover:bg-blue-500/20" },
  { role: "Test Engineer", email: "testengineer@healthai.edu", color: "text-cyan-400", bg: "bg-cyan-500/10 border-cyan-500/20 hover:bg-cyan-500/20" },
  { role: "Healthcare", email: "doctor@healthai.edu", color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20 hover:bg-emerald-500/20" },
  { role: "Test Doctor", email: "testdoctor@healthai.edu", color: "text-teal-400", bg: "bg-teal-500/10 border-teal-500/20 hover:bg-teal-500/20" },
  { role: "Admin", email: "admin@healthai.edu", color: "text-destructive", bg: "bg-destructive/10 border-destructive/20 hover:bg-destructive/20" },
];
const DEMO_PASSWORD = "password123";

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }
    setLoading(true);
    try {
      const { user, token } = await authApi.login(email, password);
      setAuth(user, token);
      toast.success("Welcome back, " + user.firstName + "!");
      if (user.role === "admin") {
        router.push("/admin");
      } else {
        router.push("/dashboard");
      }
    } catch {
      toast.error("Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword(DEMO_PASSWORD);
  };

  return (
    <div className="flex min-h-screen">
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-primary/20 via-background to-cyan/10">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 h-64 w-64 rounded-full bg-primary/10 blur-3xl floating" />
          <div className="absolute bottom-1/3 right-1/4 h-80 w-80 rounded-full bg-cyan/10 blur-3xl floating" style={{ animationDelay: "3s" }} />
        </div>
        <div className="relative flex flex-col items-center justify-center px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-md"
          >
            <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary glow">
              <Activity className="h-7 w-7 text-primary-foreground" />
            </div>
            <h2 className="text-3xl font-bold tracking-tight">
              Welcome to{" "}
              <span className="gradient-text">HEALTH AI</span>
            </h2>
            <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
              The European HealthTech Co-Creation Platform connecting researchers,
              engineers, and healthcare professionals.
            </p>
            <div className="mt-10 space-y-4">
              {["Structured partner discovery", "Secure first-contact initiation", "GDPR-compliant workspace"].map(
                (item, i) => (
                  <motion.div
                    key={item}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.1 }}
                    className="flex items-center gap-3 text-sm text-muted-foreground"
                  >
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20">
                      <ArrowRight className="h-3 w-3 text-primary" />
                    </div>
                    {item}
                  </motion.div>
                )
              )}
            </div>
          </motion.div>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center px-4 py-12 sm:px-6 lg:w-1/2 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-sm"
        >
          <div className="mb-8 lg:hidden flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Activity className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold gradient-text">HEALTH AI</span>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-bold tracking-tight">Sign in to your account</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Enter your institutional email to continue
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm">
                Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="name@university.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-11"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm">
                  Password
                </Label>
                <Link
                  href="/forgot-password"
                  className="text-xs font-medium text-primary hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 h-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-11 text-sm font-medium"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Signing in...
                </span>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="font-medium text-primary hover:underline"
            >
              Create an account
            </Link>
          </p>

          {/* Demo Accounts */}
          <div className="mt-8">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex-1 h-px bg-border/50" />
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">
                <Zap className="h-3 w-3" /> Demo Accounts
              </div>
              <div className="flex-1 h-px bg-border/50" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              {DEMO_ACCOUNTS.map((acc, idx) => (
                <button
                  key={acc.email}
                  type="button"
                  onClick={() => fillDemo(acc.email)}
                  className={`flex flex-col justify-center rounded-xl border px-3 py-2 text-left transition-all ${acc.bg} ${acc.role === "Admin" ? "col-span-2" : ""}`}
                >
                  <p className={`text-[10px] font-black uppercase tracking-tighter ${acc.color}`}>{acc.role}</p>
                  <p className="text-[10px] text-muted-foreground font-mono truncate">{acc.email}</p>
                </button>
              ))}
              <p className="col-span-2 text-center text-[10px] text-muted-foreground/50 pt-1">
                All demo accounts use password: <span className="font-mono font-bold text-muted-foreground">password123</span>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
