-- Fix infinite recursion in RLS policies by using a SECURITY DEFINER function
-- This function bypasses RLS to safely check the user's role

-- 1. Create the helper function
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Update policies on public.users to use the function instead of direct query

DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
DROP POLICY IF EXISTS "Admins can update all users" ON public.users;

CREATE POLICY "Admins can view all users"
  ON public.users FOR SELECT
  USING (is_admin());

CREATE POLICY "Admins can update all users"
  ON public.users FOR UPDATE
  USING (is_admin());

-- 3. Update other tables' admin policies to use the helper (Cleaner and safer)

-- Applications
DROP POLICY IF EXISTS "Admins can view all applications" ON public.applications;
CREATE POLICY "Admins can view all applications"
  ON public.applications FOR ALL
  USING (is_admin());

-- Member Profiles
DROP POLICY IF EXISTS "Admins can manage all profiles" ON public.member_profiles;
CREATE POLICY "Admins can manage all profiles"
  ON public.member_profiles FOR ALL
  USING (is_admin());

-- Subscriptions
DROP POLICY IF EXISTS "Admins can manage all subscriptions" ON public.subscriptions;
CREATE POLICY "Admins can manage all subscriptions"
  ON public.subscriptions FOR ALL
  USING (is_admin());

-- Introductions
DROP POLICY IF EXISTS "Admins can manage all introductions" ON public.introductions;
CREATE POLICY "Admins can manage all introductions"
  ON public.introductions FOR ALL
  USING (is_admin());

-- Introduction Feedback
DROP POLICY IF EXISTS "Admins can view all feedback" ON public.introduction_feedback;
CREATE POLICY "Admins can view all feedback"
  ON public.introduction_feedback FOR SELECT
  USING (is_admin());
