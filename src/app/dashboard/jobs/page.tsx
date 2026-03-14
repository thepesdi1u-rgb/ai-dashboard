"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  Briefcase,
  Search,
  MapPin,
  ExternalLink,
  Bookmark,
  BookmarkCheck,
  Loader2,
  DollarSign,
  Clock,
  Building2,
  Trash2,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

interface Job {
  company: string;
  title: string;
  location: string;
  link: string;
  requirements: string[] | string;
  salary?: string;
  type?: string;
}

interface SavedJob {
  id: string;
  company: string;
  title: string;
  location: string;
  link: string;
  requirements: string;
  salary?: string;
  type?: string;
  created_at: string;
}

export default function JobsPage() {
  const [jobTitle, setJobTitle] = useState("");
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Job[]>([]);
  const [savedJobs, setSavedJobs] = useState<SavedJob[]>([]);
  const [view, setView] = useState<"search" | "saved">("search");
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/jobs")
      .then((r) => r.json())
      .then((d) => setSavedJobs(d.jobs || []))
      .catch(() => setSavedJobs([]));
  }, []);

  const handleSearch = async () => {
    if (!jobTitle.trim() || !location.trim()) return toast.error("Enter job title and location");
    setLoading(true);
    const toastId = toast.loading("Searching jobs with AI...");
    try {
      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobTitle, location }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setResults(data.jobs || []);
      toast.success(`Found ${data.jobs?.length || 0} jobs!`, { id: toastId });
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : "Search failed";
      toast.error(errMsg, { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (job: Job, idx: number) => {
    const key = `${idx}`;
    setSavingId(key);
    try {
      const res = await fetch("/api/jobs", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(job),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSavedJobs((p) => [data.job, ...p]);
      toast.success("Job saved!");
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : "Failed to save";
      toast.error(errMsg);
    } finally {
      setSavingId(null);
    }
  };

  const handleDeleteSaved = async (id: string) => {
    const res = await fetch(`/api/jobs/${id}`, { method: "DELETE" });
    if (!res.ok) return toast.error("Failed to delete");
    setSavedJobs((p) => p.filter((j) => j.id !== id));
    toast.success("Job removed");
  };

  const getReqs = (r: string[] | string): string[] => {
    if (Array.isArray(r)) return r;
    return r ? r.split(",").map((s) => s.trim()) : [];
  };

  const isSaved = (job: Job) =>
    savedJobs.some((s) => s.title === job.title && s.company === job.company);

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2 mb-1">
          <Briefcase className="w-6 h-6 text-emerald-400" />
          AI Job Search
        </h1>
        <p className="text-muted-foreground text-sm">Find jobs powered by Firecrawl & Groq AI</p>
      </div>

      {/* Search bar */}
      <div className="card mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              className="input-field pl-9"
              placeholder="Job title (e.g. Frontend Developer)"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
          </div>
          <div className="relative flex-1">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              className="input-field pl-9"
              placeholder="Location (e.g. New York or Remote)"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
          </div>
          <button onClick={handleSearch} disabled={loading} className="btn-primary flex-shrink-0 px-6">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            {loading ? "Searching..." : "Search"}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-5">
        <button
          onClick={() => setView("search")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${view === "search" ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/20" : "text-muted-foreground hover:text-foreground"}`}
        >
          Search Results ({results.length})
        </button>
        <button
          onClick={() => setView("saved")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${view === "saved" ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/20" : "text-muted-foreground hover:text-foreground"}`}
        >
          Saved Jobs ({savedJobs.length})
        </button>
      </div>

      {/* Results Grid */}
      {view === "search" && (
        <>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => <div key={i} className="skeleton h-48 rounded-xl" />)}
            </div>
          ) : results.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <Briefcase className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p>Search for jobs to see results here</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {results.map((job, idx) => (
                <div key={idx} className="card hover:border-emerald-500/20 transition-all duration-200">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground">{job.title}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Building2 className="w-3.5 h-3.5 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">{job.company}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleSave(job, idx)}
                      disabled={savingId === `${idx}` || isSaved(job)}
                      className={`flex-shrink-0 p-2 rounded-lg transition-all ${isSaved(job) ? "text-emerald-400 bg-emerald-500/10" : "text-muted-foreground hover:text-emerald-400 hover:bg-emerald-500/10"}`}
                      title={isSaved(job) ? "Saved" : "Save job"}
                    >
                      {isSaved(job) ? <BookmarkCheck className="w-4 h-4" /> : savingId === `${idx}` ? <Loader2 className="w-4 h-4 animate-spin" /> : <Bookmark className="w-4 h-4" />}
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className="badge bg-secondary text-muted-foreground">
                      <MapPin className="w-2.5 h-2.5" /> {job.location}
                    </span>
                    {job.type && (
                      <span className="badge bg-emerald-500/10 text-emerald-300">
                        <Clock className="w-2.5 h-2.5" /> {job.type}
                      </span>
                    )}
                    {job.salary && (
                      <span className="badge bg-violet-500/10 text-violet-300">
                        <DollarSign className="w-2.5 h-2.5" /> {job.salary}
                      </span>
                    )}
                  </div>

                  {getReqs(job.requirements).length > 0 && (
                    <div className="mb-3">
                      <p className="text-xs text-muted-foreground mb-1.5 font-medium">Key Requirements</p>
                      <ul className="space-y-1">
                        {getReqs(job.requirements).slice(0, 3).map((req, i) => (
                          <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                            <span className="text-emerald-400 mt-0.5">•</span>
                            {req}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <a
                    href={job.link && job.link !== "#" ? job.link : `https://www.google.com/search?q=${encodeURIComponent(job.title + " " + job.company + " jobs")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Apply Now
                  </a>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Saved Jobs */}
      {view === "saved" && (
        <>
          {savedJobs.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <Bookmark className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p>No saved jobs yet — search and save jobs you like</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {savedJobs.map((job) => (
                <div key={job.id} className="card hover:border-emerald-500/20 transition-all group">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <h3 className="font-semibold">{job.title}</h3>
                      <p className="text-sm text-muted-foreground">{job.company}</p>
                    </div>
                    <button
                      onClick={() => handleDeleteSaved(job.id)}
                      className="text-muted-foreground hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className="badge bg-secondary text-muted-foreground text-xs">
                      <MapPin className="w-2.5 h-2.5" /> {job.location}
                    </span>
                    {job.type && <span className="badge bg-emerald-500/10 text-emerald-300 text-xs">{job.type}</span>}
                    {job.salary && <span className="badge bg-violet-500/10 text-violet-300 text-xs">{job.salary}</span>}
                  </div>
                  <p className="text-xs text-muted-foreground mb-3">
                    Saved {formatDate(job.created_at)}
                  </p>
                  <a
                    href={job.link && job.link !== "#" ? job.link : `https://www.google.com/search?q=${encodeURIComponent(job.title + " " + job.company)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300"
                  >
                    <ExternalLink className="w-3.5 h-3.5" /> Apply Now
                  </a>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
