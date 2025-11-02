-- Add property_code column to properties table
ALTER TABLE public.properties
ADD COLUMN property_code TEXT UNIQUE;

-- Create index for performance
CREATE INDEX idx_properties_code ON public.properties(property_code);

-- Add code_prefix column to property_types table
ALTER TABLE public.property_types
ADD COLUMN code_prefix TEXT NOT NULL DEFAULT 'GE';

-- Update existing property types with their code prefixes
UPDATE public.property_types SET code_prefix = 'CA' WHERE slug = 'casa';
UPDATE public.property_types SET code_prefix = 'SB' WHERE slug = 'sobrado';
UPDATE public.property_types SET code_prefix = 'CV' WHERE slug = 'casa-de-vila';
UPDATE public.property_types SET code_prefix = 'CC' WHERE slug = 'casa-de-condominio';
UPDATE public.property_types SET code_prefix = 'AP' WHERE slug = 'apartamento';
UPDATE public.property_types SET code_prefix = 'CB' WHERE slug = 'cobertura';
UPDATE public.property_types SET code_prefix = 'TE' WHERE slug = 'terreno';
UPDATE public.property_types SET code_prefix = 'CM' WHERE slug = 'comercial';
UPDATE public.property_types SET code_prefix = 'RU' WHERE slug = 'rural';

-- Function to generate unique property code
CREATE OR REPLACE FUNCTION public.generate_property_code()
RETURNS TRIGGER AS $$
DECLARE
  type_prefix TEXT;
  random_number TEXT;
  new_code TEXT;
  max_attempts INTEGER := 100;
  attempt INTEGER := 0;
BEGIN
  -- Get prefix from property type
  SELECT code_prefix INTO type_prefix
  FROM public.property_types
  WHERE id = NEW.type_id;
  
  -- Use 'GE' (Generic) if prefix not found
  IF type_prefix IS NULL THEN
    type_prefix := 'GE';
  END IF;
  
  -- Generate unique code (loop to avoid collisions)
  LOOP
    -- Generate 6 random digits
    random_number := LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0');
    new_code := type_prefix || random_number;
    
    -- Check if code already exists
    IF NOT EXISTS (SELECT 1 FROM public.properties WHERE property_code = new_code) THEN
      NEW.property_code := new_code;
      EXIT;
    END IF;
    
    -- Prevent infinite loop
    attempt := attempt + 1;
    IF attempt >= max_attempts THEN
      RAISE EXCEPTION 'Could not generate unique code after % attempts', max_attempts;
    END IF;
  END LOOP;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger to auto-generate code on insert
CREATE TRIGGER before_property_insert_generate_code
  BEFORE INSERT ON public.properties
  FOR EACH ROW
  WHEN (NEW.property_code IS NULL)
  EXECUTE FUNCTION public.generate_property_code();

-- Generate codes for existing properties
DO $$
DECLARE
  property_record RECORD;
  type_prefix TEXT;
  random_number TEXT;
  new_code TEXT;
BEGIN
  FOR property_record IN 
    SELECT p.id, p.type_id, pt.code_prefix
    FROM public.properties p
    LEFT JOIN public.property_types pt ON p.type_id = pt.id
    WHERE p.property_code IS NULL
  LOOP
    -- Use type prefix or 'GE' if not found
    type_prefix := COALESCE(property_record.code_prefix, 'GE');
    
    -- Generate unique code
    LOOP
      random_number := LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0');
      new_code := type_prefix || random_number;
      
      -- Check uniqueness
      IF NOT EXISTS (SELECT 1 FROM public.properties WHERE property_code = new_code) THEN
        UPDATE public.properties 
        SET property_code = new_code 
        WHERE id = property_record.id;
        EXIT;
      END IF;
    END LOOP;
  END LOOP;
END $$;