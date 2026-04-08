DROP POLICY IF EXISTS "Staff can upload exercise images" ON storage.objects;
CREATE POLICY "Staff can upload exercise images"
ON storage.objects
FOR INSERT
TO public
WITH CHECK (
  bucket_id = 'exercise-images'
  AND public.is_gym_staff(auth.uid())
);

DROP POLICY IF EXISTS "Staff can update exercise images" ON storage.objects;
CREATE POLICY "Staff can update exercise images"
ON storage.objects
FOR UPDATE
TO public
USING (
  bucket_id = 'exercise-images'
  AND public.is_gym_staff(auth.uid())
);

DROP POLICY IF EXISTS "Staff can delete exercise images" ON storage.objects;
CREATE POLICY "Staff can delete exercise images"
ON storage.objects
FOR DELETE
TO public
USING (
  bucket_id = 'exercise-images'
  AND public.is_gym_staff(auth.uid())
);