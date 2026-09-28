/**
 * ML + Soft Computing Skill Analyzer
 *
 * Pipeline:
 * 1. Extract skills from resume text (aggressive multi-pass matching)
 * 2. Fuzzy match extracted skills against weighted role requirements
 * 3. Calculate ml_score, fuzzy_score, final_score = 0.7*ML + 0.3*Fuzzy
 */

import { getDataset, JobRoleEntry } from './rolePredictor';
import { fuzzySkillMatch, WeightedSkill, FuzzyMatchResult } from './fuzzyMatcher';
import { getResourcesForSkill } from '../../data/learningResources';

export interface SkillRecommendation {
  skill: string;
  resources: {
    type: 'free' | 'paid';
    title: string;
    url: string;
    platform: string;
  }[];
}

export interface SkillAnalysisResult {
  extractedSkills:  string[];
  matchedSkills:    string[];
  missingSkills:    string[];
  matchPercentage:  number;
  recommendations:  SkillRecommendation[];
  partialSkills:    Array<{ skill: string; similarity: number; matchedTo: string }>;
  mlScore:          number;
  fuzzyScore:       number;
  weightedScore:    number;
  finalScore:       number;
  confidence:       number;
}

// ── Alias map: resume variants → canonical dataset name ──────────────────────
// Handles React.js → react, Node.js → node.js, C++ → c++, etc.

const SKILL_ALIASES: Record<string, string[]> = {
  'javascript':       ['javascript', 'js', 'ecmascript', 'es6', 'es2015'],
  'typescript':       ['typescript', 'ts'],
  'python':           ['python', 'python3', 'py'],
  'react':            ['react', 'react.js', 'reactjs', 'react js'],
  'node.js':          ['node.js', 'nodejs', 'node js', 'node'],
  'vue.js':           ['vue.js', 'vuejs', 'vue js', 'vue'],
  'angular':          ['angular', 'angular.js', 'angularjs'],
  'next.js':          ['next.js', 'nextjs', 'next js'],
  'express':          ['express', 'express.js', 'expressjs'],
  'django':           ['django'],
  'flask':            ['flask'],
  'fastapi':          ['fastapi', 'fast api'],
  'spring boot':      ['spring boot', 'springboot', 'spring'],
  'html':             ['html', 'html5'],
  'css':              ['css', 'css3'],
  'sass':             ['sass', 'scss'],
  'tailwind css':     ['tailwind css', 'tailwind', 'tailwindcss'],
  'sql':              ['sql', 'mysql', 'sqlite', 'sqlite3'],
  'postgresql':       ['postgresql', 'postgres', 'psql'],
  'mongodb':          ['mongodb', 'mongo'],
  'redis':            ['redis'],
  'git':              ['git', 'github', 'gitlab', 'version control'],
  'docker':           ['docker', 'containerization', 'containers'],
  'kubernetes':       ['kubernetes', 'k8s'],
  'aws':              ['aws', 'amazon web services', 'amazon aws', 'microsoft azure', 'azure', 'gcp', 'google cloud'],
  'ci/cd':            ['ci/cd', 'cicd', 'continuous integration', 'continuous deployment', 'github actions', 'jenkins'],
  'terraform':        ['terraform'],
  'ansible':          ['ansible'],
  'linux':            ['linux', 'ubuntu', 'unix', 'bash scripting'],
  'bash':             ['bash', 'shell', 'shell scripting'],
  'rest api':         ['rest api', 'restful', 'rest', 'api development', 'restful api'],
  'graphql':          ['graphql'],
  'microservices':    ['microservices', 'micro services'],
  'machine learning': ['machine learning', 'ml', 'supervised learning', 'unsupervised learning'],
  'deep learning':    ['deep learning', 'neural networks', 'neural network'],
  'tensorflow':       ['tensorflow', 'tf'],
  'pytorch':          ['pytorch', 'torch'],
  'scikit-learn':     ['scikit-learn', 'sklearn', 'scikit learn', 'scikit'],
  'numpy':            ['numpy', 'num py'],
  'pandas':           ['pandas'],
  'matplotlib':       ['matplotlib'],
  'seaborn':          ['seaborn'],
  'jupyter':          ['jupyter', 'jupyter notebook', 'ipython'],
  'nlp':              ['nlp', 'natural language processing', 'text processing'],
  'computer vision':  ['computer vision', 'cv', 'image processing', 'opencv'],
  'keras':            ['keras'],
  'mlops':            ['mlops', 'ml ops', 'model deployment', 'model serving'],
  'data preprocessing': ['data preprocessing', 'data cleaning', 'feature extraction', 'data wrangling'],
  'feature engineering': ['feature engineering', 'feature selection'],
  'transformers':     ['transformers', 'huggingface', 'hugging face', 'bert', 'gpt'],
  'llm':              ['llm', 'large language model', 'chatgpt', 'openai', 'langchain'],
  'statistics':       ['statistics', 'statistical analysis', 'probability', 'hypothesis testing'],
  'data visualization': ['data visualization', 'visualization', 'dashboards', 'charts'],
  'tableau':          ['tableau'],
  'power bi':         ['power bi', 'powerbi'],
  'spark':            ['spark', 'apache spark', 'pyspark'],
  'kafka':            ['kafka', 'apache kafka'],
  'airflow':          ['airflow', 'apache airflow'],
  'dbt':              ['dbt', 'data build tool'],
  'snowflake':        ['snowflake'],
  'bigquery':         ['bigquery', 'big query'],
  'etl':              ['etl', 'elt', 'data pipeline', 'data pipelines'],
  'data modeling':    ['data modeling', 'data modelling', 'schema design'],
  'agile':            ['agile', 'scrum', 'kanban', 'sprint'],
  'jira':             ['jira', 'confluence', 'atlassian'],
  'figma':            ['figma', 'ui/ux', 'ux design', 'ui design'],
  'testing':          ['testing', 'unit testing', 'jest', 'pytest', 'tdd', 'test driven'],
  'problem solving':  ['problem solving', 'algorithms', 'data structures', 'dsa', 'leetcode'],
  'communication':    ['communication', 'teamwork', 'collaboration'],
  'product management': ['product management', 'product manager', 'pm'],
  'network security': ['network security', 'cybersecurity', 'cyber security', 'information security'],
  'penetration testing': ['penetration testing', 'pen testing', 'ethical hacking'],
  'owasp':            ['owasp', 'security testing'],
  'java':             ['java', 'java se', 'java ee'],
  'c#':               ['c#', 'csharp', 'c sharp', '.net', 'dotnet'],
  'go':               ['go', 'golang'],
  'rust':             ['rust'],
  'php':              ['php'],
  'ruby':             ['ruby', 'rails', 'ruby on rails'],
  'swift':            ['swift', 'ios'],
  'kotlin':           ['kotlin', 'android'],
  'r':                ['r programming', ' r ', 'rstudio'],
  'scala':            ['scala'],
  'hadoop':           ['hadoop', 'hdfs', 'mapreduce'],
  'prometheus':       ['prometheus'],
  'grafana':          ['grafana'],
  'nginx':            ['nginx'],
  'helm':             ['helm'],
  'serverless':       ['serverless', 'lambda', 'cloud functions'],
  'iam':              ['iam', 'identity management'],
  'vpc':              ['vpc', 'networking'],
  'load balancing':   ['load balancing', 'load balancer'],
  'high availability': ['high availability', 'ha', 'fault tolerance'],
  'infrastructure as code': ['infrastructure as code', 'iac'],
  'monitoring':       ['monitoring', 'observability', 'logging'],
  'cost optimization': ['cost optimization', 'cloud cost'],
  'authentication':   ['authentication', 'oauth', 'jwt', 'auth'],
  'authorization':    ['authorization', 'rbac', 'permissions'],
  'message queues':   ['message queues', 'rabbitmq', 'sqs', 'pub/sub'],
  'npm':              ['npm', 'yarn', 'package manager'],
  'webpack':          ['webpack', 'vite', 'bundler'],
  'redux':            ['redux', 'state management', 'zustand'],
  'accessibility':    ['accessibility', 'wcag', 'a11y'],
  'responsive design': ['responsive design', 'responsive', 'mobile first'],
  'performance optimization': ['performance optimization', 'web performance', 'optimization'],
  'okrs':             ['okrs', 'kpis', 'metrics', 'analytics'],
  'user research':    ['user research', 'ux research', 'user interviews'],
  'roadmapping':      ['roadmapping', 'product roadmap', 'roadmap'],
  'stakeholder management': ['stakeholder management', 'stakeholders'],
  'user stories':     ['user stories', 'requirements gathering'],
  'prioritization':   ['prioritization', 'backlog management', 'backlog'],
  'a/b testing':      ['a/b testing', 'ab testing', 'experimentation'],
  'compliance':       ['compliance', 'gdpr', 'hipaa', 'regulatory'],
  'risk assessment':  ['risk assessment', 'risk management'],
  'forensics':        ['forensics', 'digital forensics'],
  'ids/ips':          ['ids/ips', 'intrusion detection', 'firewall'],
  'vulnerability assessment': ['vulnerability assessment', 'vulnerability scanning'],
  'incident response': ['incident response', 'incident management'],
  'siem':             ['siem', 'security information'],
  'firewalls':        ['firewalls', 'firewall'],
  'wireshark':        ['wireshark', 'packet analysis'],
  'metasploit':       ['metasploit'],
  'kali linux':       ['kali linux', 'kali'],
  'cryptography':     ['cryptography', 'encryption', 'ssl', 'tls'],
  'ethical hacking':  ['ethical hacking', 'hacking', 'bug bounty'],
  'security auditing': ['security auditing', 'security audit'],
};

// Build reverse lookup: alias → canonical
const ALIAS_TO_CANONICAL = new Map<string, string>();
Object.entries(SKILL_ALIASES).forEach(([canonical, aliases]) => {
  aliases.forEach(alias => ALIAS_TO_CANONICAL.set(alias.toLowerCase().trim(), canonical));
});

// ── Master skill set ──────────────────────────────────────────────────────────

function buildMasterSkillSet(): Set<string> {
  const set = new Set<string>();
  getDataset().forEach((entry: JobRoleEntry) => {
    const skills = entry.skills as unknown as Array<{ name: string } | string>;
    skills.forEach(s => {
      const name = typeof s === 'string' ? s : s.name;
      set.add(name.toLowerCase().trim());
    });
  });
  return set;
}

let _masterSkills: Set<string> | null = null;
function getMasterSkills(): Set<string> {
  if (!_masterSkills) _masterSkills = buildMasterSkillSet();
  return _masterSkills;
}

// ── Skill extraction ──────────────────────────────────────────────────────────

/**
 * Normalize text for matching — lowercase, collapse whitespace, keep dots/# for skill names
 */
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s.#+/\-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Extract skills from resume text using:
 * 1. Alias map (handles React.js → react, Scikit-learn → scikit-learn, etc.)
 * 2. Direct master skill matching
 * 3. Token + bigram matching
 */
export function extractSkillsFromText(text: string): string[] {
  const masterSkills = getMasterSkills();
  const found = new Set<string>();
  const normalized = normalizeText(text);

  // Pass 1: Check all aliases against the full text
  ALIAS_TO_CANONICAL.forEach((canonical, alias) => {
    if (masterSkills.has(canonical)) {
      // Use word boundary for short terms, substring for longer
      const escaped = alias.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const pattern = alias.length <= 3
        ? new RegExp(`\\b${escaped}\\b`, 'i')
        : new RegExp(escaped, 'i');
      if (pattern.test(normalized)) {
        found.add(canonical);
      }
    }
  });

  // Pass 2: Direct master skill matching
  masterSkills.forEach(skill => {
    if (found.has(skill)) return; // already found
    const escaped = skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const pattern = skill.length <= 3
      ? new RegExp(`\\b${escaped}\\b`, 'i')
      : new RegExp(escaped, 'i');
    if (pattern.test(normalized)) {
      found.add(skill);
    }
  });

  // Pass 3: Token + bigram matching
  const tokens = normalized.split(/\s+/).filter(t => t.length > 1);
  for (let i = 0; i < tokens.length; i++) {
    const unigram = tokens[i];
    const bigram  = i < tokens.length - 1 ? `${tokens[i]} ${tokens[i + 1]}` : '';
    const trigram = i < tokens.length - 2 ? `${tokens[i]} ${tokens[i + 1]} ${tokens[i + 2]}` : '';

    // Check alias map first
    const uniCanon = ALIAS_TO_CANONICAL.get(unigram);
    if (uniCanon && masterSkills.has(uniCanon)) found.add(uniCanon);
    else if (masterSkills.has(unigram)) found.add(unigram);

    if (bigram) {
      const biCanon = ALIAS_TO_CANONICAL.get(bigram);
      if (biCanon && masterSkills.has(biCanon)) found.add(biCanon);
      else if (masterSkills.has(bigram)) found.add(bigram);
    }

    if (trigram) {
      const triCanon = ALIAS_TO_CANONICAL.get(trigram);
      if (triCanon && masterSkills.has(triCanon)) found.add(triCanon);
      else if (masterSkills.has(trigram)) found.add(trigram);
    }
  }

  return Array.from(found);
}

// ── Get weighted skills for a role ───────────────────────────────────────────

function getWeightedSkills(role: string): WeightedSkill[] {
  const entry = getDataset().find((e: JobRoleEntry) => e.role === role);
  if (!entry) return [];
  const skills = entry.skills as unknown as Array<{ name: string; weight: number } | string>;
  return skills.map(s =>
    typeof s === 'string'
      ? { name: s, weight: 0.7 }
      : { name: s.name, weight: s.weight }
  );
}

// ── Confidence calculation ────────────────────────────────────────────────────

function calcConfidence(
  extractedCount: number,
  matchedCount: number,
  partialCount: number,
  finalScore: number
): number {
  const skillFactor   = Math.min(1, extractedCount / 15);
  const matchFactor   = finalScore / 100;
  const partialPenalty = partialCount > 0 ? 0.05 * Math.min(partialCount, 5) : 0;
  return Math.round(Math.min(100, (skillFactor * 0.3 + matchFactor * 0.7 - partialPenalty) * 100));
}

// ── Main analysis function ────────────────────────────────────────────────────

export function analyzeResume(
  resumeText: string,
  targetRole: string
): SkillAnalysisResult {
  // 1. Extract skills with aggressive alias matching
  const extractedSkills = extractSkillsFromText(resumeText);

  // 2. Get weighted role requirements
  const weightedRequired = getWeightedSkills(targetRole);
  const requiredNames    = weightedRequired.map(s => s.name);

  // 3. ML score — exact match %
  const userSkillSet = new Set(extractedSkills.map(s => s.toLowerCase().trim()));
  const exactMatched = requiredNames.filter(r => userSkillSet.has(r.toLowerCase().trim()));
  const mlScore = requiredNames.length === 0 ? 0
    : Math.round((exactMatched.length / requiredNames.length) * 100);

  // 4. Fuzzy match (Soft Computing)
  const fuzzyResult: FuzzyMatchResult = fuzzySkillMatch(extractedSkills, weightedRequired);

  // 5. Final score = 0.7 * ML + 0.3 * Fuzzy
  const finalScore = Math.round(0.7 * mlScore + 0.3 * fuzzyResult.fuzzyScore);

  // 6. Confidence
  const confidence = calcConfidence(
    extractedSkills.length,
    fuzzyResult.matchedSkills.length,
    fuzzyResult.partialSkills.length,
    finalScore
  );

  // 7. Build recommendations for missing skills only
  const missingNames = fuzzyResult.missingSkills.map(s => s.skill);
  const recommendations: SkillRecommendation[] = missingNames.map(skill => {
    const res = getResourcesForSkill(skill);
    const resources: SkillRecommendation['resources'] = [];
    if (res.free) resources.push({ type: 'free', ...res.free });
    if (res.paid) resources.push({ type: 'paid', ...res.paid });
    return { skill, resources };
  });

  return {
    extractedSkills,
    matchedSkills:   fuzzyResult.matchedSkills.map(s => s.skill),
    missingSkills:   missingNames,
    matchPercentage: finalScore,
    recommendations,
    partialSkills:   fuzzyResult.partialSkills.map(s => ({
      skill:      s.skill,
      similarity: Math.round(s.similarity * 100),
      matchedTo:  s.matchedTo,
    })),
    mlScore,
    fuzzyScore:    fuzzyResult.fuzzyScore,
    weightedScore: fuzzyResult.weightedScore,
    finalScore,
    confidence,
  };
}

// (appended to avoid duplicate key — streaming/batch are in the main map above)
