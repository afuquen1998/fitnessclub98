-- Fix 1: Update get_user_email function to add authorization check
-- Only super_admin can view any user's email, or users can view their own email
CREATE OR REPLACE FUNCTION public.get_user_email(target_user_id uuid)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    CASE 
      WHEN is_super_admin(auth.uid()) THEN (
        SELECT email FROM auth.users WHERE id = target_user_id
      )
      WHEN auth.uid() = target_user_id THEN (
        SELECT email FROM auth.users WHERE id = target_user_id
      )
      ELSE NULL
    END
$$;

-- Fix 2: Replace the public gym_members SELECT policy with a more restrictive one
-- Remove the fully public policy
DROP POLICY IF EXISTS "Public can search members by document" ON public.gym_members;

-- Create a policy that requires authentication for member lookups
-- Authenticated users can search for members (needed for Valoraciones page)
CREATE POLICY "Authenticated users can search members"
ON public.gym_members
FOR SELECT
TO authenticated
USING (true);

-- Staff already have full access via "Staff can view all members" policy