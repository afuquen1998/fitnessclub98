import { Layout } from "@/components/layout/Layout";
import { RequirePermission } from "@/components/auth/RequirePermission";
import { RoutineForm } from "@/components/routines/RoutineForm";

export default function Rutinas() {
  return (
    <Layout>
      <RequirePermission permission="view_routines" fallbackMessage="No tienes permisos para acceder a las rutinas. Contacta al administrador.">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center mb-12">
            <h1 className="font-display text-4xl md:text-5xl mb-4 tracking-wider">
              RUTINAS <span className="text-primary">PERSONALIZADAS</span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Genera tu plan de entrenamiento adaptado a tu nivel, objetivo y días disponibles.
            </p>
          </div>
          <RoutineForm />
        </div>
      </RequirePermission>
    </Layout>
  );
}
