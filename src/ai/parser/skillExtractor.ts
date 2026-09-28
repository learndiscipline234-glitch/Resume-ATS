import compromise from 'compromise';
import { skillDatabase } from '../../data/skills';
import { SkillData } from '../types';

export class SkillExtractor {
  private allSkills: Map<string, { role: string; skill: SkillData }>;
  constructor() { this.allSkills = this.buildSkillsMap(); }
  private buildSkillsMap(): Map<string, { role: string; skill: SkillData }> {
    const skillsMap = new Map<string, { role: string; skill: SkillData }>();
    Object.entries(skillDatabase).forEach(([role, skillSet]) => {
      skillSet.skills.forEach(skill => {
        skillsMap.set(skill.name.toLowerCase(), { role, skill });
        skill.aliases?.forEach(alias => skillsMap.set(alias.toLowerCase(), { role, skill }));
      });
    });
    return skillsMap;
  }
  extractSkills(text: string, targetRole?: string): string[] {
    const extractedSkills = new Set<string>();
    this.extractByKeywords(text).forEach(skill => extractedSkills.add(skill));
    this.extractByNLP(text).forEach(skill => extractedSkills.add(skill));
    this.extractByContext(text).forEach(skill => extractedSkills.add(skill));
    return targetRole ? this.filterByRole(Array.from(extractedSkills), targetRole) : Array.from(extractedSkills);
  }
  private extractByKeywords(text: string): string[] {
    const skills: string[] = [];
    const lowerText = text.toLowerCase();
    this.allSkills.forEach((value, skillName) => {
      if (lowerText.includes(skillName)) {
        skills.push(value.skill.name);
      }
    });
    return skills;
  }
  private extractByNLP(text: string): string[] {
    const skills: string[] = [];
    const doc = compromise(text);
    [...doc.nouns().out('array'), ...doc.terms().out('array')].forEach(term => {
      const lowerTerm = term.toLowerCase();
      const skillData = this.allSkills.get(lowerTerm);
      if (skillData) skills.push(skillData.skill.name);
    });
    return skills;
  }
  private extractByContext(text: string): string[] {
    const skills: string[] = [];
    const lines = text.split('\n');
    let inSkillSection = false;
    for (const line of lines) {
      const lowerLine = line.toLowerCase().trim();
      if (['skills', 'technical skills', 'technologies', 'tools', 'expertise'].some(k => lowerLine.includes(k))) {
        inSkillSection = true;
      } else if (inSkillSection && ['experience', 'education', 'projects', 'certifications'].some(s => lowerLine.includes(s))) {
        inSkillSection = false;
      }
      if (inSkillSection) {
        line.split(/[,;|•·\n]/).forEach(token => {
          const cleaned = token.trim().toLowerCase();
          const skillData = this.allSkills.get(cleaned);
          if (skillData) skills.push(skillData.skill.name);
        });
      }
    }
    return skills;
  }
  private filterByRole(skills: string[], targetRole: string): string[] {
    const roleSkillSet = skillDatabase[targetRole];
    if (!roleSkillSet) return skills;
    const roleSkillNames = new Set(roleSkillSet.skills.map(s => s.name));
    return skills.filter(skill => roleSkillNames.has(skill));
  }
  getSkillDetails(skillName: string): SkillData | undefined {
    return this.allSkills.get(skillName.toLowerCase())?.skill;
  }
  calculateConfidence(text: string, extractedSkills: string[]): number {
    if (extractedSkills.length === 0) return 0;
    let confidenceScore = 0;
    extractedSkills.forEach(skill => {
      if (text.toLowerCase().includes(skill.toLowerCase())) confidenceScore += 0.4;
    });
    return Math.min(confidenceScore / extractedSkills.length, 1);
  }
  private isInSkillSection(text: string, skill: string): boolean {
    return text.toLowerCase().includes(skill.toLowerCase());
  }
}
export const skillExtractor = new SkillExtractor();