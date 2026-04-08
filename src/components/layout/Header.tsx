import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, User, LogOut, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import logo from "@/assets/logo.jpg";

const navItems = [
  { label: "Inicio", path: "/" },
  { label: "Valoraciones", path: "/valoraciones" },
  { label: "Rutinas", path: "/rutinas" },
  { label: "Nutrición", path: "/nutricion" },
  { label: "Progreso", path: "/progreso" },
];

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut, isStaff, isSuperAdmin, avatarUrl } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const getUserInitials = () => {
    const name = user?.user_metadata?.full_name || user?.email || "";
    return name
      .split(" ")
      .map((n: string) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <img src={logo} alt="Body Master Gym" className="h-12 w-12 rounded-full object-cover" />
            <span className="font-display text-2xl tracking-wider text-foreground">
              BODY MASTER GYM
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-4 py-2 text-sm font-medium transition-colors rounded-md ${
                  location.pathname === item.path
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                {item.label}
              </Link>
            ))}
            {isStaff && (
              <Link
                to="/admin"
                className={`px-4 py-2 text-sm font-medium transition-colors rounded-md ${
                  location.pathname === "/admin"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                Admin
              </Link>
            )}
            {isSuperAdmin && (
              <Link
                to="/gestion-usuarios"
                className={`px-4 py-2 text-sm font-medium transition-colors rounded-md flex items-center gap-1 ${
                  location.pathname === "/gestion-usuarios"
                    ? "bg-yellow-500/20 text-yellow-500"
                    : "text-yellow-500/70 hover:text-yellow-500 hover:bg-yellow-500/10"
                }`}
              >
                <Crown className="h-3 w-3" />
                Gestión
              </Link>
            )}
          </nav>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center gap-2">
            {user ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={avatarUrl || undefined} />
                    <AvatarFallback className="bg-primary/10 text-primary text-xs">
                      {getUserInitials() || <User className="h-4 w-4" />}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm text-muted-foreground max-w-[120px] truncate">
                    {user.user_metadata?.full_name || user.email}
                  </span>
                </div>
                <Button variant="outline" size="sm" onClick={handleSignOut}>
                  <LogOut className="h-4 w-4 mr-1" />
                  Salir
                </Button>
              </div>
            ) : (
              <Button variant="outline" size="sm" onClick={() => navigate("/login")}>
                <User className="h-4 w-4 mr-1" />
                Staff Login
              </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="md:hidden py-4 border-t border-border animate-fade-in">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`block px-4 py-3 text-sm font-medium transition-colors ${
                  location.pathname === item.path
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            {isStaff && (
              <Link
                to="/admin"
                className={`block px-4 py-3 text-sm font-medium transition-colors ${
                  location.pathname === "/admin"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Admin
              </Link>
            )}
            {isSuperAdmin && (
              <Link
                to="/gestion-usuarios"
                className={`block px-4 py-3 text-sm font-medium transition-colors flex items-center gap-2 ${
                  location.pathname === "/gestion-usuarios"
                    ? "bg-yellow-500/20 text-yellow-500"
                    : "text-yellow-500/70 hover:text-yellow-500 hover:bg-yellow-500/10"
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                <Crown className="h-4 w-4" />
                Gestión de Usuarios
              </Link>
            )}
            <div className="px-4 py-3 border-t border-border mt-2">
              {user ? (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                  <Button variant="outline" size="sm" className="w-full" onClick={handleSignOut}>
                    <LogOut className="h-4 w-4 mr-1" />
                    Cerrar Sesión
                  </Button>
                </div>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => {
                    navigate("/login");
                    setIsMenuOpen(false);
                  }}
                >
                  <User className="h-4 w-4 mr-1" />
                  Staff Login
                </Button>
              )}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
