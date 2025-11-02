import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Bed, Bath, Car, Maximize, MapPin, AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";

interface PropertyCardProps {
  id: string;
  image: string;
  title: string;
  price: number;
  location: string;
  bedrooms: number;
  bathrooms: number;
  parking: number;
  area: number;
  verified?: boolean;
  ownerDirect?: boolean;
  featured?: boolean;
  propertyCode?: string;
}

const PropertyCard = ({
  id,
  image,
  title,
  price,
  location,
  bedrooms,
  bathrooms,
  parking,
  area,
  verified = false,
  ownerDirect = false,
  featured = false,
  propertyCode,
}: PropertyCardProps) => {
  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <Card className="group overflow-hidden transition-all hover:shadow-large">
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={image}
          alt={title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute left-3 top-3 flex flex-col gap-2">
          {featured && (
            <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0">
              ⭐ Destaque
            </Badge>
          )}
          {verified ? (
            <Badge className="bg-primary text-primary-foreground">Verificado</Badge>
          ) : ownerDirect ? (
            <Badge variant="outline" className="border-yellow-500 bg-yellow-50 text-yellow-700 dark:bg-yellow-950/20 dark:text-yellow-500">
              <AlertTriangle className="mr-1 h-3 w-3" />
              Proprietário
            </Badge>
          ) : null}
        </div>
      </div>

      <CardContent className="p-4">
        {/* Property Code */}
        {propertyCode && (
          <div className="mb-2">
            <Badge variant="outline" className="font-mono text-xs">
              {propertyCode}
            </Badge>
          </div>
        )}
        
        {/* Location */}
        <div className="mb-2 flex items-center text-sm text-muted-foreground">
          <MapPin className="mr-1 h-4 w-4" />
          <span>{location}</span>
        </div>

        {/* Title */}
        <h3 className="mb-3 line-clamp-2 text-lg font-semibold">{title}</h3>

        {/* Price */}
        <p className="mb-4 text-2xl font-bold text-primary">{formatPrice(price)}</p>

        {/* Features */}
        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
          <div className="flex items-center">
            <Bed className="mr-1 h-4 w-4" />
            <span>{bedrooms}</span>
          </div>
          <div className="flex items-center">
            <Bath className="mr-1 h-4 w-4" />
            <span>{bathrooms}</span>
          </div>
          <div className="flex items-center">
            <Car className="mr-1 h-4 w-4" />
            <span>{parking}</span>
          </div>
          <div className="flex items-center">
            <Maximize className="mr-1 h-4 w-4" />
            <span>{area}m²</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Button className="w-full" asChild>
          <Link to={`/imovel/${id}`}>Ver Detalhes</Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PropertyCard;
