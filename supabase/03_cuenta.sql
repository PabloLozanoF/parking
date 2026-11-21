-- =====================================================================
--  PARKING - «Mi cuenta», Google y matrículas extranjeras
--  Ejecutar DESPUÉS de schema.sql y 02_rediseno.sql:
--  Supabase → SQL Editor → New query → pega todo → Run
--  Se puede ejecutar más de una vez sin romper nada.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. Al entrar con Google el nombre llega como full_name / name
-- ---------------------------------------------------------------------
create or replace function public.crear_perfil()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.perfiles (id, nombre, telefono)
  values (
    new.id,
    coalesce(
      nullif(new.raw_user_meta_data ->> 'nombre', ''),
      nullif(new.raw_user_meta_data ->> 'full_name', ''),
      nullif(new.raw_user_meta_data ->> 'name', ''),
      ''
    ),
    new.raw_user_meta_data ->> 'telefono'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

-- Perfiles ya creados con Google sin nombre
update public.perfiles p
   set nombre = coalesce(nullif(u.raw_user_meta_data ->> 'full_name', ''), nullif(u.raw_user_meta_data ->> 'name', ''), '')
  from auth.users u
 where u.id = p.id and coalesce(p.nombre, '') = '';

-- ---------------------------------------------------------------------
-- 2. Preferencias del usuario (tema, idioma, avisos)
-- ---------------------------------------------------------------------
alter table public.perfiles
  add column if not exists preferencias jsonb not null default '{}'::jsonb;

-- ---------------------------------------------------------------------
-- 3. Vehículos guardados («Mis vehículos»)
--    ES   = formato español actual (1234BCD)
--    OTRO = extranjera o española antigua (2 a 10 letras/números)
-- ---------------------------------------------------------------------
create table if not exists public.vehiculos (
  id          bigint generated always as identity primary key,
  usuario_id  uuid not null references public.perfiles (id) on delete cascade,
  matricula   text not null,
  alias       text not null default '',
  pais        text not null default 'ES' check (pais in ('ES', 'OTRO')),
  principal   boolean not null default false,
  creado_en   timestamptz not null default now(),
  unique (usuario_id, matricula),
  constraint vehiculos_matricula_ok check (
    (pais = 'ES'   and matricula ~ '^[0-9]{4}[BCDFGHJKLMNPRSTVWXYZ]{3}$') or
    (pais = 'OTRO' and matricula ~ '^[A-Z0-9]{2,10}$')
  )
);

-- Solo un vehículo principal por usuario
create unique index if not exists vehiculos_un_principal
  on public.vehiculos (usuario_id) where principal;

-- ---------------------------------------------------------------------
-- 4. Seguridad (Row Level Security)
--    El backend usa la service_role key; esto protege el acceso directo.
-- ---------------------------------------------------------------------
alter table public.vehiculos enable row level security;

drop policy if exists "vehiculos propios" on public.vehiculos;
create policy "vehiculos propios" on public.vehiculos
  for all using (usuario_id = auth.uid()) with check (usuario_id = auth.uid());
