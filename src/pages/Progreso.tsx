import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TRAINING_LEVELS } from "@/lib/constants";
import { TrendingUp, Calendar, Target, Zap } from "lucide-react";

export default function Progreso() {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="font-display text-4xl md:text-5xl mb-4 tracking-wider">
            PROGRESO DE <span className="text-primary">CARGA</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Aprende a aplicar la sobrecarga progresiva para mejoras constantes en tu entrenamiento.
          </p>
        </div>

        {/* Principle */}
        <Card className="max-w-4xl mx-auto mb-8">
          <CardHeader>
            <CardTitle className="font-display text-2xl flex items-center gap-2">
              <TrendingUp className="h-6 w-6 text-primary" />
              ¿Qué es la Sobrecarga Progresiva?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>
              La sobrecarga progresiva es el principio fundamental para ganar fuerza y masa muscular. 
              Consiste en aumentar gradualmente la demanda sobre los músculos para forzar adaptaciones continuas.
            </p>
            <p>
              <strong className="text-foreground">En 98 Fitness Club aplicamos este principio de forma sistemática:</strong>
            </p>
          </CardContent>
        </Card>

        {/* How to Progress */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto mb-12">
          <Card className="gym-card">
            <CardContent className="pt-6">
              <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <span className="text-2xl font-bold text-primary">1</span>
              </div>
              <h3 className="font-display text-lg mb-2">Aumentar Peso</h3>
              <p className="text-sm text-muted-foreground">
                Cuando completes el rango alto de repeticiones con buena técnica, aumenta 2.5-5kg.
              </p>
            </CardContent>
          </Card>

          <Card className="gym-card">
            <CardContent className="pt-6">
              <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <span className="text-2xl font-bold text-primary">2</span>
              </div>
              <h3 className="font-display text-lg mb-2">Más Repeticiones</h3>
              <p className="text-sm text-muted-foreground">
                Si no puedes aumentar peso, añade 1-2 repeticiones por serie cada semana.
              </p>
            </CardContent>
          </Card>

          <Card className="gym-card">
            <CardContent className="pt-6">
              <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <span className="text-2xl font-bold text-primary">3</span>
              </div>
              <h3 className="font-display text-lg mb-2">Más Series</h3>
              <p className="text-sm text-muted-foreground">
                Añade 1 serie extra cada 2-3 semanas hasta alcanzar tu volumen objetivo.
              </p>
            </CardContent>
          </Card>

          <Card className="gym-card">
            <CardContent className="pt-6">
              <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <span className="text-2xl font-bold text-primary">4</span>
              </div>
              <h3 className="font-display text-lg mb-2">Mejor Técnica</h3>
              <p className="text-sm text-muted-foreground">
                Mayor control, tempo lento y rango completo = más tensión muscular efectiva.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* By Level */}
        <h2 className="font-display text-3xl mb-6 text-center tracking-wider">
          PROGRESIÓN POR <span className="text-primary">NIVEL</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {Object.entries(TRAINING_LEVELS).map(([key, level]) => (
            <Card key={key} className="gym-card">
              <CardHeader>
                <CardTitle className="font-display text-xl">{level.label}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Frecuencia</p>
                    <p className="text-sm text-muted-foreground">{level.frequency}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Target className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Volumen</p>
                    <p className="text-sm text-muted-foreground">{level.volume}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Zap className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Enfoque</p>
                    <p className="text-sm text-muted-foreground">{level.focus}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </Layout>
  );
}
