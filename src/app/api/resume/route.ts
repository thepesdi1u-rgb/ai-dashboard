import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { generateCompletion } from "@/lib/groq";
import { createAdminClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { formData } = await req.json();
  const { fullName, email, phone, location, jobTitle, experience, education, skills, summary } = formData;

  const systemPrompt = `You are a professional resume writer. Create a polished, ATS-optimized resume in Markdown format.
Use ## for section headers. Make it professional, concise, and impactful.
Include quantifiable achievements where possible. Use bullet points for experience items.`;

  const userPrompt = `Create a professional resume for:
Name: ${fullName}
Email: ${email}
Phone: ${phone}
Location: ${location}
Target Role: ${jobTitle}

Professional Summary Input: ${summary || "Generate based on experience"}

Work Experience:
${experience}

Education:
${education}

Skills: ${skills}

Format it as a complete, ready-to-use resume with all standard sections.`;

  let resumeContent: string;
  let isDemo = false;
  try {
    resumeContent = await generateCompletion(systemPrompt, userPrompt, "llama-3.3-70b-versatile");
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : "Generation failed";
    isDemo = true;
    resumeContent = `# ${fullName}\n${email} | ${phone} | ${location}\n\n---\n\n⚠️ **Demo Mode** — Groq API key is invalid or Groq is offline.\n\n## Professional Summary\nExperienced ${jobTitle} with a strong background in delivering results.\n\n## Experience\n${experience}\n\n## Education\n${education}\n\n## Skills\n${skills}`;
  }

  // Try to save to Supabase — BUT if it fails (missing columns, etc.), still return the result
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("resumes")
      .insert({
        user_id: session.user.id,
        title: `${fullName} - ${jobTitle}`,
        full_name: fullName,
        job_title: jobTitle,
        content: resumeContent,
        form_data: formData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (!error && data) {
      return NextResponse.json({ resume: data }, { status: 201 });
    }
  } catch {}

  // Database failed or schema mismatch — return in-memory object so the UI works
  return NextResponse.json({
    resume: {
      id: `local-${Date.now()}`,
      user_id: session.user.id,
      title: `${fullName} - ${jobTitle}`,
      full_name: fullName,
      job_title: jobTitle,
      content: resumeContent,
      form_data: formData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      _unsaved: true,
      _demo: isDemo
    }
  }, { status: 201 });
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("resumes")
      .select("*")
      .eq("user_id", session.user.id)
      .order("updated_at", { ascending: false });

    if (error) return NextResponse.json({ resumes: [] });
    return NextResponse.json({ resumes: data });
  } catch {
    return NextResponse.json({ resumes: [] });
  }
}
