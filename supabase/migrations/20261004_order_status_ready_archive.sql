-- Order statuses: pending → ready → done (removes "confirmed").
-- Non-destructive: no rows are deleted; only status values change and one nullable column is added.

begin;

-- 1. Timestamp shown in the admin archive tab
alter table public.orders add column if not exists completed_at timestamptz;

-- 2. Drop any existing CHECK constraint on status so "ready" is allowed
do $$
declare c record;
begin
  for c in
    select con.conname
    from pg_constraint con
    join pg_class rel on rel.oid = con.conrelid
    join pg_namespace nsp on nsp.oid = rel.relnamespace
    where nsp.nspname = 'public' and rel.relname = 'orders'
      and con.contype = 'c' and pg_get_constraintdef(con.oid) ilike '%status%'
  loop
    execute format('alter table public.orders drop constraint %I', c.conname);
  end loop;
end $$;

-- 3. Map legacy "confirmed" orders to "ready"
update public.orders set status = 'ready' where status = 'confirmed';

-- 4. Already-completed orders: best available completion date is the order date
update public.orders set completed_at = created_at where status = 'done' and completed_at is null;

-- 5. Enforce the new set of statuses
alter table public.orders
  add constraint orders_status_check check (status in ('pending', 'ready', 'done'));

commit;
