-- Rede Protege Maues - estrutura inicial Supabase
-- Projeto remoto: ukjcjzijhakkxnerbvid

create extension if not exists pgcrypto with schema extensions;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.usuarios (
  id text primary key,
  email text unique not null,
  name text not null default '',
  role text not null default 'pending',
  unit_id text not null default '',
  active boolean not null default false,
  liberation text not null default 'pendente',
  requested_unit text not null default '',
  provider text not null default 'password',
  email_verified boolean not null default false,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.unidades (
  id text primary key,
  name text not null,
  acronym text,
  institution_type text,
  service_type text,
  active boolean not null default true,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.protocolos (
  id text primary key,
  number text unique,
  origin_unit_id text,
  current_unit_id text,
  status text,
  status_code text,
  stage text,
  priority text,
  visible_to_roles text[] not null default '{}'::text[],
  visible_to_units text[] not null default '{}'::text[],
  access_grants text[] not null default '{}'::text[],
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.encaminhamentos (
  id text primary key,
  protocol_id text references public.protocolos(id) on delete cascade,
  origin_unit_id text,
  destination_unit_id text,
  status text,
  deadline timestamptz,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.notificacoes (
  id text primary key,
  user_id text,
  target_role text,
  protocol_id text references public.protocolos(id) on delete cascade,
  read boolean not null default false,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.auditoria (
  id text primary key,
  actor_id text,
  action text not null,
  target text,
  at timestamptz not null default now(),
  payload jsonb not null default '{}'::jsonb
);

create table if not exists public.configuracoes (
  id text primary key default 'config',
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_usuarios_email on public.usuarios (lower(email));
create index if not exists idx_usuarios_role_active on public.usuarios (role, active);
create index if not exists idx_protocolos_updated_at on public.protocolos (updated_at desc);
create index if not exists idx_protocolos_stage_status on public.protocolos (stage, status_code);
create index if not exists idx_protocolos_visible_roles on public.protocolos using gin (visible_to_roles);
create index if not exists idx_protocolos_visible_units on public.protocolos using gin (visible_to_units);
create index if not exists idx_encaminhamentos_protocol_id on public.encaminhamentos (protocol_id);
create index if not exists idx_notificacoes_user_read on public.notificacoes (user_id, read);
create index if not exists idx_auditoria_at on public.auditoria (at desc);

drop trigger if exists set_updated_at_usuarios on public.usuarios;
create trigger set_updated_at_usuarios before update on public.usuarios
for each row execute function public.set_updated_at();

drop trigger if exists set_updated_at_unidades on public.unidades;
create trigger set_updated_at_unidades before update on public.unidades
for each row execute function public.set_updated_at();

drop trigger if exists set_updated_at_protocolos on public.protocolos;
create trigger set_updated_at_protocolos before update on public.protocolos
for each row execute function public.set_updated_at();

drop trigger if exists set_updated_at_encaminhamentos on public.encaminhamentos;
create trigger set_updated_at_encaminhamentos before update on public.encaminhamentos
for each row execute function public.set_updated_at();

drop trigger if exists set_updated_at_notificacoes on public.notificacoes;
create trigger set_updated_at_notificacoes before update on public.notificacoes
for each row execute function public.set_updated_at();

drop trigger if exists set_updated_at_configuracoes on public.configuracoes;
create trigger set_updated_at_configuracoes before update on public.configuracoes
for each row execute function public.set_updated_at();

create or replace function public.current_profile()
returns public.usuarios
language sql
stable
security definer
set search_path = public
as $$
  select *
  from public.usuarios
  where id = auth.uid()::text
     or lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  order by case when id = auth.uid()::text then 0 else 1 end
  limit 1
$$;

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  normalized_email text := lower(coalesce(new.email, ''));
  bootstrap_admin boolean := lower(coalesce(new.email, '')) = 'diegofernandosilva.10@gmail.com';
  display_name text := coalesce(nullif(new.raw_user_meta_data ->> 'name', ''), split_part(normalized_email, '@', 1), 'Usuario');
  requested_unit text := coalesce(new.raw_user_meta_data ->> 'requestedUnit', '');
begin
  insert into public.usuarios (
    id,
    email,
    name,
    role,
    unit_id,
    active,
    liberation,
    requested_unit,
    provider,
    email_verified,
    payload
  )
  values (
    new.id::text,
    normalized_email,
    display_name,
    case when bootstrap_admin then 'admin' else 'pending' end,
    case when bootstrap_admin then 'rede' else '' end,
    bootstrap_admin,
    case when bootstrap_admin then 'liberado' else 'pendente' end,
    case when bootstrap_admin then coalesce(nullif(requested_unit, ''), 'Administracao') else requested_unit end,
    coalesce(new.app_metadata ->> 'provider', 'password'),
    new.email_confirmed_at is not null,
    jsonb_build_object(
      'id', new.id::text,
      'email', normalized_email,
      'name', display_name,
      'role', case when bootstrap_admin then 'admin' else 'pending' end,
      'unitId', case when bootstrap_admin then 'rede' else '' end,
      'active', bootstrap_admin,
      'liberation', case when bootstrap_admin then 'liberado' else 'pendente' end,
      'requestedUnit', case when bootstrap_admin then coalesce(nullif(requested_unit, ''), 'Administracao') else requested_unit end,
      'provider', coalesce(new.app_metadata ->> 'provider', 'password'),
      'emailVerified', new.email_confirmed_at is not null,
      'createdAt', now(),
      'updatedAt', now()
    )
  )
  on conflict (email) do update
  set
    id = excluded.id,
    name = coalesce(nullif(public.usuarios.name, ''), excluded.name),
    role = case when bootstrap_admin then 'admin' else public.usuarios.role end,
    unit_id = case when bootstrap_admin then 'rede' else public.usuarios.unit_id end,
    active = case when bootstrap_admin then true else public.usuarios.active end,
    liberation = case when bootstrap_admin then 'liberado' else public.usuarios.liberation end,
    requested_unit = coalesce(nullif(public.usuarios.requested_unit, ''), excluded.requested_unit),
    provider = excluded.provider,
    email_verified = excluded.email_verified,
    payload = public.usuarios.payload || excluded.payload,
    updated_at = now();

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_auth_user();

revoke execute on function public.handle_new_auth_user() from public, anon, authenticated;

create or replace function public.current_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select coalesce((public.current_profile()).role, 'anon')
$$;

create or replace function public.current_unit_id()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select coalesce((public.current_profile()).unit_id, '')
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.current_role() = 'admin'
$$;

create or replace function public.can_access_protocol(protocol_row public.protocolos)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    public.is_admin()
    or public.current_role() = any(protocol_row.visible_to_roles)
    or public.current_unit_id() = any(protocol_row.visible_to_units)
    or auth.uid()::text = any(protocol_row.access_grants)
    or public.current_role() = 'supervisor_caso'
$$;

revoke execute on function public.current_profile() from public, anon;
revoke execute on function public.current_role() from public, anon;
revoke execute on function public.current_unit_id() from public, anon;
revoke execute on function public.is_admin() from public, anon;
revoke execute on function public.can_access_protocol(public.protocolos) from public, anon;

grant execute on function public.current_profile() to authenticated;
grant execute on function public.current_role() to authenticated;
grant execute on function public.current_unit_id() to authenticated;
grant execute on function public.is_admin() to authenticated;
grant execute on function public.can_access_protocol(public.protocolos) to authenticated;

alter table public.usuarios enable row level security;
alter table public.unidades enable row level security;
alter table public.protocolos enable row level security;
alter table public.encaminhamentos enable row level security;
alter table public.notificacoes enable row level security;
alter table public.auditoria enable row level security;
alter table public.configuracoes enable row level security;

grant usage on schema public to authenticated;
grant select, insert, update on public.usuarios to authenticated;
grant select, insert, update, delete on public.unidades to authenticated;
grant select, insert, update, delete on public.protocolos to authenticated;
grant select, insert, update, delete on public.encaminhamentos to authenticated;
grant select, insert, update, delete on public.notificacoes to authenticated;
grant select, insert on public.auditoria to authenticated;
grant select, insert, update on public.configuracoes to authenticated;

drop policy if exists usuarios_select on public.usuarios;
create policy usuarios_select on public.usuarios
for select to authenticated
using (id = auth.uid()::text or public.is_admin());

drop policy if exists usuarios_insert_own on public.usuarios;
create policy usuarios_insert_own on public.usuarios
for insert to authenticated
with check (id = auth.uid()::text or public.is_admin());

drop policy if exists usuarios_update_admin on public.usuarios;
create policy usuarios_update_admin on public.usuarios
for update to authenticated
using (id = auth.uid()::text or public.is_admin())
with check (id = auth.uid()::text or public.is_admin());

drop policy if exists unidades_read_authenticated on public.unidades;
create policy unidades_read_authenticated on public.unidades
for select to authenticated
using (true);

drop policy if exists unidades_write_admin on public.unidades;
create policy unidades_write_admin on public.unidades
for all to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists protocolos_select_competence on public.protocolos;
create policy protocolos_select_competence on public.protocolos
for select to authenticated
using (public.can_access_protocol(protocolos));

drop policy if exists protocolos_insert_operational on public.protocolos;
create policy protocolos_insert_operational on public.protocolos
for insert to authenticated
with check (
  public.is_admin()
  or public.current_role() = any(array[
    'entrada', 'conselho', 'samic', 'rede', 'vigilancia',
    'autoridade_policial', 'policia_civil', 'policia_federal'
  ]::text[])
);

drop policy if exists protocolos_update_competence on public.protocolos;
create policy protocolos_update_competence on public.protocolos
for update to authenticated
using (public.can_access_protocol(protocolos))
with check (public.can_access_protocol(protocolos));

drop policy if exists protocolos_delete_admin on public.protocolos;
create policy protocolos_delete_admin on public.protocolos
for delete to authenticated
using (public.is_admin());

drop policy if exists encaminhamentos_access on public.encaminhamentos;
create policy encaminhamentos_access on public.encaminhamentos
for all to authenticated
using (
  public.is_admin()
  or origin_unit_id = public.current_unit_id()
  or destination_unit_id = public.current_unit_id()
  or exists (
    select 1 from public.protocolos p
    where p.id = encaminhamentos.protocol_id
    and public.can_access_protocol(p)
  )
)
with check (
  public.is_admin()
  or origin_unit_id = public.current_unit_id()
  or destination_unit_id = public.current_unit_id()
  or exists (
    select 1 from public.protocolos p
    where p.id = encaminhamentos.protocol_id
    and public.can_access_protocol(p)
  )
);

drop policy if exists notificacoes_access on public.notificacoes;
create policy notificacoes_access on public.notificacoes
for all to authenticated
using (user_id = auth.uid()::text or target_role = public.current_role() or public.is_admin())
with check (user_id = auth.uid()::text or target_role = public.current_role() or public.is_admin());

drop policy if exists auditoria_insert_authenticated on public.auditoria;
create policy auditoria_insert_authenticated on public.auditoria
for insert to authenticated
with check (actor_id = auth.uid()::text or public.is_admin());

drop policy if exists auditoria_select_admin on public.auditoria;
create policy auditoria_select_admin on public.auditoria
for select to authenticated
using (public.is_admin());

drop policy if exists configuracoes_read_authenticated on public.configuracoes;
create policy configuracoes_read_authenticated on public.configuracoes
for select to authenticated
using (true);

drop policy if exists configuracoes_write_admin on public.configuracoes;
create policy configuracoes_write_admin on public.configuracoes
for all to authenticated
using (public.is_admin())
with check (public.is_admin());

insert into public.configuracoes (id, payload)
values (
  'config',
  '{
    "samic": {
      "start": "08:00",
      "end": "17:00",
      "weekdays": [1, 2, 3, 4, 5],
      "responsible": "",
      "contact": "",
      "exceptions": "",
      "offHoursRoute": "Rede de protecao e hospital/SAVVIS"
    },
    "deadlines": {
      "cienciaConselhoHoras": 2,
      "aceiteEncaminhamentoHoras": 24,
      "devolutivaDias": 7
    },
    "minGroupSize": 3,
    "retentionPolicy": "Uso operacional com dados minimizados, acesso por perfil e auditoria."
  }'::jsonb
)
on conflict (id) do nothing;
