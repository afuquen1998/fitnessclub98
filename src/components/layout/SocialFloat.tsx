import { Instagram, MessageCircle } from "lucide-react";
import { SOCIAL_LINKS } from "@/lib/constants";

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
    </svg>
  );
}

export function SocialFloat() {
  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col gap-3">
      <a
        href={SOCIAL_LINKS.whatsapp}
        target="_blank"
        rel="noopener noreferrer"
        className="p-3 bg-green-500 text-white rounded-full shadow-lg hover:scale-110 transition-transform duration-300 animate-pulse-glow"
        aria-label="WhatsApp"
        style={{ "--tw-shadow-color": "rgba(34, 197, 94, 0.5)" } as React.CSSProperties}
      >
        <MessageCircle className="h-6 w-6" />
      </a>
      <a
        href={SOCIAL_LINKS.instagram}
        target="_blank"
        rel="noopener noreferrer"
        className="p-3 bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 text-white rounded-full shadow-lg hover:scale-110 transition-transform duration-300"
        aria-label="Instagram"
      >
        <Instagram className="h-6 w-6" />
      </a>
      <a
        href={SOCIAL_LINKS.tiktok}
        target="_blank"
        rel="noopener noreferrer"
        className="p-3 bg-black text-white rounded-full shadow-lg hover:scale-110 transition-transform duration-300"
        aria-label="TikTok"
      >
        <TikTokIcon className="h-6 w-6" />
      </a>
    </div>
  );
}
