-- Function for updated_at timestamps that will be used across tables
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text unique,
  phone text,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);

-- Set up trigger for updated_at
create trigger users_updated_at
before update on public.users
for each row execute procedure update_updated_at_column();

-- Optional: Add comments for clarity
comment on table public.users is 'Stores user profile information.'; 