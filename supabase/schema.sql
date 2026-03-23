create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  display_name text,
  pin_hash text,
  balance_pence integer not null default 0 check (balance_pence >= 0),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.nfc_cards (
  id uuid primary key default gen_random_uuid(),
  card_code text not null unique,
  owner_user_id uuid not null references public.profiles(id) on delete cascade,
  active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  payer_user_id uuid not null references public.profiles(id) on delete restrict,
  receiver_user_id uuid not null references public.profiles(id) on delete restrict,
  amount_pence integer not null check (amount_pence > 0),
  note text,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.payment_requests (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null unique references public.profiles(id) on delete cascade,
  amount_pence integer check (amount_pence is null or amount_pence > 0),
  note text,
  active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.group_expenses (
  id uuid primary key default gen_random_uuid(),
  group_key text not null default 'default-house',
  payer_user_id uuid not null references public.profiles(id) on delete cascade,
  description text not null,
  total_amount_pence integer not null check (total_amount_pence > 0),
  split_mode text not null check (split_mode in ('equal', 'custom')),
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.group_expense_shares (
  id uuid primary key default gen_random_uuid(),
  expense_id uuid not null references public.group_expenses(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  amount_pence integer not null check (amount_pence >= 0)
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

drop trigger if exists payment_requests_set_updated_at on public.payment_requests;
create trigger payment_requests_set_updated_at
before update on public.payment_requests
for each row
execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, coalesce(new.email, ''))
  on conflict (id) do update
    set email = excluded.email;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.nfc_cards enable row level security;
alter table public.transactions enable row level security;
alter table public.payment_requests enable row level security;
alter table public.group_expenses enable row level security;
alter table public.group_expense_shares enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
on public.profiles
for select
to authenticated
using (auth.uid() = id);

drop policy if exists "cards_read_active" on public.nfc_cards;
create policy "cards_read_active"
on public.nfc_cards
for select
to authenticated
using (active = true);

drop policy if exists "transactions_read_related" on public.transactions;
create policy "transactions_read_related"
on public.transactions
for select
to authenticated
using (auth.uid() = payer_user_id or auth.uid() = receiver_user_id);

drop policy if exists "payment_requests_read_own" on public.payment_requests;
create policy "payment_requests_read_own"
on public.payment_requests
for select
to authenticated
using (auth.uid() = owner_user_id);

drop policy if exists "payment_requests_update_own" on public.payment_requests;
create policy "payment_requests_update_own"
on public.payment_requests
for all
to authenticated
using (auth.uid() = owner_user_id)
with check (auth.uid() = owner_user_id);

drop policy if exists "group_expenses_read_related" on public.group_expenses;
create policy "group_expenses_read_related"
on public.group_expenses
for select
to authenticated
using (auth.uid() = payer_user_id);

drop policy if exists "group_expense_shares_read_related" on public.group_expense_shares;
create policy "group_expense_shares_read_related"
on public.group_expense_shares
for select
to authenticated
using (auth.uid() = user_id);

create or replace function public.complete_onboarding(display_name_input text, pin_input text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  if display_name_input is null or length(trim(display_name_input)) < 2 then
    raise exception 'Display name must be at least 2 characters';
  end if;

  if pin_input !~ '^\d{4}$' then
    raise exception 'PIN must be exactly 4 digits';
  end if;

  update public.profiles
  set
    display_name = trim(display_name_input),
    pin_hash = crypt(pin_input, gen_salt('bf'))
  where id = auth.uid();
end;
$$;

grant execute on function public.complete_onboarding(text, text) to authenticated;

create or replace function public.upsert_payment_request(amount_pence_input integer, note_input text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  if amount_pence_input is not null and amount_pence_input <= 0 then
    raise exception 'Amount must be greater than zero';
  end if;

  insert into public.payment_requests (owner_user_id, amount_pence, note, active)
  values (auth.uid(), amount_pence_input, nullif(trim(note_input), ''), true)
  on conflict (owner_user_id) do update
    set amount_pence = excluded.amount_pence,
        note = excluded.note,
        active = true;
end;
$$;

grant execute on function public.upsert_payment_request(integer, text) to authenticated;

create or replace function public.get_active_payment_request_for_user(target_user_id uuid)
returns table (
  id uuid,
  owner_user_id uuid,
  amount_pence integer,
  note text,
  active boolean,
  created_at timestamptz,
  updated_at timestamptz
)
language sql
security definer
set search_path = public
as $$
  select
    pr.id,
    pr.owner_user_id,
    pr.amount_pence,
    pr.note,
    pr.active,
    pr.created_at,
    pr.updated_at
  from public.payment_requests pr
  where pr.owner_user_id = target_user_id
    and pr.active = true
  limit 1;
$$;

grant execute on function public.get_active_payment_request_for_user(uuid) to authenticated;

create or replace function public.get_tap_card_context(card_code_input text)
returns table (
  card_code text,
  owner_user_id uuid,
  payer_display_name text,
  payer_email text
)
language sql
security definer
set search_path = public
as $$
  select
    c.card_code,
    c.owner_user_id,
    p.display_name,
    p.email
  from public.nfc_cards c
  join public.profiles p on p.id = c.owner_user_id
  where c.card_code = card_code_input
    and c.active = true
  limit 1;
$$;

grant execute on function public.get_tap_card_context(text) to authenticated;

create or replace function public.get_my_transactions(limit_count integer default 20, target_user_id uuid default auth.uid())
returns table (
  id uuid,
  payer_user_id uuid,
  receiver_user_id uuid,
  amount_pence integer,
  note text,
  created_at timestamptz,
  payer_name text,
  receiver_name text
)
language sql
security definer
set search_path = public
as $$
  select
    t.id,
    t.payer_user_id,
    t.receiver_user_id,
    t.amount_pence,
    t.note,
    t.created_at,
    payer.display_name as payer_name,
    receiver.display_name as receiver_name
  from public.transactions t
  join public.profiles payer on payer.id = t.payer_user_id
  join public.profiles receiver on receiver.id = t.receiver_user_id
  where (t.payer_user_id = auth.uid() or t.receiver_user_id = auth.uid())
    and (target_user_id is null or t.payer_user_id = target_user_id or t.receiver_user_id = target_user_id)
  order by t.created_at desc
  limit greatest(limit_count, 1);
$$;

grant execute on function public.get_my_transactions(integer, uuid) to authenticated;

create or replace function public.execute_card_payment(
  card_code_input text,
  amount_pence_input integer,
  pin_input text,
  note_input text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  payer_profile public.profiles%rowtype;
  receiver_profile public.profiles%rowtype;
  card_record public.nfc_cards%rowtype;
  transaction_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  if amount_pence_input is null or amount_pence_input <= 0 then
    raise exception 'Amount must be greater than zero';
  end if;

  if pin_input !~ '^\d{4}$' then
    raise exception 'PIN must be exactly 4 digits';
  end if;

  select *
  into receiver_profile
  from public.profiles
  where id = auth.uid()
  for update;

  select *
  into card_record
  from public.nfc_cards
  where card_code = card_code_input
    and active = true
  limit 1;

  if card_record.id is null then
    raise exception 'Card not found';
  end if;

  select *
  into payer_profile
  from public.profiles
  where id = card_record.owner_user_id
  for update;

  if payer_profile.id = receiver_profile.id then
    raise exception 'You cannot pay yourself';
  end if;

  if payer_profile.pin_hash is null or payer_profile.pin_hash <> crypt(pin_input, payer_profile.pin_hash) then
    raise exception 'Wrong PIN';
  end if;

  if payer_profile.balance_pence < amount_pence_input then
    raise exception 'Insufficient funds';
  end if;

  update public.profiles
  set balance_pence = balance_pence - amount_pence_input
  where id = payer_profile.id;

  update public.profiles
  set balance_pence = balance_pence + amount_pence_input
  where id = receiver_profile.id;

  insert into public.transactions (payer_user_id, receiver_user_id, amount_pence, note)
  values (payer_profile.id, receiver_profile.id, amount_pence_input, nullif(trim(note_input), ''))
  returning id into transaction_id;

  return transaction_id;
end;
$$;

grant execute on function public.execute_card_payment(text, integer, text, text) to authenticated;

create or replace function public.admin_seed_profile(
  target_user_id uuid,
  email_input text,
  display_name_input text,
  pin_input text,
  balance_pence_input integer,
  card_code_input text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.profiles
  set
    email = email_input,
    display_name = display_name_input,
    pin_hash = crypt(pin_input, gen_salt('bf')),
    balance_pence = balance_pence_input
  where id = target_user_id;

  insert into public.nfc_cards (card_code, owner_user_id, active)
  values (card_code_input, target_user_id, true)
  on conflict (card_code) do update
    set owner_user_id = excluded.owner_user_id,
        active = true;

  insert into public.payment_requests (owner_user_id, amount_pence, note, active)
  values (target_user_id, null, null, true)
  on conflict (owner_user_id) do nothing;
end;
$$;

grant execute on function public.admin_seed_profile(uuid, text, text, text, integer, text) to service_role;
