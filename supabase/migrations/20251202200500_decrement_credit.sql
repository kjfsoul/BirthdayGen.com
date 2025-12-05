create or replace function decrement_credit(user_id_param uuid)
returns void as $$
begin
  update user_credits
  set credits = credits - 1,
      updated_at = now()
  where user_id = user_id_param;
end;
$$ language plpgsql security definer;
