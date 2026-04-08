"use client";

import Link from "next/link";
import { Post } from "@/types";
import { PostStatusBadge } from "./post-status-badge";
import { MapPin, Clock, Users, ArrowRight, Briefcase } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { motion } from "framer-motion";

const stageLabels: Record<string, string> = {
  idea: "Idea",
  concept_validation: "Concept Validation",
  prototype: "Prototype",
  pilot_testing: "Pilot Testing",
  pre_deployment: "Pre-Deployment",
};

const commitmentLabels: Record<string, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  full_time: "Full-Time",
};

interface PostCardProps {
  post: Post;
  index?: number;
  currentCity?: string;
}

export function PostCard({ post, index = 0, currentCity }: PostCardProps) {
  const isCityMatch =
    currentCity && post.city.toLowerCase() === currentCity.toLowerCase();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
    >
      <Link href={`/dashboard/post/${post.id}`}>
        <div className="group relative rounded-xl border border-border bg-card p-5 transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5">
          {isCityMatch && (
            <div className="absolute -top-2.5 right-4 rounded-full bg-primary px-2.5 py-0.5 text-[10px] font-bold text-primary-foreground uppercase tracking-wider">
              City Match
            </div>
          )}

          <div className="flex items-start justify-between gap-3 mb-3">
            <h3 className="text-base font-semibold leading-snug group-hover:text-primary transition-colors line-clamp-2 flex-1">
              {post.title}
            </h3>
            <PostStatusBadge status={post.status} />
          </div>

          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2 mb-4">
            {post.description}
          </p>

          <div className="flex flex-wrap gap-1.5 mb-4">
            {post.requiredExpertise.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="rounded-md bg-secondary px-2 py-0.5 text-[11px] font-medium text-secondary-foreground"
              >
                {tag}
              </span>
            ))}
            {post.requiredExpertise.length > 3 && (
              <span className="rounded-md bg-secondary px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                +{post.requiredExpertise.length - 3}
              </span>
            )}
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {post.city}, {post.country}
              </span>
              <span className="flex items-center gap-1">
                <Briefcase className="h-3 w-3" />
                {stageLabels[post.projectStage]}
              </span>
              <span className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                {post.interestCount} interested
              </span>
            </div>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
            </span>
          </div>

          <div className="absolute bottom-5 right-5 opacity-0 group-hover:opacity-100 transition-opacity">
            <ArrowRight className="h-4 w-4 text-primary" />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
