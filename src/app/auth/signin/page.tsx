"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { Zap, Loader2, ArrowLeft, FlaskConical } from "lucide-react";
import Link from "next/link";

const isDev = process.env.NODE_ENV === "development";

export default function SignInPage() {
  const [loading, setLoading] = useState(false);
  const [devLoading, setDevLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    await signIn("google", { callbackUrl: "/dashboard" });
  };

  const handleDevSignIn = async () => {
    setDevLoading(true);
    await signIn("dev-login", {
      email: "dev@localhost.dev",
      name: "Dev User",
      callbackUrl: "/dashboard",
    });
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background blobs */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-indigo-600/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Back link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to home
        </Link>

        {/* Card */}
        <div className="glass-card p-10 text-center">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/25">
              <Zap className="w-8 h-8 text-white" />
            </div>
          </div>

          <h1 className="text-3xl font-bold mb-2">Welcome back</h1>
          <p className="text-muted-foreground mb-8">
            Sign in to access your personal AI workspace
          </p>

          {/* Dev mode quick access */}
          {isDev && (
            <div className="mb-4">
              <button
                onClick={handleDevSignIn}
                disabled={devLoading}
                className="w-full flex items-center justify-center gap-3 px-6 py-3.5 rounded-xl border border-emerald-500/40 bg-emerald-500/10 text-emerald-300 font-medium hover:bg-emerald-500/20 hover:border-emerald-500/60 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {devLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <FlaskConical className="w-5 h-5" />
                )}
                {devLoading ? "Signing in..." : "⚡ Quick Dev Access (Local Only)"}
              </button>
              <div className="flex items-center gap-3 my-4">
                <div className="flex-1 h-px bg-border" />
                <span className="text-xs text-muted-foreground">or</span>
                <div className="flex-1 h-px bg-border" />
              </div>
            </div>
          )}

          {/* Google Sign In */}
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 px-6 py-3.5 rounded-xl border border-border bg-secondary/50 text-foreground font-medium hover:bg-secondary hover:border-violet-500/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            )}
            {loading ? "Signing in..." : "Continue with Google"}
          </button>

          <p className="text-xs text-muted-foreground mt-6 leading-relaxed">
            By signing in, you agree to our Terms of Service and Privacy Policy.
            Your data is private and only visible to you.
          </p>
        </div>

        {/* Features preview */}
        <div className="mt-6 grid grid-cols-2 gap-3">
          {[
            { emoji: "📝", label: "Notes" },
            { emoji: "🎬", label: "YT Summarizer" },
            { emoji: "💼", label: "Job Search" },
            { emoji: "📄", label: "Resume Builder" },
          ].map((f) => (
            <div key={f.label} className="glass-card px-4 py-3 text-center text-sm text-muted-foreground">
              <span className="mr-2">{f.emoji}</span>{f.label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
