import { Card, CardContent } from "@/components/ui/card";
import { Scale, Percent, Activity, HeartPulse, TrendingUp, TrendingDown, Minus, Ruler } from "lucide-react";
import { cn } from "@/lib/utils";

interface Assessment {
  body_fat_percentage: number;
  bmi: number;
  muscle_mass_percentage: number;
  visceral_fat: number;
  weight_kg?: number | null;
  height_cm?: number | null;
}

interface ProgressIndicatorCardsProps {
  currentAssessment: Assessment;
  previousAssessment?: Assessment | null;
}

interface MetricCardData {
  label: string;
  currentKey: keyof Assessment;
  icon: React.ComponentType<{ className?: string }>;
  unit: string;
  color: string;
  bgColor: string;
  inverse: boolean; // true = lower is better
}

const metricsConfig: MetricCardData[] = [
  {
    label: "Peso",
    currentKey: "weight_kg",
    icon: Scale,
    unit: " kg",
    color: "text-primary",
    bgColor: "bg-primary/10",
    inverse: false, // neutral - depends on goal
  },
  {
    label: "IMC",
    currentKey: "bmi",
    icon: Activity,
    unit: "",
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    inverse: true,
  },
  {
    label: "% Grasa",
    currentKey: "body_fat_percentage",
    icon: Percent,
    unit: "%",
    color: "text-red-500",
    bgColor: "bg-red-500/10",
    inverse: true,
  },
  {
    label: "% Músculo",
    currentKey: "muscle_mass_percentage",
    icon: Ruler,
    unit: "%",
    color: "text-green-500",
    bgColor: "bg-green-500/10",
    inverse: false,
  },
  {
    label: "G. Visceral",
    currentKey: "visceral_fat",
    icon: HeartPulse,
    unit: "",
    color: "text-amber-500",
    bgColor: "bg-amber-500/10",
    inverse: true,
  },
];

export function ProgressIndicatorCards({ currentAssessment, previousAssessment }: ProgressIndicatorCardsProps) {
  const getChangeData = (current: number | null | undefined, previous: number | null | undefined, inverse: boolean) => {
    if (current == null || previous == null) {
      return { diff: null, isPositive: null, percentChange: null };
    }
    
    const diff = current - previous;
    if (diff === 0) {
      return { diff: 0, isPositive: null, percentChange: 0 };
    }
    
    const isPositive = inverse ? diff < 0 : diff > 0;
    const percentChange = previous !== 0 ? (diff / previous) * 100 : 0;
    
    return { diff, isPositive, percentChange };
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
      {metricsConfig.map((metric) => {
        const Icon = metric.icon;
        const currentValue = currentAssessment[metric.currentKey] as number | null | undefined;
        const previousValue = previousAssessment?.[metric.currentKey] as number | null | undefined;
        const { diff, isPositive, percentChange } = getChangeData(currentValue, previousValue, metric.inverse);

        if (currentValue == null) return null;

        return (
          <Card 
            key={metric.currentKey} 
            className={cn(
              "overflow-hidden border-0 shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl",
              metric.bgColor
            )}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Icon className={cn("h-5 w-5", metric.color)} />
                {diff !== null && diff !== 0 && (
                  <div className={cn(
                    "flex items-center gap-0.5 text-xs font-medium px-2 py-0.5 rounded-full",
                    isPositive 
                      ? "bg-green-500/20 text-green-500" 
                      : "bg-red-500/20 text-red-500"
                  )}>
                    {isPositive ? (
                      <TrendingUp className="h-3 w-3" />
                    ) : (
                      <TrendingDown className="h-3 w-3" />
                    )}
                    <span>
                      {diff > 0 ? "+" : ""}{diff.toFixed(1)}
                    </span>
                  </div>
                )}
                {diff === 0 && (
                  <div className="flex items-center gap-0.5 text-xs font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                    <Minus className="h-3 w-3" />
                    <span>0</span>
                  </div>
                )}
              </div>
              
              <p className={cn("text-2xl font-bold", metric.color)}>
                {currentValue.toFixed(1)}{metric.unit}
              </p>
              <p className="text-xs text-muted-foreground mt-1">{metric.label}</p>
              
              {percentChange !== null && percentChange !== 0 && (
                <p className={cn(
                  "text-[10px] mt-1",
                  isPositive ? "text-green-500" : "text-red-500"
                )}>
                  {percentChange > 0 ? "+" : ""}{percentChange.toFixed(1)}% vs anterior
                </p>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
