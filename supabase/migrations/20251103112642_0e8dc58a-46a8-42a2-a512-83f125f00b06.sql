-- Create plans table
CREATE TABLE public.plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  price NUMERIC NOT NULL,
  duration_days INTEGER NOT NULL, -- Duration in days (e.g., 30 for monthly)
  features TEXT[], -- Array of features (e.g., ['Foto profissional', 'Destaque na busca'])
  max_properties INTEGER, -- NULL = unlimited
  featured BOOLEAN DEFAULT false, -- Featured/promoted plan
  active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create property_plans table (associates properties with plans)
CREATE TABLE public.property_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES public.plans(id) ON DELETE RESTRICT,
  user_id UUID NOT NULL, -- Owner who purchased the plan
  status TEXT NOT NULL DEFAULT 'active', -- 'active', 'expired', 'cancelled'
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL,
  auto_renew BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX idx_property_plans_property_id ON public.property_plans(property_id);
CREATE INDEX idx_property_plans_user_id ON public.property_plans(user_id);
CREATE INDEX idx_property_plans_expires_at ON public.property_plans(expires_at);
CREATE INDEX idx_plans_active ON public.plans(active);

-- Create trigger for updated_at
CREATE TRIGGER update_plans_updated_at
  BEFORE UPDATE ON public.plans
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_property_plans_updated_at
  BEFORE UPDATE ON public.property_plans
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

-- Enable RLS
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_plans ENABLE ROW LEVEL SECURITY;

-- RLS Policies for plans
CREATE POLICY "Anyone can view active plans"
  ON public.plans
  FOR SELECT
  USING (active = true OR auth.uid() IS NOT NULL);

CREATE POLICY "Only admins can manage plans"
  ON public.plans
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for property_plans
CREATE POLICY "Users can view their own property plans"
  ON public.property_plans
  FOR SELECT
  USING (
    user_id = auth.uid() OR 
    EXISTS (
      SELECT 1 FROM public.properties 
      WHERE properties.id = property_plans.property_id 
      AND properties.owner_id = auth.uid()
    ) OR 
    has_role(auth.uid(), 'admin'::app_role)
  );

CREATE POLICY "Owners can create property plans"
  ON public.property_plans
  FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND 
    (has_role(auth.uid(), 'owner'::app_role) OR has_role(auth.uid(), 'admin'::app_role))
  );

CREATE POLICY "Owners can update their property plans"
  ON public.property_plans
  FOR UPDATE
  USING (
    user_id = auth.uid() OR 
    has_role(auth.uid(), 'admin'::app_role)
  );

CREATE POLICY "Only admins can delete property plans"
  ON public.property_plans
  FOR DELETE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Insert default plans
INSERT INTO public.plans (name, slug, description, price, duration_days, features, display_order, featured) VALUES
('Básico', 'basico', 'Ideal para começar', 49.90, 30, ARRAY['Anúncio por 30 dias', 'Até 5 fotos', 'Suporte por email'], 1, false),
('Profissional', 'profissional', 'Mais visibilidade para seu imóvel', 99.90, 30, ARRAY['Anúncio por 30 dias', 'Até 15 fotos', 'Selo de destaque', 'Suporte prioritário'], 2, true),
('Premium', 'premium', 'Máxima exposição', 199.90, 30, ARRAY['Anúncio por 30 dias', 'Fotos ilimitadas', 'Selo premium', 'Destaque na home', 'Tour virtual', 'Suporte VIP'], 3, false);

-- Function to expire property plans
CREATE OR REPLACE FUNCTION public.expire_property_plans()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.property_plans
  SET status = 'expired'
  WHERE status = 'active'
    AND expires_at <= now();
END;
$$;