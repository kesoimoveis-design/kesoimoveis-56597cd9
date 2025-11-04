-- Add show_in_carousel field to properties table
ALTER TABLE public.properties 
ADD COLUMN show_in_carousel BOOLEAN DEFAULT false;

-- Create index for better performance when querying carousel properties
CREATE INDEX idx_properties_carousel ON public.properties(show_in_carousel) WHERE show_in_carousel = true;

-- Add comment
COMMENT ON COLUMN public.properties.show_in_carousel IS 'Indica se o imóvel deve aparecer no carrossel da home';