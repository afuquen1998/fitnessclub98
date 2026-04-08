import { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, ShieldAlert, LogIn } from "lucide-react";

type Permission = 'view_routines' | 'create_routines' | 'view_assessments' | 'create_assessments';

interface RequirePermissionProps {
  children: ReactNode;
  permission: Permission;
  fallbackMessage?: string;
}

export function RequirePermission({ 
  children, 
  permission, 
  fallbackMessage = "No tienes permisos para acceder a esta sección." 
}: RequirePermissionProps) {
  const { user, isLoading, hasPermission } = useAuth();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <Card className="max-w-md mx-auto mt-8">
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <LogIn className="h-8 w-8 text-primary" />
          </div>
          <h2 className="font-display text-2xl mb-3">Inicia Sesión</h2>
          <p className="text-muted-foreground mb-6">
            Necesitas iniciar sesión para acceder a esta sección.
          </p>
          <Button onClick={() => navigate("/login")} className="w-full">
            <LogIn className="h-4 w-4 mr-2" />
            Ir al Login
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!hasPermission(permission)) {
    return (
      <Card className="max-w-md mx-auto mt-8">
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
            <ShieldAlert className="h-8 w-8 text-destructive" />
          </div>
          <h2 className="font-display text-2xl mb-3">Acceso Denegado</h2>
          <p className="text-muted-foreground mb-6">
            {fallbackMessage}
          </p>
          <Button variant="outline" onClick={() => navigate("/")}>
            Volver al Inicio
          </Button>
        </CardContent>
      </Card>
    );
  }

  return <>{children}</>;
}
