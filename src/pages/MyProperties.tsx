import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Eye, Edit, Trash2, Clock, MessageSquare } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function MyProperties() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [properties, setProperties] = useState<any[]>([]);
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      try {
        // Fetch properties
        const { data: propertiesData, error: propertiesError } = await supabase
          .from("properties")
          .select(`
            *,
            cities (name, state),
            property_photos (url, is_main)
          `)
          .eq("owner_id", user.id)
          .order("created_at", { ascending: false });

        if (propertiesError) throw propertiesError;
        setProperties(propertiesData || []);

        // Fetch leads
        const { data: leadsData, error: leadsError } = await supabase
          .from("leads")
          .select(`
            *,
            properties (address, cities (name))
          `)
          .in(
            "property_id",
            (propertiesData || []).map((p) => p.id)
          )
          .order("created_at", { ascending: false });

        if (leadsError) throw leadsError;
        setLeads(leadsData || []);
      } catch (error: any) {
        toast({
          title: "Erro ao carregar dados",
          description: error.message,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, toast]);

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja deletar este imóvel?")) return;

    try {
      const { error } = await supabase.from("properties").delete().eq("id", id);
      if (error) throw error;

      setProperties((prev) => prev.filter((p) => p.id !== id));
      toast({
        title: "Imóvel deletado",
        description: "O imóvel foi removido com sucesso.",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao deletar",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleRenew = async (id: string) => {
    try {
      const { error } = await supabase
        .from("properties")
        .update({
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          status: "pending",
        })
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Anúncio renovado",
        description: "Seu anúncio foi renovado por mais 30 dias.",
      });

      setProperties((prev) =>
        prev.map((p) =>
          p.id === id
            ? {
                ...p,
                expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                status: "pending",
              }
            : p
        )
      );
    } catch (error: any) {
      toast({
        title: "Erro ao renovar",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      active: "default",
      pending: "secondary",
      expired: "destructive",
    };
    const labels: Record<string, string> = {
      active: "Ativo",
      pending: "Pendente",
      expired: "Expirado",
    };
    return <Badge variant={variants[status]}>{labels[status]}</Badge>;
  };

  const getDaysRemaining = (expiresAt: string | null) => {
    if (!expiresAt) return null;
    const days = Math.ceil((new Date(expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return days;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Meus Imóveis</h1>
          <Button asChild>
            <Link to="/anunciar">Adicionar Imóvel</Link>
          </Button>
        </div>

        <Tabs defaultValue="properties" className="space-y-6">
          <TabsList>
            <TabsTrigger value="properties">
              Imóveis ({properties.length})
            </TabsTrigger>
            <TabsTrigger value="leads">
              Contatos ({leads.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="properties" className="space-y-4">
            {properties.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground mb-4">
                    Você ainda não possui imóveis cadastrados.
                  </p>
                  <Button asChild>
                    <Link to="/anunciar">Cadastrar Primeiro Imóvel</Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {properties.map((property) => {
                  const mainPhoto = property.property_photos?.find((p: any) => p.is_main);
                  const daysRemaining = getDaysRemaining(property.expires_at);

                  return (
                    <Card key={property.id}>
                      <CardContent className="p-6">
                         <div className="flex gap-4">
                          <img
                            src={mainPhoto?.url || "/placeholder.svg"}
                            alt={property.address}
                            className="w-32 h-32 object-cover rounded"
                          />
                          <div className="flex-1">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                {property.property_code && (
                                  <Badge variant="outline" className="font-mono text-xs mb-1">
                                    {property.property_code}
                                  </Badge>
                                )}
                                <h3 className="text-xl font-semibold">{property.address}</h3>
                                <p className="text-sm text-muted-foreground">
                                  {property.cities?.name} - {property.cities?.state}
                                </p>
                              </div>
                              {getStatusBadge(property.status)}
                            </div>
                            <p className="text-2xl font-bold text-primary mb-2">
                              {formatPrice(property.price)}
                            </p>
                            <div className="flex gap-4 text-sm text-muted-foreground mb-4">
                              {property.bedrooms && <span>{property.bedrooms} quartos</span>}
                              {property.bathrooms && <span>{property.bathrooms} banheiros</span>}
                              {property.area && <span>{property.area}m²</span>}
                            </div>
                            {property.is_owner_direct && daysRemaining !== null && (
                              <div className="flex items-center gap-2 text-sm mb-4">
                                <Clock className="h-4 w-4" />
                                <span>
                                  {daysRemaining > 0
                                    ? `Expira em ${daysRemaining} dias`
                                    : "Expirado"}
                                </span>
                              </div>
                            )}
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline" asChild>
                                <Link to={`/imovel/${property.id}`}>
                                  <Eye className="h-4 w-4 mr-2" />
                                  Ver
                                </Link>
                              </Button>
                              {property.status === "expired" && property.is_owner_direct && (
                                <Button
                                  size="sm"
                                  variant="default"
                                  onClick={() => handleRenew(property.id)}
                                >
                                  Renovar Anúncio
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDelete(property.id)}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Deletar
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="leads">
            {leads.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    Você ainda não recebeu nenhum contato.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Contatos Recebidos</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Data</TableHead>
                        <TableHead>Imóvel</TableHead>
                        <TableHead>Nome</TableHead>
                        <TableHead>Telefone</TableHead>
                        <TableHead>Mensagem</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {leads.map((lead) => (
                        <TableRow key={lead.id}>
                          <TableCell>
                            {formatDistanceToNow(new Date(lead.created_at), {
                              addSuffix: true,
                              locale: ptBR,
                            })}
                          </TableCell>
                          <TableCell>
                            {lead.properties?.address}
                            <br />
                            <span className="text-xs text-muted-foreground">
                              {lead.properties?.cities?.name}
                            </span>
                          </TableCell>
                          <TableCell>{lead.name}</TableCell>
                          <TableCell>{lead.phone}</TableCell>
                          <TableCell className="max-w-xs truncate">
                            {lead.message || "-"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
}
