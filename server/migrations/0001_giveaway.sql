-- Giveaway schema for Postgres/Neon (reference migration)
-- Note: this repo does not currently include Drizzle tooling/runtime.

create extension if not exists pgcrypto;

create table if not exists giveaway_license_keys (
  id uuid primary key default gen_random_uuid(),
  tier text not null check (tier in ('consumer','advanced','pro','account_recovery')),
  license_key text not null unique,
  is_claimed boolean not null default false,
  claimed_at timestamptz null,
  claimed_email text null,
  claimed_ip text null,
  claimed_user_agent text null,
  created_at timestamptz not null default now()
);

create table if not exists giveaway_claims (
  id uuid primary key default gen_random_uuid(),
  tier text not null,
  email text not null,
  ip text not null,
  user_agent text null,
  created_at timestamptz not null default now(),
  license_key_id uuid not null references giveaway_license_keys(id),
  unique (email, tier)
);

create index if not exists idx_giveaway_license_keys_tier_claimed
  on giveaway_license_keys(tier, is_claimed);

create index if not exists idx_giveaway_claims_ip_created_at
  on giveaway_claims(ip, created_at);
