import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TRAINING_LEVELS, TRAINING_OBJECTIVES, TRAINING_FOCUS } from "@/lib/constants";
import { Download, Dumbbell, Clock, Target, Zap, User, Activity, AlertCircle, Utensils, TrendingUp, Flame, Scale, Ruler, Percent } from "lucide-react";
import { RoutineData } from "./RoutineForm";
import { generateRoutinePDF } from "@/lib/pdfGenerator";
import logo from "@/assets/logo.jpg";

interface RoutineDisplayProps {
  data: RoutineData;
}

export function RoutineDisplay({ data }: RoutineDisplayProps) {
  const levelInfo = TRAINING_LEVELS[data.level as keyof typeof TRAINING_LEVELS];
  const objectiveInfo = TRAINING_OBJECTIVES[data.objective as keyof typeof TRAINING_OBJECTIVES];
  const focusInfo = TRAINING_FOCUS[data.focus as keyof typeof TRAINING_FOCUS];

  const handleDownloadPDF = async () => {
    try {
      await generateRoutinePDF(data);
    } catch (error) {
      console.error("Error generating PDF:", error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Card */}
      <Card className="bg-secondary border-primary/20">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <img src={logo} alt="98 Fitness Club" className="h-16 w-16 rounded-full object-cover border-2 border-primary" />
            <div>
              <h2 className="font-display text-2xl tracking-wider">
                ¡BIENVENIDO/A, <span className="text-primary">{data.name.toUpperCase()}</span>!
              </h2>
              <p className="text-muted-foreground">Tu rutina y plan nutricional personalizado de 98 Fitness Club está listo.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* User Body Stats Summary */}
      <Card className="bg-gradient-to-r from-primary/10 to-transparent border-primary/30">
        <CardHeader className="pb-2">
          <CardTitle className="font-display text-lg flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            TU PERFIL FÍSICO
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            <div className="text-center p-3 bg-card rounded-lg border">
              <Scale className="h-5 w-5 mx-auto mb-1 text-primary" />
              <p className="text-2xl font-bold">{data.weight}</p>
              <p className="text-xs text-muted-foreground">kg</p>
            </div>
            <div className="text-center p-3 bg-card rounded-lg border">
              <Ruler className="h-5 w-5 mx-auto mb-1 text-primary" />
              <p className="text-2xl font-bold">{data.height}</p>
              <p className="text-xs text-muted-foreground">cm</p>
            </div>
            <div className="text-center p-3 bg-card rounded-lg border">
              <Target className="h-5 w-5 mx-auto mb-1 text-primary" />
              <p className="text-lg font-bold">{levelInfo?.label}</p>
              <p className="text-xs text-muted-foreground">Nivel</p>
            </div>
            <div className="text-center p-3 bg-card rounded-lg border">
              <Zap className="h-5 w-5 mx-auto mb-1 text-primary" />
              <p className="text-lg font-bold">{objectiveInfo?.label}</p>
              <p className="text-xs text-muted-foreground">Objetivo</p>
            </div>
            <div className="text-center p-3 bg-card rounded-lg border">
              <Dumbbell className="h-5 w-5 mx-auto mb-1 text-primary" />
              <p className="text-lg font-bold">{focusInfo?.label}</p>
              <p className="text-xs text-muted-foreground">Enfoque</p>
            </div>
            <div className="text-center p-3 bg-card rounded-lg border">
              <Activity className="h-5 w-5 mx-auto mb-1 text-primary" />
              <p className="text-2xl font-bold">{data.daysPerWeek}</p>
              <p className="text-xs text-muted-foreground">Días/semana</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pathologies Alert */}
      {data.pathologies && data.pathologies !== "Ninguna" && (
        <Card className="border-yellow-500/50 bg-yellow-500/10">
          <CardContent className="p-4 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5" />
            <div>
              <p className="font-medium text-sm">Consideraciones especiales</p>
              <p className="text-sm text-muted-foreground">{data.pathologies}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Nutrition Section - NOW BEFORE ROUTINE */}
      {data.nutrition && (
        <Card>
          <CardHeader className="bg-green-500/10 border-b border-green-500/20">
            <CardTitle className="font-display text-xl flex items-center gap-2 text-green-500">
              <Utensils className="h-5 w-5" />
              TU PLAN NUTRICIONAL (Harris-Benedict)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            {/* Caloric Info */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-secondary rounded-lg border border-primary/20">
                <Flame className="h-6 w-6 mx-auto mb-2 text-orange-500" />
                <p className="text-2xl font-bold text-primary">{data.nutrition.tmb || "—"}</p>
                <p className="text-xs text-muted-foreground">TMB (kcal)</p>
                <p className="text-[10px] text-muted-foreground/70">Metabolismo Basal</p>
              </div>
              <div className="text-center p-4 bg-secondary rounded-lg border border-primary/20">
                <Activity className="h-6 w-6 mx-auto mb-2 text-blue-500" />
                <p className="text-2xl font-bold text-primary">{data.nutrition.tdee || "—"}</p>
                <p className="text-xs text-muted-foreground">TDEE (kcal)</p>
                <p className="text-[10px] text-muted-foreground/70">Gasto Total Diario</p>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-primary/20 to-primary/5 rounded-lg border-2 border-primary">
                <Target className="h-6 w-6 mx-auto mb-2 text-primary" />
                <p className="text-3xl font-bold text-primary">{data.nutrition.targetCalories || data.nutrition.dailyCalories}</p>
                <p className="text-xs text-muted-foreground">Calorías Objetivo</p>
                <p className="text-[10px] text-muted-foreground/70">Para {objectiveInfo?.label}</p>
              </div>
              <div className="text-center p-4 bg-secondary rounded-lg border border-primary/20">
                <Percent className="h-6 w-6 mx-auto mb-2 text-green-500" />
                <p className="text-lg font-bold text-primary">
                  {data.objective === "perdida_grasa" ? "-20%" : data.objective === "hipertrofia" ? "+10%" : "0%"}
                </p>
                <p className="text-xs text-muted-foreground">Ajuste Calórico</p>
                <p className="text-[10px] text-muted-foreground/70">vs TDEE</p>
              </div>
            </div>

            {/* Macros */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-red-500/10 rounded-lg border border-red-500/30">
                <p className="text-3xl font-bold text-red-400">{data.nutrition.proteinGrams || "—"}g</p>
                <p className="text-sm text-muted-foreground">Proteína</p>
                <p className="text-xs text-red-400/80">{data.nutrition.protein}</p>
              </div>
              <div className="text-center p-4 bg-yellow-500/10 rounded-lg border border-yellow-500/30">
                <p className="text-3xl font-bold text-yellow-400">{data.nutrition.carbsGrams || "—"}g</p>
                <p className="text-sm text-muted-foreground">Carbohidratos</p>
                <p className="text-xs text-yellow-400/80">{data.nutrition.carbs}</p>
              </div>
              <div className="text-center p-4 bg-blue-500/10 rounded-lg border border-blue-500/30">
                <p className="text-3xl font-bold text-blue-400">{data.nutrition.fatsGrams || "—"}g</p>
                <p className="text-sm text-muted-foreground">Grasas</p>
                <p className="text-xs text-blue-400/80">{data.nutrition.fats}</p>
              </div>
            </div>

            {/* Meal Plan */}
            {data.nutrition.mealPlan && (
              <div className="space-y-3">
                <h4 className="font-medium text-lg border-b border-border pb-2">Plan de Comidas (Bogotá)</h4>
                <div className="grid gap-3 md:grid-cols-2">
                  {data.nutrition.mealPlan.map((meal, index) => (
                    <div key={index} className="p-4 bg-muted/30 rounded-lg border border-border/50">
                      <p className="font-medium text-primary mb-2">{meal.meal}</p>
                      <ul className="space-y-1">
                        {meal.options.map((option, optIndex) => (
                          <li key={optIndex} className="text-sm text-muted-foreground flex items-start gap-2">
                            <span className="text-primary">•</span>
                            {option}
                          </li>
                        ))}
                      </ul>
                      {meal.macros && (
                        <p className="text-xs text-muted-foreground/70 mt-2 italic border-t border-border/30 pt-2">{meal.macros}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tips */}
            {data.nutrition.tips && (
              <div className="space-y-2 bg-green-500/5 p-4 rounded-lg border border-green-500/20">
                <h4 className="font-medium flex items-center gap-2">
                  <span className="text-green-500">💡</span> Consejos Nutricionales
                </h4>
                <ul className="grid md:grid-cols-2 gap-2">
                  {data.nutrition.tips.map((tip, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <span className="text-green-500 font-bold">✓</span>
                      <span className="text-muted-foreground">{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Routine by Month */}
      {data.routine?.map((month, monthIndex) => (
        <div key={monthIndex} className="space-y-4">
          <h3 className="font-display text-xl text-primary flex items-center gap-2">
            <Dumbbell className="h-5 w-5" />
            MES {month.month} - Semanas {month.weeks}
          </h3>
          
          {month.days?.map((day, dayIndex) => (
            <Card key={dayIndex}>
              <CardHeader className="bg-secondary py-3">
                <CardTitle className="font-display text-lg flex items-center gap-2">
                  <Dumbbell className="h-5 w-5 text-primary" />
                  {day.day}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {/* Warmup */}
                <div className="p-3 bg-primary/5 border-b border-border">
                  <p className="text-sm">
                    <Clock className="h-4 w-4 inline mr-2 text-primary" />
                    <strong>Calentamiento:</strong> {data.warmupMinutes} min en trotadora o elíptica
                  </p>
                </div>
                
                {/* Exercises Grid with Images */}
                <div className="grid gap-3 p-4 md:grid-cols-2 lg:grid-cols-3">
                  {day.exercises?.map((exercise, exIndex) => (
                    <div key={exIndex} className="bg-muted/30 rounded-lg overflow-hidden border border-border/50 hover:border-primary/50 transition-colors">
                      {/* Exercise Image */}
                      <div className="aspect-video relative overflow-hidden bg-secondary">
                        <img 
                          src={exercise.imageUrl || "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=300&fit=crop"} 
                          alt={exercise.name}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                          <span className={`px-2 py-0.5 rounded text-xs ${
                            exercise.equipment?.toLowerCase().includes("mancuerna") 
                              ? "bg-blue-500/80 text-white" 
                              : "bg-primary/80 text-white"
                          }`}>
                            {exercise.equipment}
                          </span>
                        </div>
                      </div>
                      {/* Exercise Info */}
                      <div className="p-3">
                        <p className="font-medium text-sm mb-2">{exercise.name}</p>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-primary font-bold">{exercise.sets} × {exercise.reps}</span>
                          <span className="bg-secondary px-2 py-1 rounded">RIR {exercise.rir}</span>
                        </div>
                        {exercise.notes && (
                          <p className="text-xs text-muted-foreground mt-2 italic">{exercise.notes}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Final Cardio */}
                {day.finalCardio && (
                  <div className="p-3 bg-primary/5 border-t border-border">
                    <p className="text-sm">
                      <Activity className="h-4 w-4 inline mr-2 text-primary" />
                      <strong>Cardio final:</strong> {day.finalCardio}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ))}

      {/* Progression Section */}
      {data.progression && (
        <Card>
          <CardHeader className="bg-blue-500/10 border-b border-blue-500/20">
            <CardTitle className="font-display text-xl flex items-center gap-2 text-blue-500">
              <TrendingUp className="h-5 w-5" />
              PROGRESO DE CARGA
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-4 bg-secondary rounded-lg">
                <h5 className="font-medium text-primary mb-2">Semanas 1-2</h5>
                <p className="text-sm text-muted-foreground">{data.progression.weeks1to2}</p>
              </div>
              <div className="p-4 bg-secondary rounded-lg">
                <h5 className="font-medium text-primary mb-2">Semanas 3-4</h5>
                <p className="text-sm text-muted-foreground">{data.progression.weeks3to4}</p>
              </div>
              <div className="p-4 bg-secondary rounded-lg">
                <h5 className="font-medium text-primary mb-2">Progresión Mensual</h5>
                <p className="text-sm text-muted-foreground">{data.progression.monthlyIncrease}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Notes */}
      {data.notes && data.notes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="font-display text-lg">Notas Importantes</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {data.notes.map((note, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <span className="text-primary font-bold">•</span>
                  {note}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Download Button */}
      <div className="flex justify-center pt-4">
        <Button size="lg" onClick={handleDownloadPDF} className="gap-2">
          <Download className="h-5 w-5" />
          Descargar Rutina + Nutrición en PDF
        </Button>
      </div>

      {/* Social CTA */}
      <Card className="bg-gradient-to-r from-primary/20 to-primary/5 border-primary/30">
        <CardContent className="p-6 text-center">
          <h3 className="font-display text-xl mb-2">¡SÍGUENOS EN REDES!</h3>
          <p className="text-muted-foreground">@98fitnessclub • Bogotá, Colombia</p>
        </CardContent>
      </Card>
    </div>
  );
}
