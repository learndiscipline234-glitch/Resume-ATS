/**
 * Mock Job Dataset
 * Sample job postings for recommendation system
 */

export interface JobPosting {
  jobId: string;
  title: string;
  company: string;
  location: string;
  salaryRange: {
    min: number;
    max: number;
    currency: string;
    period: 'annual' | 'monthly';
  };
  requiredSkills: string[];
  experienceLevel: string;
  description: string;
  postedDate: string;
  applyUrl?: string;
}

export const jobsDataset: JobPosting[] = [
  // Software Developer Jobs
  {
    jobId: 'job-001',
    title: 'Full Stack Developer',
    company: 'Amazon',
    location: 'Seattle, WA',
    salaryRange: { min: 120000, max: 180000, currency: 'USD', period: 'annual' },
    requiredSkills: ['React', 'Node.js', 'JavaScript', 'TypeScript', 'AWS', 'Docker'],
    experienceLevel: 'Mid Level',
    description: 'Build scalable web applications for Amazon retail platform',
    postedDate: '2024-01-15',
    applyUrl: 'https://amazon.jobs',
  },
  {
    jobId: 'job-002',
    title: 'Frontend Developer',
    company: 'Google',
    location: 'Mountain View, CA',
    salaryRange: { min: 130000, max: 200000, currency: 'USD', period: 'annual' },
    requiredSkills: ['React', 'TypeScript', 'HTML', 'CSS', 'JavaScript', 'Redux'],
    experienceLevel: 'Mid Level',
    description: 'Create beautiful user interfaces for Google products',
    postedDate: '2024-01-20',
    applyUrl: 'https://careers.google.com',
  },
  {
    jobId: 'job-003',
    title: 'Backend Engineer',
    company: 'Microsoft',
    location: 'Redmond, WA',
    salaryRange: { min: 125000, max: 190000, currency: 'USD', period: 'annual' },
    requiredSkills: ['Node.js', 'Python', 'PostgreSQL', 'Docker', 'Kubernetes', 'Azure'],
    experienceLevel: 'Senior',
    description: 'Design and implement backend services for Azure platform',
    postedDate: '2024-01-18',
    applyUrl: 'https://careers.microsoft.com',
  },
  {
    jobId: 'job-004',
    title: 'Software Engineer',
    company: 'Meta',
    location: 'Menlo Park, CA',
    salaryRange: { min: 140000, max: 210000, currency: 'USD', period: 'annual' },
    requiredSkills: ['React', 'JavaScript', 'Python', 'GraphQL', 'Git', 'REST API'],
    experienceLevel: 'Mid Level',
    description: 'Build features for Facebook and Instagram platforms',
    postedDate: '2024-01-22',
    applyUrl: 'https://metacareers.com',
  },
  {
    jobId: 'job-005',
    title: 'Junior Web Developer',
    company: 'Shopify',
    location: 'Ottawa, Canada',
    salaryRange: { min: 70000, max: 95000, currency: 'CAD', period: 'annual' },
    requiredSkills: ['HTML', 'CSS', 'JavaScript', 'React', 'Git'],
    experienceLevel: 'Entry Level',
    description: 'Join our team building e-commerce solutions',
    postedDate: '2024-01-25',
    applyUrl: 'https://shopify.com/careers',
  },
  {
    jobId: 'job-006',
    title: 'DevOps Engineer',
    company: 'Netflix',
    location: 'Los Gatos, CA',
    salaryRange: { min: 135000, max: 205000, currency: 'USD', period: 'annual' },
    requiredSkills: ['Docker', 'Kubernetes', 'AWS', 'Python', 'Terraform', 'CI/CD'],
    experienceLevel: 'Senior',
    description: 'Manage infrastructure for Netflix streaming platform',
    postedDate: '2024-01-19',
    applyUrl: 'https://jobs.netflix.com',
  },
  {
    jobId: 'job-007',
    title: 'React Developer',
    company: 'Airbnb',
    location: 'San Francisco, CA',
    salaryRange: { min: 125000, max: 185000, currency: 'USD', period: 'annual' },
    requiredSkills: ['React', 'JavaScript', 'TypeScript', 'Redux', 'HTML', 'CSS'],
    experienceLevel: 'Mid Level',
    description: 'Build the future of travel with React',
    postedDate: '2024-01-21',
    applyUrl: 'https://careers.airbnb.com',
  },
  {
    jobId: 'job-008',
    title: 'Full Stack Engineer',
    company: 'Stripe',
    location: 'Remote',
    salaryRange: { min: 130000, max: 195000, currency: 'USD', period: 'annual' },
    requiredSkills: ['React', 'Node.js', 'TypeScript', 'PostgreSQL', 'REST API', 'Git'],
    experienceLevel: 'Mid Level',
    description: 'Build payment infrastructure for the internet',
    postedDate: '2024-01-23',
    applyUrl: 'https://stripe.com/jobs',
  },

  // AI/ML Engineer Jobs
  {
    jobId: 'job-009',
    title: 'Machine Learning Engineer',
    company: 'OpenAI',
    location: 'San Francisco, CA',
    salaryRange: { min: 150000, max: 250000, currency: 'USD', period: 'annual' },
    requiredSkills: ['Python', 'TensorFlow', 'PyTorch', 'Machine Learning', 'Deep Learning', 'NLP'],
    experienceLevel: 'Senior',
    description: 'Develop cutting-edge AI models',
    postedDate: '2024-01-17',
    applyUrl: 'https://openai.com/careers',
  },
  {
    jobId: 'job-010',
    title: 'AI Research Scientist',
    company: 'DeepMind',
    location: 'London, UK',
    salaryRange: { min: 120000, max: 200000, currency: 'GBP', period: 'annual' },
    requiredSkills: ['Python', 'TensorFlow', 'PyTorch', 'Deep Learning', 'Research', 'Mathematics'],
    experienceLevel: 'Senior',
    description: 'Advance the state of AI research',
    postedDate: '2024-01-16',
    applyUrl: 'https://deepmind.com/careers',
  },
  {
    jobId: 'job-011',
    title: 'ML Engineer',
    company: 'Tesla',
    location: 'Palo Alto, CA',
    salaryRange: { min: 140000, max: 220000, currency: 'USD', period: 'annual' },
    requiredSkills: ['Python', 'TensorFlow', 'Computer Vision', 'Deep Learning', 'C++'],
    experienceLevel: 'Mid Level',
    description: 'Build autonomous driving systems',
    postedDate: '2024-01-24',
    applyUrl: 'https://tesla.com/careers',
  },
  {
    jobId: 'job-012',
    title: 'Data Scientist',
    company: 'Uber',
    location: 'San Francisco, CA',
    salaryRange: { min: 130000, max: 190000, currency: 'USD', period: 'annual' },
    requiredSkills: ['Python', 'Machine Learning', 'SQL', 'Statistics', 'Data Analysis'],
    experienceLevel: 'Mid Level',
    description: 'Analyze data to improve rider experience',
    postedDate: '2024-01-20',
    applyUrl: 'https://uber.com/careers',
  },
];

// Export helper functions
export function getJobsByRole(role: string): JobPosting[] {
  const roleKeywords: Record<string, string[]> = {
    'Software Developer': ['developer', 'engineer', 'software', 'web', 'full stack', 'frontend', 'backend'],
    'AI/ML Engineer': ['machine learning', 'ml engineer', 'ai', 'data scientist'],
  };

  const keywords = roleKeywords[role] || [];
  
  return jobsDataset.filter(job => 
    keywords.some(keyword => job.title.toLowerCase().includes(keyword))
  );
}

export function getJobById(jobId: string): JobPosting | undefined {
  return jobsDataset.find(job => job.jobId === jobId);
}

export function getAllJobs(): JobPosting[] {
  return jobsDataset;
}
