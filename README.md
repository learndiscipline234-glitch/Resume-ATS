# NextStep Career AI

> An AI-powered career platform for resume analysis, skill-gap identification, job-role prediction, career roadmaps, and personalized career guidance.

NextStep Career AI helps users understand their current skills, identify gaps for target career roles, analyze resumes, and receive AI-powered career guidance.

This project was originally developed by [Adrian Dsouza](https://github.com/adrian-25/Next-Step-Career-AI). This repository is an independent deployment/customized version of the project. The original MIT license and attribution are preserved.

---

## Features

- Resume analysis and scoring
- Skill extraction from resumes
- Job-role prediction
- Skill-gap analysis
- Personalized career roadmaps
- Resume-to-job matching
- Job search integration
- AI-powered career chatbot
- Placement prediction
- Full-text resume search
- Supabase authentication
- PostgreSQL database
- Modern responsive dashboard
- AI-powered career recommendations

---

## Tech Stack

| Layer | Technologies |
|---|---|
| Frontend | React, TypeScript, Vite |
| Styling | Tailwind CSS |
| UI Components | shadcn/ui |
| Data Visualization | Recharts |
| Animations | Framer Motion |
| Backend | Supabase Edge Functions |
| Database | PostgreSQL / Supabase |
| Authentication | Supabase Auth |
| AI Integration | OpenRouter API |
| ML / NLP | Python, scikit-learn, TF-IDF, fuzzy matching |
| Job Search | JSearch / RapidAPI |
| Deployment | Vercel + Supabase |
| Version Control | Git + GitHub |

---

## How the Application Works

The application follows a frontend → backend services → database/AI workflow.

```text
                         ┌──────────────────┐
                         │      User        │
                         └────────┬─────────┘
                                  │
                                  ▼
                         ┌──────────────────┐
                         │ React Frontend   │
                         │ TypeScript/Vite  │
                         └────────┬─────────┘
                                  │
                    ┌─────────────┼─────────────┐
                    │             │             │
                    ▼             ▼             ▼
              ┌──────────┐  ┌──────────┐  ┌────────────┐
              │ Supabase │  │   Edge   │  │ PostgreSQL │
              │   Auth   │  │ Functions│  │  Database  │
              └──────────┘  └─────┬────┘  └────────────┘
                                  │
                                  ▼
                         ┌──────────────────┐
                         │   OpenRouter     │
                         │   AI Models      │
                         └────────┬─────────┘
                                  │
                                  ▼
                         ┌──────────────────┐
                         │ AI Career Output │
                         └──────────────────┘