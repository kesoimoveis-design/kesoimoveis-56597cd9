-- Fix search_path for remaining functions
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, phone)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', 'Usuário'),
    NEW.email,
    NEW.raw_user_meta_data->>'phone'
  );
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.set_property_expiration()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.is_owner_direct = true THEN
    NEW.expires_at = NEW.created_at + INTERVAL '30 days';
  ELSE
    NEW.expires_at = NULL;
  END IF;
  RETURN NEW;
END;
$$;