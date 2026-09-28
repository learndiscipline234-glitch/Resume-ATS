// Supabase Edge Function: analyze-resume
// Analyzes a resume using OpenRouter (server-side only)
// OPENROUTER_API_KEY must be set as a Supabase secret:
//   supabase secrets set OPENROUTER_KEY=sk-...

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const OPENROUTER_API_KEY = Deno.env.get("OPENROUTER_API_KEY");

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AnalyzeRequest {
  resumeText: string;
  targetRole?: string;
}

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS_HEADERS });
  }

  try {
    if (!OPENROUTER_API_KEY) {
  throw new Error("OPENROUTER_API_KEY is not configured.");
}

    const { resumeText, targetRole }: AnalyzeRequest = await req.json();

    if (!resumeText || typeof resumeText !== "string") {
      return new Response(
        JSON.stringify({ error: "resumeText is required and must be a string" }),
        { status: 400, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      );
    }

    const systemPrompt = `You are a helpful resume analyst and career coach. Output must be valid JSON (no extra text) matching the schema specified in the user message. Prioritize actionable, prioritized feedback and signal confidence for each suggestion.`;

    const userPrompt = `
Input:
- resume_text: ${resumeText.slice(0, 4000)}
- target_role: ${targetRole || "Not specified"}

Task:
Analyze the resume and return a JSON object that strictly follows the schema below. Provide:
1. Identified user_skills with a confidence score (0-1).
2. Suggested_skills (missing or recommended) prioritized and grouped by importance with short reason.
3. For each skill provide a recommended action (e.g., short resources, practice tasks, project ideas).
4. A skills breakdown mapping skill -> proficiency score (0-100) to drive charts.
5. Overall recommendations (top 5 things to improve now), and estimated impact (low/medium/high).
6. One-line elevator pitch improvement for the resume (what to write at top).
7. A short suggested keywords list for job applications for the target_role.
8. A summary_text field — a short human-friendly summary sentence.

Schema (REQUIRED JSON keys):
{
  "user_skills": [{"name":string,"confidence":number}],
  "suggested_skills": [{"name":string,"priority":"high|medium|low","reason":string,"recommended_action":string}],
  "skills_chart": [{"name":string,"score":number}],
  "top_recommendations": [{"title":string,"details":string,"impact":"low|medium|high"}],
  "resume_elevator_pitch": string,
  "suggested_keywords": [string],
  "summary_text": string,
  "metadata": {"model_confidence": number}
}

Important:
- Output must be strictly valid JSON matching schema above.
- Prioritize suggestions that are actionable (examples, links, small projects).
- If target_role is provided, tailor suggestions and keywords to that role.
- Keep the number of items manageable (user_skills up to 12, suggested_skills up to 8, skills_chart up to 12, top_recommendations up to 5).
`;

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "HTTP-Referer": "http://localhost:8080",
        "X-Title": "Next Step Career AI",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "openrouter/free",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.3,
        max_tokens: 2000,
      }),
    });

     if (!response.ok) {
     const errText = await response.text();
     throw new Error(`OpenRouter API error: ${response.status} — ${errText}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
  throw new Error("No content received from OpenRouter API");
}

    // Parse and validate JSON
    const analysis = JSON.parse(content);

    // Validate required fields
    const requiredFields = [
      "user_skills", "suggested_skills", "skills_chart",
      "top_recommendations", "resume_elevator_pitch",
      "suggested_keywords", "summary_text", "metadata",
    ];
    for (const field of requiredFields) {
      if (!(field in analysis)) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    return new Response(
      JSON.stringify({ data: analysis }),
      { status: 200, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
    );

  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("analyze-resume error:", message);
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
    );
  }
});
