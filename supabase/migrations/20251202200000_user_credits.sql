create table user_credits (
  user_id uuid references auth.users not null primary key,
  credits integer default 5 not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table user_credits enable row level security;

create policy "Users can view their own credits"
  on user_credits for select
  using ( auth.uid() = user_id );

-- Function to handle new user creation
create or replace function public.handle_new_user_credits()
returns trigger as $$
begin
  insert into public.user_credits (user_id, credits)
  values (new.id, 5);
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to add credits on signup
create trigger on_auth_user_created_credits
  after insert on auth.users
  for each row execute procedure public.handle_new_user_credits();
