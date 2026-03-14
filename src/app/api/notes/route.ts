import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { createAdminClient } from "@/lib/supabase/server";

// GET /api/notes - Fetch user's notes
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";

    const supabase = createAdminClient();
    let query = supabase
      .from("notes")
      .select("*")
      .eq("user_id", session.user.id)
      .order("updated_at", { ascending: false });

    if (search) {
      query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%`);
    }

    const { data, error } = await query;
    if (error) {
      console.error("Supabase GET notes error:", error.message);
      return NextResponse.json({ notes: [], _error: error.message });
    }

    return NextResponse.json({ notes: data || [] });
  } catch {
    return NextResponse.json({ notes: [] });
  }
}

// POST /api/notes - Create a note
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { title, content } = body;

    if (!title?.trim()) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    const now = new Date().toISOString();

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("notes")
      .insert({
        user_id: session.user.id,
        title: title.trim(),
        content: content || "",
        created_at: now,
        updated_at: now,
      })
      .select()
      .single();

    if (error) {
      console.error("Supabase insert note error:", error.message);
      // Return an in-memory note so the UI still works
      return NextResponse.json({
        note: {
          id: `local-${Date.now()}`,
          user_id: session.user.id,
          title: title.trim(),
          content: content || "",
          created_at: now,
          updated_at: now,
          _unsaved: true,
        },
        _warning: "Note not saved to database: " + error.message,
      }, { status: 201 });
    }

    return NextResponse.json({ note: data }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Server error — check console" }, { status: 500 });
  }
}
