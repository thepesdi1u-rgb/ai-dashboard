"use client";

import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import {
  FileUser,
  Sparkles,
  Download,
  Edit3,
  Save,
  Trash2,
  Plus,
  Loader2,
  Eye,
  Code,
  Clock,
  X,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

interface Resume {
  id: string;
  title: string;
  full_name: string;
  job_title: string;
  content: string;
  form_data: ResumeForm;
  created_at: string;
  updated_at: string;
}

interface ResumeForm {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  jobTitle: string;
  experience: string;
  education: string;
  skills: string;
  summary: string;
}

const defaultForm: ResumeForm = {
  fullName: "",
  email: "",
  phone: "",
  location: "",
  jobTitle: "",
  experience: "",
  education: "",
  skills: "",
  summary: "",
};

export default function ResumePage() {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [selected, setSelected] = useState<Resume | null>(null);
  const [view, setView] = useState<"list" | "create" | "preview" | "edit">("list");
  const [form, setForm] = useState<ResumeForm>(defaultForm);
  const [editContent, setEditContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [previewing, setPreviewing] = useState(true);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/resume")
      .then((r) => r.json())
      .then((d) => setResumes(d.resumes || []))
      .catch(() => setResumes([]));
  }, []);

  const handleGenerate = async () => {
    if (!form.fullName || !form.jobTitle || !form.experience) {
      return toast.error("Name, target role, and experience are required");
    }
    setLoading(true);
    const toastId = toast.loading("Generating your AI resume...");
    try {
      const res = await fetch("/api/resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ formData: form }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setResumes((p) => [data.resume, ...p]);
      setSelected(data.resume);
      setView("preview");
      toast.success("Resume generated!", { id: toastId });
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : "Failed";
      toast.error(errMsg, { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!selected) return;
    const res = await fetch(`/api/resume/${selected.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: editContent }),
    });
    const data = await res.json();
    if (!res.ok) return toast.error(data.error);
    setResumes((p) => p.map((r) => (r.id === selected.id ? data.resume : r)));
    setSelected(data.resume);
    setView("preview");
    toast.success("Resume saved!");
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this resume?")) return;
    const res = await fetch(`/api/resume/${id}`, { method: "DELETE" });
    if (!res.ok) return toast.error("Failed to delete");
    setResumes((p) => p.filter((r) => r.id !== id));
    if (selected?.id === id) { setSelected(null); setView("list"); }
    toast.success("Resume deleted");
  };

  const handleDownloadPDF = () => {
    if (!printRef.current || !selected) return;
    const content = printRef.current.innerHTML;
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>${selected.title}</title>
        <style>
          body { font-family: Georgia, serif; max-width: 800px; margin: 40px auto; color: #111; line-height: 1.6; }
          h1 { font-size: 24px; color: #1a1a1a; margin-bottom: 4px; }
          h2 { font-size: 16px; color: #4b5563; border-bottom: 1px solid #e5e7eb; padding-bottom: 4px; margin-top: 20px; }
          h3 { font-size: 14px; margin-bottom: 4px; }
          ul { padding-left: 20px; }
          li { margin-bottom: 4px; }
          a { color: #2563eb; }
          @media print { body { margin: 20px; } }
        </style>
      </head>
      <body>${content}</body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => { printWindow.print(); printWindow.close(); }, 500);
    toast.success("Print dialog opened — save as PDF!");
  };

  return (
    <div className="h-screen flex flex-col lg:flex-row overflow-hidden">
      {/* Sidebar */}
      <div className="w-full lg:w-72 border-b lg:border-b-0 lg:border-r border-border flex flex-col bg-[hsl(224_71%_5%)] flex-shrink-0">
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-lg font-bold flex items-center gap-2">
              <FileUser className="w-5 h-5 text-blue-400" />
              Resume Builder
            </h1>
            <button
              onClick={() => { setView("create"); setSelected(null); setForm(defaultForm); }}
              className="btn-primary py-1.5 text-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              New
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          <p className="text-xs text-muted-foreground px-2 py-2 font-medium uppercase tracking-wider">Saved Resumes</p>
          {resumes.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground text-sm">
              <FileUser className="w-8 h-8 mx-auto mb-2 opacity-30" />
              No resumes yet
            </div>
          ) : (
            resumes.map((resume) => (
              <button
                key={resume.id}
                onClick={() => { setSelected(resume); setView("preview"); setPreviewing(true); }}
                className={`w-full text-left p-3 rounded-lg mb-1 transition-all hover:bg-secondary/50 group ${selected?.id === resume.id ? "bg-secondary/70 border border-blue-500/20" : ""}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{resume.full_name}</p>
                    <p className="text-xs text-muted-foreground truncate">{resume.job_title}</p>
                    <p className="text-xs text-muted-foreground/60 mt-1 flex items-center gap-1">
                      <Clock className="w-2.5 h-2.5" />
                      {formatDate(resume.updated_at)}
                    </p>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(resume.id); }}
                    className="text-muted-foreground hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all ml-2"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Main area */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {/* Create form */}
        {view === "create" && (
          <div className="p-6 max-w-3xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Create New Resume</h2>
              <button onClick={() => setView("list")} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { key: "fullName", label: "Full Name *", placeholder: "John Doe" },
                { key: "email", label: "Email *", placeholder: "john@example.com" },
                { key: "phone", label: "Phone", placeholder: "+1 (555) 000-0000" },
                { key: "location", label: "Location", placeholder: "New York, NY" },
                { key: "jobTitle", label: "Target Job Title *", placeholder: "Senior Software Engineer" },
                { key: "skills", label: "Skills", placeholder: "React, TypeScript, Node.js, AWS..." },
              ].map((field) => (
                <div key={field.key} className={field.key === "skills" ? "md:col-span-2" : ""}>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">{field.label}</label>
                  <input
                    className="input-field"
                    placeholder={field.placeholder}
                    value={form[field.key as keyof ResumeForm]}
                    onChange={(e) => setForm((f) => ({ ...f, [field.key]: e.target.value }))}
                  />
                </div>
              ))}
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Professional Summary (optional)</label>
                <textarea
                  className="input-field resize-none h-20"
                  placeholder="A brief description or leave blank for AI to generate..."
                  value={form.summary}
                  onChange={(e) => setForm((f) => ({ ...f, summary: e.target.value }))}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Work Experience *</label>
                <textarea
                  className="input-field resize-none h-32 font-mono text-sm"
                  placeholder="Company Name - Role (2020-2023)&#10;• Achievement or responsibility&#10;• Another achievement&#10;&#10;Previous Company - Role (2018-2020)&#10;• Achievement..."
                  value={form.experience}
                  onChange={(e) => setForm((f) => ({ ...f, experience: e.target.value }))}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Education</label>
                <textarea
                  className="input-field resize-none h-20 font-mono text-sm"
                  placeholder="BS Computer Science - MIT (2018)&#10;Relevant coursework..."
                  value={form.education}
                  onChange={(e) => setForm((f) => ({ ...f, education: e.target.value }))}
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={handleGenerate} disabled={loading} className="btn-primary">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                {loading ? "Generating..." : "Generate with AI"}
              </button>
              <button onClick={() => setView("list")} className="px-4 py-2 rounded-lg border border-border text-sm text-muted-foreground hover:text-foreground transition-colors">
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Preview / Edit */}
        {view === "preview" && selected && (
          <div className="flex flex-col h-full">
            {/* Toolbar */}
            <div className="flex items-center justify-between px-6 py-3 border-b border-border bg-background/50 sticky top-0 z-10">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPreviewing(true)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${previewing ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                >
                  <Eye className="w-3.5 h-3.5" /> Preview
                </button>
                <button
                  onClick={() => { setPreviewing(false); setEditContent(selected.content); }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${!previewing ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                >
                  <Code className="w-3.5 h-3.5" /> Edit
                </button>
              </div>
              <div className="flex items-center gap-2">
                {!previewing && (
                  <button onClick={handleSaveEdit} className="btn-primary py-1.5 text-xs">
                    <Save className="w-3.5 h-3.5" /> Save
                  </button>
                )}
                <button
                  onClick={handleDownloadPDF}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border border-border text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Download className="w-3.5 h-3.5" /> PDF
                </button>
                <button
                  onClick={() => { setView("create"); setForm(selected.form_data || defaultForm); }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border border-border text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Edit3 className="w-3.5 h-3.5" /> Regenerate
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {previewing ? (
                <div
                  ref={printRef}
                  className="max-w-3xl mx-auto card bg-white text-gray-900 shadow-lg"
                  style={{ fontFamily: "Georgia, serif", minHeight: "900px" }}
                >
                  <div className="prose max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-li:text-gray-700 prose-a:text-blue-600">
                    <ReactMarkdown>{selected.content}</ReactMarkdown>
                  </div>
                </div>
              ) : (
                <div className="max-w-3xl mx-auto">
                  <textarea
                    className="input-field w-full resize-none font-mono text-sm min-h-[800px]"
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Empty state */}
        {view === "list" && resumes.length === 0 && (
          <div className="flex-1 flex items-center justify-center h-full text-center p-8">
            <div>
              <FileUser className="w-16 h-16 text-muted-foreground/20 mx-auto mb-4" />
              <p className="text-muted-foreground mb-2">No resumes yet</p>
              <button onClick={() => setView("create")} className="btn-primary mt-4">
                <Plus className="w-4 h-4" /> Create Resume
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
