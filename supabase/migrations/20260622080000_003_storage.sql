-- Storage buckets for product, category, and banner images
insert into storage.buckets (id, name, public)
values
  ('product-images', 'product-images', true),
  ('category-images', 'category-images', true),
  ('site-media', 'site-media', true)
on conflict (id) do nothing;

-- Public read access for all three buckets (storefront needs to render images)
create policy "public_read_product_images"
  on storage.objects for select
  to public
  using (bucket_id = 'product-images');

create policy "public_read_category_images"
  on storage.objects for select
  to public
  using (bucket_id = 'category-images');

create policy "public_read_site_media"
  on storage.objects for select
  to public
  using (bucket_id = 'site-media');

-- Only admins may upload/update/delete in these buckets
create policy "admin_write_product_images"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'product-images'
    and exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

create policy "admin_update_product_images"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'product-images'
    and exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

create policy "admin_delete_product_images"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'product-images'
    and exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

create policy "admin_write_category_images"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'category-images'
    and exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

create policy "admin_update_category_images"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'category-images'
    and exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

create policy "admin_delete_category_images"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'category-images'
    and exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

create policy "admin_write_site_media"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'site-media'
    and exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

create policy "admin_update_site_media"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'site-media'
    and exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

create policy "admin_delete_site_media"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'site-media'
    and exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );
