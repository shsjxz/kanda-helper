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

create table if not exists kanda_admission_yearly_records (
  id text primary key,
  admission_record_id text not null,
  college_name text not null default '南京医科大学康达学院',
  province text not null,
  track text not null,
  subject_label text not null,
  first_subject text,
  required_subjects text[] not null default '{}',
  program_group text,
  major text not null,
  data_level text not null default 'major',
  batch text,
  year integer not null,
  highest_score integer,
  lowest_score integer,
  lowest_rank integer,
  enrollment_plan integer,
  source_title text,
  source_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_kanda_yearly_records_lookup
  on kanda_admission_yearly_records (province, year, track, major);

create index if not exists idx_kanda_yearly_records_record_id
  on kanda_admission_yearly_records (admission_record_id, year);
