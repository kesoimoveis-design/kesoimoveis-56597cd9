import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ContactDialog } from "@/components/ContactDialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Bed,
  Bath,
  Car,
  Ruler,
  MapPin,
  Shield,
  CheckCircle2,
  Phone,
  Mail,
  ArrowLeft,
  AlertTriangle,
} from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

const PropertyDetails = () => {
  const { id } = useParams();
  const [property, setProperty] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchProperty();
    }
  }, [id]);

  const fetchProperty = async () => {
    try {
      const { data, error } = await supabase
        .from("properties")
        .select(`
          *,
          cities (name, state),
          property_photos (url, is_main)
        `)
        .eq("id", id)
        .single();

      if (error) throw error;
      setProperty(data);
    } catch (error) {
      console.error("Error fetching property:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 0,
    }).format(value);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <div className="container py-8">
          <Skeleton className="mb-6 h-96 w-full" />
          <Skeleton className="mb-4 h-8 w-1/2" />
          <Skeleton className="mb-4 h-6 w-1/3" />
          <Skeleton className="h-32 w-full" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!property) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <div className="container flex flex-1 items-center justify-center">
          <div className="text-center">
            <h2 className="mb-4 text-2xl font-bold">Imóvel não encontrado</h2>
            <Button asChild>
              <Link to="/imoveis">Ver todos os imóveis</Link>
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const photos = property.property_photos || [];
  const mainPhoto = photos.find((p: any) => p.is_main) || photos[0];

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <div className="container py-8">
        <Button variant="ghost" className="mb-6" asChild>
          <Link to="/imoveis">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para imóveis
          </Link>
        </Button>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Image Carousel */}
            {photos.length > 0 ? (
              <Carousel className="mb-6">
                <CarouselContent>
                  {photos.map((photo: any, index: number) => (
                    <CarouselItem key={index}>
                      <div className="aspect-video overflow-hidden rounded-lg">
                        <img
                          src={photo.url}
                          alt={`Foto ${index + 1}`}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious />
                <CarouselNext />
              </Carousel>
            ) : (
              <div className="mb-6 aspect-video overflow-hidden rounded-lg bg-muted">
                <img
                  src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800"
                  alt="Imóvel"
                  className="h-full w-full object-cover"
                />
              </div>
            )}

            {/* Property Info */}
            <div className="space-y-6">
              <div>
                <div className="mb-4 flex flex-wrap items-center gap-2">
                  {property.verified && (
                    <Badge className="bg-primary">
                      <CheckCircle2 className="mr-1 h-3 w-3" />
                      Verificado
                    </Badge>
                  )}
                  {property.is_owner_direct && (
                    <Badge variant="secondary">
                      <Shield className="mr-1 h-3 w-3" />
                      Proprietário Direto
                    </Badge>
                  )}
                  {property.featured && <Badge variant="outline">Destaque</Badge>}
                </div>

                <h1 className="mb-2 text-3xl font-bold">{property.address}</h1>
                <p className="mb-4 flex items-center text-lg text-muted-foreground">
                  <MapPin className="mr-2 h-5 w-5" />
                  {property.cities?.name}, {property.cities?.state}
                </p>
                <p className="text-4xl font-bold text-primary">{formatPrice(property.price)}</p>
                <p className="text-sm text-muted-foreground">
                  {property.finalidade === "buy" ? "Venda" : "Aluguel"}
                </p>
              </div>

              {/* Features */}
              <Card className="p-6">
                <h2 className="mb-4 text-xl font-semibold">Características</h2>
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                  {property.bedrooms && (
                    <div className="flex items-center space-x-2">
                      <Bed className="h-5 w-5 text-muted-foreground" />
                      <span>{property.bedrooms} quartos</span>
                    </div>
                  )}
                  {property.bathrooms && (
                    <div className="flex items-center space-x-2">
                      <Bath className="h-5 w-5 text-muted-foreground" />
                      <span>{property.bathrooms} banheiros</span>
                    </div>
                  )}
                  {property.parking_spaces && (
                    <div className="flex items-center space-x-2">
                      <Car className="h-5 w-5 text-muted-foreground" />
                      <span>{property.parking_spaces} vagas</span>
                    </div>
                  )}
                  {property.area && (
                    <div className="flex items-center space-x-2">
                      <Ruler className="h-5 w-5 text-muted-foreground" />
                      <span>{property.area}m²</span>
                    </div>
                  )}
                </div>
              </Card>

              {/* Description */}
              {property.description && (
                <Card className="p-6">
                  <h2 className="mb-4 text-xl font-semibold">Descrição</h2>
                  <p className="whitespace-pre-line text-muted-foreground">{property.description}</p>
                </Card>
              )}
            </div>
          </div>

          {/* Sidebar - Contact */}
          <div className="lg:col-span-1">
            <Card className="sticky top-20 p-6">
              <h2 className="mb-4 text-xl font-semibold">Interessado?</h2>
              {property.is_owner_direct && !property.verified && (
                <div className="mb-4 flex items-start gap-2 rounded-md border border-yellow-500 bg-yellow-50 p-3 dark:bg-yellow-950/20">
                  <AlertTriangle className="h-5 w-5 shrink-0 text-yellow-600 dark:text-yellow-500" />
                  <div>
                    <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                      Anúncio de Proprietário
                    </p>
                    <p className="text-xs text-yellow-700 dark:text-yellow-300">
                      Verifique a documentação pessoalmente
                    </p>
                  </div>
                </div>
              )}
              <p className="mb-6 text-sm text-muted-foreground">
                Entre em contato para saber mais sobre este imóvel
              </p>
              <ContactDialog 
                propertyId={property.id} 
                propertyAddress={property.address}
              />
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default PropertyDetails;
