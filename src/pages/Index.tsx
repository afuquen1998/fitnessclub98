import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Activity,
  Dumbbell,
  Utensils,
  TrendingUp,
  ChevronRight,
  MessageCircle,
  Instagram,
  MapPin,
  Clock,
  Star,
  Heart,
  Shield,
  Zap,
  Users,
  Headphones,
  Bike,
  ShowerHead,
  Lock,
  BadgePercent,
  MonitorSmartphone,
} from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { SOCIAL_LINKS } from "@/lib/constants";
import logo from "@/assets/logo.jpg";

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
    </svg>
  );
}

const services = [
  {
    icon: Users,
    title: "Entrenador de Planta",
    description: "Profesionales siempre disponibles para guiarte en cada ejercicio.",
  },
  {
    icon: Bike,
    title: "+30 Máquinas de Cardio",
    description: "Trotadoras, elípticas y más equipos de última generación.",
  },
  {
    icon: Dumbbell,
    title: "Zona de Pesos Libres",
    description: "Máquinas guiadas y pesos libres con maquinaria moderna.",
  },
  {
    icon: ShowerHead,
    title: "Duchas y Lockers",
    description: "Instalaciones seguras y limpias para tu comodidad.",
  },
  {
    icon: Zap,
    title: "Clases Grupales",
    description: "Sesiones dinámicas de spinning, funcional y más.",
  },
  {
    icon: MonitorSmartphone,
    title: "Seguimiento Tecnológico",
    description: "Monitoreo de tu progreso con nuestra plataforma digital.",
  },
  {
    icon: Headphones,
    title: "Asesoría Nutricional 24/7",
    description: "Guía alimentaria personalizada cuando la necesites.",
  },
  {
    icon: BadgePercent,
    title: "Descuentos Exclusivos",
    description: "Beneficios en comercios aliados por ser parte de 98 Fitness.",
  },
];

const approaches = [
  {
    icon: TrendingUp,
    title: "Pérdida de Peso",
    description: "Protocolos efectivos de entrenamiento y nutrición diseñados para quemar grasa de manera sostenible y saludable.",
    color: "from-red-600 to-red-800",
  },
  {
    icon: Dumbbell,
    title: "Aumento de Masa Muscular",
    description: "Programas de hipertrofia con técnica correcta, sobrecarga progresiva y el equipo adecuado para maximizar tu crecimiento.",
    color: "from-primary to-red-700",
  },
  {
    icon: Heart,
    title: "Salud y Recuperación",
    description: "Bienestar integral, movilidad y longevidad. Entrena para sentirte mejor cada día de tu vida.",
    color: "from-red-700 to-red-900",
  },
];

const testimonials = [
  {
    name: "Carolina M.",
    text: "Llevo 6 meses en 98 Fitness y el cambio ha sido increíble. Las máquinas son de primera y los entrenadores siempre están pendientes de corregir tu técnica.",
    stars: 5,
  },
  {
    name: "Andrés G.",
    text: "El mejor gimnasio de Soacha sin duda. El ambiente es brutal, la gente te motiva y el seguimiento con la app es un plus que no encuentras en otro lado.",
    stars: 5,
  },
  {
    name: "Laura P.",
    text: "Pasé de no hacer ejercicio a no poder dejar de ir. Las clases grupales son súper dinámicas y la asesoría nutricional me ayudó a organizar mi alimentación.",
    stars: 5,
  },
];

const appFeatures = [
  {
    icon: Activity,
    title: "Valoraciones Físicas",
    description: "Registra y consulta tu composición corporal con gráficas dinámicas.",
    link: "/valoraciones",
  },
  {
    icon: Dumbbell,
    title: "Rutinas con IA",
    description: "Plan de entrenamiento personalizado generado por inteligencia artificial.",
    link: "/rutinas",
  },
  {
    icon: Utensils,
    title: "Guía de Nutrición",
    description: "Recomendaciones de macros y alimentos locales para tus resultados.",
    link: "/nutricion",
  },
  {
    icon: TrendingUp,
    title: "Progreso de Carga",
    description: "Aplica la sobrecarga progresiva y mide tus mejoras constantes.",
    link: "/progreso",
  },
];

export default function Index() {
  return (
    <Layout>
      {/* ===== HERO ===== */}
      <section className="relative bg-secondary overflow-hidden min-h-[90vh] flex items-center">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-primary/5" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_hsl(var(--primary)/0.15),_transparent_70%)]" />
        <div className="container mx-auto px-4 py-20 md:py-32 relative z-10">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1 text-center md:text-left animate-fade-in">
              <div className="inline-block px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
                📍 El mejor gimnasio de Soacha
              </div>
              <h1 className="font-display text-5xl md:text-7xl lg:text-8xl text-secondary-foreground mb-6 tracking-wider leading-none">
                TRANSFORMA
                <br />
                TU CUERPO
                <br />
                <span className="text-primary">Y TU VIDA</span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-xl">
                En <strong className="text-foreground">98 Fitness Club</strong> cuentas con entrenadores certificados, 
                maquinaria de última generación y un plan personalizado para alcanzar tus metas. 
                <span className="text-primary font-semibold"> ¡Tu primera asesoría es gratis!</span>
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                <Button asChild size="lg" className="text-lg animate-pulse-glow">
                  <a href={SOCIAL_LINKS.whatsapp} target="_blank" rel="noopener noreferrer">
                    <MessageCircle className="mr-2 h-5 w-5" />
                    Escríbenos por WhatsApp
                  </a>
                </Button>
                <Button asChild size="lg" variant="outline" className="text-lg">
                  <Link to="/valoraciones">
                    <Activity className="mr-2 h-5 w-5" />
                    Consultar mi Valoración
                  </Link>
                </Button>
              </div>
            </div>
            <div className="flex-1 flex justify-center animate-slide-in">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/30 rounded-full blur-3xl scale-110" />
                <img
                  src={logo}
                  alt="98 Fitness Club - Gimnasio en Soacha"
                  className="relative w-64 h-64 md:w-80 md:h-80 lg:w-96 lg:h-96 object-cover rounded-full border-4 border-primary shadow-2xl"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== SERVICIOS ===== */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <span className="text-primary font-medium text-sm uppercase tracking-widest">Lo que ofrecemos</span>
            <h2 className="font-display text-4xl md:text-6xl mt-2 mb-4 tracking-wider">
              NUESTROS <span className="text-primary">SERVICIOS</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Todo lo que necesitas para entrenar como profesional, en un solo lugar
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service, index) => (
              <Card key={index} className="gym-card group text-center">
                <CardContent className="p-6 flex flex-col items-center">
                  <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <service.icon className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="font-display text-xl mb-2 tracking-wide">{service.title}</h3>
                  <p className="text-muted-foreground text-sm">{service.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ===== ENFOQUE DE ENTRENAMIENTO ===== */}
      <section className="py-20 bg-secondary">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <span className="text-primary font-medium text-sm uppercase tracking-widest">Tu transformación</span>
            <h2 className="font-display text-4xl md:text-6xl mt-2 mb-4 tracking-wider text-secondary-foreground">
              ELIGE TU <span className="text-primary">CAMINO</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Sin importar tu objetivo, tenemos el programa y el equipo para llevarte al siguiente nivel
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {approaches.map((approach, index) => (
              <Card key={index} className="overflow-hidden border-border hover:border-primary/50 transition-all duration-300 group">
                <div className={`h-2 bg-gradient-to-r ${approach.color}`} />
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                    <approach.icon className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="font-display text-2xl mb-3 tracking-wide">{approach.title}</h3>
                  <p className="text-muted-foreground">{approach.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ===== PLATAFORMA DIGITAL ===== */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <span className="text-primary font-medium text-sm uppercase tracking-widest">Tecnología a tu servicio</span>
            <h2 className="font-display text-4xl md:text-6xl mt-2 mb-4 tracking-wider">
              HERRAMIENTAS <span className="text-primary">DIGITALES</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Accede a tu plan de entrenamiento, nutrición y progreso desde cualquier dispositivo
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {appFeatures.map((feature, index) => (
              <Card key={index} className="gym-card group cursor-pointer">
                <Link to={feature.link}>
                  <CardContent className="p-6">
                    <feature.icon className="h-12 w-12 text-primary mb-4 transition-transform group-hover:scale-110" />
                    <h3 className="font-display text-xl mb-2 tracking-wide">{feature.title}</h3>
                    <p className="text-muted-foreground text-sm mb-4">{feature.description}</p>
                    <span className="text-primary flex items-center text-sm font-medium group-hover:gap-2 transition-all">
                      Explorar <ChevronRight className="h-4 w-4" />
                    </span>
                  </CardContent>
                </Link>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ===== TESTIMONIOS ===== */}
      <section className="py-20 bg-secondary">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <span className="text-primary font-medium text-sm uppercase tracking-widest">Lo que dicen nuestros miembros</span>
            <h2 className="font-display text-4xl md:text-6xl mt-2 mb-4 tracking-wider text-secondary-foreground">
              PRUEBA <span className="text-primary">SOCIAL</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((t, index) => (
              <Card key={index} className="border-border hover:border-primary/30 transition-all duration-300">
                <CardContent className="p-8">
                  <div className="flex gap-1 mb-4">
                    {Array.from({ length: t.stars }).map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-primary text-primary" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-6 italic">"{t.text}"</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-display text-lg">
                      {t.name[0]}
                    </div>
                    <span className="font-medium text-foreground">{t.name}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ===== UBICACIÓN Y HORARIOS ===== */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <span className="text-primary font-medium text-sm uppercase tracking-widest">Encuéntranos</span>
            <h2 className="font-display text-4xl md:text-6xl mt-2 mb-4 tracking-wider">
              UBICACIÓN Y <span className="text-primary">HORARIOS</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Horarios */}
            <Card className="border-border">
              <CardContent className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <Clock className="h-6 w-6 text-primary" />
                  <h3 className="font-display text-2xl tracking-wide">HORARIOS</h3>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-3 border-b border-border">
                    <span className="text-foreground font-medium">Lunes a Viernes</span>
                    <span className="text-primary font-semibold">5:00 AM - 10:00 PM</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-border">
                    <span className="text-foreground font-medium">Sábados</span>
                    <span className="text-primary font-semibold">6:00 AM - 8:00 PM</span>
                  </div>
                  <div className="flex justify-between items-center py-3">
                    <span className="text-foreground font-medium">Domingos</span>
                    <span className="text-primary font-semibold">8:00 AM - 4:00 PM</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Ubicación */}
            <Card className="border-border">
              <CardContent className="p-8 flex flex-col justify-between h-full">
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <MapPin className="h-6 w-6 text-primary" />
                    <h3 className="font-display text-2xl tracking-wide">UBICACIÓN</h3>
                  </div>
                  <p className="text-muted-foreground mb-2">📍 Soacha, Colombia</p>
                  <p className="text-muted-foreground text-sm mb-8">
                    Estamos ubicados en una zona de fácil acceso. ¡Ven y conócenos!
                  </p>
                </div>
                <Button asChild size="lg" className="w-full text-lg">
                  <a href={SOCIAL_LINKS.maps} target="_blank" rel="noopener noreferrer">
                    <MapPin className="mr-2 h-5 w-5" />
                    Cómo Llegar
                  </a>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* ===== CTA FINAL ===== */}
      <section className="py-20 bg-secondary relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_hsl(var(--primary)/0.1),_transparent_70%)]" />
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="font-display text-4xl md:text-6xl mb-6 tracking-wider text-secondary-foreground">
            ¿LISTO PARA <span className="text-primary">EMPEZAR</span>?
          </h2>
          <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
            Da el primer paso hacia tu mejor versión. Escríbenos ahora y recibe tu asesoría personalizada 
            <span className="text-primary font-semibold"> completamente gratis</span>.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="text-lg animate-pulse-glow">
              <a href={SOCIAL_LINKS.whatsapp} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="mr-2 h-5 w-5" />
                WhatsApp Ahora
              </a>
            </Button>
            <Button asChild size="lg" variant="outline" className="text-lg">
              <Link to="/rutinas">
                <Dumbbell className="mr-2 h-5 w-5" />
                Generar mi Rutina con IA
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
}
