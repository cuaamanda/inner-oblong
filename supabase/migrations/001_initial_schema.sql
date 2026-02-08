-- ===========================================
-- INNER CIRCLE: Complete Database Schema
-- ===========================================

-- 1. USERS TABLE (extends Supabase auth.users)
CREATE TABLE public.users (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email text NOT NULL,
  name text NOT NULL,
  role text NOT NULL DEFAULT 'guest' CHECK (role IN ('guest', 'applicant', 'member', 'admin')),
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all users"
  ON public.users FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can update all users"
  ON public.users FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "New users can insert their own record"
  ON public.users FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE INDEX idx_users_role ON public.users(role);
CREATE INDEX idx_users_email ON public.users(email);

-- 2. APPLICATIONS TABLE
CREATE TABLE public.applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  name text NOT NULL,
  linkedin_url text NOT NULL,
  company text NOT NULL,
  role_title text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by uuid REFERENCES public.users(id),
  reviewed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own application"
  ON public.applications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own application"
  ON public.applications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all applications"
  ON public.applications FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

CREATE INDEX idx_applications_status ON public.applications(status);
CREATE INDEX idx_applications_user ON public.applications(user_id);

-- 3. MEMBER PROFILES TABLE
CREATE TABLE public.member_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE UNIQUE,
  industry text,
  expertise_areas text[] DEFAULT '{}',
  looking_for text,
  bio text,
  linkedin_url text,
  company text,
  role_title text,
  tier text NOT NULL DEFAULT 'basic' CHECK (tier IN ('basic', 'prestige')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.member_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view own profile"
  ON public.member_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Members can update own profile"
  ON public.member_profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Members can insert own profile"
  ON public.member_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all profiles"
  ON public.member_profiles FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

CREATE INDEX idx_member_profiles_user ON public.member_profiles(user_id);
CREATE INDEX idx_member_profiles_tier ON public.member_profiles(tier);

-- 4. SUBSCRIPTIONS TABLE
CREATE TABLE public.subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE UNIQUE,
  stripe_customer_id text UNIQUE,
  stripe_subscription_id text UNIQUE,
  tier text NOT NULL DEFAULT 'basic' CHECK (tier IN ('basic', 'prestige')),
  status text NOT NULL DEFAULT 'inactive' CHECK (status IN ('active', 'cancelled', 'past_due', 'trialing', 'inactive')),
  current_period_start timestamptz,
  current_period_end timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscription"
  ON public.subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all subscriptions"
  ON public.subscriptions FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

CREATE INDEX idx_subscriptions_user ON public.subscriptions(user_id);
CREATE INDEX idx_subscriptions_stripe_customer ON public.subscriptions(stripe_customer_id);
CREATE INDEX idx_subscriptions_status ON public.subscriptions(status);

-- 5. INTRODUCTIONS TABLE
CREATE TABLE public.introductions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_a_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  member_b_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  matched_by uuid REFERENCES public.users(id),
  status text NOT NULL DEFAULT 'suggested' CHECK (status IN ('suggested', 'approved', 'sent', 'completed', 'declined')),
  intro_message text,
  sent_at timestamptz,
  month_year text NOT NULL, -- Format: '2025-03'
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.introductions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view own introductions"
  ON public.introductions FOR SELECT
  USING (auth.uid() = member_a_id OR auth.uid() = member_b_id);

CREATE POLICY "Admins can manage all introductions"
  ON public.introductions FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

CREATE INDEX idx_introductions_member_a ON public.introductions(member_a_id);
CREATE INDEX idx_introductions_member_b ON public.introductions(member_b_id);
CREATE INDEX idx_introductions_status ON public.introductions(status);
CREATE INDEX idx_introductions_month ON public.introductions(month_year);

-- 6. INTRODUCTION FEEDBACK TABLE
CREATE TABLE public.introduction_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  introduction_id uuid REFERENCES public.introductions(id) ON DELETE CASCADE NOT NULL,
  member_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  rating integer CHECK (rating >= 1 AND rating <= 5),
  notes text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(introduction_id, member_id)
);

ALTER TABLE public.introduction_feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can manage own feedback"
  ON public.introduction_feedback FOR ALL
  USING (auth.uid() = member_id);

CREATE POLICY "Admins can view all feedback"
  ON public.introduction_feedback FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

CREATE INDEX idx_feedback_introduction ON public.introduction_feedback(introduction_id);

-- ===========================================
-- AUTO-UPDATE TIMESTAMPS TRIGGER
-- ===========================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_applications_updated_at BEFORE UPDATE ON public.applications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_member_profiles_updated_at BEFORE UPDATE ON public.member_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_introductions_updated_at BEFORE UPDATE ON public.introductions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ===========================================
-- FUNCTION: Auto-create user record on signup
-- ===========================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    'guest'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
