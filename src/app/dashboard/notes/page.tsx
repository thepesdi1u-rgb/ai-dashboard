"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import {
  Plus,
  Search,
  Trash2,
  Edit3,
  Save,
  X,
  FileText,
  Eye,
  Code,
  Download,
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import { downloadPDF } from "@/lib/pdf";

interface Note {
  id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [editing, setEditing] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ title: "", content: "" });
  const [saving, setSaving] = useState(false);

  const fetchNotes = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/notes?search=${encodeURIComponent(search)}`);
      const data = await res.json();
      setNotes(data.notes || []);
    } catch {
      setNotes([]);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    const debounce = setTimeout(fetchNotes, 300);
    return () => clearTimeout(debounce);
  }, [fetchNotes]);

  const handleCreate = async () => {
    if (!form.title.trim()) return toast.error("Title is required");
    setSaving(true);
    const res = await fetch("/api/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok) return toast.error(data.error);
    setNotes((prev) => [data.note, ...prev]);
    setForm({ title: "", content: "" });
    setCreating(false);
    setSelectedNote(data.note);
    toast.success("Note created!");
    setSaving(false);
  };

  const handleUpdate = async () => {
    if (!selectedNote) return;
    setSaving(true);
    const res = await fetch(`/api/notes/${selectedNote.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok) return toast.error(data.error);
    setNotes((prev) => prev.map((n) => (n.id === selectedNote.id ? data.note : n)));
    setSelectedNote(data.note);
    setEditing(false);
    toast.success("Note saved!");
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this note?")) return;
    const res = await fetch(`/api/notes/${id}`, { method: "DELETE" });
    if (!res.ok) return toast.error("Failed to delete");
    setNotes((prev) => prev.filter((n) => n.id !== id));
    if (selectedNote?.id === id) setSelectedNote(null);
    toast.success("Note deleted!");
  };

  const startEdit = (note: Note) => {
    setForm({ title: note.title, content: note.content });
    setEditing(true);
    setPreviewing(false);
  };

  const cancelEdit = () => {
    setEditing(false);
    setForm({ title: "", content: "" });
  };

  return (
    <div className="h-screen flex flex-col lg:flex-row overflow-hidden">
      {/* Sidebar */}
      <div className="w-full lg:w-72 border-b lg:border-b-0 lg:border-r border-border flex flex-col bg-[hsl(224_71%_5%)] flex-shrink-0">
        {/* Header */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-lg font-bold flex items-center gap-2">
              <FileText className="w-5 h-5 text-violet-400" />
              Notes
            </h1>
            <button
              onClick={() => { setCreating(true); setSelectedNote(null); setEditing(false); setForm({ title: "", content: "" }); }}
              className="btn-primary py-1.5 text-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              New
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              className="input-field pl-9 text-xs"
              placeholder="Search notes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        {/* Notes list */}
        <div className="flex-1 overflow-y-auto p-2">
          {loading ? (
            <div className="space-y-2 p-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="skeleton h-16 rounded-lg" />
              ))}
            </div>
          ) : notes.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm">{search ? "No results" : "No notes yet"}</p>
            </div>
          ) : (
            notes.map((note) => (
              <button
                key={note.id}
                onClick={() => { setSelectedNote(note); setEditing(false); setCreating(false); setPreviewing(false); }}
                className={`w-full text-left p-3 rounded-lg mb-1 transition-all hover:bg-secondary/50 group ${selectedNote?.id === note.id ? "bg-secondary/70 border border-violet-500/20" : ""}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium text-foreground line-clamp-1">{note.title}</p>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(note.id); }}
                    className="flex-shrink-0 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{note.content.slice(0, 80) || "Empty note"}</p>
                <p className="text-xs text-muted-foreground/60 mt-1">{formatDate(note.updated_at)}</p>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Editor / Viewer */}
      <div className="flex-1 flex flex-col min-h-0">
        {creating ? (
          <div className="flex-1 flex flex-col p-6">
            <div className="card flex-1 flex flex-col gap-4 max-w-3xl w-full mx-auto">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Plus className="w-5 h-5 text-violet-400" /> New Note
              </h2>
              <input
                className="input-field text-lg font-medium"
                placeholder="Note title..."
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              />
              <textarea
                className="input-field flex-1 resize-none font-mono text-sm min-h-[300px]"
                placeholder="Write your note in Markdown..."
                value={form.content}
                onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
              />
              <div className="flex gap-2">
                <button onClick={handleCreate} disabled={saving} className="btn-primary">
                  <Save className="w-4 h-4" />
                  {saving ? "Saving..." : "Create Note"}
                </button>
                <button onClick={() => setCreating(false)} className="px-4 py-2 rounded-lg border border-border text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        ) : selectedNote ? (
          <div className="flex-1 flex flex-col min-h-0">
            {/* Toolbar */}
            <div className="flex items-center justify-between px-6 py-3 border-b border-border bg-background/50">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPreviewing(false)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${!previewing ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                >
                  <Code className="w-3.5 h-3.5" /> Edit
                </button>
                <button
                  onClick={() => setPreviewing(true)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${previewing ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                >
                  <Eye className="w-3.5 h-3.5" /> Preview
                </button>
              </div>
              <div className="flex items-center gap-2">
                {editing ? (
                  <>
                    <button onClick={handleUpdate} disabled={saving} className="btn-primary py-1.5 text-xs">
                      <Save className="w-3.5 h-3.5" />
                      {saving ? "Saving..." : "Save"}
                    </button>
                    <button onClick={cancelEdit} className="px-3 py-1.5 rounded-lg text-xs border border-border text-muted-foreground hover:text-foreground transition-colors">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </>
                ) : (
                  <>
                    <button onClick={() => startEdit(selectedNote)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border border-border text-muted-foreground hover:text-foreground transition-colors">
                      <Edit3 className="w-3.5 h-3.5" /> Edit
                    </button>
                    <button 
                      onClick={() => downloadPDF(selectedNote.title, selectedNote.content, `Note-${selectedNote.title.replace(/\s+/g, "_")}`)} 
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border border-border text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" /> Download
                    </button>
                    <button onClick={() => handleDelete(selectedNote.id)} className="px-3 py-1.5 rounded-lg text-xs border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </>
                )}
              </div>
            </div>
            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {editing ? (
                <div className="max-w-3xl mx-auto space-y-3">
                  <input
                    className="input-field text-xl font-bold"
                    value={form.title}
                    onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  />
                  <textarea
                    className="input-field w-full resize-none font-mono text-sm min-h-[calc(100vh-250px)]"
                    value={form.content}
                    onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
                  />
                </div>
              ) : previewing ? (
                <article className="max-w-3xl mx-auto prose prose-invert prose-sm max-w-none prose-dark">
                  <h1 className="text-2xl font-bold mb-4">{selectedNote.title}</h1>
                  <ReactMarkdown>{selectedNote.content}</ReactMarkdown>
                </article>
              ) : (
                <div className="max-w-3xl mx-auto">
                  <h1 className="text-2xl font-bold mb-2 text-foreground">{selectedNote.title}</h1>
                  <p className="text-xs text-muted-foreground mb-6">Last updated {formatDate(selectedNote.updated_at)}</p>
                  <pre className="text-sm text-muted-foreground font-mono whitespace-pre-wrap leading-relaxed">
                    {selectedNote.content || <span className="italic">Empty note — click Edit to add content</span>}
                  </pre>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-center">
            <div>
              <FileText className="w-16 h-16 text-muted-foreground/20 mx-auto mb-4" />
              <p className="text-muted-foreground">Select a note or create a new one</p>
              <button
                onClick={() => setCreating(true)}
                className="btn-primary mt-4"
              >
                <Plus className="w-4 h-4" />
                New Note
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
