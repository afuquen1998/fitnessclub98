-- Allow super_admin to view all profiles for user management
CREATE POLICY "Super admin can view all profiles"
ON public.profiles
FOR SELECT
USING (is_super_admin(auth.uid()));

-- Allow super_admin to view all user roles for management
CREATE POLICY "Super admin can view all roles"
ON public.user_roles
FOR SELECT
USING (is_super_admin(auth.uid()));

-- Allow super_admin to manage all user roles
CREATE POLICY "Super admin can manage all roles"
ON public.user_roles
FOR ALL
USING (is_super_admin(auth.uid()));