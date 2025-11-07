import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { SignaturePad } from "./SignaturePad";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
  // Dados do Captador
  captador: z.string().min(1),
  data_captacao: z.string().min(1),
  
  // Dados do Proprietário
  owner_name: z.string().min(1, "Nome é obrigatório"),
  owner_email: z.string().email("E-mail inválido"),
  owner_phones: z.string().min(1, "Telefone é obrigatório"),
  
  // Informações Básicas
  padrao: z.string().min(1, "Padrão é obrigatório"),
  finalidade_tipo: z.string().min(1, "Tipo é obrigatório"),
  tem_locacao: z.string().min(1, "Campo obrigatório"),
  financiado: z.string().optional(),
  valor_venda: z.string().optional(),
  valor_locacao: z.string().optional(),
  
  // Localização
  localizacao_qualidade: z.string().min(1, "Localização é obrigatória"),
  endereco: z.string().min(1, "Endereço é obrigatório"),
  bairro: z.string().min(1, "Bairro é obrigatório"),
  cidade: z.string().min(1, "Cidade é obrigatória"),
  cep: z.string().min(8, "CEP inválido"),
  
  // Características Físicas
  nome_condominio: z.string().optional(),
  valor_condominio: z.string().optional(),
  area_total: z.string().min(1, "Área total é obrigatória"),
  area_construida: z.string().optional(),
  face: z.string().optional(),
  caracteristicas_vaga: z.string().optional(),
  
  // Situação e Ocupação
  situacao_imovel: z.string().min(1, "Situação é obrigatória"),
  ocupado_ate: z.string().optional(),
  ocupado_pelo: z.string().optional(),
  autorizado_visita: z.string().min(1, "Campo obrigatório"),
  
  // Informações Comerciais
  exclusividade: z.string().min(1, "Exclusividade é obrigatória"),
  comissao: z.string().optional(),
  inicio_contrato: z.string().optional(),
  validade_contrato: z.string().optional(),
  condicao_comercial: z.string().optional(),
  
  // Documentação e Despesas
  valor_iptu: z.string().optional(),
  iptu_mensal: z.string().optional(),
  eletricidade: z.string().optional(),
  valor_agua: z.string().optional(),
  local_chave: z.string().optional(),
  ano_construcao: z.string().optional(),
  ano_reforma: z.string().optional(),
  placa_local: z.string().optional(),
  
  // Descrições
  descricao_anuncios: z.string().min(1, "Descrição é obrigatória"),
  comentario_interno: z.string().optional(),
});

interface CaptacaoFormProps {
  onSuccess?: (propertyId: string, propertyCode: string) => void;
}

export function CaptacaoForm({ onSuccess }: CaptacaoFormProps) {
  const { toast } = useToast();
  const [signature, setSignature] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userName, setUserName] = useState<string>("");
  const [cities, setCities] = useState<any[]>([]);

  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      captador: "",
      data_captacao: new Date().toISOString().split('T')[0],
    }
  });

  useEffect(() => {
    loadUserData();
    loadCities();
  }, []);

  const loadUserData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("name")
        .eq("id", user.id)
        .single();
      
      if (profile) {
        setUserName(profile.name);
        setValue("captador", profile.name);
      }
    }
  };

  const loadCities = async () => {
    const { data } = await supabase
      .from("cities")
      .select("*")
      .order("name");
    if (data) setCities(data);
  };

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    if (!signature) {
      toast({
        title: "Assinatura obrigatória",
        description: "Por favor, assine o formulário antes de enviar.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      // Find city_id
      const selectedCity = cities.find(c => c.name === data.cidade);
      if (!selectedCity) throw new Error("Cidade não encontrada");

      // Determine property type and type_id
      const propertyTypeMap: Record<string, string> = {
        "Residencial": "casa",
        "Comercial": "comercial",
        "Terreno": "terreno"
      };
      const propertyType = propertyTypeMap[data.finalidade_tipo] || "casa";

      // Get type_id
      const { data: typeData } = await supabase
        .from("property_types")
        .select("id")
        .eq("slug", propertyType)
        .single();

      // Create property with status pending_approval
      const { data: newProperty, error: propertyError } = await supabase
        .from("properties")
        .insert({
          owner_id: user.id,
          city_id: selectedCity.id,
          type_id: typeData?.id,
          type: propertyType as any,
          address: data.endereco,
          neighborhood: data.bairro,
          price: parseFloat(data.valor_venda || "0"),
          area: parseFloat(data.area_total),
          finalidade: data.tem_locacao === "Sim" ? "rent" : "buy",
          status: "pending_approval",
          verified: false,
          is_owner_direct: false,
          featured: false,
        })
        .select()
        .single();

      if (propertyError) throw propertyError;
      if (!newProperty) throw new Error("Erro ao criar imóvel");

      // Upload signature
      const signatureBlob = await fetch(signature).then(r => r.blob());
      const fileName = `signatures/${newProperty.property_code}_${Date.now()}.png`;
      
      const { error: uploadError } = await supabase.storage
        .from("property-photos")
        .upload(fileName, signatureBlob);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("property-photos")
        .getPublicUrl(fileName);

      // Get template ID
      const { data: template } = await supabase
        .from("form_templates")
        .select("id")
        .eq("slug", "captacao-imovel")
        .single();

      if (!template) throw new Error("Template não encontrado");

      // Save form submission
      const { error: submitError } = await supabase
        .from("form_submissions")
        .insert({
          property_id: newProperty.id,
          property_code: newProperty.property_code!,
          template_id: template.id,
          form_data: data,
          client_name: data.owner_name,
          client_email: data.owner_email,
          signature_url: publicUrl,
          signature_method: "digital",
          status: "signed",
          signed_at: new Date().toISOString(),
        });

      if (submitError) throw submitError;

      toast({
        title: "Captação registrada",
        description: `Imóvel ${newProperty.property_code} criado com sucesso e aguardando aprovação.`,
      });

      onSuccess?.(newProperty.id, newProperty.property_code!);
    } catch (error: any) {
      console.error("Erro ao enviar:", error);
      toast({
        title: "Erro ao enviar",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Accordion type="multiple" defaultValue={["captador"]} className="w-full">
        {/* Dados do Captador */}
        <AccordionItem value="captador">
          <AccordionTrigger className="text-lg font-semibold">Dados do Captador</AccordionTrigger>
          <AccordionContent>
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Captador</Label>
                    <Input value={userName} disabled />
                  </div>
                  <div className="space-y-2">
                    <Label>Data</Label>
                    <Input type="date" {...register("data_captacao")} disabled />
                  </div>
                </div>
              </CardContent>
            </Card>
          </AccordionContent>
        </AccordionItem>

        {/* Dados do Proprietário */}
        <AccordionItem value="proprietario">
          <AccordionTrigger className="text-lg font-semibold">Dados do Proprietário</AccordionTrigger>
          <AccordionContent>
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label>Nome Completo *</Label>
                    <Input {...register("owner_name")} />
                    {errors.owner_name && <p className="text-sm text-destructive">{errors.owner_name.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label>E-mail *</Label>
                    <Input type="email" {...register("owner_email")} />
                    {errors.owner_email && <p className="text-sm text-destructive">{errors.owner_email.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label>Telefones *</Label>
                    <Input {...register("owner_phones")} placeholder="(00) 00000-0000" />
                    {errors.owner_phones && <p className="text-sm text-destructive">{errors.owner_phones.message}</p>}
                  </div>
                </div>
              </CardContent>
            </Card>
          </AccordionContent>
        </AccordionItem>

        {/* Informações Básicas */}
        <AccordionItem value="basicas">
          <AccordionTrigger className="text-lg font-semibold">Informações Básicas do Imóvel</AccordionTrigger>
          <AccordionContent>
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Padrão *</Label>
                    <Select onValueChange={(value) => setValue("padrao", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Alto">Alto</SelectItem>
                        <SelectItem value="Médio">Médio</SelectItem>
                        <SelectItem value="Baixo">Baixo</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.padrao && <p className="text-sm text-destructive">{errors.padrao.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label>Tipo *</Label>
                    <Select onValueChange={(value) => setValue("finalidade_tipo", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Residencial">Residencial</SelectItem>
                        <SelectItem value="Comercial">Comercial</SelectItem>
                        <SelectItem value="Terreno">Terreno</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.finalidade_tipo && <p className="text-sm text-destructive">{errors.finalidade_tipo.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label>Tem Locação *</Label>
                    <Select onValueChange={(value) => setValue("tem_locacao", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Sim">Sim</SelectItem>
                        <SelectItem value="Não">Não</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.tem_locacao && <p className="text-sm text-destructive">{errors.tem_locacao.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label>Financiado</Label>
                    <Select onValueChange={(value) => setValue("financiado", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Sim">Sim</SelectItem>
                        <SelectItem value="Não">Não</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Valor de Venda (R$)</Label>
                    <Input type="number" step="0.01" {...register("valor_venda")} />
                  </div>

                  <div className="space-y-2">
                    <Label>Valor Locação (R$)</Label>
                    <Input type="number" step="0.01" {...register("valor_locacao")} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </AccordionContent>
        </AccordionItem>

        {/* Localização */}
        <AccordionItem value="localizacao">
          <AccordionTrigger className="text-lg font-semibold">Localização</AccordionTrigger>
          <AccordionContent>
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label>Localização *</Label>
                    <Select onValueChange={(value) => setValue("localizacao_qualidade", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Privilegiada">Privilegiada</SelectItem>
                        <SelectItem value="Ótima">Ótima</SelectItem>
                        <SelectItem value="Normal">Normal</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.localizacao_qualidade && <p className="text-sm text-destructive">{errors.localizacao_qualidade.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label>Endereço Completo *</Label>
                    <Input {...register("endereco")} />
                    {errors.endereco && <p className="text-sm text-destructive">{errors.endereco.message}</p>}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Bairro *</Label>
                      <Input {...register("bairro")} />
                      {errors.bairro && <p className="text-sm text-destructive">{errors.bairro.message}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label>Cidade *</Label>
                      <Input {...register("cidade")} />
                      {errors.cidade && <p className="text-sm text-destructive">{errors.cidade.message}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label>CEP *</Label>
                      <Input {...register("cep")} placeholder="00000-000" />
                      {errors.cep && <p className="text-sm text-destructive">{errors.cep.message}</p>}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </AccordionContent>
        </AccordionItem>

        {/* Características Físicas */}
        <AccordionItem value="fisicas">
          <AccordionTrigger className="text-lg font-semibold">Características Físicas</AccordionTrigger>
          <AccordionContent>
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Nome do Condomínio</Label>
                    <Input {...register("nome_condominio")} />
                  </div>

                  <div className="space-y-2">
                    <Label>Valor Condomínio (R$)</Label>
                    <Input type="number" step="0.01" {...register("valor_condominio")} />
                  </div>

                  <div className="space-y-2">
                    <Label>Área Total do Terreno (m²) *</Label>
                    <Input type="number" step="0.01" {...register("area_total")} />
                    {errors.area_total && <p className="text-sm text-destructive">{errors.area_total.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label>Área Construída (m²)</Label>
                    <Input type="number" step="0.01" {...register("area_construida")} />
                  </div>

                  <div className="space-y-2">
                    <Label>Face</Label>
                    <Select onValueChange={(value) => setValue("face", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Leste">Leste</SelectItem>
                        <SelectItem value="Oeste">Oeste</SelectItem>
                        <SelectItem value="Norte">Norte</SelectItem>
                        <SelectItem value="Sul">Sul</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Características da Vaga</Label>
                    <Input {...register("caracteristicas_vaga")} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </AccordionContent>
        </AccordionItem>

        {/* Situação e Ocupação */}
        <AccordionItem value="ocupacao">
          <AccordionTrigger className="text-lg font-semibold">Situação e Ocupação</AccordionTrigger>
          <AccordionContent>
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Situação do Imóvel *</Label>
                    <Select onValueChange={(value) => setValue("situacao_imovel", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Desocupado">Desocupado</SelectItem>
                        <SelectItem value="Ocupado">Ocupado</SelectItem>
                        <SelectItem value="Reservado">Reservado</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.situacao_imovel && <p className="text-sm text-destructive">{errors.situacao_imovel.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label>Ocupado Até</Label>
                    <Input type="date" {...register("ocupado_ate")} />
                  </div>

                  <div className="space-y-2">
                    <Label>Ocupado Pelo</Label>
                    <Select onValueChange={(value) => setValue("ocupado_pelo", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Proprietário">Proprietário</SelectItem>
                        <SelectItem value="Inquilino">Inquilino</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Autorizado para Visita *</Label>
                    <Select onValueChange={(value) => setValue("autorizado_visita", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Sim">Sim</SelectItem>
                        <SelectItem value="Não">Não</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.autorizado_visita && <p className="text-sm text-destructive">{errors.autorizado_visita.message}</p>}
                  </div>
                </div>
              </CardContent>
            </Card>
          </AccordionContent>
        </AccordionItem>

        {/* Informações Comerciais */}
        <AccordionItem value="comerciais">
          <AccordionTrigger className="text-lg font-semibold">Informações Comerciais</AccordionTrigger>
          <AccordionContent>
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Exclusividade *</Label>
                    <Select onValueChange={(value) => setValue("exclusividade", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Sim">Sim</SelectItem>
                        <SelectItem value="Não">Não</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.exclusividade && <p className="text-sm text-destructive">{errors.exclusividade.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label>Comissão (%)</Label>
                    <Input type="number" step="0.01" {...register("comissao")} />
                  </div>

                  <div className="space-y-2">
                    <Label>Início do Contrato</Label>
                    <Input type="date" {...register("inicio_contrato")} />
                  </div>

                  <div className="space-y-2">
                    <Label>Validade do Contrato</Label>
                    <Input type="date" {...register("validade_contrato")} />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label>Condição Comercial</Label>
                    <Textarea {...register("condicao_comercial")} placeholder="Ex: Aceita permuta" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </AccordionContent>
        </AccordionItem>

        {/* Documentação e Despesas */}
        <AccordionItem value="documentacao">
          <AccordionTrigger className="text-lg font-semibold">Documentação e Despesas</AccordionTrigger>
          <AccordionContent>
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Valor IPTU Anual (R$)</Label>
                    <Input type="number" step="0.01" {...register("valor_iptu")} />
                  </div>

                  <div className="space-y-2">
                    <Label>IPTU Mensal (R$)</Label>
                    <Input type="number" step="0.01" {...register("iptu_mensal")} />
                  </div>

                  <div className="space-y-2">
                    <Label>Eletricidade</Label>
                    <Select onValueChange={(value) => setValue("eletricidade", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Sim">Sim</SelectItem>
                        <SelectItem value="Não">Não</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Valor Água (R$)</Label>
                    <Input type="number" step="0.01" {...register("valor_agua")} />
                  </div>

                  <div className="space-y-2">
                    <Label>Local da Chave</Label>
                    <Input {...register("local_chave")} />
                  </div>

                  <div className="space-y-2">
                    <Label>Ano da Construção</Label>
                    <Input type="number" {...register("ano_construcao")} />
                  </div>

                  <div className="space-y-2">
                    <Label>Ano da Reforma</Label>
                    <Input type="number" {...register("ano_reforma")} />
                  </div>

                  <div className="space-y-2">
                    <Label>Placa no Local</Label>
                    <Input {...register("placa_local")} placeholder="Ex: Placa KESO instalada" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </AccordionContent>
        </AccordionItem>

        {/* Descrições */}
        <AccordionItem value="descricoes">
          <AccordionTrigger className="text-lg font-semibold">Descrições</AccordionTrigger>
          <AccordionContent>
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="space-y-2">
                  <Label>Descrição de Anúncios (Site e Jornal) *</Label>
                  <Textarea {...register("descricao_anuncios")} rows={4} />
                  {errors.descricao_anuncios && <p className="text-sm text-destructive">{errors.descricao_anuncios.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label>Comentário Interno</Label>
                  <Textarea {...register("comentario_interno")} rows={3} />
                </div>
              </CardContent>
            </Card>
          </AccordionContent>
        </AccordionItem>

        {/* Assinatura */}
        <AccordionItem value="assinatura">
          <AccordionTrigger className="text-lg font-semibold">Assinatura</AccordionTrigger>
          <AccordionContent>
            <Card>
              <CardHeader>
                <CardTitle>Assinatura Digital</CardTitle>
                <CardDescription>Confirme os dados e assine digitalmente</CardDescription>
              </CardHeader>
              <CardContent>
                <SignaturePad onSave={setSignature} value={signature} />
              </CardContent>
            </Card>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <div className="flex justify-end gap-4 sticky bottom-0 bg-background py-4 border-t">
        <Button type="submit" disabled={isSubmitting} size="lg">
          {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          Enviar Formulário de Captação
        </Button>
      </div>
    </form>
  );
}