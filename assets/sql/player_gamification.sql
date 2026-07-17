create table if not exists public.player_gamification (
  player_id        uuid primary key references public.player_profiles(id) on delete cascade,
  professional_id  uuid not null,
  total_points     integer not null default 0,
  level            integer not null default 1,
  session_count    integer not null default 0,
  achievements     jsonb not null default '{}'::jsonb,
  challenges       jsonb not null default '{}'::jsonb,
  updated_at       timestamptz not null default now()
);

-- Si tus otras tablas (sessions, player_profiles...) tienen Row Level Security
-- activado con políticas por professional_id, replica la misma aquí. Si no,
-- no hace falta tocar nada más: esta tabla se comportará igual que el resto.
