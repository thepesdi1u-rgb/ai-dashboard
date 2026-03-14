"use client";

import { useSession } from "next-auth/react";
import { FileText, Youtube, Briefcase, FileUser, ArrowRight, Zap, TrendingUp } from "lucide-react";
import Link from "next/link";

const tools = [
  {
    href: "/dashboard/notes",
    icon: FileText,
    label: "Notes",
    desc: "Create & manage your notes",
    color: "from-violet-500/20 to-violet-500/5",
    iconBg: "bg-violet-500/20 text-violet-400",
  },
  {
    href: "/dashboard/youtube",
    icon: Youtube,
    label: "YouTube Summarizer",
    desc: "Summarize any YouTube video with AI",
    color: "from-red-500/20 to-red-500/5",
    iconBg: "bg-red-500/20 text-red-400",
  },
  {
    href: "/dashboard/jobs",
    icon: Briefcase,
    label: "AI Job Search",
    desc: "Find & save jobs powered by AI",
    color: "from-emerald-500/20 to-emerald-500/5",
    iconBg: "bg-emerald-500/20 text-emerald-400",
  },
  {
    href: "/dashboard/resume",
    icon: FileUser,
    label: "Resume Builder",
    desc: "Build & download AI-powered resumes",
    color: "from-blue-500/20 to-blue-500/5",
    iconBg: "bg-blue-500/20 text-blue-400",
  },
];

function DashboardContent() {
  const { data: session } = useSession();
  const name = session?.user?.name?.split(" ")[0] || "there";

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs mb-4">
          <TrendingUp className="w-3 h-3" />
          Your AI Workspace
        </div>
        <h1 className="text-3xl font-bold mb-2">
          Good {getTimeGreeting()},{" "}
          <span className="gradient-text">{name}</span> 👋
        </h1>
        <p className="text-muted-foreground">
          Everything you need to be productive, powered by AI.
        </p>
      </div>

      {/* Tool Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-10">
        {tools.map((tool) => {
          const Icon = tool.icon;
          return (
            <Link
              key={tool.href}
              href={tool.href}
              className={`card bg-gradient-to-br ${tool.color} border-white/10 hover:border-violet-500/30 transition-all duration-300 hover:-translate-y-0.5 group flex items-center gap-4`}
            >
              <div className={`w-12 h-12 rounded-xl ${tool.iconBg} flex items-center justify-center flex-shrink-0`}>
                <Icon className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="font-semibold text-foreground group-hover:text-violet-300 transition-colors">{tool.label}</h2>
                <p className="text-sm text-muted-foreground truncate">{tool.desc}</p>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-violet-400 group-hover:translate-x-1 transition-all flex-shrink-0" />
            </Link>
          );
        })}
      </div>

      {/* Quick stats */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Zap className="w-4 h-4 text-violet-400" />
          <h2 className="font-semibold">Platform Highlights</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5 text-center">
          {[
            { label: "Notes Tool", value: "Markdown", emoji: "📝" },
            { label: "AI Model", value: "Groq Llama 3", emoji: "🤖" },
            { label: "Job Data", value: "Firecrawl", emoji: "🌐" },
            { label: "Storage", value: "Supabase", emoji: "🗄️" },
          ].map((item) => (
            <div key={item.label} className="flex flex-col items-center gap-1">
              <span className="text-2xl">{item.emoji}</span>
              <span className="text-sm font-medium text-foreground">{item.value}</span>
              <span className="text-xs text-muted-foreground">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function getTimeGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "morning";
  if (hour < 17) return "afternoon";
  return "evening";
}

export default function DashboardPage() {
  return <DashboardContent />;
}
