"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Activity, CheckCircle, Mail } from "lucide-react";
import { authApi } from "@/lib/api";
import { toast } from "sonner";

export default function VerifyEmailPage() {
  const router = useRouter();
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [verified, setVerified] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    if (newCode.every((c) => c !== "")) {
      handleVerify(newCode.join(""));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async (fullCode: string) => {
    setLoading(true);
    try {
      await authApi.verifyEmail(fullCode);
      setVerified(true);
      toast.success("Email verified successfully!");
      setTimeout(() => router.push("/dashboard"), 2000);
    } catch {
      toast.error("Invalid verification code. Try 123456.");
      setCode(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = () => {
    setCountdown(60);
    toast.success("Verification code resent!");
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="absolute inset-0 gradient-bg" />
      <div className="absolute top-20 left-20 h-72 w-72 rounded-full bg-primary/5 blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-md text-center"
      >
        <div className="mb-8 flex items-center justify-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Activity className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold gradient-text">HEALTH AI</span>
        </div>

        <div className="rounded-2xl border border-border bg-card p-8">
          {verified ? (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="py-6"
            >
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10">
                <CheckCircle className="h-8 w-8 text-emerald-400" />
              </div>
              <h2 className="text-xl font-bold">Email Verified!</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Redirecting to your dashboard...
              </p>
            </motion.div>
          ) : (
            <>
              <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                <Mail className="h-6 w-6 text-primary" />
              </div>

              <h2 className="text-xl font-bold mb-2">Verify your email</h2>
              <p className="text-sm text-muted-foreground mb-8">
                We sent a 6-digit verification code to your email address. Enter
                it below to confirm your account.
              </p>

              <div className="flex items-center justify-center gap-2 mb-8">
                {code.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => {
                      inputRefs.current[i] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(i, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(i, e)}
                    className="h-12 w-12 rounded-lg border border-border bg-muted text-center text-lg font-semibold transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                    disabled={loading}
                  />
                ))}
              </div>

              {loading && (
                <div className="flex items-center justify-center gap-2 mb-4 text-sm text-muted-foreground">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  Verifying...
                </div>
              )}

              <div className="text-sm text-muted-foreground">
                {countdown > 0 ? (
                  <span>Resend code in {countdown}s</span>
                ) : (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleResend}
                    className="text-primary"
                  >
                    Resend verification code
                  </Button>
                )}
              </div>
            </>
          )}
        </div>

        <p className="mt-4 text-xs text-muted-foreground">
          Hint: Use code <span className="font-mono text-primary">123456</span>{" "}
          for demo
        </p>
      </motion.div>
    </div>
  );
}
