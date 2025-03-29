create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text unique,
  phone text,
  created_at timestamp with time zone default now() not null
);

-- Optional: Add comments for clarity
comment on table public.users is 'Stores user profile information.'; 