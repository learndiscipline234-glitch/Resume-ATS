/**
 * Edge Function Service
 * All AI-powered API calls go through Supabase Edge Functions (server-side).
 * No API keys are ever exposed to the frontend.
 */

import { supabase } from '@/integrations/supabase/client';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface SkillAnalysis {
  user_skills: Array<{ name: string; confidence: number }>;
  suggested_skills: Array<{ name: string; priority: 'high' | 'medium' | 'low'; reason: string; recommended_action: string }>;
  skills_chart: Array<{ name: string; score: number }>;
  top_recommendations: Array<{ title: string; details: string; impact: 'low' | 'medium' | 'high' }>;
  resume_elevator_pitch: string;
  suggested_keywords: string[];
  summary_text: string;
  metadata: { model_confidence: number };
}

export interface PlacementPrediction {
  placementPercentage: number;
  confidence: number;
  keyFactors: Array<{ factor: string; impact: 'positive' | 'negative'; weight: number }>;
  skillGaps: Array<{ skill: string; importance: 'critical' | 'important' | 'nice-to-have'; learningEffort: string }>;
  recommendations: Array<{ title: string; details: string; priority: 'high' | 'medium' | 'low' }>;
  estimatedSalary: { min: number; max: number; currency: string } | null;
  summaryText: string;
  metadata: { modelConfidence: number };
}

export interface EdgeFunctionError {
  error: string;
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function isEdgeFunctionError(result: any): result is EdgeFunctionError {
  return result && typeof result.error === 'string';
}

// ── Analyze Resume ────────────────────────────────────────────────────────────

export async function analyzeResume(
  resumeText: string,
  targetRole?: string
): Promise<SkillAnalysis> {
  const { data, error } = await supabase.functions.invoke('analyze-resume', {
    body: { resumeText, targetRole },
  });

  if (error) {
    throw new Error(`Resume analysis failed: ${error.message}`);
  }

  if (isEdgeFunctionError(data)) {
    throw new Error(`Resume analysis failed: ${data.error}`);
  }

  return data.data as SkillAnalysis;
}

// ── Predict Placement ─────────────────────────────────────────────────────────

export interface PlacementInput {
  skills?: string[];
  gpa?: number;
  experienceYears?: number;
  projects?: number;
  education?: string;
  targetRole?: string;
  certifications?: string[];
}

// ── Career Chat ──────────────────────────────────────────────────────────────

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface CareerChatContext {
  skills?: string[];
  targetRole?: string;
  experienceYears?: number;
  resumeSummary?: string;
}

export async function careerChat(
  message: string,
  history?: ChatMessage[],
  context?: CareerChatContext
): Promise<string> {
  const { data, error } = await supabase.functions.invoke('career-chat', {
    body: { message, history, context },
  });

  if (error) {
    throw new Error(`Career chat failed: ${error.message}`);
  }

  if (isEdgeFunctionError(data)) {
    throw new Error(`Career chat failed: ${data.error}`);
  }

  return data.reply as string;
}

// ── Predict Placement ─────────────────────────────────────────────────────────

export async function predictPlacement(
  input: PlacementInput
): Promise<PlacementPrediction> {
  const { data, error } = await supabase.functions.invoke('predict-placement', {
    body: input,
  });

  if (error) {
    throw new Error(`Placement prediction failed: ${error.message}`);
  }

  if (isEdgeFunctionError(data)) {
    throw new Error(`Placement prediction failed: ${data.error}`);
  }

  return data.data as PlacementPrediction;
}
