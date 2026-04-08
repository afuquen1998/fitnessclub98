import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, Calendar, FileText, TrendingUp } from "lucide-react";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";

interface GymMember {
  id: string;
  document_number: string;
  full_name: string;
  age: number;
  sex?: string | null;
  weight_kg?: number | null;
  height_cm?: number | null;
}

interface Assessment {
  assessment_date: string;
}

interface PremiumSummaryHeaderProps {
  member: GymMember;
  assessments: Assessment[];
}

export function PremiumSummaryHeader({ member, assessments }: PremiumSummaryHeaderProps) {
  const latestDate = assessments.length > 0 
    ? assessments[assessments.length - 1].assessment_date 
    : null;

  const firstDate = assessments.length > 0 
    ? assessments[0].assessment_date 
    : null;

  return (
    <Card className="overflow-hidden border-0 shadow-2xl bg-gradient-to-r from-primary/10 via-card to-primary/5">
      <CardContent className="p-0">
        <div className="flex flex-col lg:flex-row">
          {/* Avatar / Silhouette Section */}
          <div className="relative bg-gradient-to-br from-primary to-primary/60 p-8 flex items-center justify-center lg:w-56">
            <div className="relative z-10">
              {/* Modern Avatar Circle */}
              <div className="w-24 h-24 rounded-full bg-background/20 backdrop-blur-sm flex items-center justify-center border-2 border-background/30">
                <User className="w-12 h-12 text-background" />
              </div>
              
              {/* Badge for assessments count */}
              <Badge 
                className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-background text-foreground shadow-lg"
              >
                {assessments.length} valoraciones
              </Badge>
            </div>
            
            {/* Decorative elements */}
            <div className="absolute top-4 right-4 w-20 h-20 rounded-full bg-background/10 blur-2xl" />
            <div className="absolute bottom-4 left-4 w-16 h-16 rounded-full bg-background/10 blur-xl" />
          </div>

          {/* Info Section */}
          <div className="flex-1 p-6 lg:p-8">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div>
                <h2 className="font-display text-2xl lg:text-3xl tracking-wide text-foreground">
                  {member.full_name}
                </h2>
                <p className="text-muted-foreground mt-1 flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Doc: {member.document_number}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="bg-secondary/50">
                  {member.age} años
                </Badge>
                {member.sex && (
                  <Badge variant="outline" className="bg-secondary/50">
                    {member.sex === 'masculino' ? '♂ Masculino' : '♀ Femenino'}
                  </Badge>
                )}
                {member.height_cm && (
                  <Badge variant="outline" className="bg-secondary/50">
                    {member.height_cm} cm
                  </Badge>
                )}
              </div>
            </div>

            {/* Timeline info */}
            {assessments.length > 0 && (
              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/30">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Calendar className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Primera valoración</p>
                    <p className="font-medium">
                      {firstDate && format(parseISO(firstDate), "dd MMM yyyy", { locale: es })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/30">
                  <div className="p-2 rounded-lg bg-green-500/10">
                    <TrendingUp className="h-5 w-5 text-green-500" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Última valoración</p>
                    <p className="font-medium">
                      {latestDate && format(parseISO(latestDate), "dd MMM yyyy", { locale: es })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/30">
                  <div className="p-2 rounded-lg bg-amber-500/10">
                    <FileText className="h-5 w-5 text-amber-500" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Total registros</p>
                    <p className="font-medium">{assessments.length} valoraciones</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
