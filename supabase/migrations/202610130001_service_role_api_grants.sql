-- Minimum direct table access used by the API's service-role repository.
-- RLS, ownership, and grants to anon/authenticated/PUBLIC are unchanged.
grant select on table
  public.profiles,
  public.ecard_cards,
  public.ecard_versions,
  public.ecard_templates,
  public.recipient_sessions,
  public.media_assets,
  public.ecard_version_media
to service_role;

-- Upload repository inserts rows with RETURNING and removes its own asset rows.
grant insert, delete on table public.media_assets to service_role;
grant insert on table public.ecard_version_media to service_role;
