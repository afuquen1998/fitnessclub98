-- Create a secure function for super_admin to get user emails
CREATE OR REPLACE FUNCTION public.get_user_email(target_user_id uuid)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT email FROM auth.users WHERE id = target_user_id
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.get_user_email(uuid) TO authenticated;

-- Add policy to allow super_admin to delete profiles (for rejecting pending users)
CREATE POLICY "Super admin can delete profiles"
ON public.profiles
FOR DELETE
USING (is_super_admin(auth.uid()));