import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, ShieldAlert, Users, Image } from "lucide-react";
import { AdminAssessments } from "@/components/admin/AdminAssessments";
import { ExerciseImageManager } from "@/components/admin/ExerciseImageManager";

export default function Admin() {
  const { user, isLoading, isStaff } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("members");

  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/login");
    }
  }, [user, isLoading, navigate]);

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!isStaff) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20">
          <Card className="max-w-md mx-auto">
            <CardContent className="p-6 text-center">
              <ShieldAlert className="h-12 w-12 text-destructive mx-auto mb-4" />
              <h2 className="font-display text-2xl mb-2">Acceso Denegado</h2>
              <p className="text-muted-foreground">
                No tienes permisos para acceder a esta sección. 
                Contacta al administrador si crees que esto es un error.
              </p>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="font-display text-4xl md:text-5xl mb-4 tracking-wider">
            PANEL DE <span className="text-primary">ADMINISTRACIÓN</span>
          </h1>
          <p className="text-muted-foreground text-lg">
            Gestiona los miembros del gimnasio y el repositorio de imágenes.
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
            <TabsTrigger value="members" className="gap-2">
              <Users className="h-4 w-4" />
              Miembros
            </TabsTrigger>
            <TabsTrigger value="images" className="gap-2">
              <Image className="h-4 w-4" />
              Imágenes
            </TabsTrigger>
          </TabsList>

          <TabsContent value="members">
            <AdminAssessments />
          </TabsContent>

          <TabsContent value="images">
            <ExerciseImageManager />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
