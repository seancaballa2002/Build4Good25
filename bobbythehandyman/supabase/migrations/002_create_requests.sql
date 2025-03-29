create table if not exists public.requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users (id) on delete cascade not null, -- Added ON DELETE CASCADE for cleanup
  issue text not null,
  description text,
  address text,
  times_available text, -- Consider JSONB if structure is complex
  desired_price_range text, -- Consider numeric range or two numeric columns
  text_input text, -- Raw text input for LLM
  image_url text, -- Optional image URL for visual issues
  voice_url text, -- Optional voice recording URL
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);

-- Optional: Indexes for faster lookups
create index if not exists idx_requests_user_id on public.requests(user_id);

comment on table public.requests is 'Stores user-submitted job requests.';
comment on column public.requests.times_available is 'User availability, e.g., ["Saturday morning", "Weekday evenings"]';

-- Add trigger for updated_at timestamp
create trigger requests_updated_at
before update on public.requests
for each row execute procedure update_updated_at_column(); 