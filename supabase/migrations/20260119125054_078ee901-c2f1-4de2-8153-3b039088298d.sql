-- Create storage bucket for exercise images
INSERT INTO storage.buckets (id, name, public)
VALUES ('exercise-images', 'exercise-images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access to exercise images
CREATE POLICY "Exercise images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'exercise-images');

-- Allow authenticated users (staff/admin) to upload exercise images
CREATE POLICY "Staff can upload exercise images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'exercise-images' 
  AND EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'staff')
  )
);

-- Allow staff to update exercise images
CREATE POLICY "Staff can update exercise images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'exercise-images' 
  AND EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'staff')
  )
);

-- Allow staff to delete exercise images
CREATE POLICY "Staff can delete exercise images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'exercise-images' 
  AND EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'staff')
  )
);

-- Create exercise images catalog table
CREATE TABLE public.exercise_images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  exercise_name TEXT NOT NULL,
  exercise_name_normalized TEXT NOT NULL,
  image_url TEXT NOT NULL,
  muscle_group TEXT,
  equipment TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for fast lookups by normalized name
CREATE INDEX idx_exercise_images_normalized ON public.exercise_images(exercise_name_normalized);

-- Enable RLS
ALTER TABLE public.exercise_images ENABLE ROW LEVEL SECURITY;

-- Everyone can view exercise images
CREATE POLICY "Anyone can view exercise images"
ON public.exercise_images FOR SELECT
USING (true);

-- Staff can manage exercise images
CREATE POLICY "Staff can insert exercise images"
ON public.exercise_images FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'staff')
  )
);

CREATE POLICY "Staff can update exercise images"
ON public.exercise_images FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'staff')
  )
);

CREATE POLICY "Staff can delete exercise images"
ON public.exercise_images FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'staff')
  )
);

-- Trigger for updated_at
CREATE TRIGGER update_exercise_images_updated_at
BEFORE UPDATE ON public.exercise_images
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();