
DROP POLICY "Staff can insert exercise images" ON public.exercise_images;
CREATE POLICY "Staff can insert exercise images" ON public.exercise_images
  FOR INSERT TO public
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
        AND user_roles.role = ANY (ARRAY['admin'::app_role, 'staff'::app_role, 'super_admin'::app_role])
    )
  );

DROP POLICY "Staff can delete exercise images" ON public.exercise_images;
CREATE POLICY "Staff can delete exercise images" ON public.exercise_images
  FOR DELETE TO public
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
        AND user_roles.role = ANY (ARRAY['admin'::app_role, 'staff'::app_role, 'super_admin'::app_role])
    )
  );

DROP POLICY "Staff can update exercise images" ON public.exercise_images;
CREATE POLICY "Staff can update exercise images" ON public.exercise_images
  FOR UPDATE TO public
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
        AND user_roles.role = ANY (ARRAY['admin'::app_role, 'staff'::app_role, 'super_admin'::app_role])
    )
  );
