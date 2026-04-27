"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { authApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Activity, ArrowLeft, Send, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    try {
      await authApi.forgotPassword(email);
      setIsSuccess(true);
      toast.success("Reset link sent!", {
        description: "Please check your institutional email for instructions.",
      });
    } catch (error: any) {
      toast.error("Error", {
        description: error.message || "Something went wrong. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="absolute inset-0 gradient-bg opacity-50" />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative"
      >
        <Link 
          href="/login"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-8 group"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Back to Login
        </Link>

        <div className="bg-card border border-border rounded-2xl p-8 shadow-xl shadow-primary/5">
          <div className="flex flex-col items-center text-center mb-8">
            <div className="h-12 w-12 rounded-xl bg-primary flex items-center justify-center mb-4">
              <Activity className="h-6 w-6 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Reset Password</h1>
            <p className="text-sm text-muted-foreground mt-2 px-4">
              {isSuccess 
                ? "We've sent a password reset link to your email address."
                : "Enter your institutional .edu email and we'll send you a link to reset your password."}
            </p>
          </div>

          {!isSuccess ? (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-xs uppercase tracking-wider font-semibold opacity-70">
                  Institutional Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@university.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-background/50 border-border/50 h-11"
                />
              </div>

              <Button 
                type="submit" 
                className="w-full h-11 gap-2 font-semibold"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                Send reset link
              </Button>
            </form>
          ) : (
            <div className="space-y-6 pt-4 text-center">
              <div className="flex justify-center">
                <CheckCircle2 className="h-16 w-16 text-emerald-500 animate-in zoom-in duration-300" />
              </div>
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <p className="text-sm font-medium text-emerald-400">
                  Email Sent Successfully
                </p>
              </div>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => setIsSuccess(false)}
              >
                Try reaching another email
              </Button>
              <Link href="/login">
                <Button variant="ghost" className="w-full mt-2">
                  Return to Sign In
                </Button>
              </Link>
            </div>
          )}
        </div>
      </motion.div>

      <div className="mt-12 text-center relative">
        <p className="text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} HEALTH AI Platform. Secure European Infrastructure.
        </p>
      </div>
    </div>
  );
}
