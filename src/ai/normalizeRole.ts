/**
 * Normalizes any human-readable role string to a skill database key.
 * Ensures calculateSkillMatch() always receives a valid key.
 */

import { skillDatabase } from '../data/skills';

/**
 * Maps a free-form role string to a valid skillDatabase key.
 * Falls back to 'software_developer' if no match is found.
 */
export function normalizeRole(role: string): string {
  if (!role || !role.trim()) return 'software_developer';

  // If it's already a valid key, return as-is
  if (role in skillDatabase) return role;

  const r = role.toLowerCase();

  if (r.includes('product')) return 'product_manager';
  if (r.includes('devops') || r.includes('site reliability') || r.includes('sre') || r.includes('cloud')) return 'devops_engineer';
  if (r.includes('data scientist') || r.includes('data science')) return 'data_scientist';
  if (r.includes('machine learning') || r.includes('ml engineer') || r.includes('ai engineer') || r.includes('aiml')) return 'aiml_engineer';
  if (r.includes('data')) return 'data_scientist';
  if (r.includes('ai') || r.includes('ml')) return 'aiml_engineer';
  if (r.includes('frontend') || r.includes('front-end') || r.includes('front end')) return 'software_developer';
  if (r.includes('backend') || r.includes('back-end') || r.includes('back end')) return 'software_developer';
  if (r.includes('fullstack') || r.includes('full stack') || r.includes('full-stack')) return 'software_developer';
  if (r.includes('software') || r.includes('developer') || r.includes('engineer') || r.includes('programmer')) return 'software_developer';

  return 'software_developer';
}
