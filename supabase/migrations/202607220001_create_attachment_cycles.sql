begin;

create table if not exists public.attachment_cycles (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  year integer not null,
  start_month integer,
  end_month integer,
  is_active boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.students
  add column if not exists attachment_cycle_id uuid;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'attachment_cycles_start_month_check'
      and conrelid = 'public.attachment_cycles'::regclass
  ) then
    alter table public.attachment_cycles
      add constraint attachment_cycles_start_month_check
      check (start_month is null or start_month between 1 and 12);
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'attachment_cycles_end_month_check'
      and conrelid = 'public.attachment_cycles'::regclass
  ) then
    alter table public.attachment_cycles
      add constraint attachment_cycles_end_month_check
      check (end_month is null or end_month between 1 and 12);
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'attachment_cycles_name_year_key'
      and conrelid = 'public.attachment_cycles'::regclass
  ) then
    alter table public.attachment_cycles
      add constraint attachment_cycles_name_year_key unique (name, year);
  end if;
end;
$$;

create unique index if not exists attachment_cycles_one_active_cycle_key
  on public.attachment_cycles (is_active)
  where is_active;

create or replace function public.set_attachment_cycles_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

do $$
begin
  if not exists (
    select 1 from pg_trigger
    where tgname = 'set_attachment_cycles_updated_at'
      and tgrelid = 'public.attachment_cycles'::regclass
      and not tgisinternal
  ) then
    create trigger set_attachment_cycles_updated_at
    before update on public.attachment_cycles
    for each row execute function public.set_attachment_cycles_updated_at();
  end if;
end;
$$;

-- Preserve legacy attachment_cycle text while backfilling the normalized relation.
-- Month values remain null because free-text legacy labels cannot be parsed safely.
insert into public.attachment_cycles (
  name,
  year,
  start_month,
  end_month,
  is_active,
  created_at,
  updated_at
)
select
  coalesce(nullif(btrim(student.attachment_cycle), ''), 'Unspecified legacy cycle') as name,
  extract(year from student.created_at)::integer as year,
  null,
  null,
  false,
  min(student.created_at),
  timezone('utc', now())
from public.students as student
where student.attachment_cycle_id is null
group by
  coalesce(nullif(btrim(student.attachment_cycle), ''), 'Unspecified legacy cycle'),
  extract(year from student.created_at)::integer
on conflict (name, year) do nothing;

update public.students as student
set attachment_cycle_id = cycle.id
from public.attachment_cycles as cycle
where student.attachment_cycle_id is null
  and cycle.name = coalesce(nullif(btrim(student.attachment_cycle), ''), 'Unspecified legacy cycle')
  and cycle.year = extract(year from student.created_at)::integer;

do $$
begin
  if exists (select 1 from public.students where attachment_cycle_id is null) then
    raise exception 'Attachment cycle migration could not link every existing student record.';
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'students_attachment_cycle_id_fkey'
      and conrelid = 'public.students'::regclass
  ) then
    alter table public.students
      add constraint students_attachment_cycle_id_fkey
      foreign key (attachment_cycle_id)
      references public.attachment_cycles(id)
      not valid;
  end if;
end;
$$;

alter table public.students
  validate constraint students_attachment_cycle_id_fkey;

commit;
