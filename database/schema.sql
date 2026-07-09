create table if not exists kanda_admission_records (
  id text primary key,
  college_name text not null,
  year integer not null,
  province text not null,
  program_group text not null,
  track text not null,
  first_subject text not null,
  required_subjects text[] not null default '{}',
  major text not null,
  duration text not null,
  plan_2025 integer not null,
  plan_2026 integer not null,
  score_2022_lowest_rank integer,
  score_2023_highest integer,
  score_2023_lowest integer,
  score_2023_lowest_rank integer,
  score_2024_highest integer,
  score_2024_lowest integer,
  score_2024_lowest_rank integer,
  score_2025_highest integer not null,
  score_2025_lowest integer not null,
  score_2025_lowest_rank integer,
  source_title text not null,
  source_url text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table kanda_admission_records
  add column if not exists score_2022_lowest_rank integer,
  add column if not exists score_2023_lowest_rank integer,
  add column if not exists score_2024_lowest_rank integer,
  add column if not exists score_2025_lowest_rank integer;

create index if not exists idx_kanda_admission_records_lookup
  on kanda_admission_records (province, year, first_subject, program_group);

create index if not exists idx_kanda_admission_records_required_subjects
  on kanda_admission_records using gin (required_subjects);
