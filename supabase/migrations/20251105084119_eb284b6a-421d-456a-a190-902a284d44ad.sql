-- Create form_templates table
CREATE TABLE form_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  form_fields JSONB NOT NULL,
  is_active BOOLEAN DEFAULT true,
  requires_signature BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE form_templates ENABLE ROW LEVEL SECURITY;

-- Policies for form_templates
CREATE POLICY "Anyone can view active templates"
ON form_templates FOR SELECT
USING (is_active = true OR auth.uid() IS NOT NULL);

CREATE POLICY "Only admins can manage templates"
ON form_templates FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Create form_submissions table
CREATE TABLE form_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  property_code TEXT NOT NULL,
  template_id UUID REFERENCES form_templates(id),
  form_data JSONB NOT NULL,
  submitted_by UUID REFERENCES auth.users(id),
  client_name TEXT,
  client_cpf TEXT,
  client_email TEXT,
  status TEXT DEFAULT 'pending',
  signature_url TEXT,
  signature_method TEXT,
  signed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes
CREATE INDEX idx_form_submissions_property ON form_submissions(property_id);
CREATE INDEX idx_form_submissions_property_code ON form_submissions(property_code);
CREATE INDEX idx_form_submissions_status ON form_submissions(status);
CREATE INDEX idx_form_submissions_template ON form_submissions(template_id);

-- Enable RLS
ALTER TABLE form_submissions ENABLE ROW LEVEL SECURITY;

-- Policies for form_submissions
CREATE POLICY "Property owners and admins can view submissions"
ON form_submissions FOR SELECT
USING (
  submitted_by = auth.uid() OR
  EXISTS (
    SELECT 1 FROM properties
    WHERE properties.id = form_submissions.property_id
    AND properties.owner_id = auth.uid()
  ) OR
  has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Authenticated users can insert submissions"
ON form_submissions FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Submitters and admins can update submissions"
ON form_submissions FOR UPDATE
USING (
  submitted_by = auth.uid() OR
  has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Only admins can delete submissions"
ON form_submissions FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add trigger for updated_at
CREATE TRIGGER update_form_templates_updated_at
BEFORE UPDATE ON form_templates
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_form_submissions_updated_at
BEFORE UPDATE ON form_submissions
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

-- Insert default form template (Autorização de Comercialização)
INSERT INTO form_templates (name, slug, description, requires_signature, form_fields)
VALUES (
  'Autorização de Comercialização',
  'autorizacao-comercializacao',
  'Formulário de captação e autorização para comercialização de imóvel',
  true,
  '{
    "sections": [
      {
        "title": "Dados do Proprietário",
        "fields": [
          {"name": "owner_name", "label": "Nome Completo", "type": "text", "required": true},
          {"name": "owner_cpf", "label": "CPF", "type": "text", "required": true, "mask": "999.999.999-99"},
          {"name": "owner_rg", "label": "RG", "type": "text", "required": true},
          {"name": "owner_address", "label": "Endereço", "type": "text", "required": true},
          {"name": "owner_city", "label": "Cidade", "type": "text", "required": true},
          {"name": "owner_state", "label": "Estado", "type": "text", "required": true},
          {"name": "owner_cep", "label": "CEP", "type": "text", "required": true, "mask": "99999-999"},
          {"name": "owner_phone", "label": "Telefone", "type": "text", "required": true, "mask": "(99) 99999-9999"},
          {"name": "owner_email", "label": "E-mail", "type": "email", "required": true}
        ]
      },
      {
        "title": "Dados do Imóvel",
        "fields": [
          {"name": "property_type", "label": "Tipo", "type": "select", "required": true, "options": ["Casa", "Apartamento", "Terreno", "Comercial", "Rural"]},
          {"name": "property_address", "label": "Endereço Completo", "type": "text", "required": true},
          {"name": "property_neighborhood", "label": "Bairro", "type": "text", "required": true},
          {"name": "property_city", "label": "Cidade", "type": "text", "required": true},
          {"name": "property_area", "label": "Área Total (m²)", "type": "number", "required": true},
          {"name": "property_bedrooms", "label": "Quartos", "type": "number"},
          {"name": "property_bathrooms", "label": "Banheiros", "type": "number"},
          {"name": "property_parking", "label": "Vagas Garagem", "type": "number"}
        ]
      },
      {
        "title": "Condições Comerciais",
        "fields": [
          {"name": "sale_type", "label": "Finalidade", "type": "select", "required": true, "options": ["Venda", "Locação", "Ambos"]},
          {"name": "sale_price", "label": "Valor Venda (R$)", "type": "number"},
          {"name": "rent_price", "label": "Valor Locação (R$)", "type": "number"},
          {"name": "commission", "label": "Comissão (%)", "type": "number", "required": true},
          {"name": "exclusive", "label": "Exclusividade", "type": "select", "required": true, "options": ["Sim", "Não"]},
          {"name": "contract_duration", "label": "Prazo Contrato (meses)", "type": "number", "required": true}
        ]
      }
    ]
  }'::jsonb
);