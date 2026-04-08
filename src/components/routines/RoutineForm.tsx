import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TRAINING_LEVELS, TRAINING_OBJECTIVES, TRAINING_FOCUS } from "@/lib/constants";
import { Loader2, Sparkles, Scale, Ruler, Calculator, User, Activity, Target } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { RoutineDisplay } from "./RoutineDisplay";

export interface RoutineData {
  name: string;
  age: number;
  sex: string;
  weight: number;
  height: number;
  level: string;
  objective: string;
  focus: string;
  daysPerWeek: number;
  weeklyActivity: string;
  pathologies: string;
  warmupMinutes: number;
  warmupDescription: string;
  cardioProtocol?: {
    preCardio: number;
    postCardio: number;
    description: string;
  };
  recommendedClasses?: string[];
  supplements?: string[];
  routine: Array<{
    month: number;
    weeks: string;
    rirTarget?: string;
    days: Array<{
      day: string;
      exercises: Array<{
        name: string;
        equipment: string;
        sets: number;
        reps: string;
        rir: string;
        restMinutes?: string;
        notes?: string;
        imageUrl?: string;
      }>;
      finalCardio?: string;
    }>;
  }>;
  nutrition: {
    tmb: number;
    tdee: number;
    targetCalories: number;
    dailyCalories: string;
    protein: string;
    proteinGrams: number;
    carbs: string;
    carbsGrams: number;
    fats: string;
    fatsGrams: number;
    water?: string;
    mealPlan: Array<{
      meal: string;
      options: string[];
      macros: string;
    }>;
    supplements?: string[];
    tips: string[];
  };
  progression: {
    weeks1to2: string;
    weeks3to4: string;
    monthlyIncrease: string;
    deloadWeek?: string;
  };
  recovery?: {
    sleep?: string[];
    deloadProtocol?: string;
  };
  notes: string[];
  disclaimer?: string;
}

const WEEKLY_ACTIVITY_OPTIONS = [
  { value: "sedentario", label: "Sedentario (sin actividad física)", factor: 1.2 },
  { value: "ligera", label: "Ligera (1-2 veces por semana)", factor: 1.375 },
  { value: "moderada", label: "Moderada (3-4 veces por semana)", factor: 1.55 },
  { value: "activa", label: "Activa (5-6 veces por semana)", factor: 1.725 },
  { value: "muy_activa", label: "Muy activa (ejercicio diario intenso)", factor: 1.9 },
];

const SEX_OPTIONS = [
  { value: "masculino", label: "Masculino" },
  { value: "femenino", label: "Femenino" },
];

export function RoutineForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [routineData, setRoutineData] = useState<RoutineData | null>(null);
  const [weight, setWeight] = useState<string>("");
  const [height, setHeight] = useState<string>("");
  const [imc, setImc] = useState<number | null>(null);
  const { toast } = useToast();

  // Auto-calculate IMC
  useEffect(() => {
    const w = parseFloat(weight);
    const h = parseFloat(height) / 100; // Convert cm to m
    if (w > 0 && h > 0) {
      setImc(parseFloat((w / (h * h)).toFixed(1)));
    } else {
      setImc(null);
    }
  }, [weight, height]);

  const getImcCategory = (imc: number): { label: string; color: string } => {
    if (imc < 18.5) return { label: "Bajo peso", color: "text-yellow-500" };
    if (imc < 25) return { label: "Normal", color: "text-green-500" };
    if (imc < 30) return { label: "Sobrepeso", color: "text-orange-500" };
    return { label: "Obesidad", color: "text-red-500" };
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const age = parseInt(formData.get("age") as string);
    const sex = formData.get("sex") as string;
    const weightKg = parseFloat(formData.get("weight") as string);
    const heightCm = parseFloat(formData.get("height") as string);
    const level = formData.get("level") as string;
    const objective = formData.get("objective") as string;
    const focus = formData.get("focus") as string;
    const daysPerWeek = parseInt(formData.get("days") as string);
    const weeklyActivity = formData.get("weeklyActivity") as string;
    const pathologies = formData.get("pathologies") as string;
    const dislikedFoods = formData.get("dislikedFoods") as string;

    try {
      const { data, error } = await supabase.functions.invoke("generate-routine", {
        body: { 
          name, 
          age, 
          sex, 
          weight: weightKg,
          height: heightCm,
          level, 
          objective, 
          focus, 
          daysPerWeek, 
          weeklyActivity, 
          pathologies,
          dislikedFoods
        },
      });

      if (error) throw error;

      if (data.error) {
        throw new Error(data.error);
      }

      setRoutineData(data);
      toast({ title: "¡Rutina generada!", description: "Tu plan personalizado con nutrición está listo." });
    } catch (error) {
      console.error("Error generating routine:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No pudimos generar la rutina. Intenta de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (routineData) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Button variant="outline" onClick={() => setRoutineData(null)}>
            ← Nueva Rutina
          </Button>
        </div>
        <RoutineDisplay data={routineData} />
      </div>
    );
  }

  return (
    <Card className="max-w-3xl mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="font-display text-2xl flex items-center justify-center gap-2">
          <Sparkles className="h-6 w-6 text-primary" />
          Genera Tu Rutina + Plan Nutricional
        </CardTitle>
        <CardDescription>
          Completa tus datos para recibir un plan de entrenamiento y nutrición 100% personalizado
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Section 1: Personal Data */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-lg font-medium border-b border-border pb-2">
              <User className="h-5 w-5 text-primary" />
              Datos Personales
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre</Label>
                <Input id="name" name="name" placeholder="Tu nombre" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="age">Edad</Label>
                <Input id="age" name="age" type="number" min="14" max="80" placeholder="25" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sex">Sexo</Label>
                <Select name="sex" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona" />
                  </SelectTrigger>
                  <SelectContent>
                    {SEX_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Section 2: Body Metrics for Nutrition */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-lg font-medium border-b border-border pb-2">
              <Scale className="h-5 w-5 text-primary" />
              Medidas Corporales (para cálculo nutricional)
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="weight" className="flex items-center gap-1">
                  <Scale className="h-4 w-4" /> Peso (kg)
                </Label>
                <Input 
                  id="weight" 
                  name="weight" 
                  type="number" 
                  min="30" 
                  max="200" 
                  step="0.1"
                  placeholder="70" 
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="height" className="flex items-center gap-1">
                  <Ruler className="h-4 w-4" /> Estatura (cm)
                </Label>
                <Input 
                  id="height" 
                  name="height" 
                  type="number" 
                  min="120" 
                  max="220" 
                  placeholder="170" 
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-1">
                  <Calculator className="h-4 w-4" /> IMC (automático)
                </Label>
                <div className="h-10 px-3 py-2 rounded-md border border-input bg-muted flex items-center justify-between">
                  {imc ? (
                    <>
                      <span className="font-medium">{imc}</span>
                      <span className={`text-sm ${getImcCategory(imc).color}`}>
                        {getImcCategory(imc).label}
                      </span>
                    </>
                  ) : (
                    <span className="text-muted-foreground text-sm">Ingresa peso y estatura</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Activity Level */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-lg font-medium border-b border-border pb-2">
              <Activity className="h-5 w-5 text-primary" />
              Nivel de Actividad
            </div>
            <div className="space-y-2">
              <Label htmlFor="weeklyActivity">¿Cuánta actividad física realizas actualmente?</Label>
              <Select name="weeklyActivity" required>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona tu nivel de actividad" />
                </SelectTrigger>
                <SelectContent>
                  {WEEKLY_ACTIVITY_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Esto determina tu gasto calórico diario (TDEE) usando la ecuación Harris-Benedict
              </p>
            </div>

            {/* Pathologies */}
            <div className="space-y-2">
              <Label htmlFor="pathologies">Patologías o Limitaciones Físicas</Label>
              <Textarea 
                id="pathologies" 
                name="pathologies" 
                placeholder="Describe cualquier condición médica, lesión o limitación física (ej: dolor de rodilla, hernia discal, hipertensión). Deja vacío si no tienes ninguna."
                className="min-h-[80px]"
              />
            </div>

            {/* Disliked Foods */}
            <div className="space-y-2">
              <Label htmlFor="dislikedFoods">Alimentos que NO deseas consumir</Label>
              <Textarea 
                id="dislikedFoods" 
                name="dislikedFoods" 
                placeholder="Lista los alimentos que no te gustan o no puedes consumir (ej: pescado, lácteos, mariscos, aguacate). Deja vacío si no tienes restricciones."
                className="min-h-[60px]"
              />
              <p className="text-xs text-muted-foreground">
                Estos alimentos serán excluidos de tu plan nutricional
              </p>
            </div>
          </div>

          {/* Section 4: Training Config */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-lg font-medium border-b border-border pb-2">
              <Target className="h-5 w-5 text-primary" />
              Configuración del Entrenamiento
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Training Level */}
              <div className="space-y-2">
                <Label htmlFor="level">Nivel de Entrenamiento</Label>
                <Select name="level" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona tu nivel" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(TRAINING_LEVELS).map(([key, value]) => (
                      <SelectItem key={key} value={key}>
                        <div className="flex flex-col">
                          <span>{value.label}</span>
                          <span className="text-xs text-muted-foreground">{value.frequency}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Objective */}
              <div className="space-y-2">
                <Label htmlFor="objective">Objetivo Principal</Label>
                <Select name="objective" required>
                  <SelectTrigger>
                    <SelectValue placeholder="¿Qué quieres lograr?" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(TRAINING_OBJECTIVES).map(([key, value]) => (
                      <SelectItem key={key} value={key}>
                        <div className="flex flex-col">
                          <span>{value.label}</span>
                          <span className="text-xs text-muted-foreground">{value.description}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Focus */}
              <div className="space-y-2">
                <Label htmlFor="focus">Enfoque de Entrenamiento</Label>
                <Select name="focus" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona el enfoque" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(TRAINING_FOCUS).map(([key, value]) => (
                      <SelectItem key={key} value={key}>
                        {value.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Days per Week */}
              <div className="space-y-2">
                <Label htmlFor="days">Días por Semana</Label>
                <Select name="days" required>
                  <SelectTrigger>
                    <SelectValue placeholder="¿Cuántos días entrenarás?" />
                  </SelectTrigger>
                  <SelectContent>
                    {[2, 3, 4, 5, 6].map((day) => (
                      <SelectItem key={day} value={day.toString()}>
                        {day} días
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Generando rutina y plan nutricional...
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5 mr-2" />
                Generar Rutina + Nutrición con IA
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
