create table if not exists public.requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users (id) on delete cascade not null, -- Added ON DELETE CASCADE for cleanup
  issue text not null,
  description text,
  address text,
  times_available text, -- Consider JSONB if structure is complex
  desired_price_range text, -- Consider numeric range or two numeric columns
  created_at timestamp with time zone default now() not null
);

-- Optional: Indexes for faster lookups
create index if not exists idx_requests_user_id on public.requests(user_id);

comment on table public.requests is 'Stores user-submitted job requests.';
comment on column public.requests.times_available is 'User availability, e.g., ["Saturday morning", "Weekday evenings"]'; 