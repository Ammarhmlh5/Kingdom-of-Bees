-- Init schema for Kingdom-of-Bees Supabase project
-- Creates user_profile and sync_event tables used by platform

-- user_profile
CREATE TABLE IF NOT EXISTS public.user_profile (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text,
  phone text,
  username text,
  created_at timestamptz DEFAULT now()
);

-- sync_event
CREATE TABLE IF NOT EXISTS public.sync_event (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id text,
  device_id text,
  batch_id text,
  entity text,
  operation text,
  payload jsonb,
  client_created_at timestamptz,
  server_received_at timestamptz DEFAULT now(),
  processed boolean DEFAULT false,
  server_applied_at timestamptz,
  user_id uuid REFERENCES public.user_profile(id)
);

CREATE INDEX IF NOT EXISTS idx_sync_event_server_received_at ON public.sync_event (server_received_at);
CREATE INDEX IF NOT EXISTS idx_sync_event_user_id ON public.sync_event (user_id);

-- Minimal RLS policy examples (optional; require enabling RLS per table in Supabase UI)
-- Note: Keep these commented for manual review before enabling in production.
-- ALTER TABLE public.user_profile ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "user_profile_public_read" ON public.user_profile FOR SELECT USING (true);

-- ALTER TABLE public.sync_event ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "sync_event_insert_from_service" ON public.sync_event FOR INSERT USING (true);
