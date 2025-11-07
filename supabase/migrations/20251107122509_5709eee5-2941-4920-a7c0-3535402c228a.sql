-- Create the complete "Captação de Imóvel" form template
INSERT INTO form_templates (
  name, 
  slug, 
  description, 
  requires_signature, 
  form_fields,
  is_active
)
VALUES (
  'Captação de Imóvel',
  'captacao-imovel',
  'Formulário completo para captação de novos imóveis com todos os campos necessários',
  true,
  '{
    "sections": [
      {
        "title": "Dados do Captador",
        "fields": [
          {"name": "captador", "label": "Captador", "type": "text", "required": true, "readonly": true},
          {"name": "data_captacao", "label": "Data", "type": "date", "required": true, "readonly": true}
        ]
      },
      {
        "title": "Dados do Proprietário",
        "fields": [
          {"name": "owner_name", "label": "Nome Completo", "type": "text", "required": true},
          {"name": "owner_email", "label": "E-mail", "type": "email", "required": true},
          {"name": "owner_phones", "label": "Telefones", "type": "text", "required": true, "placeholder": "(00) 00000-0000"}
        ]
      },
      {
        "title": "Informações Básicas do Imóvel",
        "fields": [
          {"name": "padrao", "label": "Padrão", "type": "select", "required": true, "options": ["Alto", "Médio", "Baixo"]},
          {"name": "finalidade_tipo", "label": "Tipo", "type": "select", "required": true, "options": ["Residencial", "Comercial", "Terreno"]},
          {"name": "tem_locacao", "label": "Tem Locação", "type": "select", "required": true, "options": ["Sim", "Não"]},
          {"name": "financiado", "label": "Financiado", "type": "select", "options": ["Sim", "Não"]},
          {"name": "valor_venda", "label": "Valor de Venda (R$)", "type": "number"},
          {"name": "valor_locacao", "label": "Valor Locação (R$)", "type": "number"}
        ]
      },
      {
        "title": "Localização",
        "fields": [
          {"name": "localizacao_qualidade", "label": "Localização", "type": "select", "required": true, "options": ["Privilegiada", "Ótima", "Normal"]},
          {"name": "endereco", "label": "Endereço Completo", "type": "text", "required": true},
          {"name": "bairro", "label": "Bairro", "type": "text", "required": true},
          {"name": "cidade", "label": "Cidade", "type": "text", "required": true},
          {"name": "cep", "label": "CEP", "type": "text", "required": true, "placeholder": "00000-000"}
        ]
      },
      {
        "title": "Características Físicas",
        "fields": [
          {"name": "nome_condominio", "label": "Nome do Condomínio", "type": "text"},
          {"name": "valor_condominio", "label": "Valor Condomínio (R$)", "type": "number"},
          {"name": "area_total", "label": "Área Total do Terreno (m²)", "type": "number", "required": true},
          {"name": "area_construida", "label": "Área Construída (m²)", "type": "number"},
          {"name": "face", "label": "Face", "type": "select", "options": ["Leste", "Oeste", "Norte", "Sul"]},
          {"name": "caracteristicas_vaga", "label": "Características da Vaga", "type": "text"}
        ]
      },
      {
        "title": "Situação e Ocupação",
        "fields": [
          {"name": "situacao_imovel", "label": "Situação do Imóvel", "type": "select", "required": true, "options": ["Desocupado", "Ocupado", "Reservado"]},
          {"name": "ocupado_ate", "label": "Ocupado Até", "type": "date"},
          {"name": "ocupado_pelo", "label": "Ocupado Pelo", "type": "select", "options": ["Proprietário", "Inquilino"]},
          {"name": "autorizado_visita", "label": "Autorizado para Visita", "type": "select", "required": true, "options": ["Sim", "Não"]}
        ]
      },
      {
        "title": "Informações Comerciais",
        "fields": [
          {"name": "exclusividade", "label": "Exclusividade", "type": "select", "required": true, "options": ["Sim", "Não"]},
          {"name": "comissao", "label": "Comissão (%)", "type": "number", "step": "0.01"},
          {"name": "inicio_contrato", "label": "Início do Contrato", "type": "date"},
          {"name": "validade_contrato", "label": "Validade do Contrato", "type": "date"},
          {"name": "condicao_comercial", "label": "Condição Comercial", "type": "textarea", "placeholder": "Ex: Aceita permuta"}
        ]
      },
      {
        "title": "Documentação e Despesas",
        "fields": [
          {"name": "valor_iptu", "label": "Valor IPTU Anual (R$)", "type": "number"},
          {"name": "iptu_mensal", "label": "IPTU Mensal (R$)", "type": "number"},
          {"name": "eletricidade", "label": "Eletricidade", "type": "select", "options": ["Sim", "Não"]},
          {"name": "valor_agua", "label": "Valor Água (R$)", "type": "number"},
          {"name": "local_chave", "label": "Local da Chave", "type": "text"},
          {"name": "ano_construcao", "label": "Ano da Construção", "type": "number"},
          {"name": "ano_reforma", "label": "Ano da Reforma", "type": "number"},
          {"name": "placa_local", "label": "Placa no Local", "type": "text", "placeholder": "Ex: Placa KESO instalada"}
        ]
      },
      {
        "title": "Descrições",
        "fields": [
          {"name": "descricao_anuncios", "label": "Descrição de Anúncios (Site e Jornal)", "type": "textarea", "required": true},
          {"name": "comentario_interno", "label": "Comentário Interno", "type": "textarea"}
        ]
      }
    ]
  }'::jsonb,
  true
)
ON CONFLICT (slug) DO UPDATE 
SET 
  form_fields = EXCLUDED.form_fields,
  updated_at = now();