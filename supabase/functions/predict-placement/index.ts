// Supabase Edge Function: predict-placement
// Predicts placement likelihood using OpenRouter (server-side only)
// OPENROUTER_API_KEY must be set as a Supabase secret

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const OPENROUTER_API_KEY = Deno.env.get("OPENROUTER_API_KEY");

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PlacementRequest {
  skills?: string[];
  gpa?: number;
  experienceYears?: number;
  projects?: number;
  education?: string;
  targetRole?: string;
  certifications?: string[];
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

    const body: PlacementRequest = await req.json();

    if (!body.skills && !body.targetRole) {
      return new Response(
        JSON.stringify({ error: "At least skills or targetRole is required" }),
        { status: 400, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      );
    }

    const systemPrompt = `You are a placement prediction AI for job candidates. Output must be valid JSON (no extra text) matching the schema specified. Be realistic and data-driven in your predictions.`;

    const userPrompt = `
Input:
- skills: ${body.skills?.join(", ") || "Not provided"}
- gpa: ${body.gpa ?? "Not provided"}
- experience_years: ${body.experienceYears ?? "Not provided"}
- projects: ${body.projects ?? "Not provided"}
- education: ${body.education || "Not provided"}
- target_role: ${body.targetRole || "Not provided"}
- certifications: ${body.certifications?.join(", ") || "None"}

Task:
Predict the placement likelihood for this candidate and return a JSON object matching the schema below. Provide:
1. Overall placement percentage (0-100).
2. Key factors that influence the prediction (positive and negative).
3. Skill gap analysis — which skills are most critical to improve.
4. Recommendations to improve placement chances.
5. Estimated salary range for the target role (if specified).
6. A short summary of the prediction.

Schema (REQUIRED JSON keys):
{
  "placementPercentage": number,
  "confidence": number,
  "keyFactors": [{"factor":string,"impact":"positive|negative","weight":number}],
  "skillGaps": [{"skill":string,"importance":"critical|important|nice-to-have","learningEffort":string}],
  "recommendations": [{"title":string,"details":string,"priority":"high|medium|low"}],
  "estimatedSalary": {"min":number,"max":number,"currency":string} | null,
  "summaryText": string,
  "metadata": {"modelConfidence":number}
}

Important:
- Output must be strictly valid JSON matching schema above.
- Be realistic — not everyone gets 90%+ placement.
- Weight skills and experience most heavily.
- If target_role is not provided, predict for the most likely role based on skills.
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
        max_tokens: 1500,
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

    const prediction = JSON.parse(content);

    // Validate required fields
    const requiredFields = [
      "placementPercentage", "confidence", "keyFactors",
      "skillGaps", "recommendations", "summaryText", "metadata",
    ];
    for (const field of requiredFields) {
      if (!(field in prediction)) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    return new Response(
      JSON.stringify({ data: prediction }),
      { status: 200, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
    );

  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("predict-placement error:", message);
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
    );
  }
});
