import { useState, useEffect } from "react";
import logo from "@/assets/logo.jpg";

export function SplashScreen() {
  const [visible, setVisible] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // Block scroll
    document.body.style.overflow = "hidden";

    const showTimer = setTimeout(() => {
      setFadeOut(true);
    }, 3000);

    const removeTimer = setTimeout(() => {
      setVisible(false);
      document.body.style.overflow = "";
    }, 3800);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(removeTimer);
      document.body.style.overflow = "";
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center bg-background transition-opacity duration-700 ${
        fadeOut ? "opacity-0" : "opacity-100"
      }`}
    >
      <img
        src={logo}
        alt="Body Master Gym"
        className="w-40 h-40 md:w-56 md:h-56 rounded-full border-4 border-primary shadow-2xl animate-fade-in object-cover"
      />
    </div>
  );
}
