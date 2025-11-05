import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { X, Upload, Star, Image as ImageIcon } from "lucide-react";

interface PhotoManagerProps {
  propertyId: string;
}

export function PhotoManager({ propertyId }: PhotoManagerProps) {
  const { toast } = useToast();
  const [photos, setPhotos] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPhotos();
  }, [propertyId]);

  const fetchPhotos = async () => {
    try {
      const { data, error } = await supabase
        .from("property_photos")
        .select("*")
        .eq("property_id", propertyId)
        .order("is_main", { ascending: false });

      if (error) throw error;
      setPhotos(data || []);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar fotos",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileExt = file.name.split(".").pop();
        const fileName = `${propertyId}/${Date.now()}_${i}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("property-photos")
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from("property-photos")
          .getPublicUrl(fileName);

        const { error: insertError } = await supabase
          .from("property_photos")
          .insert({
            property_id: propertyId,
            url: publicUrl,
            is_main: photos.length === 0 && i === 0,
          });

        if (insertError) throw insertError;
      }

      toast({
        title: "Fotos enviadas",
        description: "As fotos foram adicionadas com sucesso.",
      });

      fetchPhotos();
    } catch (error: any) {
      toast({
        title: "Erro ao enviar fotos",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleDelete = async (photoId: string, photoUrl: string) => {
    try {
      // Extract file path from URL
      const filePath = photoUrl.split("/property-photos/")[1];
      
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from("property-photos")
        .remove([filePath]);

      if (storageError) throw storageError;

      // Delete from database
      const { error: dbError } = await supabase
        .from("property_photos")
        .delete()
        .eq("id", photoId);

      if (dbError) throw dbError;

      toast({
        title: "Foto excluída",
        description: "A foto foi removida com sucesso.",
      });

      fetchPhotos();
    } catch (error: any) {
      toast({
        title: "Erro ao excluir foto",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleSetMain = async (photoId: string) => {
    try {
      // Unset all main photos
      await supabase
        .from("property_photos")
        .update({ is_main: false })
        .eq("property_id", propertyId);

      // Set new main photo
      const { error } = await supabase
        .from("property_photos")
        .update({ is_main: true })
        .eq("id", photoId);

      if (error) throw error;

      toast({
        title: "Foto principal definida",
        description: "A foto principal foi atualizada.",
      });

      fetchPhotos();
    } catch (error: any) {
      toast({
        title: "Erro ao definir foto principal",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleToggleCarousel = async (photoId: string, currentValue: boolean) => {
    try {
      // Get property data to update show_in_carousel
      const photo = photos.find(p => p.id === photoId);
      if (!photo || !photo.is_main) {
        toast({
          title: "Atenção",
          description: "Apenas a foto principal pode aparecer no carrossel.",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from("properties")
        .update({ show_in_carousel: !currentValue })
        .eq("id", propertyId);

      if (error) throw error;

      toast({
        title: "Carrossel atualizado",
        description: currentValue 
          ? "Foto removida do carrossel da home."
          : "Foto adicionada ao carrossel da home.",
      });

      fetchPhotos();
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar carrossel",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ImageIcon className="h-5 w-5" />
          Fotos do Imóvel
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="photo-upload">Adicionar Fotos</Label>
          <Input
            id="photo-upload"
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileUpload}
            disabled={uploading}
          />
          {uploading && (
            <p className="text-sm text-muted-foreground">Enviando fotos...</p>
          )}
        </div>

        {photos.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <ImageIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhuma foto cadastrada</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {photos.map((photo) => (
              <div key={photo.id} className="relative group">
                <img
                  src={photo.url}
                  alt="Foto do imóvel"
                  className="w-full h-40 object-cover rounded-lg"
                />
                
                {photo.is_main && (
                  <div className="absolute top-2 left-2">
                    <div className="bg-primary text-primary-foreground px-2 py-1 rounded text-xs flex items-center gap-1">
                      <Star className="h-3 w-3" />
                      Principal
                    </div>
                  </div>
                )}

                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex flex-col items-center justify-center gap-2 p-2">
                  {!photo.is_main && (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleSetMain(photo.id)}
                    >
                      <Star className="h-3 w-3 mr-1" />
                      Definir Principal
                    </Button>
                  )}
                  
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(photo.id, photo.url)}
                  >
                    <X className="h-3 w-3 mr-1" />
                    Excluir
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
