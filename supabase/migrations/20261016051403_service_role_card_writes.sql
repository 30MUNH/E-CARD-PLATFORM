-- The API repository inserts new cards and updates status when archiving.
-- Read access was granted in 202610130001_service_role_api_grants.sql.
-- Keep RLS, existing records, and grants to browser roles unchanged.
grant insert, update on table public.ecard_cards to service_role;
