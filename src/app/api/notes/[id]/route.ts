import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { createAdminClient } from "@/lib/supabase/server";

// PATCH /api/notes/[id] - Update a note
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { title, content } = body;
    const now = new Date().toISOString();

    // Handle in-memory notes (id starts with "local-")
    if (params.id.startsWith("local-")) {
      return NextResponse.json({
        note: {
          id: params.id,
          user_id: session.user.id,
          title: title?.trim() || "Untitled",
          content: content || "",
          created_at: now,
          updated_at: now,
          _unsaved: true,
        },
      });
    }

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("notes")
      .update({
        title: title?.trim(),
        content: content || "",
        updated_at: now,
      })
      .eq("id", params.id)
      .eq("user_id", session.user.id)
      .select()
      .single();

    if (error) {
      console.error("Supabase PATCH note error:", error.message);
      return NextResponse.json({
        note: {
          id: params.id,
          user_id: session.user.id,
          title: title?.trim() || "Untitled",
          content: content || "",
          updated_at: now,
          _unsaved: true,
        },
      });
    }

    return NextResponse.json({ note: data });
  } catch (err) {
    console.error("Notes PATCH crashed:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// DELETE /api/notes/[id] - Delete a note
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // In-memory notes can just be "deleted" (they aren't in DB anyway)
    if (params.id.startsWith("local-")) {
      return NextResponse.json({ success: true });
    }

    const supabase = createAdminClient();
    const { error } = await supabase
      .from("notes")
      .delete()
      .eq("id", params.id)
      .eq("user_id", session.user.id);

    if (error) {
      console.error("Supabase DELETE note error:", error.message);
      // Still return success so UI can remove it locally
      return NextResponse.json({ success: true, _warning: error.message });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Notes DELETE crashed:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
