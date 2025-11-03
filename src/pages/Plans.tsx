import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Star } from "lucide-react";
import { toast } from "sonner";

interface Plan {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  duration_days: number;
  features: string[];
  featured: boolean;
}

export default function Plans() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const { data, error } = await supabase
        .from("plans")
        .select("*")
        .eq("active", true)
        .order("display_order", { ascending: true });

      if (error) throw error;
      setPlans(data || []);
    } catch (error) {
      console.error("Error fetching plans:", error);
      toast.error("Erro ao carregar planos");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPlan = (planId: string) => {
    if (!user) {
      toast.error("Você precisa estar logado para contratar um plano");
      navigate("/auth");
      return;
    }

    // TODO: Implement checkout flow
    navigate(`/checkout/${planId}`);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <section className="py-20 bg-gradient-to-b from-background to-muted/20">
          <div className="container">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h1 className="text-4xl font-bold mb-4">
                Escolha o Melhor Plano para Seu Imóvel
              </h1>
              <p className="text-lg text-muted-foreground">
                Potencialize a venda ou locação do seu imóvel com nossos planos especiais
              </p>
            </div>

            {loading ? (
              <div className="grid md:grid-cols-3 gap-8">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="animate-pulse">
                    <div className="h-64 bg-muted rounded-lg" />
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid md:grid-cols-3 gap-8">
                {plans.map((plan) => (
                  <Card
                    key={plan.id}
                    className={`relative ${
                      plan.featured
                        ? "border-primary border-2 shadow-xl scale-105"
                        : ""
                    }`}
                  >
                    {plan.featured && (
                      <Badge
                        className="absolute -top-3 left-1/2 transform -translate-x-1/2"
                        variant="default"
                      >
                        <Star className="h-3 w-3 mr-1" />
                        Mais Popular
                      </Badge>
                    )}
                    <CardHeader>
                      <CardTitle className="text-2xl">{plan.name}</CardTitle>
                      <CardDescription>{plan.description}</CardDescription>
                      <div className="mt-4">
                        <span className="text-4xl font-bold">
                          R$ {plan.price.toFixed(2)}
                        </span>
                        <span className="text-muted-foreground">
                          /{plan.duration_days} dias
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-3">
                        {plan.features.map((feature, index) => (
                          <li key={index} className="flex items-start">
                            <Check className="h-5 w-5 text-primary mr-2 shrink-0 mt-0.5" />
                            <span className="text-sm">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                    <CardFooter>
                      <Button
                        className="w-full"
                        variant={plan.featured ? "default" : "outline"}
                        size="lg"
                        onClick={() => handleSelectPlan(plan.id)}
                      >
                        Escolher Plano
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}