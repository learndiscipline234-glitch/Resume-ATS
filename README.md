# NextStep Career AI

> AI-powered career platform for resume analysis, job role prediction, and personalized career roadmaps.

**Live Demo:** https://next-step-career-ai-c5t5.vercel.app/

**GitHub:** https://github.com/adrian-25/Next-Step-Career-AI

---

## What It Does

- Analyzes resumes using NLP and ML to extract skills and predict job roles
- Scores resumes across Skills, Projects, Experience, and Education
- Generates personalized career roadmaps based on skill gaps
- Matches resumes against job descriptions
- Full-text search across resume database
- AI career chatbot and mentor features

---

## Tech Stack

| Layer    | Technology                                      |
|----------|-------------------------------------------------|
| Frontend | React 18, Vite, TypeScript, Tailwind CSS        |
| UI       | shadcn/ui, Recharts, Framer Motion              |
| Backend  | FastAPI (Python 3.11)                           |
| ML       | scikit-learn, TF-IDF, Naive Bayes, Fuzzy Logic  |
| Database | PostgreSQL 15 (Supabase)                        |
| Auth     | Supabase Auth + JWT                             |
| Deploy   | Vercel (frontend) + Railway (backend)           |
| CI/CD    | GitHub Actions                                  |

---

## ML Pipeline

Resume text → Skill extraction → TF-IDF vectorization → Naive Bayes role prediction → Fuzzy skill matching → Weighted scoring

Final score = 0.7 × ML score + 0.3 × Fuzzy score

---

## Project Structure

```
├── src/
│   ├── ai/          # ML models, fuzzy logic, resume parser, skill analyzer
│   ├── data/        # Job roles dataset, learning resources, skill definitions
│   ├── pages/       # 17 page components
│   ├── services/    # Supabase + FastAPI API layer
│   ├── components/  # Reusable UI components
│   └── hooks/       # Custom React hooks
├── backend/
│   ├── main.py      # FastAPI app
│   ├── ml/          # Python ML analyzer and parsers
│   ├── routers/     # resume, match, search, analytics, auth
│   └── Dockerfile
├── supabase/
│   └── migrations/  # 17 SQL migration files
└── .github/
    └── workflows/   # CI/CD pipelines
```

---

## Getting Started

### Frontend

```bash
npm install
npm run dev
```

### Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### Environment Variables

Copy `.env.example` to `.env` and fill in your values:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_API_URL=http://localhost:8000/api
```

---

## Author

**Adrian Dsouza** — BTech Computer Engineering, VIT Mumbai

- Portfolio: https://adrianportfolio-tau.vercel.app
- GitHub: https://github.com/adrian-25
- LinkedIn: https://www.linkedin.com/in/adriandsouza-aiml

---

## License

MIT
