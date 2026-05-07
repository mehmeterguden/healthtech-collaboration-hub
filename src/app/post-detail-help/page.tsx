"use client";

import { motion } from "framer-motion";
import { Search, ArrowLeft, Info } from "lucide-react";
import Link from "next/link";

export default function PostDetailHelpPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center"
      >
        <div className="mx-auto w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mb-6">
          <Info className="h-8 w-8 text-blue-500" />
        </div>
        
        <h1 className="text-2xl font-bold text-slate-900 mb-4">How to view project details</h1>
        
        <p className="text-slate-600 mb-8 max-w-md mx-auto">
          To learn more about a project, its requirements, and the collaboration details, follow the instruction below:
        </p>

        {/* User's requested UI component */}
        <div className="bg-white border border-slate-300 rounded-md p-4 text-left inline-block w-full max-w-xl shadow-inner mb-8">
          <span className="text-slate-700 font-medium">
            Open the post detail page of a post you are interested in.
          </span>
        </div>

        <div className="flex flex-col gap-3">
          <Link href="/dashboard/posts">
            <button className="inline-flex items-center gap-2 bg-primary text-white px-6 py-2 rounded-xl text-sm font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20">
              <Search className="h-4 w-4" />
              Browse All Posts
            </button>
          </Link>
          
          <Link href="/dashboard">
            <button className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 transition-colors mt-4">
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
