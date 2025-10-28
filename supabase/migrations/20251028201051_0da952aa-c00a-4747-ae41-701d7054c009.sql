-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'owner', 'buyer');

-- Create enum for property types
CREATE TYPE public.property_type AS ENUM ('casa', 'apartamento', 'terreno', 'comercial', 'rural');

-- Create enum for property status
CREATE TYPE public.property_status AS ENUM ('active', 'pending', 'expired', 'paused');

-- Create enum for property finalidade
CREATE TYPE public.property_finalidade AS ENUM ('buy', 'rent');

-- Create enum for service order status
CREATE TYPE public.service_order_status AS ENUM ('pending', 'completed', 'cancelled');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create user_roles table (CRITICAL: separate from profiles for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE(user_id, role)
);

-- Create cities table
CREATE TABLE public.cities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  state TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create properties table
CREATE TABLE public.properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  city_id UUID REFERENCES public.cities(id) ON DELETE RESTRICT NOT NULL,
  type property_type NOT NULL,
  status property_status DEFAULT 'pending' NOT NULL,
  finalidade property_finalidade NOT NULL,
  price DECIMAL(12,2) NOT NULL,
  area DECIMAL(10,2),
  bedrooms INTEGER,
  bathrooms INTEGER,
  parking_spaces INTEGER,
  address TEXT NOT NULL,
  description TEXT,
  verified BOOLEAN DEFAULT false NOT NULL,
  is_owner_direct BOOLEAN DEFAULT false NOT NULL,
  featured BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create property_photos table
CREATE TABLE public.property_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE NOT NULL,
  url TEXT NOT NULL,
  is_main BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create leads table
CREATE TABLE public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create services table
CREATE TABLE public.services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  photos_included BOOLEAN DEFAULT false NOT NULL,
  video_included BOOLEAN DEFAULT false NOT NULL,
  legal_assistance BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create service_orders table
CREATE TABLE public.service_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id UUID REFERENCES public.services(id) ON DELETE RESTRICT NOT NULL,
  property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  status service_order_status DEFAULT 'pending' NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable Row Level Security on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_orders ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
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
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Only admins can insert roles"
  ON public.user_roles FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can update roles"
  ON public.user_roles FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can delete roles"
  ON public.user_roles FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for cities (public read, admin write)
CREATE POLICY "Anyone can view cities"
  ON public.cities FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Only admins can insert cities"
  ON public.cities FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can update cities"
  ON public.cities FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can delete cities"
  ON public.cities FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for properties (public read, owner/admin write)
CREATE POLICY "Anyone can view active properties"
  ON public.properties FOR SELECT
  TO authenticated, anon
  USING (status = 'active' OR auth.uid() = owner_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Owners can insert their own properties"
  ON public.properties FOR INSERT
  WITH CHECK (auth.uid() = owner_id AND (public.has_role(auth.uid(), 'owner') OR public.has_role(auth.uid(), 'admin')));

CREATE POLICY "Owners can update their own properties"
  ON public.properties FOR UPDATE
  USING (auth.uid() = owner_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Owners can delete their own properties"
  ON public.properties FOR DELETE
  USING (auth.uid() = owner_id OR public.has_role(auth.uid(), 'admin'));

-- RLS Policies for property_photos
CREATE POLICY "Anyone can view property photos"
  ON public.property_photos FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Property owners can insert photos"
  ON public.property_photos FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.properties
      WHERE id = property_id AND (owner_id = auth.uid() OR public.has_role(auth.uid(), 'admin'))
    )
  );

CREATE POLICY "Property owners can update photos"
  ON public.property_photos FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.properties
      WHERE id = property_id AND (owner_id = auth.uid() OR public.has_role(auth.uid(), 'admin'))
    )
  );

CREATE POLICY "Property owners can delete photos"
  ON public.property_photos FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.properties
      WHERE id = property_id AND (owner_id = auth.uid() OR public.has_role(auth.uid(), 'admin'))
    )
  );

-- RLS Policies for leads
CREATE POLICY "Property owners can view their leads"
  ON public.leads FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.properties
      WHERE id = property_id AND (owner_id = auth.uid() OR public.has_role(auth.uid(), 'admin'))
    )
  );

CREATE POLICY "Anyone can insert leads"
  ON public.leads FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);

-- RLS Policies for services
CREATE POLICY "Anyone can view services"
  ON public.services FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Only admins can manage services"
  ON public.services FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for service_orders
CREATE POLICY "Users can view their own orders"
  ON public.service_orders FOR SELECT
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can create their own orders"
  ON public.service_orders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Only admins can update orders"
  ON public.service_orders FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

-- Create function to automatically create profile on signup
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

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Trigger to update updated_at on properties
CREATE TRIGGER update_properties_updated_at
  BEFORE UPDATE ON public.properties
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Create function to expire properties after 30 days for owner_direct
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

-- Create function to set expires_at on insert/update for owner_direct properties
CREATE OR REPLACE FUNCTION public.set_property_expiration()
RETURNS TRIGGER
LANGUAGE plpgsql
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

-- Trigger to set expiration date
CREATE TRIGGER set_property_expiration_trigger
  BEFORE INSERT OR UPDATE ON public.properties
  FOR EACH ROW EXECUTE FUNCTION public.set_property_expiration();

-- Create storage bucket for property photos
INSERT INTO storage.buckets (id, name, public) 
VALUES ('property-photos', 'property-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for property-photos bucket
CREATE POLICY "Anyone can view property photos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'property-photos');

CREATE POLICY "Property owners can upload photos"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'property-photos' 
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Property owners can update their photos"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'property-photos' 
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Property owners can delete their photos"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'property-photos' 
    AND auth.role() = 'authenticated'
  );

-- Insert some initial data for testing
INSERT INTO public.cities (name, state, slug, description) VALUES
  ('São Paulo', 'SP', 'sao-paulo', 'A maior cidade do Brasil, com diversas opções de imóveis em todos os bairros.'),
  ('Rio de Janeiro', 'RJ', 'rio-de-janeiro', 'Cidade maravilhosa com imóveis de frente para o mar e na zona sul.'),
  ('Belo Horizonte', 'MG', 'belo-horizonte', 'Capital mineira com ótimas opções residenciais e comerciais.')
ON CONFLICT (slug) DO NOTHING;