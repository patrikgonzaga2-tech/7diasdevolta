-- App Corpo Feliz (Desafio Volta ao Eixo 7D): progresso de cada cliente na nuvem.
-- Projeto Supabase: "Projeto Corpo Feliz" (fjlbvoephhextnxemygf).
-- Cada cliente entra com e-mail + código e só enxerga a própria linha.
-- As fotos NÃO vêm para cá: ficam só no celular da cliente.

create table if not exists public.app_progresso (
  user_id      uuid primary key references auth.users (id) on delete cascade,
  email        text,
  dados        jsonb not null default '{}'::jsonb,
  criado_em    timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  constraint app_progresso_tamanho check (pg_column_size(dados) < 200000)
);

comment on table public.app_progresso is
  'App Corpo Feliz / Desafio 7D: progresso da cliente (dias, passos, comentários, medidas). Uma linha por conta. Fotos não são guardadas aqui.';

alter table public.app_progresso enable row level security;

drop policy if exists "cliente le o proprio progresso" on public.app_progresso;
create policy "cliente le o proprio progresso" on public.app_progresso
  for select to authenticated using ((select auth.uid()) = user_id);

drop policy if exists "cliente cria o proprio progresso" on public.app_progresso;
create policy "cliente cria o proprio progresso" on public.app_progresso
  for insert to authenticated with check ((select auth.uid()) = user_id);

drop policy if exists "cliente atualiza o proprio progresso" on public.app_progresso;
create policy "cliente atualiza o proprio progresso" on public.app_progresso
  for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

revoke all on public.app_progresso from anon;
revoke all on public.app_progresso from authenticated;
grant select, insert, update on public.app_progresso to authenticated;

-- Atualiza "atualizado_em" sozinho a cada gravação.
create or replace function public.app_progresso_touch()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.atualizado_em := now();
  return new;
end $$;

drop trigger if exists app_progresso_touch on public.app_progresso;
create trigger app_progresso_touch before update on public.app_progresso
  for each row execute function public.app_progresso_touch();
