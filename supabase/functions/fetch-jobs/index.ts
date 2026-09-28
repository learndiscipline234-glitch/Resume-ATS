import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const RAPIDAPI_KEY = Deno.env.get("RAPIDAPI_KEY");

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface FetchJobsRequest {
  queries: string[];
  location?: string;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS_HEADERS });
  }

  try {
    if (!RAPIDAPI_KEY) {
      return new Response(
        JSON.stringify({ jobs: [], source: "no_key", error: "RAPIDAPI_KEY not configured" }),
        { status: 200, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      );
    }

    const { queries, location }: FetchJobsRequest = await req.json();

    if (!queries || !Array.isArray(queries) || queries.length === 0) {
      return new Response(
        JSON.stringify({ error: "queries array is required" }),
        { status: 400, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      );
    }

    const searchQueries = queries.slice(0, 3);
    const allJobs: any[] = [];

    for (const query of searchQueries) {
      const params = new URLSearchParams({
        query: location ? `${query} in ${location}` : query,
        num_pages: "1",
        page: "1",
      });

      const res = await fetch(`https://jsearch.p.rapidapi.com/search?${params}`, {
        headers: {
          "X-RapidAPI-Key": RAPIDAPI_KEY,
          "X-RapidAPI-Host": "jsearch.p.rapidapi.com",
        },
      });

      if (!res.ok) {
        console.warn(`JSearch query "${query}" failed: ${res.status}`);
        continue;
      }

      const data = await res.json();
      const jobs = (data.data ?? []).slice(0, 5).map((j: any) => ({
        jobId: j.job_id ?? `jsearch-${crypto.randomUUID()}`,
        title: j.job_title ?? "Software Engineer",
        company: j.employer_name ?? "Unknown Company",
        location: j.job_city
          ? `${j.job_city}, ${j.job_country ?? ""}`.trim()
          : j.job_country ?? "Remote",
        applyUrl: j.job_apply_link ?? j.job_google_link ?? "",
        requiredSkills: (j.job_required_skills ?? []).slice(0, 8),
        source: "jsearch",
        postedDate: j.job_posted_at_datetime_utc,
        description: j.job_description?.slice(0, 400),
        salary: j.job_min_salary && j.job_max_salary
          ? `${j.job_salary_currency ?? "$"}${j.job_min_salary}-${j.job_max_salary}`
          : null,
        employerLogo: j.employer_logo,
        jobType: j.job_employment_type,
      }));

      allJobs.push(...jobs);
    }

    // Dedupe by jobId
    const seen = new Set<string>();
    const unique = allJobs.filter((j) => {
      if (seen.has(j.jobId)) return false;
      seen.add(j.jobId);
      return true;
    });

    return new Response(
      JSON.stringify({ jobs: unique.slice(0, 15), source: "api" }),
      { status: 200, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("fetch-jobs error:", message);
    return new Response(
      JSON.stringify({ jobs: [], source: "error", error: message }),
      { status: 200, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
    );
  }
});
