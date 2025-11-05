import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Plus } from "lucide-react";

interface PropertySelectorProps {
  onSelect: (property: any) => void;
  allowNewProperty?: boolean;
}

export function PropertySelector({ onSelect, allowNewProperty = false }: PropertySelectorProps) {
  const { toast } = useToast();
  const [properties, setProperties] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      const { data, error } = await supabase
        .from("properties")
        .select(`
          id,
          property_code,
          address,
          type,
          cities (name, state)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setProperties(data || []);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar imóveis",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredProperties = properties.filter((prop) =>
    prop.property_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    prop.address?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Card>
      <CardContent className="pt-6 space-y-4">
        <div className="space-y-2">
          <Label>Buscar Imóvel</Label>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Digite o código ou endereço..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Selecionar Imóvel</Label>
          {loading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
            </div>
          ) : filteredProperties.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Nenhum imóvel encontrado
            </p>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {filteredProperties.map((property) => (
                <Button
                  key={property.id}
                  variant="outline"
                  className="w-full justify-start text-left h-auto py-3"
                  onClick={() => onSelect(property)}
                >
                  <div className="flex-1">
                    <div className="font-mono text-xs text-primary mb-1">
                      {property.property_code}
                    </div>
                    <div className="font-medium">{property.address}</div>
                    <div className="text-xs text-muted-foreground">
                      {property.cities?.name} - {property.cities?.state}
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          )}
        </div>

        {allowNewProperty && (
          <Button variant="outline" className="w-full" onClick={() => onSelect({ isNew: true })}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Captação (Gerar Código Automático)
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
