import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SearchBar from "@/components/SearchBar";
import PropertyCard from "@/components/PropertyCard";
import { Building2, CheckCircle2, Shield, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

const Index = () => {
  const [featuredProperties, setFeaturedProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedProperties();
  }, []);

  const fetchFeaturedProperties = async () => {
    try {
      const { data, error } = await supabase
        .from("properties")
        .select(`
          *,
          cities (name, state),
          property_photos (url, is_main)
        `)
        .eq("status", "active")
        .eq("featured", true)
        .order("created_at", { ascending: false })
        .limit(3);

      if (error) throw error;

      const formattedProperties = data?.map((property) => ({
        id: property.id,
        image: property.property_photos?.find((p: any) => p.is_main)?.url || 
                property.property_photos?.[0]?.url || 
                "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800",
        title: property.address,
        price: property.price,
        location: `${property.cities?.name}, ${property.cities?.state}`,
        bedrooms: property.bedrooms,
        bathrooms: property.bathrooms,
        parking: property.parking_spaces,
        area: property.area,
        verified: property.verified,
        ownerDirect: property.is_owner_direct,
        featured: property.featured,
        propertyCode: property.property_code,
      }));

      setFeaturedProperties(formattedProperties || []);
    } catch (error) {
      console.error("Error fetching featured properties:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-hero py-20 text-white md:py-32">
        <div className="container relative z-10">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="mb-6 text-4xl font-bold md:text-5xl lg:text-6xl">
              Caminhos que levam a conquistas.
            </h1>
            <p className="mb-8 text-lg text-white/90 md:text-xl">
              Imóveis verificados pela KÈSO e anúncios diretos de proprietários.
              Simples, seguro e transparente.
            </p>
            <div className="mx-auto max-w-4xl">
              <SearchBar />
            </div>
          </div>
        </div>
        
        {/* Decorative gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent" />
      </section>

      {/* Features */}
      <section className="py-16">
        <div className="container">
          <div className="grid gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Imóveis Verificados</h3>
              <p className="text-muted-foreground">
                Todos os imóveis da KÈSO são verificados e validados pela nossa equipe
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <CheckCircle2 className="h-8 w-8 text-primary" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Anúncios Diretos</h3>
              <p className="text-muted-foreground">
                Conecte-se diretamente com proprietários sem intermediários
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <TrendingUp className="h-8 w-8 text-primary" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Melhor Preço</h3>
              <p className="text-muted-foreground">
                Encontre as melhores ofertas do mercado imobiliário
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Properties */}
      <section className="bg-muted/30 py-16">
        <div className="container">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-3xl font-bold">Imóveis em Destaque</h2>
            <Button variant="outline" asChild>
              <Link to="/imoveis">Ver Todos</Link>
            </Button>
          </div>
          
          {loading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-4">
                  <Skeleton className="h-64 w-full" />
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))}
            </div>
          ) : featuredProperties.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {featuredProperties.map((property) => (
                <PropertyCard key={property.id} {...property} />
              ))}
            </div>
          ) : (
            <div className="py-12 text-center">
              <p className="text-lg text-muted-foreground">
                Nenhum imóvel em destaque no momento.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container">
          <div className="mx-auto max-w-3xl rounded-2xl bg-gradient-hero p-8 text-center text-white md:p-12">
            <Building2 className="mx-auto mb-6 h-16 w-16" />
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">
              Anuncie Seu Imóvel com a KÈSO
            </h2>
            <p className="mb-8 text-lg text-white/90">
              Tenha acesso a milhares de interessados e venda ou alugue mais rápido.
              Primeiros 30 dias grátis!
            </p>
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Button size="lg" variant="secondary" asChild>
                <Link to="/anunciar">Anunciar Imóvel</Link>
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-primary" asChild>
                <Link to="/sobre">Saiba Mais</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
