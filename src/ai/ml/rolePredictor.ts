/**
 * Role Predictor — trains on job_roles_dataset.json and predicts role from resume text.
 * Uses TF-IDF vectorization + Multinomial Naive Bayes.
 * Model is trained once and cached in localStorage.
 */

import { TFIDFVectorizer } from './tfidf';
import { NaiveBayesClassifier } from './naiveBayes';
import dataset from '../../data/job_roles_dataset.json';

const MODEL_CACHE_KEY = 'ml_role_predictor_v4';

export interface RolePrediction {
  predictedRole: string;
  confidence: number;
  probabilities: Record<string, number>;
}

export interface JobRoleEntry {
  role: string;
  display: string;
  skills: Array<{ name: string; weight: number } | string>;
}

/** Get skill names from a role entry (handles both old string[] and new {name,weight}[]) */
export function getSkillNames(entry: JobRoleEntry): string[] {
  return entry.skills.map(s => typeof s === 'string' ? s : s.name);
}

// ── Training data generation ──────────────────────────────────────────────────

/**
 * Generate synthetic training documents from the dataset.
 * Each role gets multiple documents with skill permutations to improve generalisation.
 */
function generateTrainingData(): { documents: string[]; labels: string[] } {
  const documents: string[] = [];
  const labels: string[] = [];

  (dataset as JobRoleEntry[]).forEach(entry => {
    const skills = getSkillNames(entry);

    // Document 1: all skills joined
    documents.push(skills.join(' '));
    labels.push(entry.role);

    // Document 2: role display name + top half of skills
    documents.push(`${entry.display} ${skills.slice(0, Math.ceil(skills.length / 2)).join(' ')}`);
    labels.push(entry.role);

    // Document 3: role key + bottom half of skills
    documents.push(`${entry.role.replace(/_/g, ' ')} ${skills.slice(Math.floor(skills.length / 2)).join(' ')}`);
    labels.push(entry.role);

    // Document 4: skills repeated (boosts weight)
    documents.push(skills.concat(skills.slice(0, 5)).join(' '));
    labels.push(entry.role);
  });

  return { documents, labels };
}

// ── Singleton model ───────────────────────────────────────────────────────────

let _vectorizer: TFIDFVectorizer | null = null;
let _classifier: NaiveBayesClassifier | null = null;

function loadFromCache(): boolean {
  try {
    const raw = localStorage.getItem(MODEL_CACHE_KEY);
    if (!raw) return false;
    const { vectorizer, classifier } = JSON.parse(raw);
    _vectorizer = TFIDFVectorizer.deserialize(vectorizer);
    _classifier = NaiveBayesClassifier.deserialize(classifier);
    return true;
  } catch { return false; }
}

function saveToCache(): void {
  try {
    localStorage.setItem(MODEL_CACHE_KEY, JSON.stringify({
      vectorizer: _vectorizer!.serialize(),
      classifier: _classifier!.serialize(),
    }));
  } catch { /* quota exceeded — ignore */ }
}

/**
 * Train the model on the dataset. Called once on first use.
 */
export function trainModel(): void {
  console.log('[RolePredictor] Training model on dataset...');
  const { documents, labels } = generateTrainingData();

  _vectorizer = new TFIDFVectorizer();
  const X = _vectorizer.fitTransform(documents);

  _classifier = new NaiveBayesClassifier();
  _classifier.fit(X, labels);

  saveToCache();
  console.log(`[RolePredictor] Model trained. Vocab size: ${_vectorizer.getVocabularySize()}, Samples: ${documents.length}`);
}

/**
 * Ensure model is ready (load from cache or train).
 */
function ensureModel(): void {
  if (_vectorizer && _classifier) return;
  if (!loadFromCache()) trainModel();
}

/**
 * Predict role from resume text.
 */
export function predictRole(resumeText: string): RolePrediction {
  ensureModel();
  const features = _vectorizer!.transform(resumeText);
  const proba = _classifier!.predictProba(features);

  let predictedRole = 'software_developer';
  let maxProb = 0;
  const probabilities: Record<string, number> = {};

  proba.forEach((prob, role) => {
    probabilities[role] = Math.round(prob * 100) / 100;
    if (prob > maxProb) { maxProb = prob; predictedRole = role; }
  });

  return {
    predictedRole,
    confidence: Math.round(maxProb * 100),
    probabilities,
  };
}

/**
 * Force retrain (clears cache).
 */
export function retrainModel(): void {
  localStorage.removeItem(MODEL_CACHE_KEY);
  _vectorizer = null;
  _classifier = null;
  trainModel();
}

/**
 * Get the full dataset.
 */
export function getDataset(): JobRoleEntry[] {
  return dataset as JobRoleEntry[];
}

/**
 * Get skills for a specific role from the dataset.
 */
export function getRoleSkills(role: string): string[] {
  const entry = (dataset as JobRoleEntry[]).find(e => e.role === role);
  if (!entry) return [];
  return getSkillNames(entry);
}

/**
 * Get all role keys from dataset.
 */
export function getAllRoles(): string[] {
  return (dataset as JobRoleEntry[]).map(e => e.role);
}

/**
 * Get display name for a role.
 */
export function getRoleDisplay(role: string): string {
  const entry = (dataset as JobRoleEntry[]).find(e => e.role === role);
  return entry?.display ?? role.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}
