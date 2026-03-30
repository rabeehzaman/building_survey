-- Run this SQL in your Supabase SQL Editor to create the tables

-- Buildings table
create table if not exists buildings (
  id uuid primary key default gen_random_uuid(),
  ward_no integer not null check (ward_no >= 1 and ward_no <= 56),
  location text not null,
  building_number text not null,
  building_owner_name text not null,
  owner_mob_no_1 text not null,
  mob_no_2 text,
  building_status text not null check (building_status in ('vacant', 'working')),
  vacancy_period text,
  has_shops boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Shops table (one-to-many with buildings)
create table if not exists shops (
  id uuid primary key default gen_random_uuid(),
  building_id uuid not null references buildings(id) on delete cascade,
  shop_details text not null,
  shop_licence_no text not null,
  shop_licensee_name text not null,
  licensee_contact_no text not null,
  shop_managing_person text not null,
  managing_person_contact_no text not null,
  connected_room text,
  ward_number integer not null check (ward_number >= 1 and ward_number <= 56),
  room_number text not null,
  location_name text not null,
  created_at timestamptz not null default now()
);

-- Index for faster lookups
create index if not exists idx_shops_building_id on shops(building_id);
create index if not exists idx_buildings_ward_no on buildings(ward_no);

-- Auto-update updated_at on buildings
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger buildings_updated_at
  before update on buildings
  for each row
  execute function update_updated_at();

-- Disable RLS for now (no auth) — enable later when adding auth
alter table buildings enable row level security;
alter table shops enable row level security;

-- Allow all operations (open access — secure this when adding auth)
create policy "Allow all on buildings" on buildings for all using (true) with check (true);
create policy "Allow all on shops" on shops for all using (true) with check (true);
