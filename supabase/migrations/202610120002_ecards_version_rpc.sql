create or replace function public.replace_ecard_draft(
  p_card_id uuid,
  p_actor_id uuid,
  p_base_version integer,
  p_config jsonb,
  p_pin_provided boolean,
  p_pin text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_card public.ecard_cards%rowtype;
  v_current public.ecard_versions%rowtype;
  v_version_number integer;
  v_pin_hash text;
  v_version_id uuid;
begin
  if not public.has_card_capability(p_actor_id, p_card_id, 'edit') then
    raise exception using errcode = '42501', message = 'UNAUTHORIZED';
  end if;

  select * into v_card
  from public.ecard_cards
  where id = p_card_id
  for update;

  if not found then
    raise exception using errcode = 'P0002', message = 'CARD_NOT_FOUND';
  end if;

  if v_card.current_draft_version_id is not null then
    select * into v_current from public.ecard_versions where id = v_card.current_draft_version_id;
  end if;

  if p_base_version is distinct from coalesce(v_current.version_number, 0) then
    raise exception using errcode = 'P0001', message = 'STALE_DRAFT_VERSION';
  end if;

  if jsonb_typeof(p_config) <> 'object'
     or p_config ?| array['newPin', 'confirmPin', 'pin', 'pinHash', 'pin_hash'] then
    raise exception using errcode = '22023', message = 'INVALID_DRAFT_CONFIG';
  end if;

  if p_pin_provided then
    if p_pin is null or p_pin = '' then
      v_pin_hash := null;
    elsif p_pin !~ '^[0-9]{4}$' then
      raise exception using errcode = '22023', message = 'INVALID_PIN';
    else
      v_pin_hash := extensions.crypt(p_pin, extensions.gen_salt('bf', 12));
    end if;
  else
    v_pin_hash := v_current.pin_hash;
    if v_pin_hash is null and v_card.active_published_version_id is not null then
      select pin_hash into v_pin_hash
      from public.ecard_versions
      where id = v_card.active_published_version_id;
    end if;
  end if;

  select coalesce(max(version_number), 0) + 1 into v_version_number
  from public.ecard_versions
  where card_id = p_card_id;

  insert into public.ecard_versions (
    card_id, version_number, config, pin_hash, kind, created_by
  )
  values (
    p_card_id, v_version_number, p_config, v_pin_hash, 'draft', p_actor_id
  )
  returning id into v_version_id;

  update public.ecard_cards
  set current_draft_version_id = v_version_id,
      title = coalesce(nullif(trim(p_config ->> 'title'), ''), title),
      updated_at = now()
  where id = p_card_id;

  return jsonb_build_object('version_id', v_version_id, 'version_number', v_version_number);
end;
$$;

create or replace function public.publish_ecard(
  p_card_id uuid,
  p_actor_id uuid,
  p_expected_draft_version integer
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_card public.ecard_cards%rowtype;
  v_draft public.ecard_versions%rowtype;
  v_published_version_number integer;
  v_published_version_id uuid;
  v_publication_id uuid;
begin
  if not public.has_card_capability(p_actor_id, p_card_id, 'publish') then
    raise exception using errcode = '42501', message = 'UNAUTHORIZED';
  end if;

  select * into v_card
  from public.ecard_cards
  where id = p_card_id
  for update;

  if not found then
    raise exception using errcode = 'P0002', message = 'CARD_NOT_FOUND';
  end if;

  if v_card.current_draft_version_id is null then
    raise exception using errcode = '22023', message = 'DRAFT_REQUIRED';
  end if;

  select * into v_draft
  from public.ecard_versions
  where id = v_card.current_draft_version_id
  for update;

  if v_draft.version_number <> p_expected_draft_version then
    raise exception using errcode = 'P0001', message = 'STALE_DRAFT_VERSION';
  end if;

  if v_draft.pin_hash is null then
    raise exception using errcode = '22023', message = 'PUBLISHED_PIN_REQUIRED';
  end if;

  select coalesce(max(version_number), 0) + 1 into v_published_version_number
  from public.ecard_versions
  where card_id = p_card_id;

  insert into public.ecard_versions (
    card_id, version_number, config, pin_hash, kind, created_by
  )
  values (
    p_card_id,
    v_published_version_number,
    v_draft.config,
    v_draft.pin_hash,
    'published',
    p_actor_id
  )
  returning id into v_published_version_id;

  insert into public.ecard_version_media (version_id, media_asset_id)
  select v_published_version_id, version_media.media_asset_id
  from public.ecard_version_media version_media
  where version_media.version_id = v_draft.id;

  insert into public.ecard_publications (card_id, version_id, published_by)
  values (p_card_id, v_published_version_id, p_actor_id)
  returning id into v_publication_id;

  update public.ecard_cards
  set active_published_version_id = v_published_version_id,
      status = 'published',
      updated_at = now()
  where id = p_card_id;

  update public.recipient_sessions
  set revoked_at = now()
  where card_id = p_card_id
    and revoked_at is null;

  return jsonb_build_object(
    'card_id', p_card_id,
    'version_id', v_published_version_id,
    'publication_id', v_publication_id,
    'version_number', v_published_version_number
  );
end;
$$;

create or replace function public.verify_ecard_pin(
  p_public_slug text,
  p_pin text
)
returns table (card_id uuid, version_id uuid)
language sql
security definer
set search_path = public
as $$
  select card.id, version.id
  from public.ecard_cards card
  join public.ecard_versions version on version.id = card.active_published_version_id
  where card.public_slug = p_public_slug
    and card.status = 'published'
    and p_pin ~ '^[0-9]{4}$'
    and version.pin_hash is not null
    and extensions.crypt(p_pin, version.pin_hash) = version.pin_hash;
$$;

create or replace function public.create_recipient_session(
  p_card_id uuid,
  p_token_hash text,
  p_expires_at timestamptz
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_session_id uuid;
begin
  if not exists (
    select 1 from public.ecard_cards
    where id = p_card_id and status = 'published' and active_published_version_id is not null
  ) then
    raise exception using errcode = '42501', message = 'CARD_NOT_PUBLISHED';
  end if;

  insert into public.recipient_sessions (card_id, token_hash, expires_at)
  values (p_card_id, p_token_hash, p_expires_at)
  returning id into v_session_id;

  return v_session_id;
end;
$$;

create or replace function public.revoke_recipient_sessions(p_card_id uuid)
returns void
language sql
security definer
set search_path = public
as $$
  update public.recipient_sessions
  set revoked_at = now()
  where card_id = p_card_id and revoked_at is null;
$$;

revoke all on function public.replace_ecard_draft(uuid, uuid, integer, jsonb, boolean, text) from public;
revoke all on function public.publish_ecard(uuid, uuid, integer) from public;
revoke all on function public.verify_ecard_pin(text, text) from public;
revoke all on function public.create_recipient_session(uuid, text, timestamptz) from public;
revoke all on function public.revoke_recipient_sessions(uuid) from public;

grant execute on function public.replace_ecard_draft(uuid, uuid, integer, jsonb, boolean, text) to service_role;
grant execute on function public.publish_ecard(uuid, uuid, integer) to service_role;
grant execute on function public.verify_ecard_pin(text, text) to service_role;
grant execute on function public.create_recipient_session(uuid, text, timestamptz) to service_role;
grant execute on function public.revoke_recipient_sessions(uuid) to service_role;
