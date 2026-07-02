-- ==========================================
-- SCHEMA SQL PARA SUPABASE - LIGA DO FERRO
-- ==========================================
-- Cole este código no SQL Editor do seu painel Supabase e clique em "Run".

-- 0. (OPCIONAL) Limpar tabela antiga se quiser recriar do zero
-- ATENÇÃO: Descomente a linha abaixo apenas se quiser apagar todos os perfis e históricos existentes:
-- drop table if exists public.profiles cascade;

-- 1. Criar a tabela de perfis (profiles)
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade not null primary key,
  username text not null default 'Monstro',
  xp integer not null default 0,
  workouts integer not null default 0,
  prs jsonb not null default '{}'::jsonb,
  feed jsonb not null default '[]'::jsonb,
  profile_img text,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

-- 2. Habilitar Row Level Security (RLS)
alter table public.profiles enable row level security;

-- 3. Limpar políticas antigas se existirem para evitar conflito de nomes
drop policy if exists "Perfis são visíveis para todos os usuários autenticados" on public.profiles;
drop policy if exists "Usuários podem criar seu próprio perfil" on public.profiles;
drop policy if exists "Usuários podem atualizar seu próprio perfil" on public.profiles;

-- 4. Políticas de Segurança (Policies)

-- Permitir que qualquer usuário autenticado veja os perfis (útil para rankings no futuro)
create policy "Perfis são visíveis para todos os usuários autenticados"
  on public.profiles
  for select
  to authenticated
  using (true);

-- Permitir que o usuário insira apenas o seu próprio perfil
create policy "Usuários podem criar seu próprio perfil"
  on public.profiles
  for insert
  to authenticated
  with check (auth.uid() = id);

-- Permitir que o usuário atualize apenas o seu próprio perfil
create policy "Usuários podem atualizar seu próprio perfil"
  on public.profiles
  for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- 5. Função e Trigger para Criar Perfil Automaticamente ao Cadastrar
-- Quando um novo usuário assina contrato no auth.users, o Postgres cria a linha no profiles instantaneamente!

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, username, xp, workouts, prs, feed)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1), 'Monstro'),
    0,
    0,
    '{}'::jsonb,
    '[]'::jsonb
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

-- Remover a trigger antiga se existir para recriar limpa
drop trigger if exists on_auth_user_created on auth.users;

-- Criar a trigger atrelada à tabela de usuários da autenticação
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
