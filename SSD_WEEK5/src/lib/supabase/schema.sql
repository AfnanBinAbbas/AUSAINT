
-- Users table (extends Supabase auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  avatar_url text,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);

-- Enable Row Level Security
alter table public.profiles enable row level security;

-- RLS policies for profiles
create policy "Users can view their own profile" 
on profiles for select 
using (auth.uid() = id);

create policy "Users can update their own profile" 
on profiles for update 
using (auth.uid() = id);

-- Social Media Investigations
create table public.social_media_investigations (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users not null,
  target text not null,
  platform text not null,
  findings jsonb,
  status text default 'pending',
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);

-- Enable Row Level Security
alter table public.social_media_investigations enable row level security;

-- RLS policies for social media investigations
create policy "Users can view their own social media investigations" 
on social_media_investigations for select 
using (auth.uid() = user_id);

create policy "Users can insert their own social media investigations" 
on social_media_investigations for insert 
with check (auth.uid() = user_id);

create policy "Users can update their own social media investigations" 
on social_media_investigations for update 
using (auth.uid() = user_id);

-- IP Domain Investigations
create table public.ip_domain_investigations (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users not null,
  target text not null,
  target_type text not null,
  findings jsonb,
  status text default 'pending',
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);

-- Enable Row Level Security
alter table public.ip_domain_investigations enable row level security;

-- RLS policies for IP domain investigations
create policy "Users can view their own IP domain investigations" 
on ip_domain_investigations for select 
using (auth.uid() = user_id);

create policy "Users can insert their own IP domain investigations" 
on ip_domain_investigations for insert 
with check (auth.uid() = user_id);

create policy "Users can update their own IP domain investigations" 
on ip_domain_investigations for update 
using (auth.uid() = user_id);

-- Email Phone Investigations
create table public.email_phone_investigations (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users not null,
  target text not null,
  target_type text not null,
  findings jsonb,
  status text default 'pending',
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);

-- Enable Row Level Security
alter table public.email_phone_investigations enable row level security;

-- RLS policies for email phone investigations
create policy "Users can view their own email phone investigations" 
on email_phone_investigations for select 
using (auth.uid() = user_id);

create policy "Users can insert their own email phone investigations" 
on email_phone_investigations for insert 
with check (auth.uid() = user_id);

create policy "Users can update their own email phone investigations" 
on email_phone_investigations for update 
using (auth.uid() = user_id);

-- Web Scraping Investigations
create table public.web_scraping_investigations (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users not null,
  url text not null,
  parameters jsonb,
  findings jsonb,
  status text default 'pending',
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);

-- Enable Row Level Security
alter table public.web_scraping_investigations enable row level security;

-- RLS policies for web scraping investigations
create policy "Users can view their own web scraping investigations" 
on web_scraping_investigations for select 
using (auth.uid() = user_id);

create policy "Users can insert their own web scraping investigations" 
on web_scraping_investigations for insert 
with check (auth.uid() = user_id);

create policy "Users can update their own web scraping investigations" 
on web_scraping_investigations for update 
using (auth.uid() = user_id);

-- Investigation Reports
create table public.reports (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users not null,
  title text not null,
  description text,
  content jsonb not null,
  is_encrypted boolean default false,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);

-- Enable Row Level Security
alter table public.reports enable row level security;

-- RLS policies for reports
create policy "Users can view their own reports" 
on reports for select 
using (auth.uid() = user_id);

create policy "Users can insert their own reports" 
on reports for insert 
with check (auth.uid() = user_id);

create policy "Users can update their own reports" 
on reports for update 
using (auth.uid() = user_id);

-- Audit Log for security monitoring
create table public.audit_logs (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users,
  action text not null,
  entity text not null,
  entity_id uuid,
  details jsonb,
  ip_address text,
  user_agent text,
  created_at timestamp with time zone default now() not null
);

-- Enable Row Level Security
alter table public.audit_logs enable row level security;

-- RLS policies for audit logs - only viewable by admin
create policy "Only admins can view audit logs" 
on audit_logs for select 
using (
  exists (
    select 1 from public.profiles
    where id = auth.uid() and id = '00000000-0000-0000-0000-000000000000' -- Replace with actual admin ID
  )
);

-- Create a trigger to automatically update updated_at columns
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Apply the trigger to all tables with updated_at column
create trigger update_profiles_updated_at before update
on profiles for each row execute procedure update_updated_at_column();

create trigger update_social_media_investigations_updated_at before update
on social_media_investigations for each row execute procedure update_updated_at_column();

create trigger update_ip_domain_investigations_updated_at before update
on ip_domain_investigations for each row execute procedure update_updated_at_column();

create trigger update_email_phone_investigations_updated_at before update
on email_phone_investigations for each row execute procedure update_updated_at_column();

create trigger update_web_scraping_investigations_updated_at before update
on web_scraping_investigations for each row execute procedure update_updated_at_column();

create trigger update_reports_updated_at before update
on reports for each row execute procedure update_updated_at_column();
