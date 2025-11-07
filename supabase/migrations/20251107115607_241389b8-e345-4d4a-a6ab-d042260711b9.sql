-- Add neighborhood column to properties table
ALTER TABLE properties ADD COLUMN IF NOT EXISTS neighborhood TEXT;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_properties_neighborhood ON properties(neighborhood);

-- Add pending_approval status to property_status enum
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_type t 
        JOIN pg_enum e ON t.oid = e.enumtypid  
        WHERE t.typname = 'property_status' 
        AND e.enumlabel = 'pending_approval'
    ) THEN
        ALTER TYPE property_status ADD VALUE 'pending_approval';
    END IF;
END $$;