import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, Calculator } from "lucide-react";

interface AssessmentFormProps {
  memberName: string;
  onSubmit: (data: {
    weight_kg: number;
    height_cm: number;
    body_fat_percentage: number;
    bmi: number;
    muscle_mass_percentage: number;
    visceral_fat: number;
    notes?: string;
  }) => void;
  isLoading?: boolean;
  initialWeight?: number;
  initialHeight?: number;
}

export function AssessmentForm({ 
  memberName, 
  onSubmit, 
  isLoading,
  initialWeight,
  initialHeight 
}: AssessmentFormProps) {
  const [weight, setWeight] = useState(initialWeight?.toString() || "");
  const [height, setHeight] = useState(initialHeight?.toString() || "");
  const [bmi, setBmi] = useState("");
  const [bodyFat, setBodyFat] = useState("");
  const [muscle, setMuscle] = useState("");
  const [visceral, setVisceral] = useState("");
  const [notes, setNotes] = useState("");

  // Auto-calculate BMI when weight and height change
  useEffect(() => {
    if (weight && height) {
      const w = parseFloat(weight);
      const h = parseFloat(height) / 100; // Convert cm to meters
      if (w > 0 && h > 0) {
        const calculatedBmi = w / (h * h);
        setBmi(calculatedBmi.toFixed(1));
      }
    }
  }, [weight, height]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      weight_kg: parseFloat(weight),
      height_cm: parseFloat(height),
      body_fat_percentage: parseFloat(bodyFat),
      bmi: parseFloat(bmi),
      muscle_mass_percentage: parseFloat(muscle),
      visceral_fat: parseFloat(visceral),
      notes: notes || undefined,
    });
  };

  const getBmiCategory = (bmiValue: number) => {
    if (bmiValue < 18.5) return { label: "Bajo peso", color: "text-blue-500" };
    if (bmiValue < 25) return { label: "Normal", color: "text-green-500" };
    if (bmiValue < 30) return { label: "Sobrepeso", color: "text-amber-500" };
    return { label: "Obesidad", color: "text-red-500" };
  };

  const bmiValue = parseFloat(bmi);
  const bmiCategory = !isNaN(bmiValue) ? getBmiCategory(bmiValue) : null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-display text-xl">
          Nueva Valoración para {memberName}
        </CardTitle>
        <CardDescription>
          Ingresa los datos de composición corporal. El IMC se calcula automáticamente.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Weight and Height */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="weight">Peso (kg)</Label>
              <Input
                id="weight"
                type="number"
                step="0.1"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="70.5"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="height">Estatura (cm)</Label>
              <Input
                id="height"
                type="number"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                placeholder="170"
                required
              />
            </div>
          </div>

          {/* Auto-calculated BMI */}
          <div className="space-y-2">
            <Label htmlFor="bmi" className="flex items-center gap-2">
              IMC (Índice de Masa Corporal)
              <Calculator className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Auto-calculado</span>
            </Label>
            <div className="flex gap-2 items-center">
              <Input
                id="bmi"
                type="number"
                step="0.1"
                value={bmi}
                onChange={(e) => setBmi(e.target.value)}
                className="bg-muted"
                required
              />
              {bmiCategory && (
                <span className={`text-sm font-medium ${bmiCategory.color}`}>
                  {bmiCategory.label}
                </span>
              )}
            </div>
          </div>

          {/* Body Composition */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="bodyFat">% Grasa Corporal</Label>
              <Input
                id="bodyFat"
                type="number"
                step="0.1"
                value={bodyFat}
                onChange={(e) => setBodyFat(e.target.value)}
                placeholder="20.0"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="muscle">% Masa Muscular</Label>
              <Input
                id="muscle"
                type="number"
                step="0.1"
                value={muscle}
                onChange={(e) => setMuscle(e.target.value)}
                placeholder="35.0"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="visceral">Grasa Visceral</Label>
              <Input
                id="visceral"
                type="number"
                step="0.1"
                value={visceral}
                onChange={(e) => setVisceral(e.target.value)}
                placeholder="8"
                required
              />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notas (opcional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Observaciones adicionales..."
              className="min-h-[80px]"
            />
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Guardar Valoración
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}