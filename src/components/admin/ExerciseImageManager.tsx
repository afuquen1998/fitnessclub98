import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, Upload, Trash2, Image, Search, Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { BulkImageUpload } from "./BulkImageUpload";

interface ExerciseImage {
  id: string;
  exercise_name: string;
  exercise_name_normalized: string;
  image_url: string;
  muscle_group: string | null;
  equipment: string | null;
  created_at: string;
}

const MUSCLE_GROUPS = [
  { value: "pecho", label: "Pecho" },
  { value: "espalda", label: "Espalda" },
  { value: "hombros", label: "Hombros" },
  { value: "biceps", label: "Bíceps" },
  { value: "triceps", label: "Tríceps" },
  { value: "piernas", label: "Piernas" },
  { value: "gluteos", label: "Glúteos" },
  { value: "core", label: "Core / Abdominales" },
  { value: "cardio", label: "Cardio" },
];

const EQUIPMENT_TYPES = [
  { value: "maquina", label: "Máquina" },
  { value: "mancuernas", label: "Mancuernas" },
  { value: "barra", label: "Barra" },
  { value: "cable", label: "Cable / Polea" },
  { value: "peso_corporal", label: "Peso Corporal" },
  { value: "cardio", label: "Cardio" },
];

function normalizeExerciseName(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove accents
    .replace(/[^a-z0-9\s]/g, "") // Remove special chars
    .replace(/\s+/g, "_") // Replace spaces with underscores
    .trim();
}

export function ExerciseImageManager() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterMuscle, setFilterMuscle] = useState<string>("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  // Form state
  const [exerciseName, setExerciseName] = useState("");
  const [muscleGroup, setMuscleGroup] = useState("");
  const [equipment, setEquipment] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Fetch exercise images
  const { data: exerciseImages, isLoading } = useQuery({
    queryKey: ["exercise-images"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("exercise_images")
        .select("*")
        .order("muscle_group", { ascending: true })
        .order("exercise_name", { ascending: true });

      if (error) throw error;
      return data as ExerciseImage[];
    },
  });

  // Upload mutation
  const uploadMutation = useMutation({
    mutationFn: async () => {
      if (!selectedFile || !exerciseName) {
        throw new Error("Nombre de ejercicio y archivo son requeridos");
      }

      setIsUploading(true);
      const normalized = normalizeExerciseName(exerciseName);
      const fileExt = selectedFile.name.split(".").pop();
      const fileName = `${normalized}_${Date.now()}.${fileExt}`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from("exercise-images")
        .upload(fileName, selectedFile, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("exercise-images")
        .getPublicUrl(fileName);

      // Insert into database
      const { error: dbError } = await supabase.from("exercise_images").insert({
        exercise_name: exerciseName,
        exercise_name_normalized: normalized,
        image_url: urlData.publicUrl,
        muscle_group: muscleGroup || null,
        equipment: equipment || null,
      });

      if (dbError) throw dbError;
    },
    onSuccess: () => {
      toast.success("Imagen de ejercicio añadida correctamente");
      queryClient.invalidateQueries({ queryKey: ["exercise-images"] });
      resetForm();
      setIsAddDialogOpen(false);
    },
    onError: (error) => {
      console.error("Upload error:", error);
      toast.error("Error al subir la imagen: " + (error as Error).message);
    },
    onSettled: () => {
      setIsUploading(false);
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (image: ExerciseImage) => {
      // Extract filename from URL
      const urlParts = image.image_url.split("/");
      const fileName = urlParts[urlParts.length - 1];

      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from("exercise-images")
        .remove([fileName]);

      if (storageError) {
        console.warn("Storage delete error:", storageError);
      }

      // Delete from database
      const { error: dbError } = await supabase
        .from("exercise_images")
        .delete()
        .eq("id", image.id);

      if (dbError) throw dbError;
    },
    onSuccess: () => {
      toast.success("Imagen eliminada correctamente");
      queryClient.invalidateQueries({ queryKey: ["exercise-images"] });
    },
    onError: (error) => {
      toast.error("Error al eliminar: " + (error as Error).message);
    },
  });

  const resetForm = () => {
    setExerciseName("");
    setMuscleGroup("");
    setEquipment("");
    setSelectedFile(null);
  };

  const filteredImages = exerciseImages?.filter((img) => {
    const matchesSearch = img.exercise_name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesMuscle =
      filterMuscle === "all" || img.muscle_group === filterMuscle;
    return matchesSearch && matchesMuscle;
  });

  const groupedImages = filteredImages?.reduce((acc, img) => {
    const group = img.muscle_group || "otros";
    if (!acc[group]) acc[group] = [];
    acc[group].push(img);
    return acc;
  }, {} as Record<string, ExerciseImage[]>);

  return (
    <Card className="bg-card border-border">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="font-display text-xl flex items-center gap-2">
          <Image className="h-5 w-5 text-primary" />
          Repositorio de Imágenes de Ejercicios
        </CardTitle>
        
        <div className="flex gap-2">
          <BulkImageUpload />
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Añadir Imagen
              </Button>
            </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Añadir Nueva Imagen de Ejercicio</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="exercise-name">Nombre del Ejercicio *</Label>
                <Input
                  id="exercise-name"
                  value={exerciseName}
                  onChange={(e) => setExerciseName(e.target.value)}
                  placeholder="Ej: Press de Banca Plano"
                  className="bg-background"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Grupo Muscular</Label>
                  <Select value={muscleGroup} onValueChange={setMuscleGroup}>
                    <SelectTrigger className="bg-background">
                      <SelectValue placeholder="Seleccionar..." />
                    </SelectTrigger>
                    <SelectContent>
                      {MUSCLE_GROUPS.map((mg) => (
                        <SelectItem key={mg.value} value={mg.value}>
                          {mg.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Equipamiento</Label>
                  <Select value={equipment} onValueChange={setEquipment}>
                    <SelectTrigger className="bg-background">
                      <SelectValue placeholder="Seleccionar..." />
                    </SelectTrigger>
                    <SelectContent>
                      {EQUIPMENT_TYPES.map((eq) => (
                        <SelectItem key={eq.value} value={eq.value}>
                          {eq.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="exercise-image">Imagen *</Label>
                <Input
                  id="exercise-image"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  className="bg-background"
                />
                {selectedFile && (
                  <p className="text-sm text-muted-foreground">
                    {selectedFile.name} ({Math.round(selectedFile.size / 1024)} KB)
                  </p>
                )}
              </div>

              <Button
                onClick={() => uploadMutation.mutate()}
                disabled={!exerciseName || !selectedFile || isUploading}
                className="w-full gap-2"
              >
                {isUploading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4" />
                )}
                Subir Imagen
              </Button>
            </div>
          </DialogContent>
          </Dialog>
        </div>
      </CardHeader>

      <CardContent>
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar ejercicio..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-background"
            />
          </div>
          <Select value={filterMuscle} onValueChange={setFilterMuscle}>
            <SelectTrigger className="w-full sm:w-48 bg-background">
              <SelectValue placeholder="Filtrar por músculo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los músculos</SelectItem>
              {MUSCLE_GROUPS.map((mg) => (
                <SelectItem key={mg.value} value={mg.value}>
                  {mg.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : !filteredImages?.length ? (
          <div className="text-center py-12 text-muted-foreground">
            <Image className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No hay imágenes de ejercicios en el repositorio.</p>
            <p className="text-sm">Añade imágenes para usarlas en los PDFs de rutinas.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(groupedImages || {}).map(([group, images]) => (
              <div key={group}>
                <h3 className="text-lg font-semibold mb-4 capitalize text-primary">
                  {MUSCLE_GROUPS.find((mg) => mg.value === group)?.label || group}
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {images.map((image) => (
                    <div
                      key={image.id}
                      className="group relative bg-muted rounded-lg overflow-hidden border border-border"
                    >
                      <img
                        src={image.image_url}
                        alt={image.exercise_name}
                        className="w-full h-32 object-cover"
                        loading="lazy"
                      />
                      <div className="p-2">
                        <p className="text-xs font-medium truncate">
                          {image.exercise_name}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {EQUIPMENT_TYPES.find((eq) => eq.value === image.equipment)?.label || image.equipment || "—"}
                        </p>
                      </div>
                      
                      {/* Delete overlay */}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => deleteMutation.mutate(image)}
                          disabled={deleteMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Stats */}
        <div className="mt-8 pt-6 border-t border-border">
          <p className="text-sm text-muted-foreground">
            Total: <span className="text-foreground font-medium">{exerciseImages?.length || 0}</span> imágenes en el repositorio
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
