import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Layout } from "@/components/layout/Layout";
import { RequirePermission } from "@/components/auth/RequirePermission";
import { supabase } from "@/integrations/supabase/client";
import { Search, Activity, Loader2, Sparkles, ClipboardPlus } from "lucide-react";
import { InteractiveMetricChart } from "@/components/assessments/InteractiveMetricChart";
import { ProgressIndicatorCards } from "@/components/assessments/ProgressIndicatorCards";
import { PremiumSummaryHeader } from "@/components/assessments/PremiumSummaryHeader";
import { AssessmentTable } from "@/components/assessments/AssessmentTable";
import { AssessmentComparisonTable } from "@/components/assessments/AssessmentComparisonTable";
import { AssessmentEntryForm } from "@/components/assessments/AssessmentEntryForm";
import { AssessmentPdfExport } from "@/components/assessments/AssessmentPdfExport";
import { HarrisBenedictCalculator } from "@/components/nutrition/HarrisBenedictCalculator";
import { useAuth } from "@/hooks/useAuth";
interface GymMember {
  id: string;
  document_number: string;
  full_name: string;
  age: number;
  sex?: string | null;
  weight_kg?: number | null;
  height_cm?: number | null;
  birth_date?: string | null;
}

interface PhysicalAssessment {
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

export default function Valoraciones() {
  const [documentNumber, setDocumentNumber] = useState("");
  const [searchTrigger, setSearchTrigger] = useState<string | null>(null);
  const { hasPermission } = useAuth();

  const { data: member, isLoading: isLoadingMember } = useQuery({
    queryKey: ["member", searchTrigger],
    queryFn: async () => {
      if (!searchTrigger) return null;
      const { data, error } = await supabase
        .from("gym_members")
        .select("*")
        .eq("document_number", searchTrigger)
        .maybeSingle();

      if (error) throw error;
      return data as GymMember | null;
    },
    enabled: !!searchTrigger,
  });

  const { data: assessments, isLoading: isLoadingAssessments } = useQuery({
    queryKey: ["assessments", member?.id],
    queryFn: async () => {
      if (!member?.id) return [];
      const { data, error } = await supabase
        .from("physical_assessments")
        .select("*")
        .eq("member_id", member.id)
        .order("assessment_date", { ascending: true });

      if (error) throw error;
      return data as PhysicalAssessment[];
    },
    enabled: !!member?.id,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (documentNumber.trim()) {
      setSearchTrigger(documentNumber.trim());
    }
  };

  const isLoading = isLoadingMember || isLoadingAssessments;
  const latestAssessment = assessments && assessments.length > 0 
    ? assessments[assessments.length - 1] 
    : null;
  const previousAssessment = assessments && assessments.length > 1
    ? assessments[assessments.length - 2]
    : null;

  const canCreateAssessments = hasPermission('create_assessments');

  return (
    <Layout>
      <RequirePermission permission="view_assessments" fallbackMessage="No tienes permisos para acceder a las valoraciones. Contacta al administrador.">
        <div className="container mx-auto px-4 py-12">
          {/* Premium Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 mb-4 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium">
              <Sparkles className="h-4 w-4" />
              Dashboard Premium
            </div>
            <h1 className="font-display text-4xl md:text-5xl mb-4 tracking-wider">
              VALORACIONES <span className="text-primary">FÍSICAS</span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Consulta tu composición corporal y visualiza tu progreso a lo largo del tiempo.
            </p>
          </div>

          {/* Tabs: Buscar / Registrar */}
          <Tabs defaultValue="search" className="max-w-3xl mx-auto mb-12">
            <TabsList className={`grid w-full h-14 bg-secondary/50 ${canCreateAssessments ? 'grid-cols-2' : 'grid-cols-1'}`}>
              <TabsTrigger value="search" className="h-12 text-base gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Search className="h-5 w-5" />
                Buscar Valoración
              </TabsTrigger>
              {canCreateAssessments && (
                <TabsTrigger value="register" className="h-12 text-base gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  <ClipboardPlus className="h-5 w-5" />
                  Registrar Nueva
                </TabsTrigger>
              )}
            </TabsList>

            {/* Search Tab */}
            <TabsContent value="search" className="mt-6">
              <Card className="border-0 shadow-xl bg-gradient-to-br from-card to-card/90">
                <CardHeader className="text-center pb-4">
                  <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                    <Search className="h-7 w-7 text-primary" />
                  </div>
                  <CardTitle className="font-display text-xl">Buscar Valoración</CardTitle>
                  <CardDescription>
                    Ingresa tu número de documento para consultar tus datos
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSearch} className="flex gap-3">
                    <div className="flex-1">
                      <Label htmlFor="document" className="sr-only">Número de documento</Label>
                      <Input
                        id="document"
                        placeholder="Número de documento"
                        value={documentNumber}
                        onChange={(e) => setDocumentNumber(e.target.value)}
                        required
                        className="h-12 text-lg bg-secondary/30 border-0"
                      />
                    </div>
                    <Button type="submit" disabled={isLoading} size="lg" className="h-12 px-6">
                      {isLoading ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <>
                          <Search className="h-5 w-5 mr-2" />
                          Buscar
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Register Tab */}
            {canCreateAssessments && (
              <TabsContent value="register" className="mt-6">
                <AssessmentEntryForm />
              </TabsContent>
            )}
          </Tabs>

        {/* Results */}
        {searchTrigger && (
          <div className="animate-fade-in">
            {!member && !isLoadingMember ? (
              <Card className="max-w-md mx-auto border-0 shadow-xl">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                    <Activity className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="font-display text-xl mb-2">Usuario no encontrado</h3>
                  <p className="text-muted-foreground">
                    No encontramos registros con el documento "{searchTrigger}".
                    Por favor verifica el número o contacta al personal del gimnasio.
                  </p>
                </CardContent>
              </Card>
              ) : member && assessments ? (
                <div className="space-y-8">
                  {/* Premium Member Header with PDF Export */}
                  <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                    <div className="flex-1 w-full">
                      <PremiumSummaryHeader member={member} assessments={assessments} />
                    </div>
                    {assessments.length > 0 && (
                      <div className="md:absolute md:top-4 md:right-4">
                        <AssessmentPdfExport member={member} assessments={assessments} />
                      </div>
                    )}
                  </div>

                  {assessments.length > 0 ? (
                    <>
                      {/* PDF Export Button */}
                      <div className="flex justify-end">
                        <AssessmentPdfExport member={member} assessments={assessments} />
                      </div>

                      {/* Progress Indicator Cards */}
                      {latestAssessment && (
                        <ProgressIndicatorCards 
                          currentAssessment={latestAssessment}
                          previousAssessment={previousAssessment}
                        />
                      )}

                      {/* Interactive Chart with Toggle */}
                      <InteractiveMetricChart data={assessments} />

                      {/* Comparison Table (only if 2+ assessments) */}
                      <AssessmentComparisonTable assessments={assessments} />

                      {/* Historical Table */}
                      <AssessmentTable assessments={assessments} />

                      {/* Harris-Benedict Calculator */}
                      <HarrisBenedictCalculator
                        initialWeight={latestAssessment?.weight_kg || member.weight_kg || undefined}
                        initialHeight={latestAssessment?.height_cm || member.height_cm || undefined}
                        initialAge={member.age}
                        initialSex={member.sex || undefined}
                      />
                    </>
                  ) : (
                    <Card className="border-0 shadow-xl">
                      <CardContent className="p-8 text-center">
                        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                          <Activity className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <h3 className="font-display text-xl mb-2">Sin valoraciones</h3>
                        <p className="text-muted-foreground">
                          Aún no tienes valoraciones registradas. 
                          ¡Visita el gimnasio para tu primera evaluación!
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              ) : null}
            </div>
          )}
        </div>
      </RequirePermission>
    </Layout>
  );
}
