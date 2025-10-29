-- Fix search_path security issues in functions
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.expire_owner_direct_properties()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.properties
  SET status = 'expired'
  WHERE is_owner_direct = true
    AND status = 'active'
    AND expires_at IS NOT NULL
    AND expires_at <= now();
END;
$$;