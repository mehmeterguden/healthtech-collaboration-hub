"use client";

import { motion } from "framer-motion";
import { Mail, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function VerificationHelpPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center"
      >
        <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6">
          <Mail className="h-8 w-8 text-primary" />
        </div>
        
        <h1 className="text-2xl font-bold text-slate-900 mb-4">Check your inbox</h1>
        
        <p className="text-slate-600 mb-8 max-w-md mx-auto">
          We've sent a verification link to your institutional email address. 
          Please follow the instructions in the email to complete your registration.
        </p>

        {/* User's requested UI component */}
        <div className="bg-white border border-slate-300 rounded-md p-4 text-left inline-block w-full max-w-xl shadow-inner mb-8">
          <span className="text-slate-700 font-medium">
            Open the verification email and click the confirmation link.
          </span>
        </div>

        <div className="flex flex-col gap-3">
          <button className="text-sm font-semibold text-primary hover:underline">
            Didn't receive the email? Resend
          </button>
          
          <Link href="/login">
            <button className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 transition-colors mt-4">
              <ArrowLeft className="h-4 w-4" />
              Back to Login
            </button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
