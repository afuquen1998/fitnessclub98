import { useState, useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Loader2, Upload, Trash2, FolderUp, CheckCircle2, XCircle, Image as ImageIcon } from "lucide-react";

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

interface PendingImage {
  id: string;
  file: File;
  preview: string;
  exerciseName: string;
  muscleGroup: string;
  equipment: string;
  status: "pending" | "uploading" | "success" | "error";
  error?: string;
  selected: boolean;
}

function normalizeExerciseName(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, "_")
    .trim();
}

function parseFileName(fileName: string): { exerciseName: string; muscleGroup: string; equipment: string } {
  // Remove extension
  const nameWithoutExt = fileName.replace(/\.[^/.]+$/, "");
  
  // Replace underscores and hyphens with spaces
  const cleanName = nameWithoutExt.replace(/[_-]/g, " ").trim();
  
  // Try to detect muscle group and equipment from filename
  let detectedMuscle = "";
  let detectedEquipment = "";
  
  const lowerName = cleanName.toLowerCase();
  
  // Detect muscle group
  for (const mg of MUSCLE_GROUPS) {
    if (lowerName.includes(mg.value)) {
      detectedMuscle = mg.value;
      break;
    }
  }
  
  // Detect equipment
  for (const eq of EQUIPMENT_TYPES) {
    if (lowerName.includes(eq.value)) {
      detectedEquipment = eq.value;
      break;
    }
  }
  
  // Format exercise name (capitalize first letter of each word)
  const exerciseName = cleanName
    .split(" ")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
  
  return { exerciseName, muscleGroup: detectedMuscle, equipment: detectedEquipment };
}

export function BulkImageUpload() {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [pendingImages, setPendingImages] = useState<PendingImage[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [batchMuscle, setBatchMuscle] = useState("");
  const [batchEquipment, setBatchEquipment] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFileSelect = useCallback((files: FileList | null) => {
    if (!files) return;
    
    const newImages: PendingImage[] = Array.from(files)
      .filter(file => file.type.startsWith("image/"))
      .slice(0, 50) // Limit to 50 images
      .map(file => {
        const parsed = parseFileName(file.name);
        return {
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          file,
          preview: URL.createObjectURL(file),
          exerciseName: parsed.exerciseName,
          muscleGroup: parsed.muscleGroup,
          equipment: parsed.equipment,
          status: "pending" as const,
          selected: true,
        };
      });
    
    setPendingImages(prev => [...prev, ...newImages].slice(0, 50));
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const updateImage = (id: string, updates: Partial<PendingImage>) => {
    setPendingImages(prev => prev.map(img => 
      img.id === id ? { ...img, ...updates } : img
    ));
  };

  const removeImage = (id: string) => {
    setPendingImages(prev => {
      const img = prev.find(i => i.id === id);
      if (img) URL.revokeObjectURL(img.preview);
      return prev.filter(i => i.id !== id);
    });
  };

  const toggleSelectAll = (checked: boolean) => {
    setPendingImages(prev => prev.map(img => ({ ...img, selected: checked })));
  };

  const applyBatchMuscle = () => {
    if (!batchMuscle) return;
    setPendingImages(prev => prev.map(img => 
      img.selected ? { ...img, muscleGroup: batchMuscle } : img
    ));
    toast.success(`Grupo muscular aplicado a ${pendingImages.filter(i => i.selected).length} imágenes`);
  };

  const applyBatchEquipment = () => {
    if (!batchEquipment) return;
    setPendingImages(prev => prev.map(img => 
      img.selected ? { ...img, equipment: batchEquipment } : img
    ));
    toast.success(`Equipamiento aplicado a ${pendingImages.filter(i => i.selected).length} imágenes`);
  };

  const uploadAllImages = async () => {
    const imagesToUpload = pendingImages.filter(img => img.selected && img.status === "pending");
    if (imagesToUpload.length === 0) {
      toast.error("No hay imágenes seleccionadas para subir");
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < imagesToUpload.length; i++) {
      const img = imagesToUpload[i];
      
      updateImage(img.id, { status: "uploading" });

      try {
        if (!img.exerciseName.trim()) {
          throw new Error("Nombre de ejercicio requerido");
        }

        const normalized = normalizeExerciseName(img.exerciseName);
        const fileExt = img.file.name.split(".").pop();
        const fileName = `${normalized}_${Date.now()}.${fileExt}`;

        // Upload to storage
        const { error: uploadError } = await supabase.storage
          .from("exercise-images")
          .upload(fileName, img.file, {
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
          exercise_name: img.exerciseName.trim(),
          exercise_name_normalized: normalized,
          image_url: urlData.publicUrl,
          muscle_group: img.muscleGroup || null,
          equipment: img.equipment || null,
        });

        if (dbError) throw dbError;

        updateImage(img.id, { status: "success" });
        successCount++;
      } catch (error) {
        updateImage(img.id, { 
          status: "error", 
          error: (error as Error).message 
        });
        errorCount++;
      }

      setUploadProgress(((i + 1) / imagesToUpload.length) * 100);
    }

    setIsUploading(false);
    queryClient.invalidateQueries({ queryKey: ["exercise-images"] });
    
    if (successCount > 0) {
      toast.success(`${successCount} imágenes subidas correctamente`);
    }
    if (errorCount > 0) {
      toast.error(`${errorCount} imágenes fallaron`);
    }
  };

  const clearAll = () => {
    pendingImages.forEach(img => URL.revokeObjectURL(img.preview));
    setPendingImages([]);
    setUploadProgress(0);
  };

  const handleClose = () => {
    if (!isUploading) {
      clearAll();
      setIsOpen(false);
    }
  };

  const selectedCount = pendingImages.filter(i => i.selected).length;
  const pendingCount = pendingImages.filter(i => i.status === "pending" && i.selected).length;
  const successCount = pendingImages.filter(i => i.status === "success").length;
  const errorCount = pendingImages.filter(i => i.status === "error").length;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2" onClick={() => setIsOpen(true)}>
          <FolderUp className="h-4 w-4" />
          Carga Masiva
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FolderUp className="h-5 w-5 text-primary" />
            Carga Masiva de Imágenes
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-auto space-y-4">
          {/* Drop zone */}
          {pendingImages.length === 0 && (
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
                isDragOver 
                  ? "border-primary bg-primary/5" 
                  : "border-border hover:border-primary/50"
              }`}
            >
              <ImageIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-lg font-medium mb-2">
                Arrastra y suelta imágenes aquí
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                o haz clic para seleccionar (máximo 50 imágenes)
              </p>
              <Input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => handleFileSelect(e.target.files)}
                className="max-w-xs mx-auto"
              />
            </div>
          )}

          {/* Images loaded */}
          {pendingImages.length > 0 && (
            <>
              {/* Batch controls */}
              <div className="flex flex-wrap gap-4 p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Checkbox 
                    checked={selectedCount === pendingImages.length}
                    onCheckedChange={(checked) => toggleSelectAll(!!checked)}
                  />
                  <span className="text-sm">
                    {selectedCount} de {pendingImages.length} seleccionadas
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Select value={batchMuscle} onValueChange={setBatchMuscle}>
                    <SelectTrigger className="w-40 h-8 text-xs">
                      <SelectValue placeholder="Grupo muscular" />
                    </SelectTrigger>
                    <SelectContent>
                      {MUSCLE_GROUPS.map((mg) => (
                        <SelectItem key={mg.value} value={mg.value}>
                          {mg.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button size="sm" variant="outline" onClick={applyBatchMuscle} disabled={!batchMuscle}>
                    Aplicar
                  </Button>
                </div>

                <div className="flex items-center gap-2">
                  <Select value={batchEquipment} onValueChange={setBatchEquipment}>
                    <SelectTrigger className="w-40 h-8 text-xs">
                      <SelectValue placeholder="Equipamiento" />
                    </SelectTrigger>
                    <SelectContent>
                      {EQUIPMENT_TYPES.map((eq) => (
                        <SelectItem key={eq.value} value={eq.value}>
                          {eq.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button size="sm" variant="outline" onClick={applyBatchEquipment} disabled={!batchEquipment}>
                    Aplicar
                  </Button>
                </div>

                <div className="ml-auto flex gap-2">
                  <Input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => handleFileSelect(e.target.files)}
                    className="w-auto text-xs"
                  />
                  <Button size="sm" variant="ghost" onClick={clearAll} disabled={isUploading}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Progress bar */}
              {isUploading && (
                <div className="space-y-2">
                  <Progress value={uploadProgress} className="h-2" />
                  <p className="text-sm text-center text-muted-foreground">
                    Subiendo... {Math.round(uploadProgress)}%
                  </p>
                </div>
              )}

              {/* Images grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-2">
                {pendingImages.map((img) => (
                  <div 
                    key={img.id} 
                    className={`flex gap-3 p-3 rounded-lg border ${
                      img.status === "success" ? "border-green-500/50 bg-green-500/5" :
                      img.status === "error" ? "border-destructive/50 bg-destructive/5" :
                      "border-border bg-card"
                    }`}
                  >
                    <div className="relative flex-shrink-0">
                      <Checkbox
                        checked={img.selected}
                        onCheckedChange={(checked) => updateImage(img.id, { selected: !!checked })}
                        disabled={img.status !== "pending"}
                        className="absolute -top-1 -left-1 z-10"
                      />
                      <img
                        src={img.preview}
                        alt={img.exerciseName}
                        className="w-20 h-20 object-cover rounded"
                      />
                      {img.status === "uploading" && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded">
                          <Loader2 className="h-6 w-6 animate-spin text-white" />
                        </div>
                      )}
                      {img.status === "success" && (
                        <div className="absolute inset-0 bg-primary/50 flex items-center justify-center rounded">
                          <CheckCircle2 className="h-6 w-6 text-primary-foreground" />
                        </div>
                      )}
                      {img.status === "error" && (
                        <div className="absolute inset-0 bg-destructive/50 flex items-center justify-center rounded">
                          <XCircle className="h-6 w-6 text-white" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0 space-y-2">
                      <Input
                        value={img.exerciseName}
                        onChange={(e) => updateImage(img.id, { exerciseName: e.target.value })}
                        placeholder="Nombre del ejercicio"
                        className="h-8 text-sm"
                        disabled={img.status !== "pending"}
                      />
                      <div className="flex gap-2">
                        <Select 
                          value={img.muscleGroup} 
                          onValueChange={(v) => updateImage(img.id, { muscleGroup: v })}
                          disabled={img.status !== "pending"}
                        >
                          <SelectTrigger className="h-7 text-xs flex-1">
                            <SelectValue placeholder="Músculo" />
                          </SelectTrigger>
                          <SelectContent>
                            {MUSCLE_GROUPS.map((mg) => (
                              <SelectItem key={mg.value} value={mg.value}>
                                {mg.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Select 
                          value={img.equipment} 
                          onValueChange={(v) => updateImage(img.id, { equipment: v })}
                          disabled={img.status !== "pending"}
                        >
                          <SelectTrigger className="h-7 text-xs flex-1">
                            <SelectValue placeholder="Equipo" />
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
                      {img.error && (
                        <p className="text-xs text-destructive truncate">{img.error}</p>
                      )}
                    </div>
                    
                    {img.status === "pending" && (
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        className="h-8 w-8 flex-shrink-0"
                        onClick={() => removeImage(img.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>

              {/* Stats */}
              <div className="flex justify-between items-center text-sm text-muted-foreground">
                <span>
                  {successCount > 0 && <span className="text-primary">{successCount} exitosas</span>}
                  {successCount > 0 && errorCount > 0 && " · "}
                  {errorCount > 0 && <span className="text-destructive">{errorCount} fallidas</span>}
                  {(successCount > 0 || errorCount > 0) && pendingCount > 0 && " · "}
                  {pendingCount > 0 && <span>{pendingCount} pendientes</span>}
                </span>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        {pendingImages.length > 0 && (
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={handleClose} disabled={isUploading}>
              {successCount > 0 ? "Cerrar" : "Cancelar"}
            </Button>
            <Button 
              onClick={uploadAllImages} 
              disabled={isUploading || pendingCount === 0}
              className="gap-2"
            >
              {isUploading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Upload className="h-4 w-4" />
              )}
              Subir {pendingCount} {pendingCount === 1 ? "Imagen" : "Imágenes"}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
