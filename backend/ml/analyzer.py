"""
ML Resume Analyzer
Uses scikit-learn TF-IDF + Naive Bayes for role prediction
spaCy for NLP skill extraction
Fuzzy matching for skill gap analysis
"""

import json
import re
import os
from pathlib import Path
from typing import List, Dict, Tuple, Optional
import pickle

import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import LabelEncoder

# Load dataset
DATASET_PATH = Path(__file__).parent.parent.parent / "src/data/job_roles_dataset.json"

def load_dataset() -> List[Dict]:
    with open(DATASET_PATH) as f:
        return json.load(f)

# ── Skill alias map (mirrors TypeScript version) ──────────────────────────────
SKILL_ALIASES = {
    "javascript": ["javascript", "js", "ecmascript", "es6"],
    "typescript": ["typescript", "ts"],
    "python": ["python", "python3", "py"],
    "react": ["react", "react.js", "reactjs"],
    "node.js": ["node.js", "nodejs", "node js", "node"],
    "vue.js": ["vue.js", "vuejs", "vue"],
    "angular": ["angular", "angular.js", "angularjs"],
    "scikit-learn": ["scikit-learn", "sklearn", "scikit learn"],
    "numpy": ["numpy", "num py"],
    "pandas": ["pandas"],
    "tensorflow": ["tensorflow", "tf"],
    "pytorch": ["pytorch", "torch"],
    "machine learning": ["machine learning", "ml", "supervised learning"],
    "deep learning": ["deep learning", "neural networks"],
    "sql": ["sql", "mysql", "sqlite"],
    "postgresql": ["postgresql", "postgres", "psql"],
    "mongodb": ["mongodb", "mongo"],
    "docker": ["docker", "containerization"],
    "kubernetes": ["kubernetes", "k8s"],
    "aws": ["aws", "amazon web services", "azure", "gcp", "google cloud"],
    "git": ["git", "github", "gitlab"],
    "rest api": ["rest api", "restful", "rest"],
    "tailwind css": ["tailwind css", "tailwind", "tailwindcss"],
    "data preprocessing": ["data preprocessing", "data cleaning", "feature extraction"],
    "nlp": ["nlp", "natural language processing"],
    "computer vision": ["computer vision", "opencv", "image processing"],
    "mlops": ["mlops", "model deployment", "model serving"],
    "statistics": ["statistics", "statistical analysis", "probability"],
    "agile": ["agile", "scrum", "kanban"],
    "ci/cd": ["ci/cd", "cicd", "github actions", "jenkins"],
    "linux": ["linux", "ubuntu", "unix"],
    "bash": ["bash", "shell", "shell scripting"],
}

# Build reverse lookup
ALIAS_TO_CANONICAL: Dict[str, str] = {}
for canonical, aliases in SKILL_ALIASES.items():
    for alias in aliases:
        ALIAS_TO_CANONICAL[alias.lower().strip()] = canonical


def normalize_text(text: str) -> str:
    return re.sub(r'\s+', ' ', text.lower().replace('\n', ' ')).strip()


def extract_skills(text: str) -> List[str]:
    """Extract skills from resume text using alias map + direct matching."""
    dataset = load_dataset()
    master_skills = set()
    for entry in dataset:
        for s in entry["skills"]:
            name = s["name"] if isinstance(s, dict) else s
            master_skills.add(name.lower().strip())

    found = set()
    normalized = normalize_text(text)

    # Pass 1: alias map
    for alias, canonical in ALIAS_TO_CANONICAL.items():
        if canonical in master_skills:
            pattern = r'\b' + re.escape(alias) + r'\b' if len(alias) <= 4 else re.escape(alias)
            if re.search(pattern, normalized, re.IGNORECASE):
                found.add(canonical)

    # Pass 2: direct master skill matching
    for skill in master_skills:
        if skill not in found:
            pattern = r'\b' + re.escape(skill) + r'\b' if len(skill) <= 4 else re.escape(skill)
            if re.search(pattern, normalized, re.IGNORECASE):
                found.add(skill)

    return list(found)


# ── Role Prediction Model ─────────────────────────────────────────────────────

MODEL_PATH = Path(__file__).parent / "models/role_classifier.pkl"

def _generate_training_data() -> Tuple[List[str], List[str]]:
    dataset = load_dataset()
    docs, labels = [], []
    for entry in dataset:
        skills = [s["name"] if isinstance(s, dict) else s for s in entry["skills"]]
        skill_text = " ".join(skills)
        docs.append(skill_text)
        labels.append(entry["role"])
        docs.append(f"{entry['display']} {' '.join(skills[:len(skills)//2])}")
        labels.append(entry["role"])
        docs.append(f"{entry['role'].replace('_', ' ')} {' '.join(skills[len(skills)//2:])}")
        labels.append(entry["role"])
    return docs, labels


def train_model() -> Pipeline:
    docs, labels = _generate_training_data()
    pipeline = Pipeline([
        ("tfidf", TfidfVectorizer(ngram_range=(1, 2), max_features=5000, sublinear_tf=True)),
        ("clf",   MultinomialNB(alpha=0.1)),
    ])
    pipeline.fit(docs, labels)
    MODEL_PATH.parent.mkdir(parents=True, exist_ok=True)
    with open(MODEL_PATH, "wb") as f:
        pickle.dump(pipeline, f)
    return pipeline


def load_model() -> Pipeline:
    if MODEL_PATH.exists():
        with open(MODEL_PATH, "rb") as f:
            return pickle.load(f)
    return train_model()


_model: Optional[Pipeline] = None

def get_model() -> Pipeline:
    global _model
    if _model is None:
        _model = load_model()
    return _model


def predict_role(text: str) -> Dict:
    model = get_model()
    proba = model.predict_proba([text])[0]
    classes = model.classes_
    idx = np.argmax(proba)
    probabilities = {cls: round(float(p), 3) for cls, p in zip(classes, proba)}
    return {
        "predicted_role": classes[idx],
        "confidence": round(float(proba[idx]) * 100, 1),
        "probabilities": probabilities,
    }


# ── Fuzzy Skill Matching ──────────────────────────────────────────────────────

def levenshtein(a: str, b: str) -> int:
    m, n = len(a), len(b)
    dp = [[0] * (n + 1) for _ in range(m + 1)]
    for i in range(m + 1): dp[i][0] = i
    for j in range(n + 1): dp[0][j] = j
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            dp[i][j] = dp[i-1][j-1] if a[i-1] == b[j-1] else 1 + min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1])
    return dp[m][n]


def skill_similarity(a: str, b: str) -> float:
    na, nb = a.lower().strip(), b.lower().strip()
    if na == nb: return 1.0
    max_len = max(len(na), len(nb))
    lev_sim = 1 - levenshtein(na, nb) / max_len if max_len > 0 else 1.0
    ta = set(na.split())
    tb = set(nb.split())
    inter = len(ta & tb)
    union = len(ta | tb)
    tok_sim = inter / union if union > 0 else 0
    return max(lev_sim * 0.6 + tok_sim * 0.4, tok_sim)


def calculate_match(
    extracted_skills: List[str],
    target_role: str,
    ml_score: float
) -> Dict:
    dataset = load_dataset()
    entry = next((e for e in dataset if e["role"] == target_role), None)
    if not entry:
        return {"matchPercentage": 0, "matchedSkills": [], "missingSkills": [], "finalScore": 0}

    required = entry["skills"]
    user_set = {s.lower().strip() for s in extracted_skills}

    matched, partial, missing = [], [], []
    total_weight = sum(s.get("weight", 0.7) if isinstance(s, dict) else 0.7 for s in required)
    weighted_score = 0.0

    for req in required:
        name = req["name"] if isinstance(req, dict) else req
        weight = req.get("weight", 0.7) if isinstance(req, dict) else 0.7

        best_sim = max((skill_similarity(us, name) for us in user_set), default=0)

        if best_sim >= 0.85:
            matched.append(name)
            weighted_score += weight
        elif best_sim >= 0.50:
            partial.append({"skill": name, "similarity": round(best_sim * 100)})
            weighted_score += weight * best_sim
        else:
            missing.append(name)

    fuzzy_score = round(len(matched) / len(required) * 100) if required else 0
    weighted_pct = round(weighted_score / total_weight * 100) if total_weight > 0 else 0
    final_score = round(0.7 * ml_score + 0.3 * fuzzy_score)

    return {
        "matchedSkills":  matched,
        "partialSkills":  partial,
        "missingSkills":  missing,
        "mlScore":        round(ml_score),
        "fuzzyScore":     fuzzy_score,
        "weightedScore":  weighted_pct,
        "finalScore":     final_score,
        "matchPercentage": final_score,
    }


def analyze_resume(text: str, target_role: str) -> Dict:
    """Full ML pipeline: extract → predict → match."""
    extracted = extract_skills(text)
    prediction = predict_role(text)

    # ML score = exact match %
    dataset = load_dataset()
    entry = next((e for e in dataset if e["role"] == target_role), None)
    if entry:
        required_names = {(s["name"] if isinstance(s, dict) else s).lower() for s in entry["skills"]}
        user_set = {s.lower() for s in extracted}
        ml_score = len(user_set & required_names) / len(required_names) * 100 if required_names else 0
    else:
        ml_score = 0

    match_result = calculate_match(extracted, target_role, ml_score)

    return {
        "extractedSkills":  extracted,
        "predictedRole":    prediction["predicted_role"],
        "mlConfidence":     prediction["confidence"],
        "probabilities":    prediction["probabilities"],
        **match_result,
    }
