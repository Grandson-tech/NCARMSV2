create or replace function public.activate_attachment_cycle(target_cycle_id uuid)
returns void
language plpgsql
set search_path = public
as $$
begin
  perform 1
  from public.attachment_cycles
  where id = target_cycle_id
  for update;

  if not found then
    raise exception 'Attachment cycle % does not exist.', target_cycle_id;
  end if;

  update public.attachment_cycles
  set is_active = false
  where is_active;

  update public.attachment_cycles
  set is_active = true
  where id = target_cycle_id;
end;
$$;
