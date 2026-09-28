import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const OPENROUTER_API_KEY = Deno.env.get("OPENROUTER_API_KEY");

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface ChatRequest {
  message: string;
  history?: ChatMessage[];
  context?: {
    skills?: string[];
    targetRole?: string;
    experienceYears?: number;
    resumeSummary?: string;
  };
}

const SYSTEM_PROMPT = `You are an AI Career Mentor — a knowledgeable, supportive career coach specializing in tech careers. Your role is to provide actionable, personalized career advice.

Guidelines:
- Be concise but thorough. Use bullet points and clear structure.
- Tailor advice to the user's context (skills, role, experience) when provided.
- Provide specific, actionable recommendations — not generic platitudes.
- When discussing skills, mention real tools, frameworks, and certifications.
- For salary/negotiation topics, reference market data and strategies.
- For interview prep, give concrete examples and frameworks (STAR method, etc.).
- Be encouraging but honest about gaps or areas for improvement.
- Keep responses under 400 words unless the question requires more detail.
- Format with markdown: use ## for headers, **bold** for emphasis, - for bullets.
- End with a brief follow-up question or next step suggestion.

If the user's context includes their skills and target role, reference those specifically in your advice.`;

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS_HEADERS });
  }

  try {
    if (!OPENROUTER_API_KEY) {
      throw new Error("OPENROUTER_API_KEY is not configured");
    }

    const { message, history, context }: ChatRequest = await req.json();

    if (!message || typeof message !== "string") {
      return new Response(
        JSON.stringify({ error: "message is required" }),
        { status: 400, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      );
    }

    let systemPrompt = SYSTEM_PROMPT;
    if (context) {
      const parts: string[] = [];
      if (context.skills?.length) parts.push(`Current skills: ${context.skills.join(", ")}`);
      if (context.targetRole) parts.push(`Target role: ${context.targetRole}`);
      if (context.experienceYears) parts.push(`Experience: ${context.experienceYears} years`);
      if (context.resumeSummary) parts.push(`Resume summary: ${context.resumeSummary}`);
      if (parts.length) {
        systemPrompt += `\n\nUser context:\n${parts.join("\n")}`;
      }
    }

    const messages: Array<{ role: string; content: string }> = [
      { role: "system", content: systemPrompt },
    ];

    if (history?.length) {
      const recentHistory = history.slice(-10);
      for (const msg of recentHistory) {
        messages.push({ role: msg.role, content: msg.content });
      }
    }

    messages.push({ role: "user", content: message });

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://next-step-career-ai-c5t5.vercel.app",
        "X-Title": "Next Step Career AI",
      },
      body: JSON.stringify({
        model: "openai/gpt-4o-mini",
        messages,
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`OpenRouter API error: ${response.status} — ${errText}`);
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content;

    if (!reply) {
      throw new Error("No response from OpenRouter");
    }

    return new Response(
      JSON.stringify({ reply }),
      { status: 200, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
    );

  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("career-chat error:", message);
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
    );
  }
});
