create table if not exists public.quotes (
  id uuid primary key default gen_random_uuid(),
  request_id uuid references public.requests (id) on delete cascade not null, -- Added ON DELETE CASCADE
  provider_name text not null,
  quote_price text not null,
  available_time text not null,
  duration text not null,
  included_in_quote text not null,
  contact_info text,
  call_id text, -- For tracking Retell call ID
  call_status text, -- For tracking call status (pending, completed, failed)
  call_summary text, -- Summary of the call from Retell analysis
  call_error text,
  user_sentiment text, -- Sentiment of the user during the call
  call_successful boolean, -- Whether the call was successful
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);

-- Optional: Indexes for faster lookups
create index if not exists idx_quotes_request_id on public.quotes(request_id);
create index if not exists idx_quotes_call_id on public.quotes(call_id);

comment on table public.quotes is 'Stores quotes received from handymen for requests.';

-- Add trigger for updated_at timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger quotes_updated_at
before update on public.quotes
for each row execute procedure update_updated_at_column(); 