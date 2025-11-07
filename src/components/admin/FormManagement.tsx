import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, FileText, Eye, Download } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AuthorizationForm } from "@/components/forms/AuthorizationForm";
import { CaptacaoForm } from "@/components/forms/CaptacaoForm";
import { PropertySelector } from "@/components/admin/PropertySelector";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function FormManagement() {
  const { toast } = useToast();
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchCode, setSearchCode] = useState("");
  const [selectedProperty, setSelectedProperty] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedFormType, setSelectedFormType] = useState<string>("captacao");

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      const { data, error } = await supabase
        .from("form_submissions")
        .select(`
          *,
          properties (
            id,
            property_code,
            address,
            cities (name, state)
          ),
          form_templates (name)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setSubmissions(data || []);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar formulários",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredSubmissions = submissions.filter((sub) =>
    searchCode === "" || sub.property_code.toLowerCase().includes(searchCode.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      signed: "default",
      pending: "secondary",
      completed: "default",
    };
    const labels: Record<string, string> = {
      signed: "Assinado",
      pending: "Pendente",
      completed: "Completo",
    };
    return <Badge variant={variants[status] || "secondary"}>{labels[status] || status}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Formulários</h2>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <FileText className="h-4 w-4 mr-2" />
              Novo Formulário
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {!showForm ? "Novo Formulário" : selectedFormType === "captacao" ? "Captação de Imóvel" : "Autorização de Comercialização"}
              </DialogTitle>
            </DialogHeader>
            
            {!showForm ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Tipo de Formulário</Label>
                  <Select value={selectedFormType} onValueChange={setSelectedFormType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="captacao">Captação de Imóvel</SelectItem>
                      <SelectItem value="autorizacao">Autorização de Comercialização</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {selectedFormType === "captacao" ? (
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      O formulário de captação cria um novo imóvel com código automático e status aguardando aprovação.
                    </p>
                    <Button onClick={() => setShowForm(true)} className="w-full">
                      Iniciar Captação
                    </Button>
                  </div>
                ) : (
                  <PropertySelector
                    onSelect={(property) => {
                      setSelectedProperty(property);
                      setShowForm(true);
                    }}
                    allowNewProperty={false}
                  />
                )}
              </div>
            ) : selectedFormType === "captacao" ? (
              <CaptacaoForm
                onSuccess={(propertyId, propertyCode) => {
                  fetchSubmissions();
                  setSelectedProperty(null);
                  setShowForm(false);
                  toast({
                    title: "Sucesso",
                    description: `Imóvel ${propertyCode} cadastrado e aguardando aprovação.`,
                  });
                }}
              />
            ) : selectedProperty ? (
              <AuthorizationForm
                propertyId={selectedProperty.id}
                propertyCode={selectedProperty.property_code}
                onSuccess={() => {
                  fetchSubmissions();
                  setSelectedProperty(null);
                  setShowForm(false);
                }}
              />
            ) : null}
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Buscar por Código do Imóvel</CardTitle>
          <CardDescription>
            Digite o código do imóvel para filtrar os formulários
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Digite o código do imóvel..."
                value={searchCode}
                onChange={(e) => setSearchCode(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Formulários Cadastrados</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            </div>
          ) : filteredSubmissions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum formulário encontrado</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Imóvel</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSubmissions.map((submission) => (
                  <TableRow key={submission.id}>
                    <TableCell>
                      <Badge variant="outline" className="font-mono">
                        {submission.property_code}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{submission.properties?.address}</p>
                        <p className="text-xs text-muted-foreground">
                          {submission.properties?.cities?.name} - {submission.properties?.cities?.state}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>{submission.form_templates?.name}</TableCell>
                    <TableCell>
                      <div>
                        <p>{submission.client_name}</p>
                        <p className="text-xs text-muted-foreground">{submission.client_email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {new Date(submission.created_at).toLocaleDateString("pt-BR")}
                    </TableCell>
                    <TableCell>{getStatusBadge(submission.status)}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4" />
                        </Button>
                        {submission.signature_url && (
                          <Button size="sm" variant="outline" asChild>
                            <a href={submission.signature_url} target="_blank" rel="noopener noreferrer">
                              <Download className="h-4 w-4" />
                            </a>
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}