import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Bed, Bath, Car, Maximize } from "lucide-react";
import Autoplay from "embla-carousel-autoplay";

interface CarouselProperty {
  id: string;
  property_code: string;
  address: string;
  price: number;
  bedrooms: number | null;
  bathrooms: number | null;
  parking_spaces: number | null;
  area: number | null;
  finalidade: string;
  verified: boolean;
  featured: boolean;
  is_owner_direct: boolean;
  property_photos: { url: string; is_main: boolean }[];
  cities: { name: string; state: string };
}

export default function HomeCarousel() {
  const [properties, setProperties] = useState<CarouselProperty[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCarouselProperties();
  }, []);

  const fetchCarouselProperties = async () => {
    try {
      const { data, error } = await supabase
        .from("properties")
        .select(`
          *,
          cities (name, state),
          property_photos (url, is_main)
        `)
        .eq("status", "active")
        .eq("show_in_carousel", true)
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) throw error;
      setProperties(data || []);
    } catch (error) {
      console.error("Error fetching carousel properties:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  if (loading || properties.length === 0) {
    return null;
  }

  return (
    <div className="w-full">
      <Carousel
        opts={{
          align: "start",
          loop: true,
        }}
        plugins={[
          Autoplay({
            delay: 5000,
          }),
        ]}
        className="w-full"
      >
        <CarouselContent>
          {properties.map((property) => {
            const mainImage = property.property_photos?.find((p) => p.is_main)?.url ||
              property.property_photos?.[0]?.url ||
              "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200";

            return (
              <CarouselItem key={property.id}>
                <Link to={`/imovel/${property.id}`}>
                  <Card className="border-0 rounded-none overflow-hidden">
                    <div className="relative h-[500px] md:h-[600px]">
                      {/* Image */}
                      <img
                        src={mainImage}
                        alt={property.address}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                      
                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                      
                      {/* Badges */}
                      <div className="absolute top-6 left-6 flex flex-wrap gap-2">
                        {property.featured && (
                          <Badge className="bg-yellow-500 text-yellow-950 hover:bg-yellow-600">
                            Destaque
                          </Badge>
                        )}
                        {property.verified && (
                          <Badge className="bg-green-500 text-green-950 hover:bg-green-600">
                            Verificado KÈSO
                          </Badge>
                        )}
                        {property.is_owner_direct && (
                          <Badge className="bg-blue-500 text-blue-950 hover:bg-blue-600">
                            Proprietário Direto
                          </Badge>
                        )}
                      </div>

                      {/* Property Info */}
                      <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                        <div className="max-w-7xl mx-auto">
                          <Badge variant="secondary" className="mb-4 font-mono">
                            {property.property_code}
                          </Badge>
                          
                          <div className="flex items-start gap-2 mb-3">
                            <MapPin className="h-5 w-5 mt-1 flex-shrink-0" />
                            <p className="text-lg font-medium">
                              {property.cities?.name}, {property.cities?.state}
                            </p>
                          </div>

                          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4">
                            {property.address}
                          </h2>

                          <div className="flex flex-wrap items-center gap-6 mb-4">
                            {property.bedrooms && (
                              <div className="flex items-center gap-2">
                                <Bed className="h-5 w-5" />
                                <span className="font-medium">{property.bedrooms} {property.bedrooms === 1 ? 'quarto' : 'quartos'}</span>
                              </div>
                            )}
                            {property.bathrooms && (
                              <div className="flex items-center gap-2">
                                <Bath className="h-5 w-5" />
                                <span className="font-medium">{property.bathrooms} {property.bathrooms === 1 ? 'banheiro' : 'banheiros'}</span>
                              </div>
                            )}
                            {property.parking_spaces && (
                              <div className="flex items-center gap-2">
                                <Car className="h-5 w-5" />
                                <span className="font-medium">{property.parking_spaces} {property.parking_spaces === 1 ? 'vaga' : 'vagas'}</span>
                              </div>
                            )}
                            {property.area && (
                              <div className="flex items-center gap-2">
                                <Maximize className="h-5 w-5" />
                                <span className="font-medium">{property.area}m²</span>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-3">
                            <Badge variant="outline" className="border-white text-white text-lg px-4 py-2">
                              {property.finalidade === 'rent' ? 'Aluguel' : 'Venda'}
                            </Badge>
                            <p className="text-3xl md:text-4xl font-bold">
                              {formatPrice(property.price)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                </Link>
              </CarouselItem>
            );
          })}
        </CarouselContent>
        <CarouselPrevious className="left-4" />
        <CarouselNext className="right-4" />
      </Carousel>
    </div>
  );
}
