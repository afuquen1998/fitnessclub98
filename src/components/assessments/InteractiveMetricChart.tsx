import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { Scale, Percent, Activity, HeartPulse, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface AssessmentData {
  id: string;
  body_fat_percentage: number;
  bmi: number;
  muscle_mass_percentage: number;
  visceral_fat: number;
  assessment_date: string;
  weight_kg?: number | null;
}

interface InteractiveMetricChartProps {
  data: AssessmentData[];
}

type MetricKey = "weight_kg" | "body_fat_percentage" | "muscle_mass_percentage" | "visceral_fat";

interface MetricConfig {
  key: MetricKey;
  label: string;
  shortLabel: string;
  unit: string;
  color: string;
  gradientFrom: string;
  gradientTo: string;
  icon: React.ComponentType<{ className?: string }>;
  inverse: boolean; // true = lower is better
}

const metrics: MetricConfig[] = [
  {
    key: "weight_kg",
    label: "Peso",
    shortLabel: "Peso",
    unit: " kg",
    color: "hsl(var(--primary))",
    gradientFrom: "hsl(var(--primary) / 0.3)",
    gradientTo: "hsl(var(--primary) / 0.05)",
    icon: Scale,
    inverse: false,
  },
  {
    key: "body_fat_percentage",
    label: "% Grasa Corporal",
    shortLabel: "% Grasa",
    unit: "%",
    color: "#ef4444",
    gradientFrom: "rgba(239, 68, 68, 0.3)",
    gradientTo: "rgba(239, 68, 68, 0.05)",
    icon: Percent,
    inverse: true,
  },
  {
    key: "muscle_mass_percentage",
    label: "% Masa Muscular",
    shortLabel: "% Músculo",
    unit: "%",
    color: "#22c55e",
    gradientFrom: "rgba(34, 197, 94, 0.3)",
    gradientTo: "rgba(34, 197, 94, 0.05)",
    icon: Activity,
    inverse: false,
  },
  {
    key: "visceral_fat",
    label: "Grasa Visceral",
    shortLabel: "G. Visceral",
    unit: "",
    color: "#f59e0b",
    gradientFrom: "rgba(245, 158, 11, 0.3)",
    gradientTo: "rgba(245, 158, 11, 0.05)",
    icon: HeartPulse,
    inverse: true,
  },
];

export function InteractiveMetricChart({ data }: InteractiveMetricChartProps) {
  const [selectedMetric, setSelectedMetric] = useState<MetricKey>("weight_kg");

  const currentMetric = metrics.find((m) => m.key === selectedMetric)!;

  const chartData = data.map((item) => ({
    date: format(parseISO(item.assessment_date), "dd MMM", { locale: es }),
    value: item[selectedMetric] != null ? Number(item[selectedMetric]) : null,
    fullDate: format(parseISO(item.assessment_date), "dd 'de' MMMM, yyyy", { locale: es }),
  })).filter((d) => d.value !== null);

  const values = chartData.map((d) => d.value as number);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const padding = (maxValue - minValue) * 0.15 || 1;

  // Calculate change
  const firstValue = chartData.length > 0 ? chartData[0].value : null;
  const lastValue = chartData.length > 0 ? chartData[chartData.length - 1].value : null;
  const totalChange = firstValue !== null && lastValue !== null ? lastValue - firstValue : null;
  const percentChange = firstValue !== null && lastValue !== null && firstValue !== 0 
    ? ((lastValue - firstValue) / firstValue) * 100 
    : null;

  // Determine if change is positive (good)
  const isPositiveChange = totalChange !== null 
    ? (currentMetric.inverse ? totalChange < 0 : totalChange > 0)
    : null;

  return (
    <Card className="overflow-hidden border-0 shadow-xl bg-gradient-to-br from-card to-card/80">
      <CardHeader className="pb-2 border-b border-border/50">
        <div className="flex flex-col gap-4">
          <CardTitle className="font-display text-xl tracking-wide flex items-center gap-2">
            📈 Progreso de Métricas
          </CardTitle>
          
          {/* Metric Toggle Buttons */}
          <div className="flex flex-wrap gap-2">
            {metrics.map((metric) => {
              const Icon = metric.icon;
              const isSelected = selectedMetric === metric.key;
              return (
                <Button
                  key={metric.key}
                  variant={isSelected ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedMetric(metric.key)}
                  className={cn(
                    "gap-2 transition-all duration-200",
                    isSelected && "shadow-lg scale-105"
                  )}
                  style={{
                    backgroundColor: isSelected ? metric.color : undefined,
                    borderColor: isSelected ? metric.color : undefined,
                  }}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{metric.shortLabel}</span>
                </Button>
              );
            })}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-6">
        {/* Current Value Display */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-sm text-muted-foreground">{currentMetric.label} Actual</p>
            <p className="text-4xl font-bold" style={{ color: currentMetric.color }}>
              {lastValue?.toFixed(1)}{currentMetric.unit}
            </p>
          </div>
          
          {totalChange !== null && chartData.length >= 2 && (
            <div className={cn(
              "flex flex-col items-end px-4 py-2 rounded-xl",
              isPositiveChange ? "bg-green-500/10" : "bg-red-500/10"
            )}>
              <div className={cn(
                "flex items-center gap-1 text-lg font-bold",
                isPositiveChange ? "text-green-500" : "text-red-500"
              )}>
                {isPositiveChange ? (
                  <TrendingUp className="h-5 w-5" />
                ) : (
                  <TrendingDown className="h-5 w-5" />
                )}
                <span>
                  {totalChange > 0 ? "+" : ""}{totalChange.toFixed(1)}{currentMetric.unit}
                </span>
              </div>
              {percentChange !== null && (
                <p className={cn(
                  "text-xs",
                  isPositiveChange ? "text-green-500/70" : "text-red-500/70"
                )}>
                  {percentChange > 0 ? "+" : ""}{percentChange.toFixed(1)}% desde inicio
                </p>
              )}
            </div>
          )}
        </div>

        {/* Chart */}
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
              <defs>
                <linearGradient id={`gradient-${selectedMetric}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={currentMetric.gradientFrom} />
                  <stop offset="100%" stopColor={currentMetric.gradientTo} />
                </linearGradient>
              </defs>
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="hsl(var(--border))" 
                opacity={0.5}
                vertical={false}
              />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                tickLine={false}
                axisLine={{ stroke: "hsl(var(--border))" }}
                dy={10}
              />
              <YAxis
                domain={[minValue - padding, maxValue + padding]}
                tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value.toFixed(0)}${currentMetric.unit}`}
                width={60}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "0.75rem",
                  boxShadow: "0 10px 40px -10px rgba(0,0,0,0.3)",
                }}
                labelStyle={{ color: "hsl(var(--foreground))", fontWeight: "bold" }}
                formatter={(value: number) => [
                  <span style={{ color: currentMetric.color, fontWeight: "bold" }}>
                    {value.toFixed(1)}{currentMetric.unit}
                  </span>,
                  currentMetric.label,
                ]}
                labelFormatter={(_, payload) => payload[0]?.payload?.fullDate || ""}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke={currentMetric.color}
                strokeWidth={3}
                fill={`url(#gradient-${selectedMetric})`}
                dot={{ fill: currentMetric.color, strokeWidth: 2, r: 5, stroke: "hsl(var(--card))" }}
                activeDot={{ r: 8, stroke: currentMetric.color, strokeWidth: 3, fill: "hsl(var(--card))" }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Stats Summary */}
        {chartData.length >= 2 && (
          <div className="mt-6 pt-4 border-t border-border/50 grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-xs text-muted-foreground">Mínimo</p>
              <p className="font-bold text-lg">{minValue.toFixed(1)}{currentMetric.unit}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Promedio</p>
              <p className="font-bold text-lg">
                {(values.reduce((a, b) => a + b, 0) / values.length).toFixed(1)}{currentMetric.unit}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Máximo</p>
              <p className="font-bold text-lg">{maxValue.toFixed(1)}{currentMetric.unit}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
