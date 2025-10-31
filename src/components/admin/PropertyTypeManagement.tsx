import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Pencil, Power, PowerOff } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

interface PropertyType {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  active: boolean;
  display_order: number;
}

export function PropertyTypeManagement() {
  const [types, setTypes] = useState<PropertyType[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingType, setEditingType] = useState<PropertyType | null>(null);
  const [formData, setFormData] = useState({ 
    name: "", 
    slug: "", 
    description: "", 
    icon: "", 
    active: true, 
    display_order: 0 
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchTypes();
  }, []);

  const fetchTypes = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("property_types")
      .select("*")
      .order("display_order");
    
    if (error) {
      toast({ title: "Erro ao carregar tipos", description: error.message, variant: "destructive" });
    } else {
      setTypes(data || []);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const typeData = {
      name: formData.name,
      slug: formData.slug || formData.name.toLowerCase().replace(/\s+/g, "-"),
      description: formData.description,
      icon: formData.icon,
      active: formData.active,
      display_order: formData.display_order,
    };

    if (editingType) {
      const { error } = await supabase
        .from("property_types")
        .update(typeData)
        .eq("id", editingType.id);

      if (error) {
        toast({ title: "Erro ao atualizar tipo", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Tipo atualizado!" });
        setDialogOpen(false);
        fetchTypes();
        resetForm();
      }
    } else {
      const { error } = await supabase.from("property_types").insert([typeData]);

      if (error) {
        toast({ title: "Erro ao criar tipo", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Tipo criado!" });
        setDialogOpen(false);
        fetchTypes();
        resetForm();
      }
    }
  };

  const toggleActive = async (id: string, currentActive: boolean) => {
    const { error } = await supabase
      .from("property_types")
      .update({ active: !currentActive })
      .eq("id", id);

    if (error) {
      toast({ title: "Erro ao atualizar status", description: error.message, variant: "destructive" });
    } else {
      toast({ title: currentActive ? "Tipo desativado" : "Tipo ativado" });
      fetchTypes();
    }
  };

  const openEditDialog = (type: PropertyType) => {
    setEditingType(type);
    setFormData({
      name: type.name,
      slug: type.slug,
      description: type.description || "",
      icon: type.icon || "",
      active: type.active,
      display_order: type.display_order,
    });
    setDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({ name: "", slug: "", description: "", icon: "", active: true, display_order: 0 });
    setEditingType(null);
  };

  if (loading) {
    return <div className="text-center py-8">Carregando tipos...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gestão de Tipos de Imóveis</h2>
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Novo Tipo
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingType ? "Editar Tipo" : "Novo Tipo"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Nome *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Casa, Sobrado, Apartamento"
                  required
                />
              </div>
              <div>
                <Label>Slug (URL)</Label>
                <Input
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="nome-do-tipo"
                />
              </div>
              <div>
                <Label>Descrição</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={2}
                />
              </div>
              <div>
                <Label>Ordem de Exibição</Label>
                <Input
                  type="number"
                  value={formData.display_order}
                  onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) })}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label>Ativo</Label>
                <Switch
                  checked={formData.active}
                  onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
                />
              </div>
              <Button type="submit" className="w-full">
                {editingType ? "Atualizar" : "Criar"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Ordem</TableHead>
            <TableHead>Nome</TableHead>
            <TableHead>Slug</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {types.map((type) => (
            <TableRow key={type.id}>
              <TableCell className="font-medium">{type.display_order}</TableCell>
              <TableCell>{type.name}</TableCell>
              <TableCell className="text-muted-foreground">{type.slug}</TableCell>
              <TableCell>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                  type.active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                }`}>
                  {type.active ? "Ativo" : "Inativo"}
                </span>
              </TableCell>
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => openEditDialog(type)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => toggleActive(type.id, type.active)}
                >
                  {type.active ? <PowerOff className="h-4 w-4" /> : <Power className="h-4 w-4" />}
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
