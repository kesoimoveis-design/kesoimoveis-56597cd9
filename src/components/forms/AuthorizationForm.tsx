import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SignaturePad } from "./SignaturePad";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
  owner_name: z.string().min(1, "Nome é obrigatório"),
  owner_cpf: z.string().min(11, "CPF inválido"),
  owner_rg: z.string().min(1, "RG é obrigatório"),
  owner_address: z.string().min(1, "Endereço é obrigatório"),
  owner_city: z.string().min(1, "Cidade é obrigatória"),
  owner_state: z.string().min(2, "Estado é obrigatório"),
  owner_cep: z.string().min(8, "CEP inválido"),
  owner_phone: z.string().min(10, "Telefone inválido"),
  owner_email: z.string().email("E-mail inválido"),
  property_type: z.string().min(1, "Tipo é obrigatório"),
  property_address: z.string().min(1, "Endereço é obrigatório"),
  property_neighborhood: z.string().min(1, "Bairro é obrigatório"),
  property_city: z.string().min(1, "Cidade é obrigatória"),
  property_area: z.string().min(1, "Área é obrigatória"),
  property_bedrooms: z.string().optional(),
  property_bathrooms: z.string().optional(),
  property_parking: z.string().optional(),
  sale_type: z.string().min(1, "Finalidade é obrigatória"),
  sale_price: z.string().optional(),
  rent_price: z.string().optional(),
  commission: z.string().min(1, "Comissão é obrigatória"),
  exclusive: z.string().min(1, "Campo obrigatório"),
  contract_duration: z.string().min(1, "Prazo é obrigatório"),
});

interface AuthorizationFormProps {
  propertyId: string;
  propertyCode: string;
  onSuccess?: () => void;
}

export function AuthorizationForm({ propertyId, propertyCode, onSuccess }: AuthorizationFormProps) {
  const { toast } = useToast();
  const [signature, setSignature] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

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
      // Upload signature to storage
      const signatureBlob = await fetch(signature).then(r => r.blob());
      const fileName = `signatures/${propertyCode}_${Date.now()}.png`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
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
        .eq("slug", "autorizacao-comercializacao")
        .single();

      if (!template) throw new Error("Template não encontrado");

      // Save form submission
      const { error: submitError } = await supabase
        .from("form_submissions")
        .insert({
          property_id: propertyId,
          property_code: propertyCode,
          template_id: template.id,
          form_data: data,
          client_name: data.owner_name,
          client_cpf: data.owner_cpf,
          client_email: data.owner_email,
          signature_url: publicUrl,
          signature_method: "digital",
          status: "signed",
          signed_at: new Date().toISOString(),
        });

      if (submitError) throw submitError;

      toast({
        title: "Formulário enviado",
        description: "Autorização de comercialização registrada com sucesso.",
      });

      onSuccess?.();
    } catch (error: any) {
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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Dados do Proprietário</CardTitle>
          <CardDescription>Informações do proprietário do imóvel</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="owner_name">Nome Completo *</Label>
              <Input id="owner_name" {...register("owner_name")} />
              {errors.owner_name && <p className="text-sm text-destructive">{errors.owner_name.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="owner_cpf">CPF *</Label>
              <Input id="owner_cpf" {...register("owner_cpf")} placeholder="000.000.000-00" />
              {errors.owner_cpf && <p className="text-sm text-destructive">{errors.owner_cpf.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="owner_rg">RG *</Label>
              <Input id="owner_rg" {...register("owner_rg")} />
              {errors.owner_rg && <p className="text-sm text-destructive">{errors.owner_rg.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="owner_phone">Telefone *</Label>
              <Input id="owner_phone" {...register("owner_phone")} placeholder="(00) 00000-0000" />
              {errors.owner_phone && <p className="text-sm text-destructive">{errors.owner_phone.message}</p>}
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="owner_email">E-mail *</Label>
              <Input id="owner_email" type="email" {...register("owner_email")} />
              {errors.owner_email && <p className="text-sm text-destructive">{errors.owner_email.message}</p>}
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="owner_address">Endereço *</Label>
              <Input id="owner_address" {...register("owner_address")} />
              {errors.owner_address && <p className="text-sm text-destructive">{errors.owner_address.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="owner_city">Cidade *</Label>
              <Input id="owner_city" {...register("owner_city")} />
              {errors.owner_city && <p className="text-sm text-destructive">{errors.owner_city.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="owner_state">Estado *</Label>
              <Input id="owner_state" {...register("owner_state")} maxLength={2} placeholder="SP" />
              {errors.owner_state && <p className="text-sm text-destructive">{errors.owner_state.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="owner_cep">CEP *</Label>
              <Input id="owner_cep" {...register("owner_cep")} placeholder="00000-000" />
              {errors.owner_cep && <p className="text-sm text-destructive">{errors.owner_cep.message}</p>}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Dados do Imóvel</CardTitle>
          <CardDescription>Código: {propertyCode}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="property_type">Tipo *</Label>
              <Select onValueChange={(value) => setValue("property_type", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Casa">Casa</SelectItem>
                  <SelectItem value="Apartamento">Apartamento</SelectItem>
                  <SelectItem value="Terreno">Terreno</SelectItem>
                  <SelectItem value="Comercial">Comercial</SelectItem>
                  <SelectItem value="Rural">Rural</SelectItem>
                </SelectContent>
              </Select>
              {errors.property_type && <p className="text-sm text-destructive">{errors.property_type.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="property_area">Área Total (m²) *</Label>
              <Input id="property_area" type="number" {...register("property_area")} />
              {errors.property_area && <p className="text-sm text-destructive">{errors.property_area.message}</p>}
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="property_address">Endereço Completo *</Label>
              <Input id="property_address" {...register("property_address")} />
              {errors.property_address && <p className="text-sm text-destructive">{errors.property_address.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="property_neighborhood">Bairro *</Label>
              <Input id="property_neighborhood" {...register("property_neighborhood")} />
              {errors.property_neighborhood && <p className="text-sm text-destructive">{errors.property_neighborhood.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="property_city">Cidade *</Label>
              <Input id="property_city" {...register("property_city")} />
              {errors.property_city && <p className="text-sm text-destructive">{errors.property_city.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="property_bedrooms">Quartos</Label>
              <Input id="property_bedrooms" type="number" {...register("property_bedrooms")} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="property_bathrooms">Banheiros</Label>
              <Input id="property_bathrooms" type="number" {...register("property_bathrooms")} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="property_parking">Vagas Garagem</Label>
              <Input id="property_parking" type="number" {...register("property_parking")} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Condições Comerciais</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sale_type">Finalidade *</Label>
              <Select onValueChange={(value) => setValue("sale_type", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Venda">Venda</SelectItem>
                  <SelectItem value="Locação">Locação</SelectItem>
                  <SelectItem value="Ambos">Ambos</SelectItem>
                </SelectContent>
              </Select>
              {errors.sale_type && <p className="text-sm text-destructive">{errors.sale_type.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="commission">Comissão (%) *</Label>
              <Input id="commission" type="number" step="0.01" {...register("commission")} />
              {errors.commission && <p className="text-sm text-destructive">{errors.commission.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="sale_price">Valor Venda (R$)</Label>
              <Input id="sale_price" type="number" step="0.01" {...register("sale_price")} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="rent_price">Valor Locação (R$)</Label>
              <Input id="rent_price" type="number" step="0.01" {...register("rent_price")} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="exclusive">Exclusividade *</Label>
              <Select onValueChange={(value) => setValue("exclusive", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Sim">Sim</SelectItem>
                  <SelectItem value="Não">Não</SelectItem>
                </SelectContent>
              </Select>
              {errors.exclusive && <p className="text-sm text-destructive">{errors.exclusive.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="contract_duration">Prazo Contrato (meses) *</Label>
              <Input id="contract_duration" type="number" {...register("contract_duration")} />
              {errors.contract_duration && <p className="text-sm text-destructive">{errors.contract_duration.message}</p>}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Assinatura</CardTitle>
          <CardDescription>Confirme os dados e assine digitalmente</CardDescription>
        </CardHeader>
        <CardContent>
          <SignaturePad onSave={setSignature} value={signature} />
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          Enviar Formulário
        </Button>
      </div>
    </form>
  );
}