-- Fix security vulnerability: Remove overly permissive waitlist access
-- Drop the current policy that allows any authenticated user to view all waitlist entries
DROP POLICY IF EXISTS "Authenticated users can view waitlist" ON public.waitlist;

-- Create a more restrictive admin-only policy
-- For now, we'll use a simple approach where only specific admin emails can access the waitlist
-- This can be enhanced later with a proper role-based system
CREATE POLICY "Admin users can view waitlist" 
ON public.waitlist 
FOR SELECT 
USING (
  auth.email() IN (
    'admin@padu.com',
    'founder@padu.com'
  )
);

-- Keep the INSERT policy as-is since anyone should be able to join the waitlist
-- The existing policy "Anyone can join waitlist" remains unchanged