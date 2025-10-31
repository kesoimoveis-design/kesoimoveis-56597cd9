-- ============================================
-- FASE 1: CORREÇÃO CRÍTICA DE SEGURANÇA
-- ============================================

-- Adicionar política SELECT na tabela leads
CREATE POLICY "Property owners and admins can view leads"
ON public.leads FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.properties
    WHERE properties.id = leads.property_id
    AND (properties.owner_id = auth.uid() OR public.has_role(auth.uid(), 'admin'::app_role))
  )
);

-- ============================================
-- FASE 2: CRIAR SISTEMA DE TIPOS DINÂMICOS
-- ============================================

-- Criar tabela de tipos de imóveis
CREATE TABLE public.property_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.property_types ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para property_types
CREATE POLICY "Anyone can view active property types"
ON public.property_types FOR SELECT
USING (active = true OR auth.uid() IS NOT NULL);

CREATE POLICY "Only admins can manage property types"
ON public.property_types FOR ALL
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- Inserir tipos iniciais
INSERT INTO public.property_types (name, slug, description, display_order) VALUES
  ('Casa', 'casa', 'Casa residencial', 1),
  ('Sobrado', 'sobrado', 'Casa com dois ou mais andares', 2),
  ('Casa de Vila', 'casa-de-vila', 'Casa em vila residencial', 3),
  ('Casa de Condomínio', 'casa-de-condominio', 'Casa em condomínio fechado', 4),
  ('Apartamento', 'apartamento', 'Apartamento em condomínio', 5),
  ('Cobertura', 'cobertura', 'Apartamento cobertura', 6),
  ('Terreno', 'terreno', 'Terreno para construção', 7),
  ('Comercial', 'comercial', 'Imóvel comercial', 8),
  ('Rural', 'rural', 'Propriedade rural', 9);

-- Adicionar coluna type_id na tabela properties
ALTER TABLE public.properties ADD COLUMN type_id UUID REFERENCES public.property_types(id);

-- Migrar dados existentes do enum para type_id
UPDATE public.properties p
SET type_id = (
  SELECT pt.id FROM public.property_types pt
  WHERE pt.slug = 
    CASE p.type::text
      WHEN 'casa' THEN 'casa'
      WHEN 'apartamento' THEN 'apartamento'
      WHEN 'terreno' THEN 'terreno'
      WHEN 'comercial' THEN 'comercial'
      WHEN 'rural' THEN 'rural'
      ELSE 'casa'
    END
);

-- ============================================
-- FASE 3: PROTEÇÃO PARA CIDADES
-- ============================================

-- Função para prevenir exclusão de cidade com imóveis
CREATE OR REPLACE FUNCTION public.prevent_city_deletion()
RETURNS TRIGGER AS $$
BEGIN
  IF EXISTS (SELECT 1 FROM public.properties WHERE city_id = OLD.id) THEN
    RAISE EXCEPTION 'Não é possível excluir cidade com imóveis cadastrados';
  END IF;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger para prevenir exclusão
CREATE TRIGGER check_city_before_delete
BEFORE DELETE ON public.cities
FOR EACH ROW EXECUTE FUNCTION public.prevent_city_deletion();