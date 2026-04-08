import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BOGOTA_FOODS, TRAINING_OBJECTIVES } from "@/lib/constants";
import { Apple, Beef, Wheat, Droplets, Salad, Calculator } from "lucide-react";
import { HarrisBenedictCalculator } from "@/components/nutrition/HarrisBenedictCalculator";

export default function Nutricion() {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="font-display text-4xl md:text-5xl mb-4 tracking-wider">
            GUÍA DE <span className="text-primary">NUTRICIÓN</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Calcula tus necesidades calóricas y macronutrientes con la ecuación de Harris-Benedict.
          </p>
        </div>

        {/* Harris-Benedict Calculator */}
        <div className="max-w-4xl mx-auto mb-12">
          <HarrisBenedictCalculator />
        </div>

        {/* Objectives Guide */}
        <div className="max-w-4xl mx-auto mb-12">
          <h2 className="font-display text-3xl mb-6 text-center tracking-wider">
            GUÍA POR <span className="text-primary">OBJETIVO</span>
          </h2>
          
          <Tabs defaultValue="perdida_grasa">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="perdida_grasa">Pérdida de Grasa</TabsTrigger>
              <TabsTrigger value="hipertrofia">Hipertrofia</TabsTrigger>
              <TabsTrigger value="recomposicion">Recomposición</TabsTrigger>
            </TabsList>

            {Object.entries(TRAINING_OBJECTIVES).map(([key, obj]) => (
              <TabsContent key={key} value={key} className="space-y-6 mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="font-display text-2xl">{obj.label}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-muted-foreground">{obj.description}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                      <div className="p-4 bg-red-500/10 rounded-lg text-center border border-red-500/20">
                        <Beef className="h-8 w-8 mx-auto mb-2 text-red-500" />
                        <h4 className="font-medium">Proteína</h4>
                        <p className="text-2xl font-bold text-primary">
                          {key === "hipertrofia" ? "2.0-2.2g" : "1.8-2.0g"}
                        </p>
                        <p className="text-sm text-muted-foreground">por kg de peso</p>
                      </div>
                      <div className="p-4 bg-amber-500/10 rounded-lg text-center border border-amber-500/20">
                        <Wheat className="h-8 w-8 mx-auto mb-2 text-amber-500" />
                        <h4 className="font-medium">Carbohidratos</h4>
                        <p className="text-2xl font-bold text-primary">
                          {key === "perdida_grasa" ? "2-3g" : key === "hipertrofia" ? "4-6g" : "3-4g"}
                        </p>
                        <p className="text-sm text-muted-foreground">por kg de peso</p>
                      </div>
                      <div className="p-4 bg-yellow-500/10 rounded-lg text-center border border-yellow-500/20">
                        <Droplets className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
                        <h4 className="font-medium">Grasas</h4>
                        <p className="text-2xl font-bold text-primary">
                          {key === "perdida_grasa" ? "0.8-1g" : "0.8-1.2g"}
                        </p>
                        <p className="text-sm text-muted-foreground">por kg de peso</p>
                      </div>
                    </div>

                    {/* Tips per objective */}
                    <div className="mt-6 p-4 bg-secondary rounded-lg">
                      <h4 className="font-medium mb-3">💡 Consejos para {obj.label}</h4>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        {key === "perdida_grasa" && (
                          <>
                            <li>• Mantén un déficit calórico de 300-500 kcal/día</li>
                            <li>• Prioriza proteína para preservar masa muscular</li>
                            <li>• Incluye 20-30 min de cardio post-entrenamiento</li>
                            <li>• Bebe al menos 3 litros de agua al día</li>
                          </>
                        )}
                        {key === "hipertrofia" && (
                          <>
                            <li>• Mantén un superávit calórico de 200-400 kcal/día</li>
                            <li>• Consume proteína cada 3-4 horas</li>
                            <li>• Prioriza carbohidratos alrededor del entrenamiento</li>
                            <li>• Descansa 7-9 horas para optimizar la recuperación</li>
                          </>
                        )}
                        {key === "recomposicion" && (
                          <>
                            <li>• Mantén calorías en mantenimiento o leve déficit</li>
                            <li>• Proteína alta (2g/kg) para preservar y construir músculo</li>
                            <li>• Combina entrenamiento de fuerza con cardio moderado</li>
                            <li>• Sé paciente, los resultados toman más tiempo</li>
                          </>
                        )}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>
        </div>

        {/* Local Foods */}
        <div className="max-w-4xl mx-auto">
          <h2 className="font-display text-3xl mb-6 text-center tracking-wider">
            ALIMENTOS <span className="text-primary">LOCALES</span>
          </h2>
          <p className="text-muted-foreground text-center mb-8">
            Opciones saludables disponibles en Bogotá para armar tu dieta
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="overflow-hidden">
              <CardHeader className="pb-2 bg-red-500/10 border-b border-red-500/20">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Beef className="h-5 w-5 text-red-500" /> Proteínas
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <ul className="space-y-1 text-sm text-muted-foreground">
                  {BOGOTA_FOODS.proteins.map((food) => (
                    <li key={food}>• {food}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="overflow-hidden">
              <CardHeader className="pb-2 bg-amber-500/10 border-b border-amber-500/20">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Wheat className="h-5 w-5 text-amber-500" /> Carbohidratos
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <ul className="space-y-1 text-sm text-muted-foreground">
                  {BOGOTA_FOODS.carbs.map((food) => (
                    <li key={food}>• {food}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="overflow-hidden">
              <CardHeader className="pb-2 bg-yellow-500/10 border-b border-yellow-500/20">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Droplets className="h-5 w-5 text-yellow-500" /> Grasas Saludables
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <ul className="space-y-1 text-sm text-muted-foreground">
                  {BOGOTA_FOODS.fats.map((food) => (
                    <li key={food}>• {food}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="overflow-hidden">
              <CardHeader className="pb-2 bg-green-500/10 border-b border-green-500/20">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Salad className="h-5 w-5 text-green-500" /> Vegetales
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <ul className="space-y-1 text-sm text-muted-foreground">
                  {BOGOTA_FOODS.vegetables.map((food) => (
                    <li key={food}>• {food}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="overflow-hidden">
              <CardHeader className="pb-2 bg-pink-500/10 border-b border-pink-500/20">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Apple className="h-5 w-5 text-pink-500" /> Frutas
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <ul className="space-y-1 text-sm text-muted-foreground">
                  {BOGOTA_FOODS.fruits.map((food) => (
                    <li key={food}>• {food}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}