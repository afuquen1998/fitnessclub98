import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { TrendingUp, TrendingDown } from "lucide-react";

interface Assessment {
  id: string;
  body_fat_percentage: number;
  bmi: number;
  muscle_mass_percentage: number;
  visceral_fat: number;
  assessment_date: string;
  notes: string | null;
  weight_kg?: number | null;
  height_cm?: number | null;
}

interface AssessmentTableProps {
  assessments: Assessment[];
}

export function AssessmentTable({ assessments }: AssessmentTableProps) {
  const sortedAssessments = [...assessments].sort(
    (a, b) => new Date(b.assessment_date).getTime() - new Date(a.assessment_date).getTime()
  );

  const getChangeIndicator = (current: number, previous: number | undefined, inverse = false) => {
    if (!previous) return null;
    const diff = current - previous;
    if (diff === 0) return null;
    const isPositive = inverse ? diff < 0 : diff > 0;
    return (
      <span className={`inline-flex items-center ml-1 ${isPositive ? "text-green-500" : "text-red-500"}`}>
        {diff > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
      </span>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-medium">📋 Historial de Valoraciones</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead>Fecha</TableHead>
                <TableHead className="text-right">Peso (kg)</TableHead>
                <TableHead className="text-right">% Grasa</TableHead>
                <TableHead className="text-right">IMC</TableHead>
                <TableHead className="text-right">% Músculo</TableHead>
                <TableHead className="text-right">G. Visceral</TableHead>
                <TableHead className="hidden md:table-cell">Notas</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedAssessments.map((assessment, index) => {
                const prevAssessment = sortedAssessments[index + 1];

                return (
                  <TableRow key={assessment.id} className="hover:bg-muted/20">
                    <TableCell className="font-medium">
                      {format(parseISO(assessment.assessment_date), "dd MMM yyyy", { locale: es })}
                    </TableCell>
                    <TableCell className="text-right">
                      {assessment.weight_kg ?? "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="font-semibold">{assessment.body_fat_percentage}%</span>
                      {getChangeIndicator(assessment.body_fat_percentage, prevAssessment?.body_fat_percentage, true)}
                    </TableCell>
                    <TableCell className="text-right">
                      {assessment.bmi}
                      {getChangeIndicator(assessment.bmi, prevAssessment?.bmi, true)}
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="font-semibold">{assessment.muscle_mass_percentage}%</span>
                      {getChangeIndicator(assessment.muscle_mass_percentage, prevAssessment?.muscle_mass_percentage)}
                    </TableCell>
                    <TableCell className="text-right">
                      {assessment.visceral_fat}
                      {getChangeIndicator(assessment.visceral_fat, prevAssessment?.visceral_fat, true)}
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate text-muted-foreground hidden md:table-cell">
                      {assessment.notes || "-"}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
