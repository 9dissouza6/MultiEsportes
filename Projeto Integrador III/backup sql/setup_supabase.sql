-- ==========================================================
-- MultiEsportes — Script de configuração do banco Supabase
-- Execute este script inteiro no SQL Editor do Supabase
-- (Painel do projeto → SQL Editor → New query → colar e RUN)
-- ==========================================================

-- 1) TABELA DE PERFIS (dados extras de cada usuário)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  city text,
  state text,
  role text default 'user',
  updated_at timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Usuário vê o próprio perfil"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Usuário edita o próprio perfil"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Usuário cria o próprio perfil"
  on public.profiles for insert
  with check (auth.uid() = id);


-- 2) TABELA DE ESPAÇOS (quadras/campos disponíveis)
create table if not exists public.spaces (
  id bigint generated always as identity primary key,
  name text not null,
  sport_type text not null,
  city text,
  address text,
  price_per_hour numeric not null default 0,
  amenities text[] default '{}',
  capacity int,
  active boolean default true,
  created_at timestamptz default now()
);

alter table public.spaces enable row level security;

create policy "Qualquer pessoa vê espaços ativos"
  on public.spaces for select
  using (active = true);


-- 3) TABELA DE AGENDAMENTOS (reservas)
create table if not exists public.bookings (
  id bigint generated always as identity primary key,
  space_id bigint references public.spaces(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  booking_date date not null,
  start_time time not null,
  end_time time not null,
  total_price numeric not null default 0,
  status text default 'confirmed',
  created_at timestamptz default now()
);

alter table public.bookings enable row level security;

create policy "Usuário vê os próprios agendamentos"
  on public.bookings for select
  using (auth.uid() = user_id);

create policy "Usuário cria os próprios agendamentos"
  on public.bookings for insert
  with check (auth.uid() = user_id);

create policy "Usuário cancela/edita os próprios agendamentos"
  on public.bookings for update
  using (auth.uid() = user_id);


-- 4) DADOS DE EXEMPLO (os mesmos espaços que já apareciam no site)
insert into public.spaces (name, sport_type, city, address, price_per_hour, amenities, capacity, active) values
  ('Arena Society FC', 'futebol', 'São Paulo', 'Rua das Flores, 100 - Centro, SP', 120, array['Grama sintética','Iluminação','Vestiário','Estacionamento'], 14, true),
  ('Quadra Nova Era', 'basquete', 'São Paulo', 'Av. Paulista, 500 - Bela Vista, SP', 80, array['Piso emborrachado','Ar-condicionado','Bebedouro'], 10, true),
  ('Tênis Clube Premium', 'tenis', 'São Paulo', 'Rua Oscar Freire, 220 - Jardins, SP', 90, array['Saibro','Estacionamento','Lanchonete'], 4, true),
  ('Centro Esportivo Vôlei', 'volei', 'Campinas', 'Av. Brasil, 1500 - Centro, Campinas', 70, array['Piso vinílico','Iluminação','Vestiário'], 12, true),
  ('Padel Sport Club', 'padel', 'Curitiba', 'Rua XV de Novembro, 80 - Curitiba, PR', 110, array['Parede de vidro','Iluminação LED','Vestiário premium'], 4, true),
  ('Arena Golaço', 'futebol', 'Belo Horizonte', 'Av. Getúlio Vargas, 700 - BH', 100, array['Grama natural','Alambrado','Placar eletrônico'], 18, true)
on conflict do nothing;
