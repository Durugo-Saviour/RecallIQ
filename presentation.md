---
marp: true
theme: default
paginate: true
backgroundColor: #fff
---

# RecallIQ

### AI-Powered Active Recall Study Assistant

*"Don't just study. Prove what you know."*

---

# The Problem

- Students reread notes thinking they've learned
- This creates an **illusion of competence**
- Knowledge gaps are discovered during exams — too late
- No personalized study scheduling exists

---

# The Solution

RecallIQ uses **active recall** + **AI** to:

- Generate quizzes from study topics
- Grade free-text answers with AI
- Track mastery over time
- Schedule studies by priority

---

# Core Philosophy

> Active recall > passive rereading

- Retrieve information from memory
- Identify weak areas early
- Build long-term retention
- Study smarter, not harder

---

# Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript 5 |
| UI | React 18 + Tailwind CSS |
| Components | shadcn/ui (Radix UI) |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth (SSR) |
| AI | Google Gemini 2.5 Flash |
| Charts | Recharts |

---

# Project Structure

```
app/                  # Pages & API routes
├── auth/             # Login / Signup
├── dashboard/        # Main dashboard
├── study/            # Study session launcher
├── quiz/             # Active quiz
├── exam-quiz/        # Exam quiz
├── results/          # Results history
├── progress/         # Analytics
├── schedule/         # Weekly timetable
├── pricing/          # Pricing tiers
└── api/              # 8 API endpoints
components/           # 8 custom components
lib/supabase/         # SSR + browser clients
```

---

# Database Schema

| Table | Purpose |
|-------|---------|
| `courses` | User courses with exam dates & difficulty |
| `study_sessions` | AI-generated quizzes (JSONB questions) |
| `recall_results` | Graded answers with feedback |
| `mastery_scores` | Per-course mastery tracking |

All tables have **Row Level Security (RLS)** enabled.

---

# Feature: Authentication

- Email/password signup & login
- Server-side middleware protects routes
- Pro/Free tier via user metadata
- Terms & Privacy acceptance required

---

# Feature: Course Management

- Add courses with name, exam date, difficulty (1-5)
- Delete with cascade cleanup
- Dashboard shows course cards with:
  - Mastery bar
  - Days until exam
  - Risk badge (Low/Medium/High)

---

# Feature: AI Quiz Generation

### Quick Recall Mode
- Enter a topic name
- AI generates **5 short-answer questions**
- Real-world application scenarios

### Exam Mode
- Paste study notes (up to 3000 chars)
- AI generates **5 comprehensive questions**
- Deep understanding & synthesis focus

---

# Feature: AI Answer Evaluation

### Quick Recall
- Grades 0-100
- One-sentence constructive feedback
- Mastery: `old × 0.7 + session × 0.3`

### Exam Mode
- Stricter grading
- Detailed "Corrections" + "Better Way to Recall"
- Mastery: `old × 0.4 + session × 0.6`

---

# Smart Study Schedule

Priority formula:

```
priority = (difficulty/5 × 0.35)
         + (mastery_gap × 0.45)
         + (urgency × 0.20)
```

- **Mastery gap** is most important (45%)
- Weekly timetable grid
- High-priority courses appear daily
- Color-coded blocks with study buttons

---

# Progress Tracking

- Bar chart of course mastery scores
- Recent study sessions with averages
- **Weak topics identification**
  - Topics with 2+ attempts
  - Sorted by lowest average score
- Color-coded results (green/yellow/red)

---

# Results History

- Full history with search & filter
- Sort by course, date, or score
- Per-question breakdown:
  - User answer
  - AI score
  - Feedback
  - Exam mode: corrections + recall technique

---

# Pricing Model

| Tier | Price | Features |
|------|-------|----------|
| Free | ₦0 | 2 courses, 5 quizzes/week |
| Pro | ₦900/month | Unlimited, detailed feedback, priority support |

- Paystack payment simulator (mock)
- Targets Nigerian student market

---

# UI/UX Features

- Dark/Light mode with system detection
- Cookie consent banner (GDPR-style)
- Mobile-first responsive design
- Toast notifications for all actions
- Auth-aware sticky navigation

---

# API Endpoints

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/generate-questions` | POST | Generate recall questions |
| `/api/generate-exam` | POST | Generate exam questions |
| `/api/evaluate-answers` | POST | Grade recall quiz |
| `/api/evaluate-exam` | POST | Grade exam answers |
| `/api/schedule` | GET | Compute study schedule |
| `/api/courses/[id]` | DELETE | Delete course (cascade) |
| `/api/models` | GET | List Gemini models |
| `/api/seed` | POST | Seed demo data |

---

# Key Design Decisions

1. **Weighted moving average** for mastery scoring
2. **JSONB questions** — quizzes survive page refreshes
3. **Gemini 2.5 Flash** with structured JSON output
4. **Nigerian market** — Naira pricing, Paystack
5. **RLS policies** — users only access their own data

---

# What's Next?

- Real payment integration (Paystack)
- Spaced repetition scheduling
- Flashcard generation
- Collaborative study groups
- Mobile app (React Native)
- Import from PDF/DOCX notes

---

# Summary

**RecallIQ** combines:

- AI-powered quiz generation
- Intelligent answer grading
- Priority-based scheduling
- Mastery tracking

...into one platform that helps students **discover knowledge gaps before exams**.

---

# Thank You

**RecallIQ** — *Don't just study. Prove what you know.*
