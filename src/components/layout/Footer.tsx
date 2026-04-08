import { Instagram, MessageCircle, MapPin } from "lucide-react";
import { SOCIAL_LINKS } from "@/lib/constants";
import logo from "@/assets/logo.jpg";

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
    </svg>
  );
}

export function Footer() {
  return (
    <footer className="bg-secondary text-secondary-foreground">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Logo & Tagline */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <img src={logo} alt="Body Master Gym" className="h-16 w-16 rounded-full object-cover" />
              <div>
                <h3 className="font-display text-2xl tracking-wider">BODY MASTER GYM</h3>
                <p className="text-sm text-muted-foreground">Tu transformación comienza aquí</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Somos más que un gimnasio, somos una comunidad comprometida con tu bienestar y resultados.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display text-xl mb-4 tracking-wider">ENLACES</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="/valoraciones" className="text-muted-foreground hover:text-primary transition-colors">
                  Valoraciones Físicas
                </a>
              </li>
              <li>
                <a href="/rutinas" className="text-muted-foreground hover:text-primary transition-colors">
                  Generador de Rutinas
                </a>
              </li>
              <li>
                <a href="/nutricion" className="text-muted-foreground hover:text-primary transition-colors">
                  Guía de Nutrición
                </a>
              </li>
              <li>
                <a href="/progreso" className="text-muted-foreground hover:text-primary transition-colors">
                  Progreso de Carga
                </a>
              </li>
            </ul>
          </div>

          {/* Social Links */}
          <div>
            <h4 className="font-display text-xl mb-4 tracking-wider">CONTÁCTANOS</h4>
            <p className="text-sm text-muted-foreground mb-2">
              📞 {SOCIAL_LINKS.whatsappNumber}
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              📍 Bogotá, Colombia
            </p>
            <div className="flex gap-4">
              <a
                href={SOCIAL_LINKS.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 bg-primary/10 rounded-full hover:bg-primary hover:text-primary-foreground transition-all duration-300"
                aria-label="WhatsApp"
              >
                <MessageCircle className="h-5 w-5" />
              </a>
              <a
                href={SOCIAL_LINKS.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 bg-primary/10 rounded-full hover:bg-primary hover:text-primary-foreground transition-all duration-300"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href={SOCIAL_LINKS.tiktok}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 bg-primary/10 rounded-full hover:bg-primary hover:text-primary-foreground transition-all duration-300"
                aria-label="TikTok"
              >
                <TikTokIcon className="h-5 w-5" />
              </a>
              <a
                href={SOCIAL_LINKS.maps}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 bg-primary/10 rounded-full hover:bg-primary hover:text-primary-foreground transition-all duration-300"
                aria-label="Ubicación"
              >
                <MapPin className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Body Master Gym. Todos los derechos reservados.</p>
          <p className="mt-2">📍 Bogotá, Colombia</p>
        </div>
      </div>
    </footer>
  );
}
