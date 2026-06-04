-- Users handled by Supabase Auth (auth.users)

create table courses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  name text not null,
  exam_date date not null,
  difficulty int not null check (difficulty between 1 and 5),
  created_at timestamptz default now()
);

-- questions JSONB column stores the generated questions so the quiz page
-- can fetch them from DB on load — prevents data loss if user refreshes.
create table study_sessions (
  id uuid primary key default gen_random_uuid(),
  course_id uuid references courses not null,
  user_id uuid references auth.users not null,
  topic text not null,
  questions jsonb,
  studied_at timestamptz default now()
);

create table recall_results (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references study_sessions not null,
  user_id uuid references auth.users not null,
  question text not null,
  user_answer text not null,
  score int not null check (score between 0 and 100),
  feedback text,
  topic text not null,
  created_at timestamptz default now()
);

create table mastery_scores (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  course_id uuid references courses not null,
  score numeric default 50,
  sessions_completed int default 0,
  last_updated timestamptz default now(),
  unique(user_id, course_id)
);

-- RLS Policies
alter table courses enable row level security;
alter table study_sessions enable row level security;
alter table recall_results enable row level security;
alter table mastery_scores enable row level security;

-- Policies for courses
create policy "Users can view their own courses" on courses for select using (auth.uid() = user_id);
create policy "Users can insert their own courses" on courses for insert with check (auth.uid() = user_id);
create policy "Users can update their own courses" on courses for update using (auth.uid() = user_id);
create policy "Users can delete their own courses" on courses for delete using (auth.uid() = user_id);

-- Policies for study_sessions
create policy "Users can view their own study sessions" on study_sessions for select using (auth.uid() = user_id);
create policy "Users can insert their own study sessions" on study_sessions for insert with check (auth.uid() = user_id);
create policy "Users can update their own study sessions" on study_sessions for update using (auth.uid() = user_id);
create policy "Users can delete their own study sessions" on study_sessions for delete using (auth.uid() = user_id);

-- Policies for recall_results
create policy "Users can view their own recall results" on recall_results for select using (auth.uid() = user_id);
create policy "Users can insert their own recall results" on recall_results for insert with check (auth.uid() = user_id);
create policy "Users can update their own recall results" on recall_results for update using (auth.uid() = user_id);
create policy "Users can delete their own recall results" on recall_results for delete using (auth.uid() = user_id);

-- Policies for mastery_scores
create policy "Users can view their own mastery scores" on mastery_scores for select using (auth.uid() = user_id);
create policy "Users can insert their own mastery scores" on mastery_scores for insert with check (auth.uid() = user_id);
create policy "Users can update their own mastery scores" on mastery_scores for update using (auth.uid() = user_id);
create policy "Users can delete their own mastery scores" on mastery_scores for delete using (auth.uid() = user_id);
