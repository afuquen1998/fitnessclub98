import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface Assessment {
  id: string;
  body_fat_percentage: number;
  bmi: number;
  muscle_mass_percentage: number;
  visceral_fat: number;
  assessment_date: string;
  weight_kg?: number | null;
  height_cm?: number | null;
}

interface AssessmentComparisonTableProps {
  assessments: Assessment[];
}

export function AssessmentComparisonTable({ assessments }: AssessmentComparisonTableProps) {
  // Sort by date ascending for comparison (oldest to newest)
  const sortedAssessments = [...assessments].sort(
    (a, b) => new Date(a.assessment_date).getTime() - new Date(b.assessment_date).getTime()
  );

  if (sortedAssessments.length < 2) {
    return null;
  }

  const metrics = [
    { 
      key: "weight_kg", 
      label: "Peso (kg)", 
      inverse: false, // Lower is not always better for weight
      neutral: true 
    },
    { 
      key: "bmi", 
      label: "IMC", 
      inverse: true // Lower BMI is generally better (within healthy range)
    },
    { 
      key: "body_fat_percentage", 
      label: "% Grasa Corporal", 
      inverse: true // Lower body fat is better
    },
    { 
      key: "muscle_mass_percentage", 
      label: "% Masa Muscular", 
      inverse: false // Higher muscle mass is better
    },
    { 
      key: "visceral_fat", 
      label: "Grasa Visceral", 
      inverse: true // Lower visceral fat is better
    },
  ];

  const getChangeIndicator = (current: number | null | undefined, previous: number | null | undefined, inverse: boolean, neutral?: boolean) => {
    if (current == null || previous == null) return { icon: null, className: "metric-neutral" };
    
    const diff = current - previous;
    if (diff === 0) return { icon: <Minus className="h-4 w-4" />, className: "metric-neutral" };
    
    if (neutral) {
      return { 
        icon: diff > 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />, 
        className: "metric-neutral" 
      };
    }
    
    const isPositive = inverse ? diff < 0 : diff > 0;
    return {
      icon: diff > 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />,
      className: isPositive ? "metric-positive" : "metric-negative"
    };
  };

  const getValue = (assessment: Assessment, key: string): number | null | undefined => {
    return assessment[key as keyof Assessment] as number | null | undefined;
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-secondary/50">
        <CardTitle className="font-display text-xl flex items-center gap-2">
          📊 Comparativa de Valoraciones
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead className="font-medium sticky left-0 bg-card z-10">Métrica</TableHead>
                {sortedAssessments.map((assessment) => (
                  <TableHead key={assessment.id} className="text-center min-w-[120px]">
                    {format(parseISO(assessment.assessment_date), "dd MMM yyyy", { locale: es })}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {metrics.map((metric) => (
                <TableRow key={metric.key} className="hover:bg-muted/20">
                  <TableCell className="font-medium sticky left-0 bg-card z-10">
                    {metric.label}
                  </TableCell>
                  {sortedAssessments.map((assessment, index) => {
                    const value = getValue(assessment, metric.key);
                    const prevValue = index > 0 ? getValue(sortedAssessments[index - 1], metric.key) : null;
                    const { icon, className } = getChangeIndicator(value, prevValue, metric.inverse, metric.neutral);
                    
                    return (
                      <TableCell key={assessment.id} className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <span className="font-semibold">
                            {value != null ? value.toFixed(1) : "-"}
                          </span>
                          {index > 0 && icon && (
                            <span className={className}>{icon}</span>
                          )}
                        </div>
                        {index > 0 && value != null && prevValue != null && (
                          <span className={`text-xs ${className}`}>
                            {(value - prevValue) > 0 ? "+" : ""}{(value - prevValue).toFixed(1)}
                          </span>
                        )}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}