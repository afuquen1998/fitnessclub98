import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileDown, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import jsPDF from "jspdf";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";

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

interface GymMember {
  id: string;
  document_number: string;
  full_name: string;
  age: number;
  sex?: string | null;
  weight_kg?: number | null;
  height_cm?: number | null;
}

interface AssessmentPdfExportProps {
  member: GymMember;
  assessments: Assessment[];
}

export function AssessmentPdfExport({ member, assessments }: AssessmentPdfExportProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const generatePdf = async () => {
    setIsGenerating(true);

    try {
      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 20;
      let yPos = margin;

      // Colors
      const primaryColor: [number, number, number] = [220, 38, 38]; // Red
      const darkColor: [number, number, number] = [23, 23, 23];
      const grayColor: [number, number, number] = [100, 100, 100];

      // Header background
      pdf.setFillColor(23, 23, 23);
      pdf.rect(0, 0, pageWidth, 50, "F");

      // Header accent bar
      pdf.setFillColor(...primaryColor);
      pdf.rect(0, 50, pageWidth, 3, "F");

      // Title
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(24);
      pdf.setFont("helvetica", "bold");
      pdf.text("HISTORIAL DE VALORACIONES", pageWidth / 2, 25, { align: "center" });

      pdf.setFontSize(12);
      pdf.setFont("helvetica", "normal");
      pdf.text("Reporte de Composición Corporal", pageWidth / 2, 35, { align: "center" });

      yPos = 65;

      // Member info section
      pdf.setFillColor(245, 245, 245);
      pdf.roundedRect(margin, yPos, pageWidth - 2 * margin, 40, 3, 3, "F");

      pdf.setTextColor(...darkColor);
      pdf.setFontSize(16);
      pdf.setFont("helvetica", "bold");
      pdf.text(member.full_name.toUpperCase(), margin + 10, yPos + 12);

      pdf.setFontSize(10);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(...grayColor);
      pdf.text(`Documento: ${member.document_number}`, margin + 10, yPos + 22);

      const memberInfo = [
        `Edad: ${member.age} años`,
        member.sex ? `Sexo: ${member.sex === 'masculino' ? 'Masculino' : 'Femenino'}` : null,
        member.height_cm ? `Altura: ${member.height_cm} cm` : null,
      ].filter(Boolean);
      pdf.text(memberInfo.join("  |  "), margin + 10, yPos + 32);

      // Date
      pdf.setTextColor(...primaryColor);
      pdf.setFontSize(10);
      pdf.text(
        `Generado: ${format(new Date(), "dd/MM/yyyy HH:mm", { locale: es })}`,
        pageWidth - margin - 10,
        yPos + 12,
        { align: "right" }
      );

      yPos += 55;

      // Progress summary if more than 1 assessment
      if (assessments.length > 1) {
        const first = assessments[0];
        const last = assessments[assessments.length - 1];

        pdf.setFillColor(...primaryColor);
        pdf.rect(margin, yPos, pageWidth - 2 * margin, 8, "F");
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(11);
        pdf.setFont("helvetica", "bold");
        pdf.text("RESUMEN DE PROGRESO", margin + 5, yPos + 6);

        yPos += 12;

        const changes = [
          {
            label: "Peso",
            first: first.weight_kg,
            last: last.weight_kg,
            unit: "kg",
            inverse: false,
          },
          {
            label: "% Grasa",
            first: first.body_fat_percentage,
            last: last.body_fat_percentage,
            unit: "%",
            inverse: true,
          },
          {
            label: "% Músculo",
            first: first.muscle_mass_percentage,
            last: last.muscle_mass_percentage,
            unit: "%",
            inverse: false,
          },
          {
            label: "G. Visceral",
            first: first.visceral_fat,
            last: last.visceral_fat,
            unit: "",
            inverse: true,
          },
        ];

        const colWidth = (pageWidth - 2 * margin) / changes.length;

        changes.forEach((change, i) => {
          const x = margin + i * colWidth;
          
          if (change.first != null && change.last != null) {
            const diff = change.last - change.first;
            const isPositive = change.inverse ? diff < 0 : diff > 0;

            pdf.setFillColor(250, 250, 250);
            pdf.roundedRect(x + 2, yPos, colWidth - 4, 35, 2, 2, "F");

            pdf.setTextColor(...grayColor);
            pdf.setFontSize(9);
            pdf.setFont("helvetica", "normal");
            pdf.text(change.label, x + colWidth / 2, yPos + 8, { align: "center" });

            pdf.setTextColor(...darkColor);
            pdf.setFontSize(14);
            pdf.setFont("helvetica", "bold");
            pdf.text(
              `${change.last.toFixed(1)}${change.unit}`,
              x + colWidth / 2,
              yPos + 20,
              { align: "center" }
            );

            const diffText = `${diff > 0 ? "+" : ""}${diff.toFixed(1)}`;
            pdf.setTextColor(isPositive ? 34 : 220, isPositive ? 197 : 38, isPositive ? 94 : 38);
            pdf.setFontSize(10);
            pdf.text(diffText, x + colWidth / 2, yPos + 30, { align: "center" });
          }
        });

        yPos += 45;
      }

      // Assessment history table
      pdf.setFillColor(...primaryColor);
      pdf.rect(margin, yPos, pageWidth - 2 * margin, 8, "F");
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(11);
      pdf.setFont("helvetica", "bold");
      pdf.text("HISTORIAL COMPLETO", margin + 5, yPos + 6);

      yPos += 12;

      // Table header
      const cols = ["Fecha", "Peso", "IMC", "% Grasa", "% Músculo", "G. Visceral"];
      const colWidths = [35, 25, 20, 25, 28, 27];
      let xPos = margin;

      pdf.setFillColor(240, 240, 240);
      pdf.rect(margin, yPos, pageWidth - 2 * margin, 8, "F");

      pdf.setTextColor(...darkColor);
      pdf.setFontSize(9);
      pdf.setFont("helvetica", "bold");

      cols.forEach((col, i) => {
        pdf.text(col, xPos + 2, yPos + 6);
        xPos += colWidths[i];
      });

      yPos += 10;

      // Table rows
      const sortedAssessments = [...assessments].sort(
        (a, b) => new Date(b.assessment_date).getTime() - new Date(a.assessment_date).getTime()
      );

      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(9);

      sortedAssessments.forEach((assessment, index) => {
        if (yPos > pageHeight - 30) {
          pdf.addPage();
          yPos = margin;
        }

        if (index % 2 === 0) {
          pdf.setFillColor(250, 250, 250);
          pdf.rect(margin, yPos - 2, pageWidth - 2 * margin, 8, "F");
        }

        xPos = margin;
        pdf.setTextColor(...darkColor);

        const rowData = [
          format(parseISO(assessment.assessment_date), "dd/MM/yyyy"),
          assessment.weight_kg ? `${assessment.weight_kg} kg` : "-",
          assessment.bmi.toFixed(1),
          `${assessment.body_fat_percentage}%`,
          `${assessment.muscle_mass_percentage}%`,
          assessment.visceral_fat.toString(),
        ];

        rowData.forEach((data, i) => {
          pdf.text(data, xPos + 2, yPos + 4);
          xPos += colWidths[i];
        });

        yPos += 8;
      });

      // Footer
      yPos = pageHeight - 15;
      pdf.setDrawColor(...primaryColor);
      pdf.line(margin, yPos - 5, pageWidth - margin, yPos - 5);

      pdf.setTextColor(...grayColor);
      pdf.setFontSize(8);
      pdf.text(
        "Este documento es generado automáticamente. Para más información, contacta al gimnasio.",
        pageWidth / 2,
        yPos,
        { align: "center" }
      );

      // Save PDF
      const fileName = `valoraciones_${member.document_number}_${format(new Date(), "yyyyMMdd")}.pdf`;
      pdf.save(fileName);

      toast({
        title: "PDF Generado",
        description: "El historial de valoraciones se ha descargado correctamente.",
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({
        title: "Error",
        description: "No se pudo generar el PDF. Intenta de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  if (assessments.length === 0) return null;

  return (
    <Button
      onClick={generatePdf}
      disabled={isGenerating}
      variant="outline"
      className="gap-2"
    >
      {isGenerating ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Generando PDF...
        </>
      ) : (
        <>
          <FileDown className="h-4 w-4" />
          Descargar PDF
        </>
      )}
    </Button>
  );
}
