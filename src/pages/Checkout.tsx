import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Check, ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Plan {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  duration_days: number;
  features: string[];
}

interface Property {
  id: string;
  property_code: string | null;
  address: string;
}

export default function Checkout() {
  const { planId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [plan, setPlan] = useState<Plan | null>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!user) {
      toast.error("Você precisa estar logado");
      navigate("/auth");
      return;
    }
    fetchData();
  }, [user, planId]);

  const fetchData = async () => {
    try {
      // Fetch plan details
      const { data: planData, error: planError } = await supabase
        .from("plans")
        .select("*")
        .eq("id", planId)
        .single();

      if (planError) throw planError;
      setPlan(planData);

      // Fetch user's properties
      const { data: propertiesData, error: propertiesError } = await supabase
        .from("properties")
        .select("id, property_code, address")
        .eq("owner_id", user?.id)
        .eq("status", "active");

      if (propertiesError) throw propertiesError;
      setProperties(propertiesData || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Erro ao carregar dados");
      navigate("/planos");
    } finally {
      setLoading(false);
    }
  };

  const handleActivatePlan = async () => {
    if (!selectedProperty) {
      toast.error("Selecione um imóvel");
      return;
    }

    if (!plan) return;

    setProcessing(true);
    try {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + plan.duration_days);

      const { error } = await supabase
        .from("property_plans")
        .insert({
          property_id: selectedProperty,
          plan_id: plan.id,
          user_id: user?.id,
          status: "active",
          expires_at: expiresAt.toISOString(),
        });

      if (error) throw error;

      toast.success("Plano ativado com sucesso!");
      navigate("/my-properties");
    } catch (error: any) {
      console.error("Error activating plan:", error);
      toast.error(error.message || "Erro ao ativar plano");
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!plan) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 py-20">
        <div className="container max-w-4xl">
          <Button
            variant="ghost"
            onClick={() => navigate("/planos")}
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para Planos
          </Button>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Plan Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Resumo do Plano</CardTitle>
                <CardDescription>Detalhes da sua assinatura</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-2xl font-bold">{plan.name}</h3>
                  <p className="text-muted-foreground">{plan.description}</p>
                </div>
                <div className="pt-4 border-t">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-muted-foreground">Preço</span>
                    <span className="text-2xl font-bold">R$ {plan.price.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Duração</span>
                    <span className="font-semibold">{plan.duration_days} dias</span>
                  </div>
                </div>
                <div className="pt-4 border-t">
                  <h4 className="font-semibold mb-3">Recursos Incluídos</h4>
                  <ul className="space-y-2">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <Check className="h-5 w-5 text-primary mr-2 shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Property Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Selecione o Imóvel</CardTitle>
                <CardDescription>
                  Escolha qual imóvel receberá este plano
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {properties.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-4">
                      Você ainda não possui imóveis cadastrados
                    </p>
                    <Button onClick={() => navigate("/add-property")}>
                      Cadastrar Imóvel
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="property">Imóvel</Label>
                      <Select
                        value={selectedProperty}
                        onValueChange={setSelectedProperty}
                      >
                        <SelectTrigger id="property">
                          <SelectValue placeholder="Selecione um imóvel" />
                        </SelectTrigger>
                        <SelectContent>
                          {properties.map((property) => (
                            <SelectItem key={property.id} value={property.id}>
                              {property.property_code || "Sem código"} - {property.address}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="pt-4 border-t">
                      <h4 className="font-semibold mb-2">Método de Pagamento</h4>
                      <p className="text-sm text-muted-foreground mb-4">
                        Pagamento será processado via PIX/Transferência
                      </p>
                      <div className="bg-muted/50 p-4 rounded-lg">
                        <p className="text-sm">
                          Após a confirmação, você receberá instruções de pagamento por email.
                        </p>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full"
                  size="lg"
                  onClick={handleActivatePlan}
                  disabled={!selectedProperty || processing}
                >
                  {processing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processando...
                    </>
                  ) : (
                    `Ativar Plano - R$ ${plan.price.toFixed(2)}`
                  )}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
