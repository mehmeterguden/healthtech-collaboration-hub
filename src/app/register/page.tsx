"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  Mail,
  Lock,
  User,
  Building2,
  MapPin,
  Globe,
  Stethoscope,
  Cpu,
  Eye,
  EyeOff,
} from "lucide-react";
import { authApi } from "@/lib/api";
import { useAuthStore } from "@/lib/store";
import { toast } from "sonner";

const roleOptions = [
  {
    value: "engineer",
    label: "Engineer",
    description: "I build healthcare technologies and need clinical expertise",
    icon: Cpu,
    gradient: "from-blue-500/20 to-cyan-500/20",
    border: "border-blue-500/30",
    text: "text-blue-400",
  },
  {
    value: "healthcare",
    label: "Healthcare Professional",
    description: "I have clinical knowledge and innovative ideas to implement",
    icon: Stethoscope,
    gradient: "from-emerald-500/20 to-teal-500/20",
    border: "border-emerald-500/30",
    text: "text-emerald-400",
  },
];

export default function RegisterPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    role: "",
    firstName: "",
    lastName: "",
    institution: "",
    city: "",
    country: "",
  });

  const updateForm = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleNext = () => {
    if (step === 1) {
      if (!form.email || !form.password || !form.confirmPassword) {
        toast.error("Please fill in all fields");
        return;
      }
      if (!form.email.endsWith(".edu")) {
        toast.error("Only institutional .edu email addresses are allowed");
        return;
      }
      if (form.password.length < 8) {
        toast.error("Password must be at least 8 characters");
        return;
      }
      if (form.password !== form.confirmPassword) {
        toast.error("Passwords do not match");
        return;
      }
    }
    if (step === 2 && !form.role) {
      toast.error("Please select your role");
      return;
    }
    setStep((s) => s + 1);
  };

  const handleSubmit = async () => {
    if (!form.firstName || !form.lastName || !form.institution) {
      toast.error("Please fill in required fields");
      return;
    }
    setLoading(true);
    try {
      const { user, token } = await authApi.register({
        email: form.email,
        password: form.password,
        role: form.role,
        firstName: form.firstName,
        lastName: form.lastName,
        institution: form.institution,
        city: form.city,
        country: form.country,
      });
      setAuth(user, token);
      toast.success("Account created successfully!");
      router.push("/verify-email");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Registration failed";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="absolute inset-0 gradient-bg" />
      <div className="absolute top-20 right-20 h-72 w-72 rounded-full bg-primary/5 blur-3xl" />
      <div className="absolute bottom-20 left-20 h-80 w-80 rounded-full bg-cyan/5 blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-lg"
      >
        <div className="mb-8 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Activity className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold gradient-text">HEALTH AI</span>
          </Link>
          <div className="flex items-center gap-2">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  s === step
                    ? "w-8 bg-primary"
                    : s < step
                    ? "w-4 bg-primary/50"
                    : "w-4 bg-muted"
                }`}
              />
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-8">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <h2 className="text-xl font-bold mb-1">Create your account</h2>
                <p className="text-sm text-muted-foreground mb-6">
                  Use your institutional .edu email address
                </p>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="reg-email">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="reg-email"
                        type="email"
                        placeholder="name@university.edu"
                        value={form.email}
                        onChange={(e) => updateForm("email", e.target.value)}
                        className="pl-10 h-11"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="reg-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="reg-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Min. 8 characters"
                        value={form.password}
                        onChange={(e) => updateForm("password", e.target.value)}
                        className="pl-10 pr-10 h-11"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="reg-confirm">Confirm Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="reg-confirm"
                        type="password"
                        placeholder="Repeat your password"
                        value={form.confirmPassword}
                        onChange={(e) =>
                          updateForm("confirmPassword", e.target.value)
                        }
                        className="pl-10 h-11"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <h2 className="text-xl font-bold mb-1">Select your role</h2>
                <p className="text-sm text-muted-foreground mb-6">
                  This helps us personalize your experience
                </p>

                <div className="space-y-3">
                  {roleOptions.map((role) => (
                    <button
                      key={role.value}
                      onClick={() => updateForm("role", role.value)}
                      className={`w-full rounded-xl border-2 p-5 text-left transition-all duration-200 ${
                        form.role === role.value
                          ? `${role.border} bg-gradient-to-r ${role.gradient}`
                          : "border-border hover:border-primary/20"
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                            form.role === role.value
                              ? "bg-background/20"
                              : "bg-muted"
                          }`}
                        >
                          <role.icon
                            className={`h-5 w-5 ${
                              form.role === role.value
                                ? role.text
                                : "text-muted-foreground"
                            }`}
                          />
                        </div>
                        <div>
                          <p className="font-semibold">{role.label}</p>
                          <p className="mt-0.5 text-sm text-muted-foreground">
                            {role.description}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <h2 className="text-xl font-bold mb-1">
                  Complete your profile
                </h2>
                <p className="text-sm text-muted-foreground mb-6">
                  Tell us about yourself and your institution
                </p>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="firstName"
                          placeholder="John"
                          value={form.firstName}
                          onChange={(e) => updateForm("firstName", e.target.value)}
                          className="pl-10 h-10"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        placeholder="Smith"
                        value={form.lastName}
                        onChange={(e) => updateForm("lastName", e.target.value)}
                        className="h-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="institution">Institution</Label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="institution"
                        placeholder="Stanford University"
                        value={form.institution}
                        onChange={(e) =>
                          updateForm("institution", e.target.value)
                        }
                        className="pl-10 h-10"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="city"
                          placeholder="Palo Alto"
                          value={form.city}
                          onChange={(e) => updateForm("city", e.target.value)}
                          className="pl-10 h-10"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="country">Country</Label>
                      <div className="relative">
                        <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="country"
                          placeholder="United States"
                          value={form.country}
                          onChange={(e) => updateForm("country", e.target.value)}
                          className="pl-10 h-10"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-8 flex items-center justify-between">
            {step > 1 ? (
              <Button
                variant="ghost"
                onClick={() => setStep((s) => s - 1)}
                className="gap-1.5"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
            ) : (
              <div />
            )}

            {step < 3 ? (
              <Button onClick={handleNext} className="gap-1.5">
                Continue
                <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={loading}
                className="gap-1.5"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Creating...
                  </span>
                ) : (
                  <>
                    Create Account
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            )}
          </div>
        </div>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-primary hover:underline"
          >
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
