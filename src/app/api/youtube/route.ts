import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { generateCompletion } from "@/lib/groq";
import { createAdminClient } from "@/lib/supabase/server";

function extractVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /^([a-zA-Z0-9_-]{11})$/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

async function fetchTranscript(videoId: string): Promise<string> {
  try {
    const response = await fetch(
      `https://www.youtube.com/watch?v=${videoId}`,
      { headers: { "Accept-Language": "en-US" } }
    );
    const html = await response.text();
    const captionMatch = html.match(/"captionTracks":\[{"baseUrl":"([^"]+)"/);
    if (captionMatch) {
      const captionUrl = captionMatch[1].replace(/\\u0026/g, "&");
      const captionRes = await fetch(captionUrl);
      const captionXml = await captionRes.text();
      
      // regex to catch both the start time and the text content
      const textRegex = /<text start="([\d.]+)"[^>]*>([^<]*)<\/text>/g;
      let match;
      const transcriptParts: string[] = [];

      while ((match = textRegex.exec(captionXml)) !== null) {
        const start = parseFloat(match[1]);
        const text = match[2]
          .replace(/&amp;/g, "&")
          .replace(/&lt;/g, "<")
          .replace(/&gt;/g, ">")
          .replace(/&#39;/g, "'")
          .replace(/&quot;/g, '"');
        
        // Format seconds to [MM:SS] or [HH:MM:SS]
        const h = Math.floor(start / 3600);
        const m = Math.floor((start % 3600) / 60);
        const s = Math.floor(start % 60);
        const timestamp = h > 0 
          ? `[${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}]`
          : `[${m}:${s.toString().padStart(2, '0')}]`;
        
        transcriptParts.push(`${timestamp} ${text}`);
      }

      return transcriptParts.join("\n") || "Could not extract transcript.";
    }
    return "No captions available for this video.";
  } catch {
    return "Could not fetch transcript. Video may be private or have no captions.";
  }
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { url, language = "English" } = await req.json();
  if (!url) return NextResponse.json({ error: "URL required" }, { status: 400 });

  const videoId = extractVideoId(url);
  if (!videoId) return NextResponse.json({ error: "Invalid YouTube URL" }, { status: 400 });

  // Fetch video metadata
  let videoTitle = "YouTube Video";
  const thumbnail = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;

  try {
    const oembedRes = await fetch(
      `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`
    );
    if (oembedRes.ok) {
      const oembed = await oembedRes.json();
      videoTitle = oembed.title || videoTitle;
    }
  } catch {}

  // Get transcript
  const transcript = await fetchTranscript(videoId);

  const systemPrompt = `You are an expert content analyst. Analyze the YouTube video transcript (which includes timestamps) and provide a comprehensive, well-structured response in the following format. 

IMPORTANT: YOU MUST WRITE THE ENTIRE RESPONSE IN THE ${language.toUpperCase()} LANGUAGE.

## Summary
A 3-4 sentence overview of the video content in ${language}.

## Video Timeline
A chronological breakdown of the video's key segments using the timestamps [MM:SS] provided in the transcript.
- [0:00] Segment Name: Brief explanation of what happens or is discussed here.
- [0:45] Next Segment: Explanation...
(Focus on 5-8 significant timestamps)

## Key Points
- Point 1
- Point 2
- Point 3
- Point 4
- Point 5

## Actionable Insights
- Insight 1
- Insight 2
- Insight 3

Keep it concise, clear, and valuable in the ${language} language.`;

  const userPrompt = `Video Title: "${videoTitle}"
Video URL: ${url}
Transcript:
${transcript.slice(0, 8000)}

Please summarize this video in ${language}.`;

  // Try AI — catch ANY error and fall back to demo summary
  let aiSummary: string;
  let isDemo = false;
  try {
    aiSummary = await generateCompletion(systemPrompt, userPrompt, "llama-3.3-70b-versatile");
  } catch {
    isDemo = true;
    aiSummary = `## Summary

⚠️ **Demo Mode** — Groq API key is missing or invalid.

This is a placeholder summary for **"${videoTitle}"**. To get real AI-generated summaries, you need a valid Groq API key.

## Key Points
- Get a **free** Groq API key at [console.groq.com](https://console.groq.com)
- Go to **API Keys → Create API Key** and copy the key (starts with \`gsk_\`)
- Open \`.env.local\` and set: \`GROQ_API_KEY=gsk_your_key_here\`
- Restart the dev server with \`npm run dev\`
- Real AI summaries use **Llama 3.3 70B** — fast and completely free

## Actionable Insights
- Visit [console.groq.com](https://console.groq.com) — no credit card needed
- Replace the invalid key in \`.env.local\` line 19
- After restart, all AI features (YouTube, Resume, Job Search) will work`;
  }

  // Try Supabase save — if it fails, still return the result so UI works
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("youtube_summaries")
      .insert({
        user_id: session.user.id,
        video_url: url,
        video_id: videoId,
        video_title: videoTitle,
        thumbnail_url: thumbnail,
        summary: aiSummary,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (!error && data) {
      return NextResponse.json({ summary: data });
    }
  } catch {}

  // Supabase failed — return in-memory object so UI still shows the summary
  return NextResponse.json({
    summary: {
      id: `local-${Date.now()}`,
      user_id: session.user.id,
      video_url: url,
      video_id: videoId,
      video_title: videoTitle,
      thumbnail_url: thumbnail,
      summary: aiSummary,
      created_at: new Date().toISOString(),
      _unsaved: true,
      _demo: isDemo,
    },
  });
}

// GET - List saved summaries
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("youtube_summaries")
      .select("*")
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false });

    if (error) return NextResponse.json({ summaries: [] });
    return NextResponse.json({ summaries: data });
  } catch {
    return NextResponse.json({ summaries: [] });
  }
}
