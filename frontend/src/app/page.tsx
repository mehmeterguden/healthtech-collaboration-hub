"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Activity,
  ArrowRight,
  Users,
  Shield,
  Search,
  Calendar,
  Handshake,
  FileText,
  Globe,
  Lock,
  Zap,
  CheckCircle,
} from "lucide-react";

const features = [
  {
    icon: Search,
    title: "Smart Partner Discovery",
    description:
      "Browse structured announcements from engineers and healthcare professionals. Filter by domain, expertise, city, and project stage.",
  },
  {
    icon: Shield,
    title: "Secure & GDPR-Compliant",
    description:
      "No patient data, no file uploads, no IP exposure. NDA acceptance before meetings. Full data privacy compliance.",
  },
  {
    icon: Calendar,
    title: "Meeting Workflow",
    description:
      "Express interest, propose time slots, schedule meetings. All externally hosted via Zoom or Teams.",
  },
  {
    icon: Handshake,
    title: "Structured Collaboration",
    description:
      "From idea to partner found — track the full lifecycle. Clear status indicators and transparent processes.",
  },
];

const steps = [
  {
    step: "01",
    title: "Create Your Profile",
    description: "Register with your institutional .edu email and select your role.",
    icon: Users,
  },
  {
    step: "02",
    title: "Post an Announcement",
    description: "Describe your project, required expertise, and collaboration type.",
    icon: FileText,
  },
  {
    step: "03",
    title: "Discover Partners",
    description: "Browse posts, filter by domain, and express interest in potential matches.",
    icon: Search,
  },
  {
    step: "04",
    title: "Meet & Collaborate",
    description: "Schedule meetings, discuss ideas, and mark partnerships as found.",
    icon: Handshake,
  },
];

const stats = [
  { value: "156+", label: "Researchers" },
  { value: "89", label: "Active Projects" },
  { value: "42%", label: "Match Rate" },
  { value: "12", label: "Countries" },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Activity className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold gradient-text">HEALTH AI</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm">
                Sign In
              </Button>
            </Link>
            <Link href="/register">
              <Button size="sm" className="gap-1.5">
                Get Started
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-bg" />
        <div className="absolute top-20 left-10 h-72 w-72 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-10 right-10 h-96 w-96 rounded-full bg-cyan/5 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:py-40">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mx-auto max-w-3xl text-center"
          >
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary">
              <Globe className="h-3.5 w-3.5" />
              European HealthTech Innovation
            </div>

            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
              <span className="block">Where Healthcare Meets</span>
              <span className="gradient-text">Engineering Innovation</span>
            </h1>

            <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
              A secure, GDPR-compliant co-creation platform connecting healthcare
              professionals with engineers for structured partner discovery and
              interdisciplinary collaboration.
            </p>

            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link href="/register">
                <Button size="lg" className="gap-2 px-8 h-12 text-base">
                  Start Collaborating
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/dashboard/posts">
                <Button
                  variant="outline"
                  size="lg"
                  className="gap-2 px-8 h-12 text-base"
                >
                  Browse Projects
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="border-y border-border/50 bg-card/50">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="text-3xl font-bold gradient-text sm:text-4xl">
                  {stat.value}
                </div>
                <div className="mt-1 text-sm text-muted-foreground">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mx-auto max-w-2xl text-center mb-16"
          >
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Built for{" "}
              <span className="gradient-text">Interdisciplinary</span>{" "}
              Collaboration
            </h2>
            <p className="mt-4 text-muted-foreground">
              Everything you need to discover the right partner, initiate
              contact, and start collaborating — securely.
            </p>
          </motion.div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group rounded-xl border border-border bg-card p-6 transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
              >
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <feature.icon className="h-5 w-5" />
                </div>
                <h3 className="mb-2 text-base font-semibold">{feature.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-border/50 bg-card/30 py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mx-auto max-w-2xl text-center mb-16"
          >
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              How It <span className="gradient-text">Works</span>
            </h2>
            <p className="mt-4 text-muted-foreground">
              Four simple steps to find your ideal interdisciplinary partner.
            </p>
          </motion.div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, i) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="relative"
              >
                {i < steps.length - 1 && (
                  <div className="absolute top-8 left-[calc(50%+32px)] hidden h-px w-[calc(100%-64px)] bg-gradient-to-r from-primary/30 to-transparent lg:block" />
                )}
                <div className="flex flex-col items-center text-center">
                  <div className="relative mb-5">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                      <step.icon className="h-7 w-7" />
                    </div>
                    <span className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground">
                      {step.step}
                    </span>
                  </div>
                  <h3 className="mb-2 text-base font-semibold">{step.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 via-background to-cyan/5 p-10 sm:p-16 text-center">
            <div className="absolute top-0 left-1/4 h-40 w-40 rounded-full bg-primary/10 blur-3xl" />
            <div className="absolute bottom-0 right-1/4 h-40 w-40 rounded-full bg-cyan/10 blur-3xl" />

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Ready to Find Your{" "}
                <span className="gradient-text">Research Partner</span>?
              </h2>
              <p className="mx-auto mt-4 max-w-lg text-muted-foreground">
                Join the European HealthTech Co-Creation Platform and start
                building the future of healthcare technology.
              </p>
              <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
                <Link href="/register">
                  <Button size="lg" className="gap-2 px-8 h-12 text-base">
                    Create Free Account
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
              <div className="mt-6 flex items-center justify-center gap-6 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <CheckCircle className="h-3.5 w-3.5 text-primary" />
                  Free to use
                </span>
                <span className="flex items-center gap-1.5">
                  <Lock className="h-3.5 w-3.5 text-primary" />
                  GDPR Compliant
                </span>
                <span className="flex items-center gap-1.5">
                  <Zap className="h-3.5 w-3.5 text-primary" />
                  Instant access
                </span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <footer className="border-t border-border bg-card/50">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary">
                <Activity className="h-3.5 w-3.5 text-primary-foreground" />
              </div>
              <span className="text-sm font-semibold gradient-text">
                HEALTH AI Platform
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              &copy; {new Date().getFullYear()} European HealthTech Co-Creation
              Platform. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
