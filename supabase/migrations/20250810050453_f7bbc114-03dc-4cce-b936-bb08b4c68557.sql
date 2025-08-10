-- Harden function by setting immutable search_path
create or replace function public.set_updated_at()
returns trigger
security definer
set search_path = public
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;