import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SearchBar from "@/components/SearchBar";
import PropertyCard from "@/components/PropertyCard";
import { Building2, CheckCircle2, Shield, TrendingUp } from "lucide-react";

const Index = () => {
  // Mock data - substituir por dados reais do Supabase
  const featuredProperties = [
    {
      id: "1",
      image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800",
      title: "Casa moderna com 3 quartos",
      price: 850000,
      location: "São Paulo, SP",
      bedrooms: 3,
      bathrooms: 2,
      parking: 2,
      area: 180,
      verified: true,
    },
    {
      id: "2",
      image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800",
      title: "Apartamento no centro",
      price: 450000,
      location: "Rio de Janeiro, RJ",
      bedrooms: 2,
      bathrooms: 1,
      parking: 1,
      area: 75,
      verified: true,
    },
    {
      id: "3",
      image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800",
      title: "Cobertura com vista panorâmica",
      price: 1200000,
      location: "Belo Horizonte, MG",
      bedrooms: 4,
      bathrooms: 3,
      parking: 3,
      area: 220,
      ownerDirect: true,
    },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-hero py-20 text-white md:py-32">
        <div className="container relative z-10">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="mb-6 text-4xl font-bold md:text-5xl lg:text-6xl">
              Encontre o Imóvel dos Seus Sonhos
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
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {featuredProperties.map((property) => (
              <PropertyCard key={property.id} {...property} />
            ))}
          </div>
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
