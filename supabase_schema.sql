-- SQL to create otp_verifications table
-- Run this in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS public.otp_verifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL,
    code TEXT NOT NULL,
    purpose TEXT NOT NULL, -- 'signup' or 'reset'
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Index for faster lookup
CREATE INDEX IF NOT EXISTS idx_otp_email ON public.otp_verifications(email);

-- Enable RLS (Row Level Security)
ALTER TABLE public.otp_verifications ENABLE ROW LEVEL SECURITY;

-- No one can read/write except service role
CREATE POLICY "Service role only" ON public.otp_verifications
    FOR ALL
    USING (auth.role() = 'service_role');
