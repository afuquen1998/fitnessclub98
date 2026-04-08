-- Add new columns to gym_members table
ALTER TABLE public.gym_members
ADD COLUMN IF NOT EXISTS birth_date DATE,
ADD COLUMN IF NOT EXISTS sex TEXT CHECK (sex IN ('masculino', 'femenino')),
ADD COLUMN IF NOT EXISTS weight_kg NUMERIC,
ADD COLUMN IF NOT EXISTS height_cm NUMERIC;

-- Add new columns to physical_assessments table
ALTER TABLE public.physical_assessments
ADD COLUMN IF NOT EXISTS weight_kg NUMERIC,
ADD COLUMN IF NOT EXISTS height_cm NUMERIC;

-- Create routine_exercises table for detailed exercise tracking
CREATE TABLE IF NOT EXISTS public.routine_exercises (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  routine_id UUID NOT NULL REFERENCES public.routines(id) ON DELETE CASCADE,
  exercise_name TEXT NOT NULL,
  sets INTEGER NOT NULL,
  reps TEXT NOT NULL,
  rir TEXT,
  equipment TEXT,
  day_number INTEGER NOT NULL DEFAULT 1,
  exercise_order INTEGER NOT NULL DEFAULT 1,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on routine_exercises
ALTER TABLE public.routine_exercises ENABLE ROW LEVEL SECURITY;

-- RLS policies for routine_exercises
CREATE POLICY "Anyone can view routine exercises"
ON public.routine_exercises FOR SELECT
USING (true);

CREATE POLICY "Anyone can create routine exercises"
ON public.routine_exercises FOR INSERT
WITH CHECK (true);

-- Create nutrition_plans table to store calculated nutrition data
CREATE TABLE IF NOT EXISTS public.nutrition_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  member_id UUID REFERENCES public.gym_members(id) ON DELETE CASCADE,
  tmb NUMERIC NOT NULL,
  daily_calories NUMERIC NOT NULL,
  activity_factor NUMERIC NOT NULL DEFAULT 1.2,
  protein_g NUMERIC NOT NULL,
  carbs_g NUMERIC NOT NULL,
  fats_g NUMERIC NOT NULL,
  objective TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on nutrition_plans
ALTER TABLE public.nutrition_plans ENABLE ROW LEVEL SECURITY;

-- RLS policies for nutrition_plans
CREATE POLICY "Public can view nutrition plans"
ON public.nutrition_plans FOR SELECT
USING (true);

CREATE POLICY "Staff can manage nutrition plans"
ON public.nutrition_plans FOR ALL
USING (is_gym_staff(auth.uid()));

CREATE POLICY "Anyone can create nutrition plans"
ON public.nutrition_plans FOR INSERT
WITH CHECK (true);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_routine_exercises_routine_id ON public.routine_exercises(routine_id);
CREATE INDEX IF NOT EXISTS idx_nutrition_plans_member_id ON public.nutrition_plans(member_id);