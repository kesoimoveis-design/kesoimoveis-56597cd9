import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface City {
  id: string;
  name: string;
  state: string;
  slug: string;
  description?: string;
}

export function CityManagement() {
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCity, setEditingCity] = useState<City | null>(null);
  const [formData, setFormData] = useState({ name: "", state: "", slug: "", description: "" });
  const { toast } = useToast();

  useEffect(() => {
    fetchCities();
  }, []);

  const fetchCities = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("cities")
      .select("*")
      .order("name");
    
    if (error) {
      toast({ title: "Erro ao carregar cidades", description: error.message, variant: "destructive" });
    } else {
      setCities(data || []);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const cityData = {
      name: formData.name,
      state: formData.state,
      slug: formData.slug || formData.name.toLowerCase().replace(/\s+/g, "-"),
      description: formData.description,
    };

    if (editingCity) {
      const { error } = await supabase
        .from("cities")
        .update(cityData)
        .eq("id", editingCity.id);

      if (error) {
        toast({ title: "Erro ao atualizar cidade", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Cidade atualizada!" });
        setDialogOpen(false);
        fetchCities();
        resetForm();
      }
    } else {
      const { error } = await supabase.from("cities").insert([cityData]);

      if (error) {
        toast({ title: "Erro ao criar cidade", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Cidade criada!" });
        setDialogOpen(false);
        fetchCities();
        resetForm();
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta cidade?")) return;

    const { error } = await supabase.from("cities").delete().eq("id", id);

    if (error) {
      toast({ 
        title: "Erro ao excluir cidade", 
        description: "Esta cidade possui imóveis cadastrados e não pode ser excluída.", 
        variant: "destructive" 
      });
    } else {
      toast({ title: "Cidade excluída!" });
      fetchCities();
    }
  };

  const openEditDialog = (city: City) => {
    setEditingCity(city);
    setFormData({
      name: city.name,
      state: city.state,
      slug: city.slug,
      description: city.description || "",
    });
    setDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({ name: "", state: "", slug: "", description: "" });
    setEditingCity(null);
  };

  if (loading) {
    return <div className="text-center py-8">Carregando cidades...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gestão de Cidades</h2>
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nova Cidade
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingCity ? "Editar Cidade" : "Nova Cidade"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Nome *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label>Estado (UF) *</Label>
                <Input
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value.toUpperCase() })}
                  maxLength={2}
                  required
                />
              </div>
              <div>
                <Label>Slug (URL)</Label>
                <Input
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="nome-da-cidade"
                />
              </div>
              <div>
                <Label>Descrição</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>
              <Button type="submit" className="w-full">
                {editingCity ? "Atualizar" : "Criar"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Cidade</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Slug</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {cities.map((city) => (
            <TableRow key={city.id}>
              <TableCell className="font-medium">{city.name}</TableCell>
              <TableCell>{city.state}</TableCell>
              <TableCell className="text-muted-foreground">{city.slug}</TableCell>
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => openEditDialog(city)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(city.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
