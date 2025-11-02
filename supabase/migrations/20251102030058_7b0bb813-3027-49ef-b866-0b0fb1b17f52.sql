-- Add user_id to leads table for LGPD compliance
ALTER TABLE public.leads
ADD COLUMN user_id UUID REFERENCES auth.users(id);

-- Create index for performance
CREATE INDEX idx_leads_user_id ON public.leads(user_id);

-- Function to auto-set user_id on lead insert
CREATE OR REPLACE FUNCTION public.set_lead_user_id()
RETURNS TRIGGER AS $$
BEGIN
  IF auth.uid() IS NOT NULL THEN
    NEW.user_id = auth.uid();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger to set user_id automatically
CREATE TRIGGER before_lead_insert_set_user
  BEFORE INSERT ON public.leads
  FOR EACH ROW
  EXECUTE FUNCTION public.set_lead_user_id();

-- Update RLS policy to allow users to view their own leads
DROP POLICY IF EXISTS "Users can view their own leads" ON public.leads;

CREATE POLICY "Users can view their own leads"
ON public.leads FOR SELECT
USING (
  user_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.properties
    WHERE properties.id = leads.property_id
    AND properties.owner_id = auth.uid()
  ) OR
  public.has_role(auth.uid(), 'admin'::app_role)
);