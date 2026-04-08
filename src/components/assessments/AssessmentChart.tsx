import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";

interface AssessmentData {
  id: string;
  body_fat_percentage: number;
  bmi: number;
  muscle_mass_percentage: number;
  visceral_fat: number;
  assessment_date: string;
  notes: string | null;
}

interface AssessmentChartProps {
  data: AssessmentData[];
  dataKey: keyof Pick<AssessmentData, 'body_fat_percentage' | 'bmi' | 'muscle_mass_percentage' | 'visceral_fat'>;
  title: string;
  color: string;
  unit: string;
}

export function AssessmentChart({ data, dataKey, title, color, unit }: AssessmentChartProps) {
  const chartData = data.map((item) => ({
    date: format(parseISO(item.assessment_date), "dd MMM", { locale: es }),
    value: Number(item[dataKey]),
    fullDate: format(parseISO(item.assessment_date), "dd 'de' MMMM, yyyy", { locale: es }),
  }));

  const values = chartData.map((d) => d.value);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const padding = (maxValue - minValue) * 0.1 || 1;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                tickLine={false}
                axisLine={{ stroke: "hsl(var(--border))" }}
              />
              <YAxis
                domain={[minValue - padding, maxValue + padding]}
                tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                tickLine={false}
                axisLine={{ stroke: "hsl(var(--border))" }}
                tickFormatter={(value) => `${value}${unit}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "0.5rem",
                }}
                labelStyle={{ color: "hsl(var(--foreground))" }}
                formatter={(value: number) => [`${value}${unit}`, title]}
                labelFormatter={(_, payload) => payload[0]?.payload?.fullDate || ""}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke={color}
                strokeWidth={3}
                dot={{ fill: color, strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: color, strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Progress indicator */}
        {chartData.length >= 2 && (
          <div className="mt-4 pt-4 border-t border-border">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Cambio total:</span>
              <span
                className={`font-medium ${
                  chartData[chartData.length - 1].value > chartData[0].value
                    ? dataKey === "muscle_mass_percentage"
                      ? "text-green-500"
                      : "text-red-500"
                    : dataKey === "muscle_mass_percentage"
                    ? "text-red-500"
                    : "text-green-500"
                }`}
              >
                {chartData[chartData.length - 1].value > chartData[0].value ? "+" : ""}
                {(chartData[chartData.length - 1].value - chartData[0].value).toFixed(1)}
                {unit}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
