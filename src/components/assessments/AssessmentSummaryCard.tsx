import { Card, CardContent } from "@/components/ui/card";
import { Scale, Ruler, Percent, Activity, HeartPulse } from "lucide-react";

interface Assessment {
  body_fat_percentage: number;
  bmi: number;
  muscle_mass_percentage: number;
  visceral_fat: number;
  weight_kg?: number | null;
  height_cm?: number | null;
}

interface AssessmentSummaryCardProps {
  assessment: Assessment;
  memberName?: string;
}

export function AssessmentSummaryCard({ assessment, memberName }: AssessmentSummaryCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="flex flex-col md:flex-row">
          {/* Silhouette Section */}
          <div className="bg-gradient-to-b from-primary/20 to-secondary p-6 flex items-center justify-center md:w-48">
            <div className="relative">
              {/* Simple body silhouette using SVG */}
              <svg
                viewBox="0 0 100 180"
                className="w-24 h-40 text-primary/60"
                fill="currentColor"
              >
                {/* Head */}
                <circle cx="50" cy="20" r="16" />
                {/* Neck */}
                <rect x="44" y="36" width="12" height="10" />
                {/* Torso */}
                <path d="M30 46 Q50 42 70 46 L75 100 Q50 105 25 100 Z" />
                {/* Left arm */}
                <path d="M30 48 L20 75 L22 80 L32 58" />
                {/* Right arm */}
                <path d="M70 48 L80 75 L78 80 L68 58" />
                {/* Left leg */}
                <path d="M35 100 L30 150 L38 150 L45 105" />
                {/* Right leg */}
                <path d="M65 100 L70 150 L62 150 L55 105" />
                {/* Feet */}
                <ellipse cx="34" cy="155" rx="8" ry="4" />
                <ellipse cx="66" cy="155" rx="8" ry="4" />
              </svg>
              
              {/* Glow effect */}
              <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
            </div>
          </div>

          {/* Metrics Grid */}
          <div className="flex-1 p-4">
            {memberName && (
              <h3 className="font-display text-lg text-primary mb-3">
                Última Valoración de {memberName}
              </h3>
            )}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {assessment.weight_kg && (
                <div className="bg-secondary/50 rounded-lg p-3 text-center">
                  <Scale className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                  <p className="text-lg font-bold">{assessment.weight_kg}</p>
                  <p className="text-xs text-muted-foreground">Peso (kg)</p>
                </div>
              )}
              <div className="bg-secondary/50 rounded-lg p-3 text-center">
                <Activity className="h-5 w-5 mx-auto mb-1 text-blue-500" />
                <p className="text-lg font-bold">{assessment.bmi}</p>
                <p className="text-xs text-muted-foreground">IMC</p>
              </div>
              <div className="bg-secondary/50 rounded-lg p-3 text-center">
                <Percent className="h-5 w-5 mx-auto mb-1 text-red-500" />
                <p className="text-lg font-bold">{assessment.body_fat_percentage}%</p>
                <p className="text-xs text-muted-foreground">% Grasa</p>
              </div>
              <div className="bg-secondary/50 rounded-lg p-3 text-center">
                <Ruler className="h-5 w-5 mx-auto mb-1 text-green-500" />
                <p className="text-lg font-bold">{assessment.muscle_mass_percentage}%</p>
                <p className="text-xs text-muted-foreground">% Músculo</p>
              </div>
              <div className="bg-secondary/50 rounded-lg p-3 text-center">
                <HeartPulse className="h-5 w-5 mx-auto mb-1 text-amber-500" />
                <p className="text-lg font-bold">{assessment.visceral_fat}</p>
                <p className="text-xs text-muted-foreground">Grasa Visceral</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}