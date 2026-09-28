/**
 * Skill Database Index
 * Central export for all role skill sets
 */

import { softwareDeveloperSkillSet } from './softwareDeveloper';
import { aimlEngineerSkillSet } from './aimlEngineer';
import { dataScientistSkillSet } from './dataScientist';
import { devopsEngineerSkillSet } from './devopsEngineer';
import { productManagerSkillSet } from './productManager';
import { RoleSkillSet } from '../../ai/types';

// Export individual skill sets
export { softwareDeveloperSkillSet } from './softwareDeveloper';
export { aimlEngineerSkillSet } from './aimlEngineer';
export { dataScientistSkillSet } from './dataScientist';
export { devopsEngineerSkillSet } from './devopsEngineer';
export { productManagerSkillSet } from './productManager';

// Skill database map
export const skillDatabase: Record<string, RoleSkillSet> = {
  software_developer: softwareDeveloperSkillSet,
  aiml_engineer: aimlEngineerSkillSet,
  data_scientist: dataScientistSkillSet,
  devops_engineer: devopsEngineerSkillSet,
  product_manager: productManagerSkillSet,
};

// Helper functions
export function getSkillsByRole(role: string): RoleSkillSet | undefined {
  return skillDatabase[role];
}

export function getAllRoles(): string[] {
  return Object.keys(skillDatabase);
}

export function getRoleDisplayName(role: string): string {
  return skillDatabase[role]?.displayName || role;
}
