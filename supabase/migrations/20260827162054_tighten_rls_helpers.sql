create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

revoke execute on function public.current_profile() from public, anon, authenticated;
revoke execute on function public.current_role() from public, anon, authenticated;
revoke execute on function public.current_unit_id() from public, anon, authenticated;
revoke execute on function public.is_admin() from public, anon, authenticated;
revoke execute on function public.can_access_protocol(public.protocolos) from public, anon, authenticated;

do $$
begin
  if exists (
    select 1
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.proname = 'rls_auto_enable'
      and p.pronargs = 0
  ) then
    revoke execute on function public.rls_auto_enable() from public, anon, authenticated;
  end if;
end;
$$;

drop policy if exists usuarios_select on public.usuarios;
create policy usuarios_select on public.usuarios
for select to authenticated
using (id = (select auth.uid())::text or (select public.is_admin()));

drop policy if exists usuarios_insert_own on public.usuarios;
create policy usuarios_insert_own on public.usuarios
for insert to authenticated
with check (id = (select auth.uid())::text or (select public.is_admin()));

drop policy if exists usuarios_update_admin on public.usuarios;
create policy usuarios_update_admin on public.usuarios
for update to authenticated
using (id = (select auth.uid())::text or (select public.is_admin()))
with check (id = (select auth.uid())::text or (select public.is_admin()));

drop policy if exists unidades_write_admin on public.unidades;
drop policy if exists unidades_insert_admin on public.unidades;
create policy unidades_insert_admin on public.unidades
for insert to authenticated
with check ((select public.is_admin()));

drop policy if exists unidades_update_admin on public.unidades;
create policy unidades_update_admin on public.unidades
for update to authenticated
using ((select public.is_admin()))
with check ((select public.is_admin()));

drop policy if exists unidades_delete_admin on public.unidades;
create policy unidades_delete_admin on public.unidades
for delete to authenticated
using ((select public.is_admin()));

drop policy if exists protocolos_select_competence on public.protocolos;
create policy protocolos_select_competence on public.protocolos
for select to authenticated
using ((select public.can_access_protocol(protocolos)));

drop policy if exists protocolos_insert_operational on public.protocolos;
create policy protocolos_insert_operational on public.protocolos
for insert to authenticated
with check (
  (select public.is_admin())
  or (select public.current_role()) = any(array[
    'entrada', 'conselho', 'samic', 'rede', 'vigilancia',
    'autoridade_policial', 'policia_civil', 'policia_federal'
  ]::text[])
);

drop policy if exists protocolos_update_competence on public.protocolos;
create policy protocolos_update_competence on public.protocolos
for update to authenticated
using ((select public.can_access_protocol(protocolos)))
with check ((select public.can_access_protocol(protocolos)));

drop policy if exists protocolos_delete_admin on public.protocolos;
create policy protocolos_delete_admin on public.protocolos
for delete to authenticated
using ((select public.is_admin()));

drop policy if exists encaminhamentos_access on public.encaminhamentos;
create policy encaminhamentos_access on public.encaminhamentos
for all to authenticated
using (
  (select public.is_admin())
  or origin_unit_id = (select public.current_unit_id())
  or destination_unit_id = (select public.current_unit_id())
  or exists (
    select 1 from public.protocolos p
    where p.id = encaminhamentos.protocol_id
    and (select public.can_access_protocol(p))
  )
)
with check (
  (select public.is_admin())
  or origin_unit_id = (select public.current_unit_id())
  or destination_unit_id = (select public.current_unit_id())
  or exists (
    select 1 from public.protocolos p
    where p.id = encaminhamentos.protocol_id
    and (select public.can_access_protocol(p))
  )
);

drop policy if exists notificacoes_access on public.notificacoes;
create policy notificacoes_access on public.notificacoes
for all to authenticated
using (
  user_id = (select auth.uid())::text
  or target_role = (select public.current_role())
  or (select public.is_admin())
)
with check (
  user_id = (select auth.uid())::text
  or target_role = (select public.current_role())
  or (select public.is_admin())
);

drop policy if exists auditoria_insert_authenticated on public.auditoria;
create policy auditoria_insert_authenticated on public.auditoria
for insert to authenticated
with check (actor_id = (select auth.uid())::text or (select public.is_admin()));

drop policy if exists auditoria_select_admin on public.auditoria;
create policy auditoria_select_admin on public.auditoria
for select to authenticated
using ((select public.is_admin()));

drop policy if exists configuracoes_write_admin on public.configuracoes;
drop policy if exists configuracoes_insert_admin on public.configuracoes;
create policy configuracoes_insert_admin on public.configuracoes
for insert to authenticated
with check ((select public.is_admin()));

drop policy if exists configuracoes_update_admin on public.configuracoes;
create policy configuracoes_update_admin on public.configuracoes
for update to authenticated
using ((select public.is_admin()))
with check ((select public.is_admin()));

drop policy if exists configuracoes_delete_admin on public.configuracoes;
create policy configuracoes_delete_admin on public.configuracoes
for delete to authenticated
using ((select public.is_admin()));
