import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

const propertySchema = z.object({
  type: z.enum(["casa", "apartamento", "terreno", "comercial", "rural"]),
  finalidade: z.enum(["buy", "rent"]),
  address: z.string().min(5, "Endereço é obrigatório"),
  city_id: z.string().min(1, "Cidade é obrigatória"),
  price: z.string().min(1, "Preço é obrigatório"),
  area: z.string().optional(),
  bedrooms: z.string().optional(),
  bathrooms: z.string().optional(),
  parking_spaces: z.string().optional(),
  description: z.string().optional(),
});

export default function EditProperty() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [cities, setCities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<z.infer<typeof propertySchema>>({
    resolver: zodResolver(propertySchema),
  });

  useEffect(() => {
    if (!user || !id) return;

    const loadData = async () => {
      try {
        // Fetch property
        const { data: property, error: propertyError } = await supabase
          .from("properties")
          .select("*")
          .eq("id", id)
          .eq("owner_id", user.id)
          .single();

        if (propertyError) throw propertyError;

        if (!property) {
          toast({
            title: "Imóvel não encontrado",
            description: "Você não tem permissão para editar este imóvel.",
            variant: "destructive",
          });
          navigate("/meus-imoveis");
          return;
        }

        // Set form values
        setValue("type", property.type);
        setValue("finalidade", property.finalidade);
        setValue("address", property.address);
        setValue("city_id", property.city_id);
        setValue("price", property.price.toString());
        setValue("area", property.area?.toString() || "");
        setValue("bedrooms", property.bedrooms?.toString() || "");
        setValue("bathrooms", property.bathrooms?.toString() || "");
        setValue("parking_spaces", property.parking_spaces?.toString() || "");
        setValue("description", property.description || "");

        // Fetch cities
        const { data: citiesData } = await supabase
          .from("cities")
          .select("*")
          .order("name");
        setCities(citiesData || []);

      } catch (error: any) {
        toast({
          title: "Erro ao carregar",
          description: error.message,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user, id, navigate, toast, setValue]);

  const onSubmit = async (data: z.infer<typeof propertySchema>) => {
    if (!user || !id) return;

    setSubmitting(true);

    try {
      const { error } = await supabase
        .from("properties")
        .update({
          type: data.type,
          finalidade: data.finalidade,
          address: data.address,
          city_id: data.city_id,
          price: parseFloat(data.price),
          area: data.area ? parseFloat(data.area) : null,
          bedrooms: data.bedrooms ? parseInt(data.bedrooms) : null,
          bathrooms: data.bathrooms ? parseInt(data.bathrooms) : null,
          parking_spaces: data.parking_spaces ? parseInt(data.parking_spaces) : null,
          description: data.description || null,
        })
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Imóvel atualizado",
        description: "As alterações foram salvas com sucesso.",
      });

      navigate("/meus-imoveis");
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Editar Imóvel</h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informações Básicas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Tipo de Imóvel *</Label>
                  <Select value={watch("type")} onValueChange={(value: any) => setValue("type", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="casa">Casa</SelectItem>
                      <SelectItem value="apartamento">Apartamento</SelectItem>
                      <SelectItem value="terreno">Terreno</SelectItem>
                      <SelectItem value="comercial">Comercial</SelectItem>
                      <SelectItem value="rural">Rural</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.type && <p className="text-sm text-destructive">{errors.type.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="finalidade">Finalidade *</Label>
                  <Select value={watch("finalidade")} onValueChange={(value: any) => setValue("finalidade", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="buy">Venda</SelectItem>
                      <SelectItem value="rent">Locação</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.finalidade && <p className="text-sm text-destructive">{errors.finalidade.message}</p>}
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="address">Endereço *</Label>
                  <Input id="address" {...register("address")} />
                  {errors.address && <p className="text-sm text-destructive">{errors.address.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city_id">Cidade *</Label>
                  <Select value={watch("city_id")} onValueChange={(value) => setValue("city_id", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a cidade" />
                    </SelectTrigger>
                    <SelectContent>
                      {cities.map((city) => (
                        <SelectItem key={city.id} value={city.id}>
                          {city.name} - {city.state}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.city_id && <p className="text-sm text-destructive">{errors.city_id.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price">Preço (R$) *</Label>
                  <Input id="price" type="number" step="0.01" {...register("price")} />
                  {errors.price && <p className="text-sm text-destructive">{errors.price.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="area">Área (m²)</Label>
                  <Input id="area" type="number" step="0.01" {...register("area")} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bedrooms">Quartos</Label>
                  <Input id="bedrooms" type="number" {...register("bedrooms")} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bathrooms">Banheiros</Label>
                  <Input id="bathrooms" type="number" {...register("bathrooms")} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="parking_spaces">Vagas de Garagem</Label>
                  <Input id="parking_spaces" type="number" {...register("parking_spaces")} />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea id="description" {...register("description")} rows={4} />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-4 justify-end">
            <Button type="button" variant="outline" onClick={() => navigate("/meus-imoveis")}>
              Cancelar
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Salvar Alterações
            </Button>
          </div>
        </form>
      </main>
      <Footer />
    </div>
  );
}