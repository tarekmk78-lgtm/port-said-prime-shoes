-- Contact form submissions
create table if not exists contact_messages (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  email text not null,
  message text not null,
  is_read boolean default false,
  created_at timestamptz default now()
);

create index if not exists idx_contact_messages_created on contact_messages(created_at desc);

alter table contact_messages enable row level security;

-- Anyone (including anonymous visitors) can submit a message
create policy "contact_messages_insert_public"
  on contact_messages for insert
  to public
  with check (true);

-- Only admins can read or manage submitted messages
create policy "contact_messages_select_admin"
  on contact_messages for select
  to authenticated
  using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));

create policy "contact_messages_update_admin"
  on contact_messages for update
  to authenticated
  using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));

create policy "contact_messages_delete_admin"
  on contact_messages for delete
  to authenticated
  using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));
