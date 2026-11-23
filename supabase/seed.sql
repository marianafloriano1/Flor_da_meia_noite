-- Local-only test sink for Supabase Auth SMS hooks. This seed is not a migration
-- and must never be applied to a hosted/production project.
create table if not exists public.local_sms_captures (
  id bigint generated always as identity primary key,
  otp text not null,
  created_at timestamptz not null default now()
);

alter table public.local_sms_captures enable row level security;
revoke all on table public.local_sms_captures from public, anon, authenticated;
grant select, delete on table public.local_sms_captures to service_role;

create or replace function public.capture_local_sms_otp(event jsonb)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.local_sms_captures (otp)
  values (event -> 'sms' ->> 'otp');
  return '{}'::jsonb;
end;
$$;

revoke all on function public.capture_local_sms_otp(jsonb) from public, anon, authenticated;
grant execute on function public.capture_local_sms_otp(jsonb) to supabase_auth_admin;

-- Synthetic local-only catalog for evaluator/demo clones.
-- These are not real products or inventory. They are published with synthetic
-- stock only so a fresh local catalog has cards to explore. No image objects
-- are fabricated; the UI displays its existing "Imagem não cadastrada" state.
-- This file is applied by the local Supabase seed flow, after migrations.
-- Real Pexels source/CDN URLs and photographer credits are mapped per slug in
-- supabase/seed-demo-product-images.json. After db reset, run
-- npm run seed:demo-images to download and upload those photos to local Storage.
insert into public.catalog_products (
  slug,
  name,
  product_type,
  description,
  colors,
  price_brl,
  category_name,
  stock_quantity,
  occasion,
  size,
  materials,
  status
)
values
  (
    'demo-arranjo-encanto-floral',
    'Arranjo Encanto Floral (Demonstração)',
    'Arranjo demonstrativo',
    'Produto sintético de demonstração para avaliação local.',
    array[]::text[],
    229.90,
    'Arranjos',
    5,
    null,
    null,
    array[]::text[],
    'published'
  ),
  (
    'demo-buque-primavera',
    'Buquê Primavera (Demonstração)',
    'Buquê demonstrativo',
    'Produto sintético de demonstração para avaliação local.',
    array[]::text[],
    189.90,
    'Buquês',
    5,
    null,
    null,
    array[]::text[],
    'published'
  ),
  (
    'demo-buque-sol-radiante',
    'Buquê Sol Radiante (Demonstração)',
    'Buquê demonstrativo',
    'Produto sintético de demonstração para avaliação local.',
    array[]::text[],
    159.90,
    'Buquês',
    5,
    null,
    null,
    array[]::text[],
    'published'
  ),
  (
    'demo-buque-elegancia-de-lirios',
    'Buquê Elegância de Lírios (Demonstração)',
    'Buquê demonstrativo',
    'Produto sintético de demonstração para avaliação local.',
    array[]::text[],
    219.90,
    'Buquês',
    5,
    null,
    null,
    array[]::text[],
    'published'
  ),
  (
    'demo-buque-rosas-coloridas',
    'Buquê Rosas Coloridas (Demonstração)',
    'Buquê demonstrativo',
    'Produto sintético de demonstração para avaliação local.',
    array[]::text[],
    189.90,
    'Buquês',
    5,
    null,
    null,
    array[]::text[],
    'published'
  )
on conflict (slug) do nothing;
