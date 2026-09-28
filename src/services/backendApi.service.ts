/**
 * Backend API Service
 * Connects to the FastAPI Python backend for ML analysis,
 * full-text search, analytics, and backup.
 * Falls back to browser-side ML if backend is unavailable.
 */

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api';

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail ?? `API error ${res.status}`);
  }
  return res.json();
}

// ── Resume Analysis ───────────────────────────────────────────────────────────

export async function analyzeResumeBackend(
  file: File,
  targetRole: string,
  userId = '00000000-0000-0000-0000-000000000001'
) {
  const form = new FormData();
  form.append('file', file);
  const res = await fetch(
    `${API_BASE}/resume/analyze?target_role=${encodeURIComponent(targetRole)}&user_id=${userId}`,
    { method: 'POST', body: form }
  );
  if (!res.ok) throw new Error(`Analysis failed: ${res.statusText}`);
  return res.json();
}

// ── Full-Text Search ──────────────────────────────────────────────────────────

export async function searchResumes(
  query: string,
  options: { userId?: string; role?: string; limit?: number; offset?: number } = {}
) {
  const params = new URLSearchParams({ q: query });
  if (options.userId) params.set('user_id', options.userId);
  if (options.role)   params.set('role', options.role);
  if (options.limit)  params.set('limit', String(options.limit));
  if (options.offset) params.set('offset', String(options.offset));
  return apiFetch<{ query: string; total: number; results: any[] }>(`/search/resumes?${params}`);
}

// ── Job Matching ──────────────────────────────────────────────────────────────

export async function matchResumeToJob(resumeText: string, jobDescription: string) {
  return apiFetch<any>('/match/job', {
    method: 'POST',
    body: JSON.stringify({ resume_text: resumeText, job_description: jobDescription }),
  });
}

export async function rankResumes(resumes: Array<{ name: string; text: string }>, targetRole: string) {
  return apiFetch<any>('/match/rank', {
    method: 'POST',
    body: JSON.stringify({ resumes, target_role: targetRole }),
  });
}

// ── Analytics ─────────────────────────────────────────────────────────────────

export async function getAnalyticsOverview() {
  return apiFetch<{
    total_resumes: number;
    avg_match_score: number;
    total_skills: number;
    total_analyses: number;
  }>('/analytics/overview');
}

export async function getRoleDistribution() {
  return apiFetch<Array<{ target_role: string; count: number; percentage: number }>>('/analytics/role-distribution');
}

export async function getUploadTrend(days = 30) {
  return apiFetch<Array<{ upload_date: string; upload_count: number }>>(`/analytics/upload-trend?days=${days}`);
}

export async function getTopSkills(limit = 20) {
  return apiFetch<Array<{ skill: string; frequency: number }>>(`/analytics/top-skills?limit=${limit}`);
}

export async function getMlVsFuzzy() {
  return apiFetch<any[]>('/analytics/ml-vs-fuzzy');
}

// ── Backup ────────────────────────────────────────────────────────────────────

export async function downloadUserBackup(userId: string) {
  const res = await fetch(`${API_BASE}/backup/export/${userId}`);
  if (!res.ok) throw new Error('Backup export failed');
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `backup_${userId.slice(0, 8)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

// ── Health check ──────────────────────────────────────────────────────────────

export async function checkBackendHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL ?? 'http://localhost:8000'}/health`, { signal: AbortSignal.timeout(3000) });
    return res.ok;
  } catch { return false; }
}
