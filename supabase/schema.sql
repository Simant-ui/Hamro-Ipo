-- ============================================================
-- Hamro IPO - Supabase Schema
-- Run this in Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- PROFILES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ============================================================
-- DEMAT ACCOUNTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.demat_accounts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  account_name TEXT NOT NULL,
  boid_encrypted TEXT NOT NULL,
  bank_name TEXT NOT NULL,
  account_number_encrypted TEXT NOT NULL,
  meroshare_username TEXT,
  meroshare_password_encrypted TEXT,
  transaction_pin_encrypted TEXT,
  crn_number TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.demat_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own accounts" ON public.demat_accounts
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Admins view all accounts" ON public.demat_accounts
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ============================================================
-- IPO LISTINGS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.ipo_listings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  company_name TEXT NOT NULL,
  symbol TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL CHECK (type IN ('IPO', 'FPO', 'RIGHT', 'DEBENTURE')),
  status TEXT NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'open', 'closed', 'result_published')),
  open_date DATE NOT NULL,
  close_date DATE NOT NULL,
  issue_price NUMERIC(10,2) NOT NULL,
  total_units INTEGER NOT NULL,
  min_units INTEGER NOT NULL DEFAULT 10,
  max_units INTEGER NOT NULL DEFAULT 100,
  lot_size INTEGER NOT NULL DEFAULT 10,
  description TEXT,
  sector TEXT NOT NULL DEFAULT 'Others',
  logo_url TEXT,
  prospectus_url TEXT,
  result_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.ipo_listings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "All authenticated can view IPOs" ON public.ipo_listings
  FOR SELECT TO authenticated USING (TRUE);

CREATE POLICY "Only admins can manage IPOs" ON public.ipo_listings
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ============================================================
-- IPO APPLICATIONS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.ipo_applications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  ipo_id UUID REFERENCES public.ipo_listings(id) ON DELETE CASCADE NOT NULL,
  account_id UUID REFERENCES public.demat_accounts(id) ON DELETE CASCADE NOT NULL,
  quantity INTEGER NOT NULL,
  amount NUMERIC(12,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','success','failed','allotted','not_allotted')),
  applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  result_date TIMESTAMPTZ,
  allotted_units INTEGER,
  rejection_reason TEXT,
  -- Prevent duplicate applications (one account per IPO)
  UNIQUE(ipo_id, account_id)
);

ALTER TABLE public.ipo_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own applications" ON public.ipo_applications
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Admins view all applications" ON public.ipo_applications
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ============================================================
-- PORTFOLIO TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.portfolio (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  account_id UUID REFERENCES public.demat_accounts(id) ON DELETE CASCADE NOT NULL,
  symbol TEXT NOT NULL,
  company_name TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  average_price NUMERIC(10,2) NOT NULL,
  current_price NUMERIC(10,2),
  last_updated TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(account_id, symbol)
);

ALTER TABLE public.portfolio ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own portfolio" ON public.portfolio
  FOR ALL USING (auth.uid() = user_id);

-- ============================================================
-- WATCHLIST TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.watchlist (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  symbol TEXT NOT NULL,
  company_name TEXT NOT NULL,
  added_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, symbol)
);

ALTER TABLE public.watchlist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own watchlist" ON public.watchlist
  FOR ALL USING (auth.uid() = user_id);

-- ============================================================
-- NOTIFICATIONS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('ipo_open','ipo_result','allotment','system')),
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own notifications" ON public.notifications
  FOR ALL USING (auth.uid() = user_id);

-- ============================================================
-- OTP VERIFICATIONS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.otp_verifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  code TEXT NOT NULL,
  purpose TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Note: No RLS needed for service_role operations, but adding for safety
ALTER TABLE public.otp_verifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role only" ON public.otp_verifications
  FOR ALL TO service_role USING (TRUE);

-- ============================================================
-- TRIGGERS: Auto-update updated_at
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_demat_updated_at BEFORE UPDATE ON public.demat_accounts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ipo_updated_at BEFORE UPDATE ON public.ipo_listings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- TRIGGER: Auto-create profile on signup
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- SEED DEMO IPO DATA
-- ============================================================
INSERT INTO public.ipo_listings (company_name, symbol, type, status, open_date, close_date, issue_price, total_units, min_units, max_units, lot_size, sector, description) VALUES
('Sopan Pharmaceuticals Limited', 'SOPAN', 'IPO', 'open', '2026-04-16', '2026-04-21', 100, 3474900, 10, 1000, 10, 'Pharmaceutical', 'Sopan Pharmaceuticals is issuing shares to the general public to expand its production capacity.'),
('Mount Everest Power Development Ltd', 'MEPDL', 'IPO', 'upcoming', '2026-05-05', '2026-05-10', 100, 2580000, 10, 500, 10, 'Energy', 'Upcoming hydropower project in the Solukhumbu region.'),
('Sarvottam Paints Industries Ltd', 'SPIL', 'IPO', 'upcoming', '2026-05-12', '2026-05-17', 100, 850000, 10, 200, 10, 'Manufacturing', 'Premium paints manufacturer expanding its market reach.'),
('Everest Colour Limited', 'ECL', 'IPO', 'upcoming', '2026-05-20', '2026-05-25', 100, 790000, 10, 300, 10, 'Manufacturing', 'Color and pigment manufacturer for industrial use.'),
('Taksar Pikhuwa Khola Hydropower', 'TPKHL', 'IPO', 'closed', '2026-03-25', '2026-04-05', 100, 1200000, 10, 500, 10, 'Energy', 'Recently closed IPO for local residents and general public.'),
('Nepal Electricity Authority Bonds', 'NEAB', 'DEBENTURE', 'result_published', '2026-03-15', '2026-03-20', 1000, 500000, 5, 50, 5, 'Energy', 'NEA 8% debenture bonds.'),
('Sanima Reliance Life Insurance', 'SRLI', 'IPO', 'closed', '2026-04-01', '2026-04-06', 100, 750000, 10, 100, 10, 'Insurance', 'Life insurance merger and public offering.');
