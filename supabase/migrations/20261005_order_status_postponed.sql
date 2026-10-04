-- Adds the "postponed" (مؤجلة) order status.
-- Non-destructive: no rows are changed or deleted; only the allowed status values are widened.
-- Run after 20261004_order_status_ready_archive.sql.

begin;

alter table public.orders drop constraint if exists orders_status_check;

alter table public.orders
  add constraint orders_status_check check (status in ('pending', 'ready', 'postponed', 'done'));

commit;
