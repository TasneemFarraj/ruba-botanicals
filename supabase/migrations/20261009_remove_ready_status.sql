-- Removes the "ready" (جاهز) order status. Flow is now: pending → postponed → done.
-- Non-destructive: any "ready" orders are moved back to "pending"; no rows are deleted.
-- Run after 20261005_order_status_postponed.sql.

begin;

update public.orders set status = 'pending' where status = 'ready';

alter table public.orders drop constraint if exists orders_status_check;

alter table public.orders
  add constraint orders_status_check check (status in ('pending', 'postponed', 'done'));

commit;
