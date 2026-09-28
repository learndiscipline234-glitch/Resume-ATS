import { JobRecommendation, SkillGap, SkillMatch } from '../types';
import { jobsDataset, getJobsByRole } from '../../data/jobsDataset';

/**
 * Job Recommender Service
 * Generates personalized job recommendations based on user skills
 */

export class JobRecommender {
  private readonly MIN_MATCH_THRESHOLD = 50; // Minimum 50% match

  /**
   * Generate job recommendations for user
   */
  generateJobRecommendations(
    userSkills: string[],
    targetRole: string,
    skillMatch: SkillMatch,
    limit: number = 10
  ): JobRecommendation[] {
    // Get jobs for target role
    const jobs = getJobsByRole(targetRole);

    if (jobs.length === 0) {
      // Fallback to all jobs if no role-specific jobs found
      return this.generateRecommendationsFromAllJobs(userSkills, limit);
    }

    // Calculate match score for each job
    const recommendations: JobRecommendation[] = jobs.map(job => {
      const matchScore = this.calculateJobMatchScore(userSkills, job.requiredSkills);
      const skillGaps = this.identifySkillGaps(userSkills, job.requiredSkills);

      return {
        jobId: job.jobId,
        title: job.title,
        company: job.company,
        location: job.location,
        salaryRange: job.salaryRange,
        requiredSkills: job.requiredSkills,
        matchScore,
        skillGaps,
        description: job.description,
        experienceLevel: job.experienceLevel,
        postedDate: job.postedDate,
        applyUrl: job.applyUrl,
      };
    });

    // Filter by minimum match threshold
    const filteredRecommendations = recommendations.filter(
      rec => rec.matchScore >= this.MIN_MATCH_THRESHOLD
    );

    // Sort by match score (descending)
    filteredRecommendations.sort((a, b) => b.matchScore - a.matchScore);

    // Return top N recommendations
    return filteredRecommendations.slice(0, limit);
  }

  /**
   * Generate recommendations from all jobs (fallback)
   */
  private generateRecommendationsFromAllJobs(
    userSkills: string[],
    limit: number
  ): JobRecommendation[] {
    const recommendations: JobRecommendation[] = jobsDataset.map(job => {
      const matchScore = this.calculateJobMatchScore(userSkills, job.requiredSkills);
      const skillGaps = this.identifySkillGaps(userSkills, job.requiredSkills);

      return {
        jobId: job.jobId,
        title: job.title,
        company: job.company,
        location: job.location,
        salaryRange: job.salaryRange,
        requiredSkills: job.requiredSkills,
        matchScore,
        skillGaps,
        description: job.description,
        experienceLevel: job.experienceLevel,
        postedDate: job.postedDate,
        applyUrl: job.applyUrl,
      };
    });

    // Filter and sort
    const filteredRecommendations = recommendations.filter(
      rec => rec.matchScore >= this.MIN_MATCH_THRESHOLD
    );
    filteredRecommendations.sort((a, b) => b.matchScore - a.matchScore);

    return filteredRecommendations.slice(0, limit);
  }

  /**
   * Calculate match score between user skills and job requirements
   */
  private calculateJobMatchScore(
    userSkills: string[],
    requiredSkills: string[]
  ): number {
    if (requiredSkills.length === 0) return 0;

    // Normalize skills for comparison
    const normalizedUserSkills = new Set(
      userSkills.map(skill => skill.toLowerCase().trim())
    );

    // Count matching skills
    let matchedCount = 0;
    requiredSkills.forEach(requiredSkill => {
      const normalized = requiredSkill.toLowerCase().trim();
      if (normalizedUserSkills.has(normalized)) {
        matchedCount++;
      }
    });

    // Calculate percentage
    return Math.round((matchedCount / requiredSkills.length) * 100);
  }

  /**
   * Identify skill gaps for a job
   */
  private identifySkillGaps(
    userSkills: string[],
    requiredSkills: string[]
  ): SkillGap[] {
    const normalizedUserSkills = new Set(
      userSkills.map(skill => skill.toLowerCase().trim())
    );

    const gaps: SkillGap[] = [];

    requiredSkills.forEach((requiredSkill, index) => {
      const normalized = requiredSkill.toLowerCase().trim();
      
      if (!normalizedUserSkills.has(normalized)) {
        // Determine importance based on position in requirements list
        let importance: 'critical' | 'important' | 'nice-to-have';
        if (index < 3) {
          importance = 'critical';
        } else if (index < 6) {
          importance = 'important';
        } else {
          importance = 'nice-to-have';
        }

        gaps.push({
          skill: requiredSkill,
          importance,
          learningResources: this.getLearningResources(requiredSkill),
        });
      }
    });

    return gaps;
  }

  /**
   * Get learning resources for a skill
   */
  private getLearningResources(skill: string): any[] {
    // Mock learning resources
    const resources: Record<string, any[]> = {
      'React': [
        {
          title: 'React Official Documentation',
          url: 'https://react.dev',
          type: 'documentation',
          estimatedTime: '10 hours',
        },
        {
          title: 'React - The Complete Guide',
          url: 'https://udemy.com/react-complete-guide',
          type: 'course',
          estimatedTime: '40 hours',
        },
      ],
      'Node.js': [
        {
          title: 'Node.js Official Docs',
          url: 'https://nodejs.org/docs',
          type: 'documentation',
          estimatedTime: '8 hours',
        },
        {
          title: 'Node.js Developer Course',
          url: 'https://udemy.com/nodejs-course',
          type: 'course',
          estimatedTime: '35 hours',
        },
      ],
      'Python': [
        {
          title: 'Python Official Tutorial',
          url: 'https://docs.python.org/tutorial',
          type: 'documentation',
          estimatedTime: '12 hours',
        },
        {
          title: 'Python for Everybody',
          url: 'https://coursera.org/python',
          type: 'course',
          estimatedTime: '30 hours',
        },
      ],
      'Docker': [
        {
          title: 'Docker Official Documentation',
          url: 'https://docs.docker.com',
          type: 'documentation',
          estimatedTime: '6 hours',
        },
      ],
      'AWS': [
        {
          title: 'AWS Training',
          url: 'https://aws.amazon.com/training',
          type: 'course',
          estimatedTime: '50 hours',
        },
      ],
    };

    return resources[skill] || [
      {
        title: `Learn ${skill}`,
        url: `https://google.com/search?q=learn+${encodeURIComponent(skill)}`,
        type: 'tutorial',
        estimatedTime: '20 hours',
      },
    ];
  }

  /**
   * Filter recommendations by location
   */
  filterByLocation(
    recommendations: JobRecommendation[],
    location: string
  ): JobRecommendation[] {
    const lowerLocation = location.toLowerCase();
    return recommendations.filter(rec =>
      rec.location.toLowerCase().includes(lowerLocation) ||
      rec.location.toLowerCase() === 'remote'
    );
  }

  /**
   * Filter recommendations by salary range
   */
  filterBySalary(
    recommendations: JobRecommendation[],
    minSalary: number
  ): JobRecommendation[] {
    return recommendations.filter(rec => rec.salaryRange.min >= minSalary);
  }

  /**
   * Filter recommendations by experience level
   */
  filterByExperience(
    recommendations: JobRecommendation[],
    experienceLevel: string
  ): JobRecommendation[] {
    return recommendations.filter(rec =>
      rec.experienceLevel.toLowerCase() === experienceLevel.toLowerCase()
    );
  }

  /**
   * Get recommendations with no skill gaps (perfect matches)
   */
  getPerfectMatches(recommendations: JobRecommendation[]): JobRecommendation[] {
    return recommendations.filter(rec => rec.skillGaps.length === 0);
  }

  /**
   * Get recommendations with minimal skill gaps
   */
  getCloseMatches(recommendations: JobRecommendation[]): JobRecommendation[] {
    return recommendations.filter(rec => rec.skillGaps.length <= 2);
  }

  /**
   * Get top companies from recommendations
   */
  getTopCompanies(recommendations: JobRecommendation[], limit: number = 5): string[] {
    const companies = new Set<string>();
    recommendations.forEach(rec => companies.add(rec.company));
    return Array.from(companies).slice(0, limit);
  }

  /**
   * Calculate average match score
   */
  getAverageMatchScore(recommendations: JobRecommendation[]): number {
    if (recommendations.length === 0) return 0;
    
    const total = recommendations.reduce((sum, rec) => sum + rec.matchScore, 0);
    return Math.round(total / recommendations.length);
  }
}

// Export singleton instance
export const jobRecommender = new JobRecommender();
