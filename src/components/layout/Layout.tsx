import { ReactNode } from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { SocialFloat } from "./SocialFloat";
import { SplashScreen } from "@/components/SplashScreen";

interface LayoutProps {
  children: ReactNode;
  showSplash?: boolean;
}

export function Layout({ children, showSplash = false }: LayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      {showSplash && <SplashScreen />}
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <SocialFloat />
    </div>
  );
}
