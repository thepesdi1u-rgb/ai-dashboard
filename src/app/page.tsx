import Link from "next/link";
import {
  Zap,
  ArrowRight,
  FileText,
  Youtube,
  Briefcase,
  FileUser,
  CheckCircle,
  Star,
} from "lucide-react";

const features = [
  {
    icon: FileText,
    title: "Notes Saver",
    description: "Create, edit, and organize your notes with Markdown support and powerful search.",
    color: "from-violet-500/20 to-violet-500/5",
    iconColor: "text-violet-400",
  },
  {
    icon: Youtube,
    title: "AI YouTube Summarizer",
    description: "Paste any YouTube URL to get AI-generated summaries, key points, and insights.",
    color: "from-red-500/20 to-red-500/5",
    iconColor: "text-red-400",
  },
  {
    icon: Briefcase,
    title: "AI Job Search",
    description: "Search jobs with Firecrawl & AI. Get company info, requirements, and direct links.",
    color: "from-emerald-500/20 to-emerald-500/5",
    iconColor: "text-emerald-400",
  },
  {
    icon: FileUser,
    title: "AI Resume Maker",
    description: "Build a professional resume with AI. Edit, download PDF, and manage versions.",
    color: "from-blue-500/20 to-blue-500/5",
    iconColor: "text-blue-400",
  },
];

const benefits = [
  "Google Sign-In — secure & instant",
  "Private data — only you can see yours",
  "Powered by Groq AI — blazing fast",
  "All tools in one dashboard",
  "Mobile-friendly design",
  "Free to use",
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden">
      {/* Background blobs */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-0 w-72 h-72 bg-cyan-600/5 rounded-full blur-3xl" />
      </div>

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-5 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-xl gradient-text">AI Dashboard</span>
        </div>
        <Link
          href="/auth/signin"
          className="btn-primary"
        >
          Get Started
          <ArrowRight className="w-4 h-4" />
        </Link>
      </nav>

      {/* Hero */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-32 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-violet-500/30 bg-violet-500/10 text-violet-300 text-sm mb-8">
          <Star className="w-3.5 h-3.5" />
          All-In-One AI Productivity Platform
        </div>

        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 leading-[1.1]">
          Your Personal
          <br />
          <span className="gradient-text">AI Workspace</span>
        </h1>

        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
          A unified dashboard combining Notes, YouTube Summarizer, Job Search, and Resume Builder — all supercharged by AI.
        </p>

        <div className="flex items-center justify-center gap-4">
          <Link href="/auth/signin" className="btn-primary text-base px-6 py-3">
            Start for Free
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            href="/dashboard"
            className="px-6 py-3 rounded-lg border border-border text-sm font-medium text-muted-foreground hover:text-foreground hover:border-violet-500/50 transition-all duration-200"
          >
            View Dashboard
          </Link>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mt-24 text-left">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className={`card bg-gradient-to-br ${feature.color} border-white/10 hover:border-violet-500/30 transition-all duration-300 hover:-translate-y-1 group`}
              >
                <div className={`w-10 h-10 rounded-lg bg-card flex items-center justify-center mb-4 ${feature.iconColor}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            );
          })}
        </div>

        {/* Benefits */}
        <div className="mt-20">
          <h2 className="text-2xl font-bold mb-8">Everything you need, nothing you don&apos;t</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-w-2xl mx-auto">
            {benefits.map((b) => (
              <div key={b} className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle className="w-4 h-4 text-violet-400 flex-shrink-0" />
                {b}
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-20 glass-card max-w-2xl mx-auto p-10">
          <h2 className="text-3xl font-bold mb-3">Ready to get started?</h2>
          <p className="text-muted-foreground mb-6">Sign in with Google — it&apos;s free and takes 10 seconds.</p>
          <Link href="/auth/signin" className="btn-primary text-base px-8 py-3 inline-flex">
            Sign In with Google
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border py-6 px-6 text-center text-sm text-muted-foreground">
        <p>Built with Next.js, Supabase, and Groq AI</p>
      </footer>
    </div>
  );
}
