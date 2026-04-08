-- Add new roles to the enum (must be committed before use)
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'super_admin';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'entrenador';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'recepcionista';