"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  HelpCircle,
  Search,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Mail,
  Shield,
  FileText,
  Calendar,
  Users,
  Lock,
  Download,
  AlertTriangle,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";

const faqCategories = [
  {
    id: "getting-started",
    label: "Getting Started",
    icon: Users,
    color: "text-blue-400",
    bg: "bg-blue-500/10",
  },
  {
    id: "posts",
    label: "Posts & Projects",
    icon: FileText,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
  },
  {
    id: "meetings",
    label: "Meetings",
    icon: Calendar,
    color: "text-amber-400",
    bg: "bg-amber-500/10",
  },
  {
    id: "privacy",
    label: "Privacy & Security",
    icon: Shield,
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    id: "account",
    label: "Account",
    icon: Lock,
    color: "text-violet-400",
    bg: "bg-violet-500/10",
  },
];

const faqs = [
  {
    category: "getting-started",
    question: "How do I create an account?",
    answer:
      'Click the "Get Started" button on the homepage. You\'ll need to provide your institutional .edu email address, create a password, select your role (Engineer or Healthcare Professional), and fill in your profile details. After registration, you\'ll receive a 6-digit verification code to confirm your email.',
  },
  {
    category: "getting-started",
    question: "What is the difference between Engineer and Healthcare Professional roles?",
    answer:
      "Engineers are professionals who build healthcare technologies and seek clinical expertise for validation and collaboration. Healthcare Professionals have clinical knowledge and innovative ideas they want to implement through technology. The platform matches these two groups for interdisciplinary collaboration.",
  },
  {
    category: "getting-started",
    question: "Why is a .edu email required?",
    answer:
      "We require institutional .edu email addresses to ensure that all users are affiliated with recognized academic or research institutions. This helps maintain the quality and trustworthiness of the platform's community.",
  },
  {
    category: "posts",
    question: "How do I create a new post?",
    answer:
      'Navigate to Dashboard → Create Post (or click the "New Post" button). Fill in your project title, working domain, description, required expertise, project stage, and collaboration preferences. You can save as a draft or publish immediately.',
  },
  {
    category: "posts",
    question: "What are the different post statuses?",
    answer:
      "Posts can have the following statuses: Draft (saved but not visible to others), Active (published and accepting interest), Meeting Scheduled (a meeting has been arranged), Partner Found (collaboration partner identified), and Expired (past the expiry date).",
  },
  {
    category: "posts",
    question: "Can I edit or delete my post after publishing?",
    answer:
      'Yes! Go to "My Posts" in the sidebar to see all your posts. You can edit any post that hasn\'t been marked as "Partner Found" by clicking the edit icon. You can also delete any post at any time.',
  },
  {
    category: "posts",
    question: "What does 'Local Match' mean?",
    answer:
      "When browsing posts, you'll see a 'Local Match' badge on posts from users in the same city as you. This helps identify potential collaborators who are geographically close, making in-person meetings easier.",
  },
  {
    category: "posts",
    question: "How do I mark a post as Partner Found?",
    answer:
      'On your post\'s detail page, click the "Mark as Partner Found" button. This will update the post status and notify all interested parties. Once marked, the post cannot be reverted to active.',
  },
  {
    category: "meetings",
    question: "How do I express interest in a project?",
    answer:
      'When viewing a post, click "Express Interest" to send a short message to the post author. You can also click "Request Meeting" to propose specific time slots for a video call.',
  },
  {
    category: "meetings",
    question: "How does the meeting scheduling work?",
    answer:
      "When requesting a meeting, you propose up to 3 time slots with date and time. The post author reviews your request and can accept one of your proposed slots or suggest a different time. Once accepted, the meeting is scheduled and both parties receive a confirmation.",
  },
  {
    category: "meetings",
    question: "What is the NDA acceptance checkbox?",
    answer:
      "Before proposing a meeting, you must accept a Non-Disclosure Agreement (NDA). This ensures that any confidential information shared during the meeting is protected. It's a standard practice for protecting intellectual property in academic and research collaborations.",
  },
  {
    category: "meetings",
    question: "How do I join a scheduled meeting?",
    answer:
      'Scheduled meetings will appear in your Meetings page under the "Scheduled" tab. If a meeting link has been provided, you can click "Join" to open it in a new tab. Meetings are hosted externally via Zoom, Teams, or similar platforms.',
  },
  {
    category: "meetings",
    question: "What happens after a meeting?",
    answer:
      'After a meeting, you can mark it as "Completed" from the Meetings page. The post author can then decide to either mark the post as "Partner Found" or keep it active to continue searching for collaborators.',
  },
  {
    category: "privacy",
    question: "Is the platform GDPR-compliant?",
    answer:
      "Yes. The platform is fully GDPR-compliant. No patient data is processed, no files are uploaded, and no IP or sensitive research details are exposed publicly. All data processing follows European data protection standards.",
  },
  {
    category: "privacy",
    question: "What data does the platform collect?",
    answer:
      "We collect only the information necessary for the platform to function: your name, institutional email, role, institution, city/country, expertise areas, and collaboration activity (posts, interests, meetings). No patient data, medical records, or research files are stored.",
  },
  {
    category: "privacy",
    question: "Can I export or delete my data?",
    answer:
      'Yes. Go to Settings → Privacy & Data. You can export all your data in JSON format at any time. You can also permanently delete your account, which will remove all your data, posts, and meeting history from the platform.',
  },
  {
    category: "account",
    question: "How do I edit my profile?",
    answer:
      'Navigate to your Profile page and click "Edit Profile." You can update your name, bio, institution, location, and expertise tags. Changes are saved immediately when you click "Save Details."',
  },
  {
    category: "account",
    question: "How do I change my password?",
    answer:
      "Go to Settings and find the Change Password section. Enter your current password, then your new password twice to confirm. Click \"Update Password\" to save the changes.",
  },
  {
    category: "account",
    question: "How do I delete my account?",
    answer:
      'Go to Settings → Privacy & Data and click "Delete." You\'ll be asked to confirm this action. Once confirmed, your account, posts, and all associated data will be permanently deleted. This action cannot be undone.',
  },
];

export default function FAQPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const toggleItem = (question: string) => {
    setExpandedItems((prev) =>
      prev.includes(question)
        ? prev.filter((q) => q !== question)
        : [...prev, question]
    );
  };

  const filteredFaqs = faqs.filter((faq) => {
    const matchCategory =
      activeCategory === "all" || faq.category === activeCategory;
    const matchSearch =
      !searchQuery ||
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      {/* Header */}
      <div className="text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
            <HelpCircle className="h-7 w-7 text-primary" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            Help & <span className="gradient-text">FAQ</span>
          </h1>
          <p className="mt-2 text-muted-foreground max-w-lg mx-auto">
            Find answers to common questions about the Health AI Co-Creation
            Platform. Can&apos;t find what you need? Contact our support team.
          </p>
        </motion.div>
      </div>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="relative max-w-md mx-auto"
      >
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search for answers..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 h-11 bg-muted/50 border-border"
        />
      </motion.div>

      {/* Category Filters */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="flex flex-wrap gap-2 justify-center"
      >
        <button
          onClick={() => setActiveCategory("all")}
          className={`rounded-full px-4 py-2 text-xs font-semibold transition-all ${
            activeCategory === "all"
              ? "bg-primary/10 text-primary border border-primary/20"
              : "bg-muted/50 text-muted-foreground hover:bg-muted border border-transparent"
          }`}
        >
          All Topics
        </button>
        {faqCategories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`rounded-full px-4 py-2 text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeCategory === cat.id
                ? "bg-primary/10 text-primary border border-primary/20"
                : "bg-muted/50 text-muted-foreground hover:bg-muted border border-transparent"
            }`}
          >
            <cat.icon className="h-3 w-3" />
            {cat.label}
          </button>
        ))}
      </motion.div>

      {/* FAQ Items */}
      <div className="space-y-3">
        {filteredFaqs.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16 text-center"
          >
            <Search className="h-8 w-8 text-muted-foreground/50 mb-3" />
            <h3 className="text-base font-semibold mb-1">No results found</h3>
            <p className="text-sm text-muted-foreground">
              Try different search terms or browse by category.
            </p>
          </motion.div>
        ) : (
          filteredFaqs.map((faq, i) => {
            const isExpanded = expandedItems.includes(faq.question);
            const catConfig = faqCategories.find(
              (c) => c.id === faq.category
            );

            return (
              <motion.div
                key={faq.question}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
              >
                <button
                  onClick={() => toggleItem(faq.question)}
                  className="w-full rounded-xl border border-border bg-card p-5 text-left transition-all hover:border-primary/20 hover:shadow-md hover:shadow-primary/5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1">
                      {catConfig && (
                        <div
                          className={`flex h-8 w-8 items-center justify-center rounded-lg shrink-0 ${catConfig.bg}`}
                        >
                          <catConfig.icon
                            className={`h-3.5 w-3.5 ${catConfig.color}`}
                          />
                        </div>
                      )}
                      <div className="flex-1">
                        <h3 className="text-sm font-semibold">{faq.question}</h3>
                        {isExpanded && (
                          <motion.p
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            className="mt-3 text-sm text-muted-foreground leading-relaxed"
                          >
                            {faq.answer}
                          </motion.p>
                        )}
                      </div>
                    </div>
                    <div className="shrink-0 mt-0.5">
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4 text-primary" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                </button>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Contact Support */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 via-background to-cyan/5 p-8 text-center"
      >
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
          <MessageSquare className="h-5 w-5 text-primary" />
        </div>
        <h2 className="text-xl font-bold">Still need help?</h2>
        <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
          Our support team is ready to assist you with any questions or issues
          you may have about the platform.
        </p>
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
          <a href="mailto:support@healthai-platform.eu">
            <Button className="gap-2">
              <Mail className="h-4 w-4" />
              Contact Support
            </Button>
          </a>
          <a
            href="https://docs.healthai-platform.eu"
            target="_blank"
            rel="noreferrer"
          >
            <Button variant="outline" className="gap-2">
              <ExternalLink className="h-4 w-4" />
              View Documentation
            </Button>
          </a>
        </div>
        <p className="mt-4 text-xs text-muted-foreground">
          Email: support@healthai-platform.eu · Response time: within 24 hours
        </p>
      </motion.div>
    </div>
  );
}
