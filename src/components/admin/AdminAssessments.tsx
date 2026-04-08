import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Plus, UserPlus, Loader2, Search } from "lucide-react";
import { AssessmentForm } from "@/components/assessments/AssessmentForm";

interface GymMember {
  id: string;
  document_number: string;
  full_name: string;
  age: number;
  sex?: string | null;
  weight_kg?: number | null;
  height_cm?: number | null;
}

export function AdminAssessments() {
  const [isNewMemberOpen, setIsNewMemberOpen] = useState(false);
  const [isNewAssessmentOpen, setIsNewAssessmentOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<GymMember | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: members, isLoading } = useQuery({
    queryKey: ["admin-members"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("gym_members")
        .select("*")
        .order("full_name");
      if (error) throw error;
      return data as GymMember[];
    },
  });

  const filteredMembers = members?.filter((member) =>
    member.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.document_number.includes(searchQuery)
  );

  const createMember = useMutation({
    mutationFn: async (data: { 
      document_number: string; 
      full_name: string; 
      age: number;
      sex?: string;
      weight_kg?: number;
      height_cm?: number;
    }) => {
      const { error } = await supabase.from("gym_members").insert(data);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-members"] });
      toast({ title: "Miembro creado exitosamente" });
      setIsNewMemberOpen(false);
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const createAssessment = useMutation({
    mutationFn: async (data: {
      member_id: string;
      body_fat_percentage: number;
      bmi: number;
      muscle_mass_percentage: number;
      visceral_fat: number;
      weight_kg?: number;
      height_cm?: number;
      notes?: string;
    }) => {
      const { error } = await supabase.from("physical_assessments").insert({
        ...data,
        created_by: user?.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-members"] });
      toast({ title: "Valoración registrada exitosamente" });
      setIsNewAssessmentOpen(false);
      setSelectedMember(null);
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const handleNewMember = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    createMember.mutate({
      document_number: formData.get("document") as string,
      full_name: formData.get("name") as string,
      age: parseInt(formData.get("age") as string),
      sex: formData.get("sex") as string || undefined,
      weight_kg: formData.get("weight") ? parseFloat(formData.get("weight") as string) : undefined,
      height_cm: formData.get("height") ? parseFloat(formData.get("height") as string) : undefined,
    });
  };

  const handleNewAssessment = (data: {
    weight_kg: number;
    height_cm: number;
    body_fat_percentage: number;
    bmi: number;
    muscle_mass_percentage: number;
    visceral_fat: number;
    notes?: string;
  }) => {
    if (!selectedMember) return;
    createAssessment.mutate({
      member_id: selectedMember.id,
      ...data,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="font-display text-2xl">Miembros del Gimnasio</h2>
        
        <div className="flex gap-2 w-full md:w-auto">
          {/* Search */}
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre o documento..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          
          {/* New Member Dialog */}
          <Dialog open={isNewMemberOpen} onOpenChange={setIsNewMemberOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Nuevo Miembro</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Registrar Nuevo Miembro</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleNewMember} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <Label htmlFor="document">Número de Documento</Label>
                    <Input id="document" name="document" required />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="name">Nombre Completo</Label>
                    <Input id="name" name="name" required />
                  </div>
                  <div>
                    <Label htmlFor="age">Edad</Label>
                    <Input id="age" name="age" type="number" min="10" max="100" required />
                  </div>
                  <div>
                    <Label htmlFor="sex">Sexo</Label>
                    <Select name="sex">
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="masculino">Masculino</SelectItem>
                        <SelectItem value="femenino">Femenino</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="weight">Peso (kg)</Label>
                    <Input id="weight" name="weight" type="number" step="0.1" placeholder="70.5" />
                  </div>
                  <div>
                    <Label htmlFor="height">Estatura (cm)</Label>
                    <Input id="height" name="height" type="number" placeholder="170" />
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={createMember.isPending}>
                  {createMember.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Registrar
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMembers?.map((member) => (
            <Card key={member.id} className="gym-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">{member.full_name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground mb-4 space-y-1">
                  <p>📄 Doc: {member.document_number}</p>
                  <p>🎂 Edad: {member.age} años</p>
                  {member.sex && <p>👤 Sexo: {member.sex === 'masculino' ? 'Masculino' : 'Femenino'}</p>}
                  {member.weight_kg && <p>⚖️ Peso: {member.weight_kg} kg</p>}
                  {member.height_cm && <p>📏 Estatura: {member.height_cm} cm</p>}
                </div>
                
                <Dialog
                  open={isNewAssessmentOpen && selectedMember?.id === member.id}
                  onOpenChange={(open) => {
                    setIsNewAssessmentOpen(open);
                    if (!open) setSelectedMember(null);
                  }}
                >
                  <DialogTrigger asChild>
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full"
                      onClick={() => setSelectedMember(member)}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Nueva Valoración
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-lg">
                    <AssessmentForm
                      memberName={member.full_name}
                      onSubmit={handleNewAssessment}
                      isLoading={createAssessment.isPending}
                      initialWeight={member.weight_kg || undefined}
                      initialHeight={member.height_cm || undefined}
                    />
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {filteredMembers?.length === 0 && !isLoading && (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">
              No se encontraron miembros. {searchQuery && "Intenta con otro término de búsqueda."}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}