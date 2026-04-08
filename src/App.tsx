import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Valoraciones from "./pages/Valoraciones";
import Rutinas from "./pages/Rutinas";
import Nutricion from "./pages/Nutricion";
import Progreso from "./pages/Progreso";
import Admin from "./pages/Admin";
import GestionUsuarios from "./pages/GestionUsuarios";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/valoraciones" element={<Valoraciones />} />
            <Route path="/rutinas" element={<Rutinas />} />
            <Route path="/nutricion" element={<Nutricion />} />
            <Route path="/progreso" element={<Progreso />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/gestion-usuarios" element={<GestionUsuarios />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
