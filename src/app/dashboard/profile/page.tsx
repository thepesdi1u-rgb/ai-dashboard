"use client";

import { useSession, signOut } from "next-auth/react";
import { User, Mail, LogOut, Shield, Sparkles } from "lucide-react";

export default function ProfilePage() {
  const { data: session } = useSession();
  const user = session?.user;

  return (
    <div className="p-6 lg:p-8 max-w-3xl mx-auto animate-fade-in">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <User className="w-6 h-6 text-violet-400" />
        Profile
      </h1>

      {/* Avatar card */}
      <div className="card mb-5 flex items-center gap-5">
        {user?.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={user.image}
            alt={user.name || "User"}
            className="w-20 h-20 rounded-2xl ring-4 ring-violet-500/20"
          />
        ) : (
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-3xl font-bold text-white flex-shrink-0">
            {user?.name?.[0] || "U"}
          </div>
        )}
        <div>
          <h2 className="text-xl font-semibold text-foreground">{user?.name}</h2>
          <p className="text-muted-foreground flex items-center gap-1.5 mt-1">
            <Mail className="w-3.5 h-3.5" />
            {user?.email}
          </p>
          <div className="flex items-center gap-2 mt-2">
            <span className="badge bg-emerald-500/10 text-emerald-300">
              <Shield className="w-2.5 h-2.5" />
              Google Account
            </span>
            <span className="badge bg-violet-500/10 text-violet-300">
              <Sparkles className="w-2.5 h-2.5" />
              Premium Member
            </span>
          </div>
        </div>
      </div>

      {/* Account info */}
      <div className="card mb-5">
        <h3 className="font-semibold mb-4 text-sm uppercase tracking-wider text-muted-foreground">Account Details</h3>
        <div className="space-y-3">
          {[
            { label: "Display Name", value: user?.name, icon: User },
            { label: "Email Address", value: user?.email, icon: Mail },
            { label: "Auth Provider", value: "Google OAuth", icon: Shield },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="flex items-center gap-4 py-2 border-b border-border last:border-0">
                <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
                  <Icon className="w-4 h-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{item.label}</p>
                  <p className="text-sm font-medium text-foreground">{item.value}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Platform info */}
      <div className="card mb-5">
        <h3 className="font-semibold mb-4 text-sm uppercase tracking-wider text-muted-foreground">Platform</h3>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "AI Model", value: "Groq Llama 3", icon: "🤖" },
            { label: "Database", value: "Supabase", icon: "🗄️" },
            { label: "Job Crawler", value: "Firecrawl", icon: "🌐" },
            { label: "Auth", value: "NextAuth v5", icon: "🔐" },
          ].map((item) => (
            <div key={item.label} className="glass-card p-3">
              <span className="text-xl">{item.icon}</span>
              <p className="text-xs font-medium text-foreground mt-1">{item.value}</p>
              <p className="text-xs text-muted-foreground">{item.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Sign out */}
      <button
        onClick={() => signOut({ callbackUrl: "/" })}
        className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-all duration-200 text-sm font-medium"
      >
        <LogOut className="w-4 h-4" />
        Sign Out
      </button>
    </div>
  );
}
