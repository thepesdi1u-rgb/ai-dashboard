"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import {
  Youtube,
  Sparkles,
  Loader2,
  ExternalLink,
  Clock,
  BookOpen,
  Trash2,
  Languages,
  Download,
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import { downloadPDF } from "@/lib/pdf";

interface Summary {
  id: string;
  video_url: string;
  video_id: string;
  video_title: string;
  thumbnail_url: string;
  summary: string;
  created_at: string;
}

export default function YouTubePage() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [summaries, setSummaries] = useState<Summary[]>([]);
  const [selected, setSelected] = useState<Summary | null>(null);
  const [fetching, setFetching] = useState(true);
  const [language, setLanguage] = useState("English");

  const languages = [
    "English", "Spanish", "French", "German", 
    "Hindi", "Japanese", "Chinese", "Arabic"
  ];

  useEffect(() => {
    fetch("/api/youtube")
      .then((r) => r.json())
      .then((d) => { setSummaries(d.summaries || []); })
      .catch(() => {})
      .finally(() => setFetching(false));
  }, []);

  const handleSummarize = async () => {
    if (!url.trim()) return toast.error("Enter a YouTube URL");
    setLoading(true);
    const toastId = toast.loading("Analyzing video...");
    try {
      const res = await fetch("/api/youtube", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, language }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSummaries((prev) => [data.summary, ...prev]);
      setSelected(data.summary);
      setUrl("");
      toast.success("Video summarized!", { id: toastId });
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : "Failed";
      toast.error(errMsg, { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/youtube/${id}`, { method: "DELETE" });
    if (!res.ok) return toast.error("Delete failed");
    setSummaries((p) => p.filter((s) => s.id !== id));
    if (selected?.id === id) setSelected(null);
    toast.success("Summary deleted");
  };

  return (
    <div className="h-screen flex flex-col lg:flex-row overflow-hidden">
      {/* Sidebar */}
      <div className="w-full lg:w-80 border-b lg:border-b-0 lg:border-r border-border flex flex-col bg-[hsl(224_71%_5%)] flex-shrink-0">
        <div className="p-4 border-b border-border">
          <h1 className="text-lg font-bold flex items-center gap-2 mb-4">
            <Youtube className="w-5 h-5 text-red-400" />
            YT Summarizer
          </h1>
          <div className="space-y-2">
            <input
              className="input-field text-sm"
              placeholder="Paste YouTube URL..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSummarize()}
            />
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                <Languages className="w-3.5 h-3.5" />
              </div>
              <select
                className="input-field text-sm pl-9 appearance-none"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
              >
                {languages.map(lang => (
                  <option key={lang} value={lang}>{lang}</option>
                ))}
              </select>
            </div>
            <button
              onClick={handleSummarize}
              disabled={loading}
              className="btn-primary w-full justify-center"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              {loading ? "Analyzing..." : "Summarize"}
            </button>
          </div>
        </div>

        {/* History */}
        <div className="flex-1 overflow-y-auto p-2">
          <p className="text-xs text-muted-foreground px-2 py-2 font-medium uppercase tracking-wider">History</p>
          {fetching ? (
            <div className="space-y-2 p-2">
              {[1, 2].map((i) => <div key={i} className="skeleton h-20 rounded-lg" />)}
            </div>
          ) : summaries.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground text-sm">
              <Youtube className="w-8 h-8 mx-auto mb-2 opacity-30" />
              No summaries yet
            </div>
          ) : (
            summaries.map((s) => (
              <button
                key={s.id}
                onClick={() => setSelected(s)}
                className={`w-full text-left p-3 rounded-lg mb-1 transition-all hover:bg-secondary/50 group ${selected?.id === s.id ? "bg-secondary/70 border border-red-500/20" : ""}`}
              >
                <div className="flex gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={s.thumbnail_url} alt="" className="w-16 h-10 object-cover rounded-md flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-foreground line-clamp-2">{s.video_title}</p>
                    <p className="text-xs text-muted-foreground/60 mt-1 flex items-center gap-1">
                      <Clock className="w-2.5 h-2.5" />
                      {formatDate(s.created_at)}
                    </p>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(s.id); }}
                    className="text-muted-foreground hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Detail view */}
      <div className="flex-1 overflow-y-auto">
        {selected ? (
          <div className="p-6 max-w-4xl mx-auto animate-fade-in">
            {/* Video info */}
            <div className="card mb-6">
              <div className="flex gap-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={selected.thumbnail_url} alt="" className="w-36 h-24 object-cover rounded-lg flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg font-semibold text-foreground mb-2 line-clamp-2">{selected.video_title}</h2>
                  <div className="flex items-center gap-3">
                    <a
                      href={selected.video_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      Watch on YouTube
                    </a>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDate(selected.created_at)}
                    </span>
                    <button
                      onClick={() => downloadPDF(selected.video_title, selected.summary, `Summary-${selected.video_id}`)}
                      className="flex items-center gap-1.5 text-xs text-violet-400 hover:text-violet-300 transition-colors ml-auto"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Download PDF
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* AI Summary */}
            <div className="card">
              <h3 className="text-sm font-semibold flex items-center gap-2 mb-4 text-violet-400">
                <BookOpen className="w-4 h-4" />
                AI Summary
              </h3>
              <div className="prose prose-invert prose-sm max-w-none prose-dark">
                <ReactMarkdown>{selected.summary}</ReactMarkdown>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center h-full text-center p-8">
            <div>
              <Youtube className="w-16 h-16 text-muted-foreground/20 mx-auto mb-4" />
              <p className="text-muted-foreground mb-2">Paste a YouTube URL to get started</p>
              <p className="text-xs text-muted-foreground/60">Get summaries, key points & actionable insights</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
