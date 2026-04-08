import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calculator, Flame, Beef, Wheat, Droplets } from "lucide-react";

interface HarrisBenedictCalculatorProps {
  initialWeight?: number;
  initialHeight?: number;
  initialAge?: number;
  initialSex?: string;
}

const ACTIVITY_FACTORS = [
  { value: "1.2", label: "Sedentario (poco o ningún ejercicio)" },
  { value: "1.375", label: "Ligera actividad (1-3 días/semana)" },
  { value: "1.55", label: "Moderada actividad (3-5 días/semana)" },
  { value: "1.725", label: "Alta actividad (6-7 días/semana)" },
  { value: "1.9", label: "Muy alta actividad (atleta profesional)" },
];

const OBJECTIVES = [
  { value: "deficit", label: "Pérdida de grasa (-500 kcal)", modifier: -500 },
  { value: "maintenance", label: "Mantenimiento", modifier: 0 },
  { value: "surplus", label: "Ganancia muscular (+300 kcal)", modifier: 300 },
];

export function HarrisBenedictCalculator({
  initialWeight,
  initialHeight,
  initialAge,
  initialSex,
}: HarrisBenedictCalculatorProps) {
  const [weight, setWeight] = useState(initialWeight?.toString() || "");
  const [height, setHeight] = useState(initialHeight?.toString() || "");
  const [age, setAge] = useState(initialAge?.toString() || "");
  const [sex, setSex] = useState(initialSex || "");
  const [activityFactor, setActivityFactor] = useState("1.55");
  const [objective, setObjective] = useState("maintenance");

  const [tmb, setTmb] = useState<number | null>(null);
  const [tdee, setTdee] = useState<number | null>(null);
  const [targetCalories, setTargetCalories] = useState<number | null>(null);
  const [macros, setMacros] = useState<{ protein: number; carbs: number; fats: number } | null>(null);

  useEffect(() => {
    if (weight && height && age && sex) {
      const w = parseFloat(weight);
      const h = parseFloat(height);
      const a = parseInt(age);
      const af = parseFloat(activityFactor);
      const objModifier = OBJECTIVES.find((o) => o.value === objective)?.modifier || 0;

      // Harris-Benedict equation
      let calculatedTmb: number;
      if (sex === "masculino") {
        calculatedTmb = 88.362 + (13.397 * w) + (4.799 * h) - (5.677 * a);
      } else {
        calculatedTmb = 447.593 + (9.247 * w) + (3.098 * h) - (4.330 * a);
      }

      const calculatedTdee = calculatedTmb * af;
      const calculatedTarget = calculatedTdee + objModifier;

      setTmb(Math.round(calculatedTmb));
      setTdee(Math.round(calculatedTdee));
      setTargetCalories(Math.round(calculatedTarget));

      // Calculate macros based on objective
      let proteinRatio: number, carbRatio: number, fatRatio: number;
      
      if (objective === "deficit") {
        // Higher protein for muscle preservation during deficit
        proteinRatio = 0.35;
        carbRatio = 0.35;
        fatRatio = 0.30;
      } else if (objective === "surplus") {
        // Higher carbs for energy and muscle growth
        proteinRatio = 0.30;
        carbRatio = 0.45;
        fatRatio = 0.25;
      } else {
        // Balanced for maintenance
        proteinRatio = 0.30;
        carbRatio = 0.40;
        fatRatio = 0.30;
      }

      const proteinCals = calculatedTarget * proteinRatio;
      const carbCals = calculatedTarget * carbRatio;
      const fatCals = calculatedTarget * fatRatio;

      setMacros({
        protein: Math.round(proteinCals / 4), // 4 cals per gram of protein
        carbs: Math.round(carbCals / 4), // 4 cals per gram of carbs
        fats: Math.round(fatCals / 9), // 9 cals per gram of fat
      });
    }
  }, [weight, height, age, sex, activityFactor, objective]);

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-green-500/20 to-green-500/5 border-b border-green-500/20">
        <CardTitle className="font-display text-xl flex items-center gap-2">
          <Calculator className="h-5 w-5 text-green-500" />
          CALCULADORA NUTRICIONAL (Harris-Benedict)
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {/* Input Form */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label htmlFor="calc-weight">Peso (kg)</Label>
            <Input
              id="calc-weight"
              type="number"
              step="0.1"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="70"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="calc-height">Estatura (cm)</Label>
            <Input
              id="calc-height"
              type="number"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              placeholder="170"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="calc-age">Edad</Label>
            <Input
              id="calc-age"
              type="number"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              placeholder="25"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="calc-sex">Sexo</Label>
            <Select value={sex} onValueChange={setSex}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="masculino">Masculino</SelectItem>
                <SelectItem value="femenino">Femenino</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="activity">Factor de Actividad</Label>
            <Select value={activityFactor} onValueChange={setActivityFactor}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ACTIVITY_FACTORS.map((factor) => (
                  <SelectItem key={factor.value} value={factor.value}>
                    {factor.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="objective">Objetivo</Label>
            <Select value={objective} onValueChange={setObjective}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {OBJECTIVES.map((obj) => (
                  <SelectItem key={obj.value} value={obj.value}>
                    {obj.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Results */}
        {tmb && tdee && targetCalories && macros && (
          <div className="space-y-6 pt-4 border-t border-border">
            {/* Calorie Results */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-secondary rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">TMB (Tasa Metabólica Basal)</p>
                <p className="text-2xl font-bold text-foreground">{tmb}</p>
                <p className="text-xs text-muted-foreground">kcal/día en reposo</p>
              </div>
              <div className="text-center p-4 bg-secondary rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">TDEE (Gasto Total)</p>
                <p className="text-2xl font-bold text-foreground">{tdee}</p>
                <p className="text-xs text-muted-foreground">kcal/día con actividad</p>
              </div>
              <div className="text-center p-4 bg-primary/20 rounded-lg border border-primary/30">
                <Flame className="h-5 w-5 text-primary mx-auto mb-1" />
                <p className="text-sm text-muted-foreground mb-1">Meta Calórica</p>
                <p className="text-3xl font-bold text-primary">{targetCalories}</p>
                <p className="text-xs text-muted-foreground">kcal/día objetivo</p>
              </div>
            </div>

            {/* Macros */}
            <div>
              <h4 className="font-medium mb-4 text-center">Distribución de Macronutrientes</h4>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-red-500/10 rounded-lg border border-red-500/20">
                  <Beef className="h-6 w-6 text-red-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-red-500">{macros.protein}g</p>
                  <p className="text-sm text-muted-foreground">Proteína</p>
                  <p className="text-xs text-muted-foreground mt-1">{Math.round((macros.protein * 4 / targetCalories) * 100)}%</p>
                </div>
                <div className="text-center p-4 bg-amber-500/10 rounded-lg border border-amber-500/20">
                  <Wheat className="h-6 w-6 text-amber-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-amber-500">{macros.carbs}g</p>
                  <p className="text-sm text-muted-foreground">Carbohidratos</p>
                  <p className="text-xs text-muted-foreground mt-1">{Math.round((macros.carbs * 4 / targetCalories) * 100)}%</p>
                </div>
                <div className="text-center p-4 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                  <Droplets className="h-6 w-6 text-yellow-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-yellow-500">{macros.fats}g</p>
                  <p className="text-sm text-muted-foreground">Grasas</p>
                  <p className="text-xs text-muted-foreground mt-1">{Math.round((macros.fats * 9 / targetCalories) * 100)}%</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}