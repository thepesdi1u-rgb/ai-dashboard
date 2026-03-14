import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { generateCompletion } from "@/lib/groq";
import { createAdminClient } from "@/lib/supabase/server";

async function crawlJobsWithFirecrawl(query: string, location: string) {
  const apiKey = process.env.FIRECRAWL_API_KEY;
  if (!apiKey || apiKey === "fc-your_firecrawl_api_key_here") return getMockJobs(query, location);

  const urls = [
    `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(query)}&location=${encodeURIComponent(location)}`,
    `https://www.indeed.com/jobs?q=${encodeURIComponent(query)}&l=${encodeURIComponent(location)}`,
  ];

  const results: string[] = [];
  for (const url of urls) {
    try {
      const response = await fetch("https://api.firecrawl.dev/v1/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({ url, formats: ["markdown"], onlyMainContent: true, waitFor: 2000 }),
      });
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data?.markdown) results.push(`[Source: ${url}]\n${data.data.markdown.slice(0, 3000)}`);
      }
    } catch {}
  }
  return results.join("\n\n---\n\n") || getMockJobs(query, location);
}

function getMockJobs(query: string, location: string): string {
  return `Sample jobs for ${query} in ${location}: 1. Senior ${query} (TechCorp), 2. ${query} Engineer (StartupXYZ), 3. Junior ${query} (GrowthCo)`;
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { jobTitle, location } = await req.json();
  const rawContent = await crawlJobsWithFirecrawl(jobTitle, location);

  const systemPrompt = `Return a JSON array of job objects: [{"company": "...", "title": "...", "location": "...", "link": "#", "requirements": [], "salary": null, "type": "Full-time"}]. Return ONLY JSON.`;

  let jobs: any[] = [];
  try {
    const aiResponse = await generateCompletion(systemPrompt, `Jobs: ${jobTitle} ${location}\n${rawContent}`, "llama-3.3-70b-versatile");
    const jsonMatch = aiResponse.match(/\[[\s\S]*\]/);
    if (jsonMatch) jobs = JSON.parse(jsonMatch[0]);
  } catch {}

  if (jobs.length === 0) {
    jobs = [
      { company: "TechCorp", title: `Senior ${jobTitle}`, location, link: "#", requirements: ["Skill A", "Skill B"], salary: "Competitive", type: "Full-time" },
      { company: "GrowthCo", title: jobTitle, location: "Remote", link: "#", requirements: ["Growth mindset"], salary: "Market rate", type: "Remote" },
    ];
  }

  return NextResponse.json({ jobs, query: { jobTitle, location } });
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase.from("saved_jobs").select("*").eq("user_id", session.user.id).order("created_at", { ascending: false });
    return NextResponse.json({ jobs: data || [] });
  } catch {
    return NextResponse.json({ jobs: [] });
  }
}

export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const job = await req.json();
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase.from("saved_jobs").insert({
      user_id: session.user.id,
      ...job,
      requirements: Array.isArray(job.requirements) ? job.requirements.join(", ") : job.requirements,
      created_at: new Date().toISOString(),
    }).select().single();

    if (!error && data) return NextResponse.json({ job: data });
  } catch {}

  return NextResponse.json({ job: { ...job, id: `local-${Date.now()}`, _unsaved: true } });
}
