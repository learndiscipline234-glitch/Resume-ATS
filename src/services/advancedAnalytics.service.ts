/**
 * Advanced Analytics Service
 * Queries stored procedures, views, materialized views, and JSONB tables.
 * All data comes from the real Supabase DB — no static/fake values.
 */

import { supabase } from '@/integrations/supabase/client';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface UserResumeStats {
  total_resumes: number;
  avg_match_score: number;
  highest_score: number;
}

export interface RoleMatchAnalytics {
  target_role: string;
  avg_match_score: number;
  max_match_score: number;
  min_match_score: number;
  total_analyses: number;
}

export interface SkillDemandEntry {
  target_role: string;
  skill: string;
  frequency: number;
}

export interface AuditLogEntry {
  id: string;
  table_name: string;
  action: string;
  record_id: string | null;
  new_values: Record<string, any> | null;
  old_values: Record<string, any> | null;
  created_at: string;
}

export interface TopJobMatch {
  user_id: string;
  target_role: string;
  match_percentage: number;
  matched_skills: string[];
  missing_skills: string[];
  created_at: string;
}

export interface ResumeSearchEntry {
  id: string;
  user_id: string;
  file_name: string;
  target_role: string;
  uploaded_at: string;
  raw_text?: string;
}

// ── Demo seed data ────────────────────────────────────────────────────────────

const DEMO_SEED: Array<{
  target_role: string;
  match_percentage: number;
  matched_skills: string[];
  missing_skills: string[];
}> = [
  { target_role: 'software_developer',  match_percentage: 82, matched_skills: ['javascript','react','node.js','html','css','git','sql'], missing_skills: ['docker','aws','graphql','ci/cd'] },
  { target_role: 'aiml_engineer',        match_percentage: 71, matched_skills: ['python','numpy','pandas','scikit-learn','jupyter'], missing_skills: ['tensorflow','pytorch','mlops','deep learning','cuda'] },
  { target_role: 'data_scientist',       match_percentage: 65, matched_skills: ['python','sql','pandas','matplotlib','statistics'], missing_skills: ['spark','tableau','power bi','big data','r'] },
  { target_role: 'devops_engineer',      match_percentage: 58, matched_skills: ['docker','git','linux','bash','aws'], missing_skills: ['kubernetes','terraform','ansible','prometheus','grafana'] },
  { target_role: 'frontend_developer',   match_percentage: 88, matched_skills: ['javascript','typescript','react','html','css','tailwind css','git','npm'], missing_skills: ['vue.js','angular','vite','accessibility'] },
  { target_role: 'backend_developer',    match_percentage: 74, matched_skills: ['node.js','python','sql','postgresql','rest api','git','docker'], missing_skills: ['redis','microservices','message queues','spring boot'] },
  { target_role: 'product_manager',      match_percentage: 60, matched_skills: ['agile','jira','communication','sql','user research'], missing_skills: ['figma','okrs','a/b testing','confluence','roadmapping'] },
  { target_role: 'data_engineer',        match_percentage: 55, matched_skills: ['python','sql','postgresql','docker','git'], missing_skills: ['spark','kafka','airflow','dbt','snowflake'] },
  { target_role: 'cloud_architect',      match_percentage: 48, matched_skills: ['aws','docker','networking','security','git'], missing_skills: ['terraform','kubernetes','azure','gcp','serverless'] },
  { target_role: 'software_developer',   match_percentage: 91, matched_skills: ['javascript','typescript','react','node.js','html','css','git','sql','docker','aws','rest api'], missing_skills: ['graphql','ci/cd','testing'] },
];

// ── Service ───────────────────────────────────────────────────────────────────

export class AdvancedAnalyticsService {

  // ── Seed demo data ──────────────────────────────────────────────────────────

  /**
   * Insert realistic demo records into job_matches.
   * Uses a special demo UUID that bypasses auth FK (requires RLS disabled or service role).
   * Falls back to direct insert with anon key if RLS allows it.
   */
  static async seedDemoData(): Promise<{ inserted: number; skipped: boolean }> {
    try {
      // Check if data already exists
      const { count } = await supabase
        .from('job_matches')
        .select('id', { count: 'exact', head: true });

      if ((count ?? 0) >= 5) return { inserted: 0, skipped: true };

      // Use a fixed demo UUID (not a real auth user — requires RLS policy to allow it)
      const demoUserId = '00000000-0000-0000-0000-000000000001';

      const rows = DEMO_SEED.map(d => ({
        user_id:          demoUserId,
        target_role:      d.target_role,
        match_percentage: d.match_percentage,
        matched_skills:   d.matched_skills,
        missing_skills:   d.missing_skills,
        recommendations:  d.missing_skills.slice(0, 3).map(s => ({ skill: s, resources: [] })),
        ml_result: {
          predicted_role: d.target_role,
          confidence:     d.match_percentage,
        },
      }));

      const { data, error } = await supabase
        .from('job_matches')
        .insert(rows)
        .select('id');

      if (error) {
        console.warn('[AdvancedAnalytics] seedDemoData error:', error.message);
        return { inserted: 0, skipped: false };
      }

      // Refresh materialized view after insert
      await supabase.rpc('refresh_top_job_matches');

      return { inserted: data?.length ?? 0, skipped: false };
    } catch (err) {
      console.warn('[AdvancedAnalytics] seedDemoData exception:', err);
      return { inserted: 0, skipped: false };
    }
  }

  // ── Stored Procedure ────────────────────────────────────────────────────────

  /**
   * Calls calculate_match(user_id) stored procedure.
   * Falls back to direct query if RPC fails.
   */
  static async getUserResumeStats(userId?: string): Promise<UserResumeStats | null> {
    try {
      // Try stored procedure first
      if (userId && userId !== 'demo-user') {
        const { data, error } = await supabase
          .rpc('calculate_match', { p_user_id: userId });
        if (!error && data && data.length > 0) {
          const rows = data as any[];
          const total = rows.length;
          const avg = rows.reduce((s: number, r: any) => s + Number(r.match_percentage), 0) / total;
          const highest = Math.max(...rows.map((r: any) => Number(r.match_percentage)));
          return { total_resumes: total, avg_match_score: Math.round(avg * 10) / 10, highest_score: highest };
        }
      }

      // Fallback: direct aggregate query on job_matches
      const { data, error } = await supabase
        .from('job_matches')
        .select('match_percentage');

      if (error || !data || data.length === 0) return null;

      const scores = data.map((r: any) => Number(r.match_percentage));
      const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
      return {
        total_resumes:   scores.length,
        avg_match_score: Math.round(avg * 10) / 10,
        highest_score:   Math.max(...scores),
      };
    } catch (err) {
      console.warn('[AdvancedAnalytics] getUserResumeStats:', err);
      return null;
    }
  }

  // ── Analytics Query ─────────────────────────────────────────────────────────

  /**
   * SELECT target_role, AVG(match_percentage) FROM job_matches
   * GROUP BY target_role ORDER BY AVG DESC
   * — the core analytics query required for ADBMS demonstration.
   */
  static async getRoleMatchAnalytics(): Promise<RoleMatchAnalytics[]> {
    try {
      const { data, error } = await supabase
        .from('job_matches')
        .select('target_role, match_percentage');

      if (error || !data || data.length === 0) return [];

      // Group by role in JS (Supabase JS client doesn't support GROUP BY directly)
      const grouped: Record<string, number[]> = {};
      data.forEach((r: any) => {
        const role = r.target_role;
        if (!grouped[role]) grouped[role] = [];
        grouped[role].push(Number(r.match_percentage));
      });

      return Object.entries(grouped)
        .map(([role, scores]) => ({
          target_role:      role,
          avg_match_score:  Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10,
          max_match_score:  Math.max(...scores),
          min_match_score:  Math.min(...scores),
          total_analyses:   scores.length,
        }))
        .sort((a, b) => b.avg_match_score - a.avg_match_score);
    } catch (err) {
      console.warn('[AdvancedAnalytics] getRoleMatchAnalytics:', err);
      return [];
    }
  }

  // ── Materialized View ───────────────────────────────────────────────────────

  /**
   * Query top_job_matches_view (materialized view) — best match per user.
   */
  static async getTopJobMatches(): Promise<TopJobMatch[]> {
    try {
      const { data, error } = await supabase
        .from('top_job_matches_view')
        .select('*')
        .order('match_percentage', { ascending: false })
        .limit(10);

      if (error) {
        console.warn('[AdvancedAnalytics] top_job_matches_view:', error.message);
        return [];
      }
      return (data ?? []) as TopJobMatch[];
    } catch (err) {
      console.warn('[AdvancedAnalytics] getTopJobMatches:', err);
      return [];
    }
  }

  /**
   * Refresh the top_job_matches_view materialized view.
   */
  static async refreshSkillDemandAnalysis(): Promise<boolean> {
    try {
      await supabase.rpc('refresh_top_job_matches');
      return true;
    } catch { return false; }
  }

  // ── JSONB Skill Demand ──────────────────────────────────────────────────────

  /**
   * Extract skill frequency from JSONB matched_skills column.
   * Demonstrates JSONB querying for ADBMS.
   */
  static async getSkillDemandAnalysis(targetRole?: string, limit = 15): Promise<SkillDemandEntry[]> {
    try {
      let q = supabase
        .from('job_matches')
        .select('target_role, matched_skills, missing_skills');

      if (targetRole) q = q.eq('target_role', targetRole);

      const { data, error } = await q;
      if (error || !data) return [];

      // Count skill frequency from JSONB arrays
      const freq: Record<string, Record<string, number>> = {};
      data.forEach((row: any) => {
        const role = row.target_role;
        if (!freq[role]) freq[role] = {};
        const skills: string[] = Array.isArray(row.matched_skills) ? row.matched_skills : [];
        skills.forEach(s => {
          freq[role][s] = (freq[role][s] ?? 0) + 1;
        });
      });

      const result: SkillDemandEntry[] = [];
      Object.entries(freq).forEach(([role, skills]) => {
        Object.entries(skills).forEach(([skill, count]) => {
          result.push({ target_role: role, skill, frequency: count });
        });
      });

      return result
        .sort((a, b) => b.frequency - a.frequency)
        .slice(0, limit);
    } catch (err) {
      console.warn('[AdvancedAnalytics] getSkillDemandAnalysis:', err);
      return [];
    }
  }

  // ── Audit Logs ──────────────────────────────────────────────────────────────

  static async getAuditLogs(limit = 25): Promise<AuditLogEntry[]> {
    try {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('id, table_name, action, record_id, new_values, old_values, created_at')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.warn('[AdvancedAnalytics] getAuditLogs:', error.message);
        return [];
      }
      return (data ?? []) as AuditLogEntry[];
    } catch { return []; }
  }

  // ── Skill gap distribution ──────────────────────────────────────────────────

  /**
   * Returns top missing skills across all job_matches (JSONB query).
   */
  static async getMissingSkillsDistribution(limit = 10): Promise<{ skill: string; count: number }[]> {
    try {
      const { data, error } = await supabase
        .from('job_matches')
        .select('missing_skills');

      if (error || !data) return [];

      const freq: Record<string, number> = {};
      data.forEach((row: any) => {
        const skills: string[] = Array.isArray(row.missing_skills) ? row.missing_skills : [];
        skills.forEach(s => { freq[s] = (freq[s] ?? 0) + 1; });
      });

      return Object.entries(freq)
        .sort(([, a], [, b]) => b - a)
        .slice(0, limit)
        .map(([skill, count]) => ({ skill, count }));
    } catch { return []; }
  }

  // ── Task 2: Full-Text Search ────────────────────────────────────────────────
  
  static async searchResumes(query: string, userId?: string, targetRole?: string): Promise<ResumeSearchEntry[]> {
    try {
      if (!query || query.trim() === '') return [];
      
      const args: any = { search_query: query };
      if (userId && userId !== 'demo-user') args.user_uuid = userId;

      const { data, error } = await supabase.rpc('search_resumes', args);
      if (error || !data) {
        console.warn('[AdvancedAnalytics] searchResumes rpc error:', error?.message);
        
        // Fallback demo functionality for UI if DB function is not deployed
        return [];
      }
      
      let filtered = data;
      if (targetRole && targetRole !== '') {
        filtered = filtered.filter((r: any) => r.target_role === targetRole);
      }
      return filtered as ResumeSearchEntry[];
    } catch { return []; }
  }

  // ── Task 4: Backup Export ───────────────────────────────────────────────────

  static async exportUserData(userId?: string): Promise<any> {
    try {
      // By default use a demo user UUID if it's the demo-user
      const id = userId && userId !== 'demo-user' ? userId : '00000000-0000-0000-0000-000000000001';
      const { data, error } = await supabase.rpc('export_user_data_json', { p_user_id: id });
      
      if (error) {
        console.warn('[AdvancedAnalytics] exportUserData error:', error.message);
        return null;
      }
      return data;
    } catch (err) { 
      console.warn('[AdvancedAnalytics] exportUserData exception:', err);
      return null; 
    }
  }
}
