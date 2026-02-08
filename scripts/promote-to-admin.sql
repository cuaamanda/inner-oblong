-- Promote a user to admin role
-- Replace 'your-email@example.com' with the actual email

-- First, find the user ID (optional - just to verify)
SELECT id, email, role FROM public.users WHERE email = 'testadmin@example.com';

-- Promote the user to admin
UPDATE public.users 
SET role = 'admin' 
WHERE email = 'testadmin@example.com';

-- Verify the update
SELECT id, email, role FROM public.users WHERE email = 'testadmin@example.com';
