/**
 * Job Fetcher Service
 *
 * Fetches real job listings via Supabase Edge Function (server-side proxy).
 * Strategy (in order):
 *   1. Supabase Edge Function `fetch-jobs` (RapidAPI key stays server-side)
 *   2. Curated Unstop / Internshala deep-link fallback objects
 *
 * The fallback always returns valid job objects with real apply URLs
 * so the UI never shows an empty state due to missing API keys.
 */

import { supabase } from '@/integrations/supabase/client';

export interface RealJob {
  jobId: string;
  title: string;
  company: string;
  location: string;
  applyUrl: string;
  requiredSkills: string[];
  source: 'jsearch' | 'unstop' | 'internshala' | 'linkedin';
  postedDate?: string;
  description?: string;
}

// ─── Role → search queries ────────────────────────────────────────────────────

const ROLE_QUERIES: Record<string, string[]> = {
  software_developer: ['software developer', 'full stack developer', 'frontend developer', 'backend developer'],
  aiml_engineer:      ['machine learning engineer', 'AI engineer', 'deep learning engineer', 'NLP engineer'],
  data_scientist:     ['data scientist', 'data analyst', 'business intelligence analyst'],
  devops_engineer:    ['devops engineer', 'cloud engineer', 'site reliability engineer', 'platform engineer'],
  product_manager:    ['product manager', 'product owner', 'technical product manager'],
};

const DEFAULT_QUERIES = ['software developer', 'full stack developer'];

// ─── Skill sets per role (used to populate fallback cards) ───────────────────

const ROLE_SKILLS: Record<string, string[]> = {
  software_developer: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'Git', 'REST APIs'],
  aiml_engineer:      ['Python', 'TensorFlow', 'PyTorch', 'Scikit-learn', 'NLP', 'MLOps'],
  data_scientist:     ['Python', 'Pandas', 'SQL', 'Tableau', 'Statistics', 'Machine Learning'],
  devops_engineer:    ['Docker', 'Kubernetes', 'AWS', 'Terraform', 'CI/CD', 'Linux'],
  product_manager:    ['Agile', 'Jira', 'Roadmapping', 'Stakeholder Management', 'Analytics'],
};

// ─── Supabase Edge Function proxy ────────────────────────────────────────────

async function fetchFromEdgeFunction(queries: string[], location?: string): Promise<RealJob[]> {
  const { data, error } = await supabase.functions.invoke('fetch-jobs', {
    body: { queries, location },
  });

  if (error) throw new Error(`Edge function error: ${error.message}`);
  if (!data || data.source === 'no_key' || data.source === 'error') {
    throw new Error(data?.error ?? 'No API key configured on server');
  }

  return (data.jobs ?? []) as RealJob[];
}

// ─── Unstop / Internshala curated fallback ────────────────────────────────────

function buildFallbackJobs(role: string): RealJob[] {
  const queries = ROLE_QUERIES[role] ?? DEFAULT_QUERIES;
  const skills  = ROLE_SKILLS[role]  ?? ROLE_SKILLS.software_developer;

  const sources: Array<{ name: string; urlFn: (q: string) => string; source: RealJob['source'] }> = [
    {
      name:   'Unstop',
      urlFn:  (q) => `https://unstop.com/jobs?searchTerm=${encodeURIComponent(q)}`,
      source: 'unstop',
    },
    {
      name:   'Internshala',
      urlFn:  (q) => `https://internshala.com/jobs/keywords-${encodeURIComponent(q.replace(/ /g, '-'))}`,
      source: 'internshala',
    },
    {
      name:   'LinkedIn',
      urlFn:  (q) => `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(q)}`,
      source: 'linkedin',
    },
  ];

  const jobs: RealJob[] = [];

  queries.forEach((query, qi) => {
    const src = sources[qi % sources.length];
    jobs.push({
      jobId:         `fallback-${role}-${qi}`,
      title:         toTitleCase(query),
      company:       src.name,
      location:      'Multiple Locations / Remote',
      applyUrl:      src.urlFn(query),
      requiredSkills: skills,
      source:        src.source,
      description:   `Browse the latest "${query}" openings on ${src.name}.`,
    });
  });

  return jobs;
}

function toTitleCase(str: string): string {
  return str.replace(/\b\w/g, (c) => c.toUpperCase());
}

// ─── Public API ───────────────────────────────────────────────────────────────

export interface FetchJobsResult {
  jobs:      RealJob[];
  source:    'api' | 'fallback';
  error?:    string;
}

/**
 * Fetch real job listings for a given role.
 * Falls back to curated Unstop/Internshala search links if the API is unavailable.
 */
export async function fetchJobsForRole(role: string): Promise<FetchJobsResult> {
  const queries = ROLE_QUERIES[role] ?? DEFAULT_QUERIES;

  // Try edge function (server-side proxy to RapidAPI)
  try {
    const jobs = await fetchFromEdgeFunction(queries.slice(0, 3));
    if (jobs.length > 0) {
      return { jobs, source: 'api' };
    }
  } catch (err) {
    console.warn('[JobFetcher] Edge function unavailable, using fallback:', err);
  }

  // Fallback: curated search-page links
  return {
    jobs:   buildFallbackJobs(role).slice(0, 10),
    source: 'fallback',
  };
}

/**
 * Returns the primary apply URL for a job.
 * Always points to the original source.
 */
export function getApplyUrl(job: RealJob): string {
  return job.applyUrl;
}

/**
 * Returns a human-readable source label.
 */
export function getSourceLabel(source: RealJob['source']): string {
  const labels: Record<RealJob['source'], string> = {
    jsearch:     'JSearch',
    unstop:      'Unstop',
    internshala: 'Internshala',
    linkedin:    'LinkedIn',
  };
  return labels[source] ?? 'Job Board';
}
