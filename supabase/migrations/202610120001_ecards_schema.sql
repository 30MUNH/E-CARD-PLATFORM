create extension if not exists pgcrypto;

create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  role text not null default 'editor' check (role in ('admin', 'editor')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ecard_cards (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete restrict,
  public_slug text not null unique default encode(extensions.gen_random_bytes(16), 'hex'),
  title text not null check (char_length(trim(title)) between 1 and 200),
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  current_draft_version_id uuid,
  active_published_version_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ecard_card_members (
  card_id uuid not null references public.ecard_cards(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  can_edit boolean not null default true,
  can_publish boolean not null default false,
  can_archive boolean not null default false,
  created_at timestamptz not null default now(),
  primary key (card_id, user_id)
);

create table if not exists public.ecard_versions (
  id uuid primary key default gen_random_uuid(),
  card_id uuid not null references public.ecard_cards(id) on delete cascade,
  version_number integer not null check (version_number > 0),
  config jsonb not null check (jsonb_typeof(config) = 'object'),
  pin_hash text,
  kind text not null check (kind in ('draft', 'published')),
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  unique (card_id, version_number)
);

alter table public.ecard_cards
  add constraint ecard_cards_current_draft_fk
  foreign key (current_draft_version_id) references public.ecard_versions(id)
  deferrable initially deferred;

alter table public.ecard_cards
  add constraint ecard_cards_active_published_fk
  foreign key (active_published_version_id) references public.ecard_versions(id)
  deferrable initially deferred;

create table if not exists public.ecard_publications (
  id uuid primary key default gen_random_uuid(),
  card_id uuid not null references public.ecard_cards(id) on delete cascade,
  version_id uuid not null references public.ecard_versions(id) on delete restrict,
  published_by uuid not null references auth.users(id) on delete restrict,
  published_at timestamptz not null default now(),
  revoked_at timestamptz
);

create table if not exists public.media_assets (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete restrict,
  card_id uuid references public.ecard_cards(id) on delete set null,
  storage_bucket text not null default 'ecard-media',
  storage_path text not null unique,
  filename text not null,
  mime_type text not null,
  media_type text not null check (media_type in ('image', 'audio', 'video')),
  size_bytes bigint not null check (size_bytes > 0),
  created_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.ecard_version_media (
  version_id uuid not null references public.ecard_versions(id) on delete cascade,
  media_asset_id uuid not null references public.media_assets(id) on delete restrict,
  primary key (version_id, media_asset_id)
);

create table if not exists public.ecard_templates (
  id text primary key,
  name text not null,
  tagline text not null,
  description text not null,
  preview_image_url text not null,
  accent_color text not null,
  supported_slides jsonb not null check (jsonb_typeof(supported_slides) = 'array'),
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.recipient_sessions (
  id uuid primary key default gen_random_uuid(),
  card_id uuid not null references public.ecard_cards(id) on delete cascade,
  token_hash text not null unique,
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  revoked_at timestamptz
);

create index if not exists ecard_cards_owner_updated_idx
  on public.ecard_cards(owner_id, updated_at desc);
create index if not exists ecard_cards_status_idx
  on public.ecard_cards(status);
create index if not exists ecard_versions_card_kind_idx
  on public.ecard_versions(card_id, kind, version_number desc);
create index if not exists ecard_publications_card_idx
  on public.ecard_publications(card_id, published_at desc);
create index if not exists media_assets_owner_idx
  on public.media_assets(owner_id, created_at desc);
create index if not exists recipient_sessions_card_idx
  on public.recipient_sessions(card_id, expires_at);

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_touch_updated_at on public.profiles;
create trigger profiles_touch_updated_at
before update on public.profiles
for each row execute function public.touch_updated_at();

drop trigger if exists ecard_cards_touch_updated_at on public.ecard_cards;
create trigger ecard_cards_touch_updated_at
before update on public.ecard_cards
for each row execute function public.touch_updated_at();

create or replace function public.has_card_capability(
  p_user_id uuid,
  p_card_id uuid,
  p_capability text
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles profile
    join public.ecard_cards card on card.id = p_card_id
    where profile.user_id = p_user_id
      and (
        profile.role = 'admin'
        or (card.owner_id = p_user_id and p_capability in ('edit', 'publish', 'archive'))
        or exists (
          select 1
          from public.ecard_card_members member
          where member.card_id = card.id
            and member.user_id = p_user_id
            and (
              (p_capability = 'edit' and member.can_edit)
              or (p_capability = 'publish' and member.can_publish)
              or (p_capability = 'archive' and member.can_archive)
            )
        )
      )
  );
$$;

revoke all on function public.has_card_capability(uuid, uuid, text) from public;
grant execute on function public.has_card_capability(uuid, uuid, text) to service_role;

alter table public.profiles enable row level security;
alter table public.ecard_cards enable row level security;
alter table public.ecard_card_members enable row level security;
alter table public.ecard_versions enable row level security;
alter table public.ecard_publications enable row level security;
alter table public.media_assets enable row level security;
alter table public.ecard_version_media enable row level security;
alter table public.ecard_templates enable row level security;
alter table public.recipient_sessions enable row level security;

create policy profiles_self_read on public.profiles
for select to authenticated
using (user_id = auth.uid());

create policy cards_capability_read on public.ecard_cards
for select to authenticated
using (public.has_card_capability(auth.uid(), id, 'edit'));

create policy cards_capability_write on public.ecard_cards
for update to authenticated
using (public.has_card_capability(auth.uid(), id, 'edit'))
with check (public.has_card_capability(auth.uid(), id, 'edit'));

create policy card_members_capability_read on public.ecard_card_members
for select to authenticated
using (user_id = auth.uid() or public.has_card_capability(auth.uid(), card_id, 'edit'));

create policy versions_capability_read on public.ecard_versions
for select to authenticated
using (public.has_card_capability(auth.uid(), card_id, 'edit'));

create policy publications_capability_read on public.ecard_publications
for select to authenticated
using (public.has_card_capability(auth.uid(), card_id, 'edit'));

create policy media_owner_read on public.media_assets
for select to authenticated
using (owner_id = auth.uid() or public.has_card_capability(auth.uid(), card_id, 'edit'));

create policy version_media_capability_read on public.ecard_version_media
for select to authenticated
using (exists (
  select 1 from public.ecard_versions version
  where version.id = version_id
    and public.has_card_capability(auth.uid(), version.card_id, 'edit')
));

create policy templates_authenticated_read on public.ecard_templates
for select to authenticated
using (true);

create policy sessions_no_client_read on public.recipient_sessions
for select to authenticated
using (false);

insert into storage.buckets (id, name, public)
values ('ecard-media', 'ecard-media', false)
on conflict (id) do update set public = false;

create policy ecard_media_owner_read on storage.objects
for select to authenticated
using (
  bucket_id = 'ecard-media'
  and (name like (auth.uid()::text || '/%'))
);

create policy ecard_media_owner_insert on storage.objects
for insert to authenticated
with check (
  bucket_id = 'ecard-media'
  and (name like (auth.uid()::text || '/%'))
);

insert into public.ecard_templates (
  id, name, tagline, description, preview_image_url, accent_color, supported_slides, is_default
)
values
  (
    '8fa6d2b3-ba30-4290-9ac7-7a830c23bc7a',
    'By.Duni Classic Scrapbook',
    'Ghi dấu kỷ niệm ngọt ngào với album ảnh, lá thư tay và bộ bài Love Drunk',
    'Giao diện chuẩn By.Duni với khung ảnh Polaroid, hiệu ứng máy đánh chữ lãng mạn, trình phát nhạc và trò chơi rút bài tương tác cho cặp đôi.',
    '/template/background-welcome.png',
    '#A33149',
    '["homepage", "album", "music", "letter", "timeline", "game", "video", "setting"]'::jsonb,
    true
  ),
  (
    'c421e9f0-71a4-4d8e-b8c2-9102f43a11e2',
    'Editorial Rose & Ivory',
    'Phong cách tạp chí tinh tế cho kỷ niệm ngày cưới & cầu hôn',
    'Bố cục tạp chí sang trọng với tông màu hồng đất & kem ngà, tối ưu cho thư tình dài, dòng thời gian kỷ niệm và bộ sưu tập ảnh nghệ thuật.',
    '/template/background-template.jpg',
    '#8c5261',
    '["homepage", "album", "music", "letter", "timeline", "video"]'::jsonb,
    false
  ),
  (
    'f910b3a8-19c2-43d1-901a-55b8210ce490',
    'Minimalist Sweetheart',
    'Tối giản, tập trung vào câu chuyện tình yêu và âm nhạc',
    'Thiết kế hiện đại tối giản dành cho các cặp đôi yêu thích sự nhẹ nhàng, tập trung vào lời nhắn gửi và giai điệu kỷ niệm.',
    '/template/background-template-2.png',
    '#BB254E',
    '["homepage", "album", "music", "letter", "game"]'::jsonb,
    false
  )
on conflict (id) do update set
  name = excluded.name,
  tagline = excluded.tagline,
  description = excluded.description,
  preview_image_url = excluded.preview_image_url,
  accent_color = excluded.accent_color,
  supported_slides = excluded.supported_slides,
  is_default = excluded.is_default;
