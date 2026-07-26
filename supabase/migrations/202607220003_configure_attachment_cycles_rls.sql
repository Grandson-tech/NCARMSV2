alter table public.attachment_cycles enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'attachment_cycles'
      and policyname = 'attachment_cycles_select_authenticated'
  ) then
    create policy attachment_cycles_select_authenticated
      on public.attachment_cycles
      for select
      to authenticated
      using (true);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'attachment_cycles'
      and policyname = 'attachment_cycles_insert_authenticated'
  ) then
    create policy attachment_cycles_insert_authenticated
      on public.attachment_cycles
      for insert
      to authenticated
      with check (true);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'attachment_cycles'
      and policyname = 'attachment_cycles_update_authenticated'
  ) then
    create policy attachment_cycles_update_authenticated
      on public.attachment_cycles
      for update
      to authenticated
      using (true)
      with check (true);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'attachment_cycles'
      and policyname = 'attachment_cycles_delete_authenticated'
  ) then
    create policy attachment_cycles_delete_authenticated
      on public.attachment_cycles
      for delete
      to authenticated
      using (true);
  end if;
end;
$$;
