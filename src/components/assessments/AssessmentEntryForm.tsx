import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ClipboardPlus, Loader2, UserPlus, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

// Validation schema
const assessmentFormSchema = z.object({
  document_number: z
    .string()
    .trim()
    .min(5, "El documento debe tener al menos 5 caracteres")
    .max(20, "El documento no puede exceder 20 caracteres")
    .regex(/^[a-zA-Z0-9]+$/, "Solo se permiten letras y números"),
  full_name: z
    .string()
    .trim()
    .min(3, "El nombre debe tener al menos 3 caracteres")
    .max(100, "El nombre no puede exceder 100 caracteres"),
  age: z
    .number({ invalid_type_error: "Ingresa una edad válida" })
    .int("La edad debe ser un número entero")
    .min(10, "La edad mínima es 10 años")
    .max(100, "La edad máxima es 100 años"),
  sex: z.enum(["masculino", "femenino"], {
    required_error: "Selecciona el sexo",
  }),
  assessment_date: z.string().min(1, "Selecciona una fecha"),
  weight_kg: z
    .number({ invalid_type_error: "Ingresa un peso válido" })
    .min(20, "El peso mínimo es 20 kg")
    .max(300, "El peso máximo es 300 kg"),
  height_cm: z
    .number({ invalid_type_error: "Ingresa una altura válida" })
    .min(100, "La altura mínima es 100 cm")
    .max(250, "La altura máxima es 250 cm"),
  bmi: z
    .number({ invalid_type_error: "Ingresa un IMC válido" })
    .min(10, "El IMC mínimo es 10")
    .max(60, "El IMC máximo es 60"),
  body_fat_percentage: z
    .number({ invalid_type_error: "Ingresa un % de grasa válido" })
    .min(3, "El % de grasa mínimo es 3%")
    .max(60, "El % de grasa máximo es 60%"),
  muscle_mass_percentage: z
    .number({ invalid_type_error: "Ingresa un % de músculo válido" })
    .min(10, "El % de músculo mínimo es 10%")
    .max(70, "El % de músculo máximo es 70%"),
  visceral_fat: z
    .number({ invalid_type_error: "Ingresa un valor válido" })
    .min(1, "El mínimo es 1")
    .max(30, "El máximo es 30"),
  notes: z
    .string()
    .max(500, "Las notas no pueden exceder 500 caracteres")
    .optional(),
});

type AssessmentFormData = z.infer<typeof assessmentFormSchema>;

interface AssessmentEntryFormProps {
  onSuccess?: () => void;
}

export function AssessmentEntryForm({ onSuccess }: AssessmentEntryFormProps) {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const queryClient = useQueryClient();

  const form = useForm<AssessmentFormData>({
    resolver: zodResolver(assessmentFormSchema),
    defaultValues: {
      document_number: "",
      full_name: "",
      age: undefined,
      sex: undefined,
      assessment_date: format(new Date(), "yyyy-MM-dd"),
      weight_kg: undefined,
      height_cm: undefined,
      bmi: undefined,
      body_fat_percentage: undefined,
      muscle_mass_percentage: undefined,
      visceral_fat: undefined,
      notes: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: AssessmentFormData) => {
      // 1. Check if member exists
      const { data: existingMember, error: searchError } = await supabase
        .from("gym_members")
        .select("id")
        .eq("document_number", data.document_number)
        .maybeSingle();

      if (searchError) throw searchError;

      let memberId: string;

      if (existingMember) {
        // Update existing member info
        memberId = existingMember.id;
        const { error: updateError } = await supabase
          .from("gym_members")
          .update({
            full_name: data.full_name,
            age: data.age,
            sex: data.sex,
            weight_kg: data.weight_kg,
            height_cm: data.height_cm,
          })
          .eq("id", memberId);

        if (updateError) throw updateError;
      } else {
        // Create new member
        const { data: newMember, error: insertError } = await supabase
          .from("gym_members")
          .insert({
            document_number: data.document_number,
            full_name: data.full_name,
            age: data.age,
            sex: data.sex,
            weight_kg: data.weight_kg,
            height_cm: data.height_cm,
          })
          .select("id")
          .single();

        if (insertError) throw insertError;
        memberId = newMember.id;
      }

      // 2. Create physical assessment
      const { error: assessmentError } = await supabase
        .from("physical_assessments")
        .insert({
          member_id: memberId,
          assessment_date: data.assessment_date,
          weight_kg: data.weight_kg,
          height_cm: data.height_cm,
          bmi: data.bmi,
          body_fat_percentage: data.body_fat_percentage,
          muscle_mass_percentage: data.muscle_mass_percentage,
          visceral_fat: data.visceral_fat,
          notes: data.notes || null,
        });

      if (assessmentError) throw assessmentError;

      return { memberId, isNew: !existingMember };
    },
    onSuccess: (result) => {
      setIsSubmitted(true);
      toast.success(
        result.isNew
          ? "¡Miembro y valoración registrados exitosamente!"
          : "¡Valoración agregada exitosamente!"
      );
      queryClient.invalidateQueries({ queryKey: ["member"] });
      queryClient.invalidateQueries({ queryKey: ["assessments"] });
      
      // Reset after animation
      setTimeout(() => {
        form.reset();
        setIsSubmitted(false);
        onSuccess?.();
      }, 2000);
    },
    onError: (error: Error) => {
      console.error("Error saving assessment:", error);
      toast.error("Error al guardar la valoración. Verifica que tienes permisos de staff.");
    },
  });

  const onSubmit = (data: AssessmentFormData) => {
    mutation.mutate(data);
  };

  // Auto-calculate BMI when weight and height change
  const watchWeight = form.watch("weight_kg");
  const watchHeight = form.watch("height_cm");

  const calculateBMI = () => {
    if (watchWeight && watchHeight) {
      const heightM = watchHeight / 100;
      const bmi = watchWeight / (heightM * heightM);
      form.setValue("bmi", parseFloat(bmi.toFixed(1)));
    }
  };

  if (isSubmitted) {
    return (
      <Card className="border-0 shadow-xl bg-gradient-to-br from-green-500/10 to-card">
        <CardContent className="p-12 text-center">
          <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4 animate-pulse">
            <CheckCircle2 className="h-10 w-10 text-green-500" />
          </div>
          <h3 className="font-display text-2xl mb-2 text-green-500">¡Valoración Guardada!</h3>
          <p className="text-muted-foreground">
            Los datos han sido registrados correctamente.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-xl">
      <CardHeader className="border-b border-border/50">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <ClipboardPlus className="h-6 w-6 text-primary" />
          </div>
          <div>
            <CardTitle className="font-display text-xl">Registrar Nueva Valoración</CardTitle>
            <CardDescription>
              Ingresa los datos del miembro y sus métricas corporales
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Personal Info Section */}
            <div className="space-y-4">
              <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <UserPlus className="h-4 w-4" />
                Datos Personales
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="document_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Número de Documento *</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Ej: 12345678" 
                          {...field} 
                          className="bg-secondary/30 border-0"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="full_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre Completo *</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Ej: Juan Pérez" 
                          {...field}
                          className="bg-secondary/30 border-0"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="age"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Edad *</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="Ej: 25" 
                          {...field}
                          onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                          value={field.value ?? ""}
                          className="bg-secondary/30 border-0"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="sex"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sexo *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-secondary/30 border-0">
                            <SelectValue placeholder="Seleccionar" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="masculino">Masculino</SelectItem>
                          <SelectItem value="femenino">Femenino</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Assessment Date & Physical Measurements */}
            <div className="space-y-4">
              <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <ClipboardPlus className="h-4 w-4" />
                Datos de la Valoración
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="assessment_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fecha de Valoración *</FormLabel>
                      <FormControl>
                        <Input 
                          type="date" 
                          {...field}
                          className="bg-secondary/30 border-0"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="weight_kg"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Peso (kg) *</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.1"
                          placeholder="Ej: 70.5" 
                          {...field}
                          onChange={(e) => {
                            field.onChange(e.target.value ? parseFloat(e.target.value) : undefined);
                            setTimeout(calculateBMI, 100);
                          }}
                          value={field.value ?? ""}
                          className="bg-secondary/30 border-0"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="height_cm"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Altura (cm) *</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="Ej: 175" 
                          {...field}
                          onChange={(e) => {
                            field.onChange(e.target.value ? parseFloat(e.target.value) : undefined);
                            setTimeout(calculateBMI, 100);
                          }}
                          value={field.value ?? ""}
                          className="bg-secondary/30 border-0"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Body Composition Metrics */}
            <div className="space-y-4">
              <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">
                📊 Métricas Corporales
              </h4>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <FormField
                  control={form.control}
                  name="bmi"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>IMC *</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.1"
                          placeholder="Auto" 
                          {...field}
                          onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                          value={field.value ?? ""}
                          className={cn(
                            "bg-secondary/30 border-0",
                            field.value && "bg-blue-500/10 text-blue-500 font-semibold"
                          )}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="body_fat_percentage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>% Grasa *</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.1"
                          placeholder="Ej: 18.5" 
                          {...field}
                          onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                          value={field.value ?? ""}
                          className="bg-secondary/30 border-0"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="muscle_mass_percentage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>% Músculo *</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.1"
                          placeholder="Ej: 42.0" 
                          {...field}
                          onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                          value={field.value ?? ""}
                          className="bg-secondary/30 border-0"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="visceral_fat"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>G. Visceral *</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="Ej: 8" 
                          {...field}
                          onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                          value={field.value ?? ""}
                          className="bg-secondary/30 border-0"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Notes */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notas (opcional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Observaciones adicionales..." 
                      {...field}
                      className="bg-secondary/30 border-0 resize-none"
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Submit Button */}
            <Button 
              type="submit" 
              size="lg" 
              className="w-full h-12 text-lg"
              disabled={mutation.isPending}
            >
              {mutation.isPending ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <ClipboardPlus className="h-5 w-5 mr-2" />
                  Guardar Valoración
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
