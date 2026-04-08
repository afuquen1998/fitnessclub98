-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'staff');

-- Create enum for training levels
CREATE TYPE public.training_level AS ENUM ('principiante', 'intermedio', 'avanzado');

-- Create enum for training objectives
CREATE TYPE public.training_objective AS ENUM ('perdida_grasa', 'hipertrofia', 'recomposicion');

-- Create enum for training focus
CREATE TYPE public.training_focus AS ENUM ('tren_superior', 'gluteo_pierna', 'full_body', 'push_pull_legs');

-- Create profiles table for gym staff
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create user_roles table for role-based access
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Create gym members table (people being evaluated, not app users)
CREATE TABLE public.gym_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_number TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  age INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create physical assessments table
CREATE TABLE public.physical_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID REFERENCES public.gym_members(id) ON DELETE CASCADE NOT NULL,
  body_fat_percentage DECIMAL(5,2) NOT NULL,
  bmi DECIMAL(5,2) NOT NULL,
  muscle_mass_percentage DECIMAL(5,2) NOT NULL,
  visceral_fat DECIMAL(5,2) NOT NULL,
  assessment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create routines table for generated workout plans
CREATE TABLE public.routines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_name TEXT NOT NULL,
  member_age INTEGER NOT NULL,
  level training_level NOT NULL,
  objective training_objective NOT NULL,
  focus training_focus NOT NULL,
  days_per_week INTEGER NOT NULL CHECK (days_per_week >= 1 AND days_per_week <= 7),
  routine_data JSONB NOT NULL,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_ai_generated BOOLEAN DEFAULT false
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gym_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.physical_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.routines ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create function to check if user is staff or admin
CREATE OR REPLACE FUNCTION public.is_gym_staff(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role IN ('admin', 'staff')
  )
$$;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for user_roles (only admins can manage)
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
  ON public.user_roles FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage roles"
  ON public.user_roles FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for gym_members (staff can manage)
CREATE POLICY "Staff can view all members"
  ON public.gym_members FOR SELECT
  USING (public.is_gym_staff(auth.uid()));

CREATE POLICY "Staff can insert members"
  ON public.gym_members FOR INSERT
  WITH CHECK (public.is_gym_staff(auth.uid()));

CREATE POLICY "Staff can update members"
  ON public.gym_members FOR UPDATE
  USING (public.is_gym_staff(auth.uid()));

CREATE POLICY "Staff can delete members"
  ON public.gym_members FOR DELETE
  USING (public.is_gym_staff(auth.uid()));

CREATE POLICY "Public can search members by document"
  ON public.gym_members FOR SELECT
  USING (true);

-- RLS Policies for physical_assessments (staff can manage, public can view)
CREATE POLICY "Staff can manage assessments"
  ON public.physical_assessments FOR ALL
  USING (public.is_gym_staff(auth.uid()));

CREATE POLICY "Public can view assessments"
  ON public.physical_assessments FOR SELECT
  USING (true);

-- RLS Policies for routines (public access for generation)
CREATE POLICY "Anyone can create routines"
  ON public.routines FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can view routines"
  ON public.routines FOR SELECT
  USING (true);

-- Create trigger for updated_at on profiles
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_gym_members_updated_at
  BEFORE UPDATE ON public.gym_members
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create trigger to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Create indexes for better query performance
CREATE INDEX idx_gym_members_document ON public.gym_members(document_number);
CREATE INDEX idx_physical_assessments_member ON public.physical_assessments(member_id);
CREATE INDEX idx_physical_assessments_date ON public.physical_assessments(assessment_date);
CREATE INDEX idx_user_roles_user ON public.user_roles(user_id);