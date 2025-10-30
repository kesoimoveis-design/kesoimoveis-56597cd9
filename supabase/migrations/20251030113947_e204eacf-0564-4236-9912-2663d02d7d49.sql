-- Create first admin user role
-- This migration adds admin role to the initial user

-- First, insert admin role for the initial user (alexandredametto@gmail.com)
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role
FROM auth.users
WHERE email = 'alexandredametto@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;

-- Also add owner role to admin (admins can also list properties)
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'owner'::app_role
FROM auth.users
WHERE email = 'alexandredametto@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;

-- Create a trigger to automatically assign 'user' role to new users
CREATE OR REPLACE FUNCTION public.assign_default_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user'::app_role)
  ON CONFLICT (user_id, role) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created_assign_role
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.assign_default_role();