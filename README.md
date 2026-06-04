# RecallIQ

**AI-Powered Active Recall Study Assistant**

> *Don't just study. Prove what you know.*

RecallIQ is a web application that helps university students study smarter using AI-generated quizzes, intelligent answer grading, and priority-based scheduling. Instead of passively rereading notes, students actively retrieve information from memory — the most effective way to build long-term retention.

---

## Table of Contents

- [Why RecallIQ?](#why-recalliq)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Database Schema](#database-schema)
- [API Routes](#api-routes)
- [How It Works](#how-it-works)
- [Screenshots](#screenshots)
- [Contributing](#contributing)
- [License](#license)

---

## Why RecallIQ?

Most students believe they've learned something after rereading their notes. This creates an **illusion of competence** — they recognize the material but can't recall it under pressure. RecallIQ breaks this cycle by:

1. Generating quizzes from topics you just studied
2. Grading your free-text answers with AI
3. Tracking your mastery over time
4. Scheduling your study sessions by priority

You discover your knowledge gaps **before the exam** — not during it.

---

## Features

### AI-Powered Quiz Generation
- **Quick Recall Mode**: Enter a topic name and get 5 short-answer questions with real-world application scenarios
- **Exam Mode**: Paste your study notes (up to 3000 chars) and get 5 comprehensive, challenging exam questions

### AI Answer Evaluation
- Grades answers on a 0-100 scale
- Provides constructive feedback
- Exam mode includes detailed corrections and recall techniques (analogies, mnemonics, visualizations)

### Smart Study Schedule
- Priority-based scheduling using a weighted formula:
  ```
  priority = (difficulty/5 × 0.35) + (mastery_gap × 0.45) + (urgency × 0.20)
  ```
- Weekly timetable grid with color-coded course blocks
- High-priority courses appear more frequently

### Progress Tracking
- Course mastery scores with visual bar charts
- Weak topic identification (topics with 2+ attempts and low scores)
- Full results history with search, filter, and sort

### Course Management
- Add courses with exam dates and difficulty levels (1-5)
- Risk badges (Low/Medium/High) based on mastery
- Days-until-exam countdown

### User Experience
- Dark/Light mode with system preference detection
- Mobile-first responsive design
- Cookie consent banner (GDPR-style)
- Toast notifications for all actions

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 14 (App Router) |
| **Language** | TypeScript 5 |
| **UI** | React 18 + Tailwind CSS |
| **Components** | shadcn/ui (Radix UI primitives) |
| **Database** | Supabase (PostgreSQL) |
| **Auth** | Supabase Auth (SSR with cookie handling) |
| **AI** | Google Gemini 2.5 Flash |
| **Charts** | Recharts |
| **Icons** | Lucide |

---

## Project Structure

```
RecallIQ/
├── app/                          # Next.js App Router pages
│   ├── layout.tsx                # Root layout (Navbar, Footer, ThemeProvider)
│   ├── page.tsx                  # Landing/marketing page
│   ├── globals.css               # Tailwind base + CSS variables
│   ├── auth/
│   │   ├── login/page.tsx        # Login form
│   │   └── signup/page.tsx       # Signup form with terms acceptance
│   ├── dashboard/page.tsx        # Main dashboard (Server Component)
│   ├── study/[courseId]/page.tsx # Study session launcher
│   ├── quiz/[sessionId]/page.tsx # Active recall quiz
│   ├── exam-quiz/[sessionId]/page.tsx  # Exam quiz
│   ├── results/page.tsx          # Results history
│   ├── results/[sessionId]/page.tsx    # Single session results
│   ├── exam-results/[sessionId]/page.tsx # Exam results
│   ├── progress/page.tsx         # Progress analytics
│   ├── schedule/page.tsx         # Weekly timetable
│   ├── pricing/page.tsx          # Pricing tiers
│   ├── privacy/page.tsx          # Privacy policy
│   ├── terms/page.tsx            # Terms of service
│   └── api/                      # API routes
│       ├── generate-questions/route.ts
│       ├── generate-exam/route.ts
│       ├── evaluate-answers/route.ts
│       ├── evaluate-exam/route.ts
│       ├── schedule/route.ts
│       ├── courses/[courseId]/route.ts
│       ├── models/route.ts
│       └── seed/route.ts
├── components/                   # Reusable React components
│   ├── Navbar.tsx
│   ├── Footer.tsx
│   ├── CourseCard.tsx
│   ├── AddCourseModal.tsx
│   ├── DeleteCourseButton.tsx
│   ├── DarkModeToggle.tsx
│   ├── CookieConsent.tsx
│   ├── RiskBadge.tsx
│   └── ui/                       # shadcn/ui components
├── hooks/
│   └── use-toast.ts
├── lib/
│   ├── utils.ts
│   └── supabase/
│       ├── client.ts             # Browser-side Supabase client
│       └── server.ts             # Server-side Supabase client (SSR)
├── middleware.ts                  # Route protection
├── supabase-schema.sql           # Database schema
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- A [Supabase](https://supabase.com) account (free tier works)
- A [Google AI Studio](https://aistudio.google.com) API key (for Gemini)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Durugo-Saviour/RecallIQ.git
   cd RecallIQ
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**

   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   GEMINI_API_KEY=your_google_gemini_api_key
   ```

4. **Set up the database**

   Go to your Supabase dashboard → SQL Editor → New query, then paste and run the contents of `supabase-schema.sql`. This creates all required tables with Row Level Security policies.

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open** [http://localhost:3000](http://localhost:3000)

---

## Database Schema

The app uses 4 tables in Supabase (PostgreSQL):

| Table | Purpose | Key Columns |
|-------|---------|-------------|
| `courses` | User courses | `id`, `user_id`, `name`, `exam_date`, `difficulty` |
| `study_sessions` | AI-generated quiz sessions | `id`, `course_id`, `topic`, `questions` (JSONB) |
| `recall_results` | Graded answers | `session_id`, `question`, `user_answer`, `score`, `feedback` |
| `mastery_scores` | Per-course mastery tracking | `user_id`, `course_id`, `score`, `sessions_completed` |

All tables have **Row Level Security (RLS)** enabled — users can only access their own data.

---

## API Routes

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/generate-questions` | POST | Generate 5 recall questions from a topic name |
| `/api/generate-exam` | POST | Generate 5 exam questions from pasted notes |
| `/api/evaluate-answers` | POST | Grade recall quiz answers (30% mastery weight) |
| `/api/evaluate-exam` | POST | Grade exam answers (60% mastery weight) |
| `/api/schedule` | GET | Compute priority-based weekly study schedule |
| `/api/courses/[courseId]` | DELETE | Delete a course and cascade related data |
| `/api/models` | GET | List available Gemini AI models |
| `/api/seed` | POST | Seed demo data for testing |

---

## How It Works

### Mastery Scoring

Each quiz session updates the course's mastery score using a weighted moving average:

- **Quick Recall**: `newMastery = oldMastery × 0.7 + sessionScore × 0.3`
- **Exam Mode**: `newMastery = oldMastery × 0.4 + sessionScore × 0.6`

Exams have higher weight because they test deeper understanding.

### Study Scheduling Algorithm

The priority score determines how often a course appears in your weekly timetable:

```
priority = (difficulty/5 × 0.35) + (mastery_gap × 0.45) + (urgency × 0.20)
```

- **Mastery gap (45%)**: Lower mastery = higher priority
- **Difficulty (35%)**: Harder courses get more time
- **Urgency (20%)**: Closer exam date = higher priority

---

## Pricing

| Tier | Price | Features |
|------|-------|----------|
| **Free** | Free | 2 courses, 5 quizzes per week |
| **Pro** | ₦900/month | Unlimited courses, detailed feedback, priority support |

> Note: Payment integration uses a simulator (Paystack mock). No real payment processing is active.

---

## Contributing

Contributions are welcome! Here's how:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m 'Add your feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request

---

## License

This project is open source. See the repository for license details.

---

**RecallIQ** — Built with Next.js, Supabase, and Google Gemini.
