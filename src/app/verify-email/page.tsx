"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle2, XCircle, Loader2, Mail, ArrowRight, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useAuthStore } from "@/lib/store";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const urlCode = searchParams.get("code");
  const { user, updateUser } = useAuthStore() as any;
  
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);

  const displayEmail = user?.email || "your institutional email";

  // If already verified, redirect to dashboard
  useEffect(() => {
    if (user?.isEmailVerified) {
      router.push("/dashboard");
    }
    // If not logged in at all, go to login
    if (!user && status === "idle") {
      router.push("/login");
    }
  }, [user, router, status]);

  const handleVerify = async (codeToVerify: string) => {
    setStatus("loading");
    try {
      const res = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: codeToVerify }),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus("success");
        setMessage("Your email has been successfully verified. Welcome to Health AI!");
        // Update local user state
        if (user) {
          updateUser({ isEmailVerified: true });
        }
      } else {
        setStatus("error");
        setMessage(data.error || "Invalid code. Please check and try again.");
      }
    } catch (err) {
      setStatus("error");
      setMessage("A connection error occurred.");
    }
  };

  useEffect(() => {
    if (urlCode) {
      handleVerify(urlCode);
    }
  }, [urlCode]);

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) value = value.slice(-1);
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto focus next
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }

    // Check if full
    if (newOtp.every(v => v !== "") && index === 5) {
      handleVerify(newOtp.join(""));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Dynamic Background */}
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px] animate-pulse delay-1000" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full relative z-10"
      >
        <div className="bg-slate-900/40 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-10 shadow-2xl overflow-hidden relative">
          {/* Progress ring decoration */}
          <div className="absolute -top-12 -right-12 w-32 h-32 border-[16px] border-primary/5 rounded-full" />

          <div className="relative">
            <div className="flex justify-center mb-8">
              <div className="h-16 w-16 bg-gradient-to-br from-primary to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20">
                <Mail className="h-8 w-8 text-white" />
              </div>
            </div>

            {status === "success" ? (
              <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="text-center space-y-6">
                <div className="flex justify-center">
                  <div className="h-20 w-20 bg-emerald-500/10 rounded-full flex items-center justify-center border border-emerald-500/20">
                    <CheckCircle2 className="h-10 w-10 text-emerald-500" />
                  </div>
                </div>
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold text-white tracking-tight">Verified!</h1>
                  <p className="text-slate-400">{message}</p>
                </div>
                <Button asChild className="w-full bg-primary hover:bg-primary/90 h-12 text-base font-bold rounded-xl shadow-lg shadow-primary/20">
                  <Link href="/dashboard">
                    Enter Platform <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </motion.div>
            ) : (
              <div className="space-y-8">
                <div className="text-center space-y-2">
                  <h1 className="text-3xl font-bold text-white tracking-tight">Check your email</h1>
                  <p className="text-slate-400 text-sm">
                    We've sent a 6-digit verification code to <span className="text-white font-medium">{displayEmail}</span>
                  </p>
                </div>

                <div className="flex justify-between gap-2">
                  {otp.map((digit, i) => (
                    <input
                      key={i}
                      id={`otp-${i}`}
                      type="text"
                      inputMode="numeric"
                      value={digit}
                      onChange={(e) => handleOtpChange(i, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(i, e)}
                      disabled={status === "loading"}
                      className="w-12 h-14 bg-white/5 border border-white/10 rounded-xl text-center text-xl font-bold text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all disabled:opacity-50"
                    />
                  ))}
                </div>

                {status === "error" && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-center gap-2 text-rose-500 bg-rose-500/10 py-3 rounded-xl border border-rose-500/20">
                    <XCircle className="h-4 w-4" />
                    <span className="text-xs font-semibold">{message}</span>
                  </motion.div>
                )}

                <div className="space-y-4">
                  <Button
                    onClick={() => handleVerify(otp.join(""))}
                    disabled={status === "loading" || otp.some(v => v === "")}
                    className="w-full bg-primary hover:bg-primary/90 h-12 text-base font-bold rounded-xl shadow-lg shadow-primary/20"
                  >
                    {status === "loading" ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : "Verify Email"}
                  </Button>

                  <div className="text-center">
                    <button
                      onClick={() => { setOtp(["", "", "", "", "", ""]); setStatus("idle"); }}
                      className="text-xs text-slate-500 hover:text-primary transition-colors font-medium"
                    >
                      Didn't receive the code? Resend
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 text-center">
          <Link href="/login" className="text-sm text-slate-500 hover:text-white transition-colors flex items-center justify-center gap-2">
            <ArrowLeft className="h-4 w-4" /> Back to Login
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="h-12 w-12 text-primary animate-spin" />
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}
