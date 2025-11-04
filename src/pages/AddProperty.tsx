import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { useToast } from "@/hooks/use-toast";
import { fetchAddressByCep, formatCep } from "@/utils/viaCep";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Upload, X, Loader2, MapPin } from "lucide-react";

const propertySchema = z.object({
  type_id: z.string().uuid("Selecione um tipo de imóvel"),
  finalidade: z.enum(["buy", "rent"]),
  address: z.string().min(5, "Endereço deve ter pelo menos 5 caracteres"),
  city_id: z.string().uuid("Selecione uma cidade"),
  price: z.string().min(1, "Preço é obrigatório"),
  area: z.string().optional(),
  bedrooms: z.string().optional(),
  bathrooms: z.string().optional(),
  parking_spaces: z.string().optional(),
  description: z.string().optional(),
  show_in_carousel: z.boolean().optional(),
});

type PropertyFormData = z.infer<typeof propertySchema>;

export default function AddProperty() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isAdmin } = useUserRole();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [cities, setCities] = useState<any[]>([]);
  const [propertyTypes, setPropertyTypes] = useState<any[]>([]);
  const [images, setImages] = useState<File[]>([]);
  const [mainImageIndex, setMainImageIndex] = useState(0);
  const [cep, setCep] = useState("");
  const [loadingCep, setLoadingCep] = useState(false);
  const [cepData, setCepData] = useState<any>(null);

  const form = useForm<PropertyFormData>({
    resolver: zodResolver(propertySchema),
    defaultValues: {
      finalidade: "buy",
      show_in_carousel: false,
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      const [citiesRes, typesRes] = await Promise.all([
        supabase.from("cities").select("*").order("name"),
        supabase.from("property_types").select("*").eq("active", true).order("display_order"),
      ]);
      if (citiesRes.data) setCities(citiesRes.data);
      if (typesRes.data) setPropertyTypes(typesRes.data);
    };
    fetchData();
  }, []);

  const handleCepSearch = async () => {
    if (cep.replace(/\D/g, "").length !== 8) {
      toast({
        title: "CEP inválido",
        description: "O CEP deve conter 8 dígitos",
        variant: "destructive",
      });
      return;
    }

    setLoadingCep(true);
    try {
      const data = await fetchAddressByCep(cep);
      setCepData(data);

      // Auto-fill address
      form.setValue("address", `${data.street}, ${data.neighborhood}`);

      // Check if city exists
      const { data: existingCity } = await supabase
        .from("cities")
        .select("*")
        .ilike("name", data.city)
        .eq("state", data.state)
        .maybeSingle();

      if (existingCity) {
        form.setValue("city_id", existingCity.id);
        toast({
          title: "Endereço encontrado!",
          description: "Dados preenchidos automaticamente.",
        });
      } else {
        // City doesn't exist, ask to create
        const shouldCreate = window.confirm(
          `A cidade ${data.city}-${data.state} não está cadastrada. Deseja adicioná-la automaticamente?`
        );

        if (shouldCreate) {
          const { data: newCity, error } = await supabase
            .from("cities")
            .insert({
              name: data.city,
              state: data.state,
              slug: data.city.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "-"),
            })
            .select()
            .single();

          if (error) throw error;

          // Refresh cities list
          const { data: citiesData } = await supabase.from("cities").select("*").order("name");
          if (citiesData) setCities(citiesData);

          form.setValue("city_id", newCity.id);
          toast({
            title: "Cidade criada!",
            description: `${data.city}-${data.state} foi adicionada ao sistema.`,
          });
        }
      }
    } catch (error: any) {
      toast({
        title: "Erro ao buscar CEP",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoadingCep(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setImages((prev) => [...prev, ...files]);
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    if (mainImageIndex === index) setMainImageIndex(0);
    else if (mainImageIndex > index) setMainImageIndex(mainImageIndex - 1);
  };

  const onSubmit = async (data: PropertyFormData) => {
    if (!user) return;

    setLoading(true);
    try {
      // Create property
      const propertyData: any = {
        owner_id: user.id,
        type_id: data.type_id,
        type: "casa", // Temporary fallback for old column
        finalidade: data.finalidade,
        address: data.address,
        city_id: data.city_id,
        price: parseFloat(data.price),
        area: data.area ? parseFloat(data.area) : null,
        bedrooms: data.bedrooms ? parseInt(data.bedrooms) : null,
        bathrooms: data.bathrooms ? parseInt(data.bathrooms) : null,
        parking_spaces: data.parking_spaces ? parseInt(data.parking_spaces) : null,
        description: data.description || null,
        status: (isAdmin ? "active" : "pending") as "active" | "pending" | "expired" | "paused",
        verified: isAdmin,
        is_owner_direct: !isAdmin,
        show_in_carousel: data.show_in_carousel || false,
      };

      const { data: property, error: propertyError } = await supabase
        .from("properties")
        .insert([propertyData])
        .select()
        .single();

      if (propertyError) throw propertyError;

      // Upload images
      if (images.length > 0) {
        for (let i = 0; i < images.length; i++) {
          const file = images[i];
          const fileExt = file.name.split(".").pop();
          const fileName = `${property.id}/${Date.now()}-${i}.${fileExt}`;

          const { error: uploadError } = await supabase.storage
            .from("property-photos")
            .upload(fileName, file);

          if (uploadError) throw uploadError;

          const { data: { publicUrl } } = supabase.storage
            .from("property-photos")
            .getPublicUrl(fileName);

          await supabase.from("property_photos").insert({
            property_id: property.id,
            url: publicUrl,
            is_main: i === mainImageIndex,
          });
        }
      }

      toast({
        title: "Imóvel cadastrado!",
        description: isAdmin
          ? "O imóvel está ativo e visível."
          : "Seu imóvel está aguardando aprovação.",
      });

      navigate(isAdmin ? "/admin" : "/meus-imoveis");
    } catch (error: any) {
      toast({
        title: "Erro ao cadastrar imóvel",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8">
        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle className="text-3xl">Cadastrar Imóvel</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-6 flex justify-between">
              {[1, 2, 3].map((s) => (
                <div
                  key={s}
                  className={`flex-1 h-2 rounded ${
                    s <= step ? "bg-primary" : "bg-muted"
                  } ${s < 3 ? "mr-2" : ""}`}
                />
              ))}
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {step === 1 && (
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="type_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tipo de Imóvel</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione o tipo" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {propertyTypes.map((type) => (
                                <SelectItem key={type.id} value={type.id}>
                                  {type.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="finalidade"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Finalidade</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="buy">Venda</SelectItem>
                              <SelectItem value="rent">Aluguel</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* CEP Search */}
                    <FormItem>
                      <FormLabel>CEP</FormLabel>
                      <div className="flex gap-2">
                        <Input
                          placeholder="00000-000"
                          value={cep}
                          onChange={(e) => setCep(formatCep(e.target.value))}
                          maxLength={9}
                        />
                        <Button
                          type="button"
                          onClick={handleCepSearch}
                          disabled={loadingCep}
                          variant="secondary"
                        >
                          {loadingCep ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <MapPin className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                      <FormDescription>
                        Digite o CEP para preencher automaticamente o endereço
                      </FormDescription>
                    </FormItem>

                    <FormField
                      control={form.control}
                      name="city_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cidade</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione uma cidade" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {cities.map((city) => (
                                <SelectItem key={city.id} value={city.id}>
                                  {city.name} - {city.state}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Endereço Completo</FormLabel>
                          <FormControl>
                            <Input placeholder="Rua, número, complemento, bairro" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button type="button" onClick={() => setStep(2)} className="w-full">
                      Próximo
                    </Button>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Preço (R$)</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="350000" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="area"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Área (m²)</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="120" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="bedrooms"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Quartos</FormLabel>
                            <FormControl>
                              <Input type="number" placeholder="3" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="bathrooms"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Banheiros</FormLabel>
                            <FormControl>
                              <Input type="number" placeholder="2" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="parking_spaces"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Vagas</FormLabel>
                            <FormControl>
                              <Input type="number" placeholder="2" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Descrição</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Descreva o imóvel..."
                              className="min-h-[100px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex gap-2">
                      <Button type="button" variant="outline" onClick={() => setStep(1)} className="flex-1">
                        Voltar
                      </Button>
                      <Button type="button" onClick={() => setStep(3)} className="flex-1">
                        Próximo
                      </Button>
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-4">
                    {isAdmin && (
                      <FormField
                        control={form.control}
                        name="show_in_carousel"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">
                                Mostrar no Carrossel da Home
                              </FormLabel>
                              <FormDescription>
                                Exibir este imóvel no carrossel principal da página inicial
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    )}

                    <div>
                      <FormLabel>Fotos do Imóvel</FormLabel>
                      <div className="mt-2 border-2 border-dashed rounded-lg p-6 text-center">
                        <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                        <p className="mt-2 text-sm text-muted-foreground">
                          Clique para adicionar fotos
                        </p>
                        <Input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleImageUpload}
                          className="mt-2"
                        />
                      </div>
                    </div>

                    {images.length > 0 && (
                      <div className="grid grid-cols-3 gap-4">
                        {images.map((file, index) => (
                          <div key={index} className="relative">
                            <img
                              src={URL.createObjectURL(file)}
                              alt={`Preview ${index}`}
                              className="w-full h-24 object-cover rounded"
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              className="absolute top-1 right-1 h-6 w-6"
                              onClick={() => removeImage(index)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                            <Button
                              type="button"
                              variant={mainImageIndex === index ? "default" : "outline"}
                              size="sm"
                              className="absolute bottom-1 left-1 h-6 text-xs"
                              onClick={() => setMainImageIndex(index)}
                            >
                              {mainImageIndex === index ? "Principal" : "Definir"}
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button type="button" variant="outline" onClick={() => setStep(2)} className="flex-1">
                        Voltar
                      </Button>
                      <Button type="submit" disabled={loading} className="flex-1">
                        {loading ? "Cadastrando..." : "Cadastrar Imóvel"}
                      </Button>
                    </div>
                  </div>
                )}
              </form>
            </Form>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
