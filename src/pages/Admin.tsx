import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Home, Users, MessageSquare, MapPin, CheckCircle, XCircle, Star, Building } from "lucide-react";
import { CityManagement } from "@/components/admin/CityManagement";
import { PropertyTypeManagement } from "@/components/admin/PropertyTypeManagement";

export default function Admin() {
  const { toast } = useToast();
  const [properties, setProperties] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [leads, setLeads] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalProperties: 0,
    activeProperties: 0,
    pendingProperties: 0,
    totalUsers: 0,
    totalLeads: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch properties
      const { data: propertiesData } = await supabase
        .from("properties")
        .select(`
          *,
          cities (name, state),
          property_photos (url, is_main),
          profiles (name, email)
        `)
        .order("created_at", { ascending: false });

      setProperties(propertiesData || []);

      // Fetch users
      const { data: usersData } = await supabase
        .from("profiles")
        .select("*, user_roles (role)")
        .order("created_at", { ascending: false });

      setUsers(usersData || []);

      // Fetch leads
      const { data: leadsData } = await supabase
        .from("leads")
        .select(`
          *,
          properties (address, cities (name))
        `)
        .order("created_at", { ascending: false });

      setLeads(leadsData || []);

      // Fetch cities
      const { data: citiesData } = await supabase
        .from("cities")
        .select("*")
        .order("name");

      setCities(citiesData || []);

      // Calculate stats
      setStats({
        totalProperties: propertiesData?.length || 0,
        activeProperties: propertiesData?.filter((p) => p.status === "active").length || 0,
        pendingProperties: propertiesData?.filter((p) => p.status === "pending").length || 0,
        totalUsers: usersData?.length || 0,
        totalLeads: leadsData?.length || 0,
      });
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

  const updatePropertyStatus = async (id: string, status: "active" | "pending" | "expired" | "paused") => {
    try {
      const { error } = await supabase
        .from("properties")
        .update({ status })
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Status atualizado",
        description: `Imóvel marcado como ${status}.`,
      });

      fetchData();
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const togglePropertyFeature = async (id: string, currentValue: boolean, field: string) => {
    try {
      // Check featured limit when trying to feature a property
      if (field === "featured" && !currentValue) {
        const { count } = await supabase
          .from("properties")
          .select("*", { count: "exact", head: true })
          .eq("featured", true);

        if (count && count >= 6) {
          toast({
            title: "Limite atingido",
            description: "Você já tem 6 imóveis em destaque. Remova um antes de adicionar outro.",
            variant: "destructive",
          });
          return;
        }
      }

      const { error } = await supabase
        .from("properties")
        .update({ [field]: !currentValue })
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Atualizado com sucesso",
        description: field === "featured" 
          ? (currentValue ? "Imóvel removido dos destaques" : "Imóvel adicionado aos destaques") 
          : undefined,
      });

      fetchData();
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar",
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
        <h1 className="text-3xl font-bold mb-6">Painel Admin</h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Imóveis</CardTitle>
              <Home className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalProperties}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Ativos</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeProperties}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
              <XCircle className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingProperties}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Usuários</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Leads</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalLeads}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="properties" className="space-y-6">
          <TabsList>
            <TabsTrigger value="properties">Imóveis</TabsTrigger>
            <TabsTrigger value="users">Usuários</TabsTrigger>
            <TabsTrigger value="leads">Leads</TabsTrigger>
            <TabsTrigger value="cities">Cidades</TabsTrigger>
            <TabsTrigger value="types">Tipos</TabsTrigger>
          </TabsList>

          <TabsContent value="properties">
            <Card>
              <CardHeader>
                <CardTitle>Gerenciar Imóveis</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Código</TableHead>
                      <TableHead>Imóvel</TableHead>
                      <TableHead>Proprietário</TableHead>
                      <TableHead>Preço</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {properties.map((property) => (
                      <TableRow key={property.id}>
                        <TableCell>
                          <Badge variant="outline" className="font-mono text-xs">
                            {property.property_code || "-"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <img
                              src={
                                property.property_photos?.find((p: any) => p.is_main)?.url ||
                                "/placeholder.svg"
                              }
                              alt={property.address}
                              className="w-12 h-12 object-cover rounded"
                            />
                            <div>
                              <p className="font-medium">{property.address}</p>
                              <p className="text-xs text-muted-foreground">
                                {property.cities?.name}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <p className="text-sm">{property.profiles?.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {property.profiles?.email}
                          </p>
                        </TableCell>
                        <TableCell>{formatPrice(property.price)}</TableCell>
                        <TableCell>
                          <Select
                            value={property.status}
                            onValueChange={(value: "active" | "pending" | "expired" | "paused") =>
                              updatePropertyStatus(property.id, value)
                            }
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="active">Ativo</SelectItem>
                              <SelectItem value="pending">Pendente</SelectItem>
                              <SelectItem value="expired">Expirado</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant={property.verified ? "default" : "outline"}
                              onClick={() =>
                                togglePropertyFeature(
                                  property.id,
                                  property.verified,
                                  "verified"
                                )
                              }
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant={property.featured ? "default" : "outline"}
                              onClick={() =>
                                togglePropertyFeature(
                                  property.id,
                                  property.featured,
                                  "featured"
                                )
                              }
                            >
                              <Star className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>Usuários do Sistema</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Telefone</TableHead>
                      <TableHead>Roles</TableHead>
                      <TableHead>Data Cadastro</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{user.phone || "-"}</TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            {user.user_roles?.map((ur: any, idx: number) => (
                              <Badge key={idx} variant="secondary">
                                {ur.role}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          {new Date(user.created_at).toLocaleDateString("pt-BR")}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="leads">
            <Card>
              <CardHeader>
                <CardTitle>Todos os Leads</CardTitle>
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
                          {new Date(lead.created_at).toLocaleDateString("pt-BR")}
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
          </TabsContent>

          <TabsContent value="cities">
            <Card>
              <CardContent className="pt-6">
                <CityManagement />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="types">
            <Card>
              <CardContent className="pt-6">
                <PropertyTypeManagement />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
}
