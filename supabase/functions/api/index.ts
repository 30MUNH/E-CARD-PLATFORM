// Supabase Edge Function wiring is kept separate from the dependency-injected router so the
// route and authorization contract can be tested locally without a live Supabase project.
import { createApiRouter } from './app.ts';
import { createClient } from 'npm:@supabase/supabase-js@2.117.3';
import { createSupabaseDeps } from './supabaseRepository.ts';
import { validateFrontendOrigins } from './http.ts';

const supabaseUrl = Deno.env.get('SUPABASE_URL');
const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
if (!supabaseUrl || !serviceRoleKey) throw new Error('Supabase server configuration is incomplete');
const frontendOrigins = [
  ...validateFrontendOrigins(
    Deno.env.get('FRONTEND_ORIGINS') ?? undefined,
    Deno.env.get('FRONTEND_ORIGIN') ?? undefined
  ),
  'https://e-card-platform-gamma.vercel.app',
];
const client = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});
const router = createApiRouter(
  createSupabaseDeps(client, {
    publicBaseUrl: Deno.env.get('PUBLIC_APP_URL') || '',
    mediaBucket: Deno.env.get('MEDIA_BUCKET') || 'ecard-media',
    recipientSessionTtlSeconds: Number(Deno.env.get('RECIPIENT_SESSION_TTL_SECONDS') || 3600),
    signedMediaUrlTtlSeconds: Number(Deno.env.get('SIGNED_MEDIA_URL_TTL_SECONDS') || 600),
  }),
  frontendOrigins
);

Deno.serve((request: Request) => router(request));
