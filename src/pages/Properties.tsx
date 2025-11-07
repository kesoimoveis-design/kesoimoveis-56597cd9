import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SearchBar from "@/components/SearchBar";
import PropertyCard from "@/components/PropertyCard";
import { Skeleton } from "@/components/ui/skeleton";

const Properties = () => {
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    fetchProperties();
  }, [searchParams]);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from("properties")
        .select(`
          *,
          cities (name, state),
          property_photos (url, is_main)
        `)
        .eq("status", "active");

      // Apply filters from search params
      const codigo = searchParams.get("codigo");
      const location = searchParams.get("location");
      const finalidade = searchParams.get("finalidade");
      const tipo = searchParams.get("tipo");

      if (codigo) {
        query = query.ilike("property_code", `%${codigo}%`);
      }

      if (location) {
        query = query.or(`address.ilike.%${location}%,cities.name.ilike.%${location}%`);
      }

      if (finalidade) {
        query = query.eq("finalidade", finalidade === "venda" ? "buy" : "rent");
      }

      if (tipo) {
        // Search by property type slug
        const { data: typeData } = await supabase
          .from("property_types")
          .select("id")
          .eq("slug", tipo)
          .single();
        
        if (typeData) {
          query = query.eq("type_id", typeData.id);
        }
      }

      query = query.order("created_at", { ascending: false });

      const { data, error } = await query;

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
        neighborhood: property.neighborhood,
        fullAddress: property.address,
      }));

      setProperties(formattedProperties || []);
    } catch (error) {
      console.error("Error fetching properties:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <section className="bg-gradient-hero py-12 text-white">
        <div className="container">
          <h1 className="mb-6 text-center text-4xl font-bold">Encontre seu Imóvel</h1>
          <SearchBar />
        </div>
      </section>

      <section className="py-12">
        <div className="container">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold">
              {loading ? "Carregando..." : `${properties.length} imóveis encontrados`}
            </h2>
          </div>

          {loading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="space-y-4">
                  <Skeleton className="h-64 w-full" />
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))}
            </div>
          ) : properties.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {properties.map((property) => (
                <PropertyCard key={property.id} {...property} />
              ))}
            </div>
          ) : (
            <div className="py-20 text-center">
              <p className="text-lg text-muted-foreground">
                Nenhum imóvel encontrado. Tente ajustar os filtros de busca.
              </p>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Properties;
