-- Storage for customer feedback photos + delete rights for admins on both image buckets.
-- (Already applied to project aohctcbzteujxtjnaifv.)

insert into storage.buckets (id, name, public)
values ('feedback-images', 'feedback-images', true)
on conflict (id) do nothing;

create policy "public can read feedback-images" on storage.objects
  for select to public using (bucket_id = 'feedback-images');
create policy "admin can upload feedback-images" on storage.objects
  for insert to authenticated with check (bucket_id = 'feedback-images');
create policy "admin can delete feedback-images" on storage.objects
  for delete to authenticated using (bucket_id = 'feedback-images');
create policy "admin can delete product-images" on storage.objects
  for delete to authenticated using (bucket_id = 'product-images');
