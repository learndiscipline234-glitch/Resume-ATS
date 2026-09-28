-- ════════════════════════════════════════════════════════════════════
-- Migration 018: Feature tables for AI Resume Builder, Job Tracker,
--               Skill Assessments, and Salary & Market Insights
-- ════════════════════════════════════════════════════════════════════

-- ── 1. Resume Templates (public, read by all) ─────────────────────
create table if not exists public.resume_templates (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  description text,
  structure   jsonb not null default '{}',
  styles      jsonb not null default '{}',
  is_public   boolean not null default true,
  created_at  timestamptz not null default now()
);

alter table public.resume_templates enable row level security;

create policy "resume_templates_select_all"
  on public.resume_templates for select
  using (is_public = true);

-- ── 2. Resume Drafts (private per user) ───────────────────────────
create table if not exists public.resume_drafts (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  template_id   uuid references public.resume_templates(id) on delete set null,
  title         text not null default 'Untitled Draft',
  sections      jsonb not null default '{}',
  target_role   text,
  last_saved_at timestamptz not null default now(),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

alter table public.resume_drafts enable row level security;

create policy "resume_drafts_select_own"
  on public.resume_drafts for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "resume_drafts_insert_own"
  on public.resume_drafts for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "resume_drafts_update_own"
  on public.resume_drafts for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "resume_drafts_delete_own"
  on public.resume_drafts for delete
  to authenticated
  using ((select auth.uid()) = user_id);

-- ── 3. Job Applications ───────────────────────────────────────────
create table if not exists public.job_applications (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  company     text not null,
  role        text not null,
  job_url     text,
  status      text not null default 'applied'
                check (status in ('applied','screening','interview','offer','rejected','withdrawn')),
  applied_at  timestamptz not null default now(),
  notes       text,
  salary_min  integer,
  salary_max  integer,
  location    text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table public.job_applications enable row level security;

create policy "job_applications_select_own"
  on public.job_applications for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "job_applications_insert_own"
  on public.job_applications for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "job_applications_update_own"
  on public.job_applications for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "job_applications_delete_own"
  on public.job_applications for delete
  to authenticated
  using ((select auth.uid()) = user_id);

-- ── 4. Application Status History ────────────────────────────────
create table if not exists public.application_status_history (
  id             uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.job_applications(id) on delete cascade,
  user_id        uuid not null references auth.users(id) on delete cascade,
  status         text not null
                   check (status in ('applied','screening','interview','offer','rejected','withdrawn')),
  changed_at     timestamptz not null default now(),
  notes          text
);

alter table public.application_status_history enable row level security;

create policy "app_status_history_select_own"
  on public.application_status_history for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "app_status_history_insert_own"
  on public.application_status_history for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

-- ── 5. Skill Assessments (public quiz bank) ───────────────────────
create table if not exists public.skill_assessments (
  id              uuid primary key default gen_random_uuid(),
  skill_name      text not null,
  role            text,
  difficulty      text not null default 'intermediate'
                    check (difficulty in ('beginner','intermediate','advanced')),
  questions       jsonb not null default '[]',
  time_limit_sec  integer not null default 90,
  created_at      timestamptz not null default now()
);

alter table public.skill_assessments enable row level security;

create policy "skill_assessments_select_all"
  on public.skill_assessments for select
  using (true);

-- ── 6. User Assessment Results ────────────────────────────────────
create table if not exists public.user_assessment_results (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  assessment_id uuid not null references public.skill_assessments(id) on delete cascade,
  score         integer not null check (score between 0 and 100),
  passed        boolean not null default false,
  answers       jsonb not null default '[]',
  completed_at  timestamptz not null default now()
);

alter table public.user_assessment_results enable row level security;

create policy "assessment_results_select_own"
  on public.user_assessment_results for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "assessment_results_insert_own"
  on public.user_assessment_results for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

-- ── 7. Salary Data (public reference data) ───────────────────────
create table if not exists public.salary_data (
  id               uuid primary key default gen_random_uuid(),
  role             text not null,
  location         text not null,
  experience_level text not null
                     check (experience_level in ('entry','mid','senior','executive')),
  min_salary       integer not null,
  max_salary       integer not null,
  median_salary    integer not null,
  currency         text not null default 'INR',
  source           text,
  year             integer not null default extract(year from now())::integer
);

alter table public.salary_data enable row level security;

create policy "salary_data_select_all"
  on public.salary_data for select
  using (true);

-- ── 8. Market Trends ─────────────────────────────────────────────
create table if not exists public.market_trends (
  id              uuid primary key default gen_random_uuid(),
  role            text,
  skill_name      text not null,
  demand_score    integer check (demand_score between 0 and 100),
  hiring_volume   integer,
  yoy_growth_pct  numeric(5,2),
  period          text not null,
  recorded_at     timestamptz not null default now()
);

alter table public.market_trends enable row level security;

create policy "market_trends_select_all"
  on public.market_trends for select
  using (true);

-- ── Indexes for common queries ────────────────────────────────────
create index if not exists idx_resume_drafts_user_id        on public.resume_drafts(user_id);
create index if not exists idx_job_applications_user_id     on public.job_applications(user_id);
create index if not exists idx_job_applications_status      on public.job_applications(status);
create index if not exists idx_app_status_history_app_id   on public.application_status_history(application_id);
create index if not exists idx_assessment_results_user_id  on public.user_assessment_results(user_id);
create index if not exists idx_salary_data_role            on public.salary_data(role, experience_level);
create index if not exists idx_market_trends_skill         on public.market_trends(skill_name);

-- ── Grants (expose to Data API) ───────────────────────────────────
grant select on public.resume_templates   to anon, authenticated;
grant select on public.skill_assessments  to anon, authenticated;
grant select on public.salary_data        to anon, authenticated;
grant select on public.market_trends      to anon, authenticated;

grant select, insert, update, delete on public.resume_drafts              to authenticated;
grant select, insert, update, delete on public.job_applications           to authenticated;
grant select, insert               on public.application_status_history  to authenticated;
grant select, insert               on public.user_assessment_results     to authenticated;
