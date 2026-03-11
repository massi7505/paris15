// components/client/Navbar.tsx
"use client";
import { useState, useEffect } from "react";
import { Search, Star } from "lucide-react";
import { SiteSettings } from "@/lib/store";
import { useWoodizStore } from "@/lib/store";
import LanguageSwitcher from "./LanguageSwitcher";

interface NavbarProps {
  settings: SiteSettings;
  onSearch: (q: string) => void;
  searchValue: string;
}

export default function Navbar({ settings, onSearch, searchValue }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { t } = useWoodizStore();

  useEffect(() => {
    setMounted(true);
    const handler = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  // Use static FR strings before mount to avoid hydration mismatch
  const searchPlaceholder = mounted ? t("nav.search_placeholder") : "Rechercher une pizza...";
  const reviewsLabel = mounted ? t("nav.reviews") : "avis";

  return (
    <nav className={`sticky top-0 z-50 bg-white transition-shadow duration-300 ${scrolled ? "shadow-md" : "shadow-[0_1px_0_#f0f0f0]"}`}>
      <div className="max-w-screen-xl mx-auto px-4 md:px-6">
        {/* Main row */}
        <div className="h-16 flex items-center gap-3 overflow-hidden">
          {/* Logo */}
          <a href="#" className="flex items-center gap-2.5 flex-shrink-0">
            <div className="w-9 h-9 rounded-full flex items-center justify-center font-black text-base flex-shrink-0"
              style={{ background: settings.primaryColor, color: settings.accentColor, fontFamily: "Poppins, sans-serif" }}>
              {settings.logoText}
            </div>
            <div>
              <div className="font-black text-lg leading-tight" style={{ fontFamily: "Poppins, sans-serif", color: settings.accentColor }}>
                {settings.siteName}
              </div>
              <div className="text-[9px] font-bold tracking-widest uppercase" style={{ color: settings.primaryColor }}>
                Paris 15ème
              </div>
            </div>
          </a>

          {/* Search bar */}
          <div className="flex-1 flex justify-center">
            <div className="relative w-full max-w-sm">
              <input
                type="text"
                value={searchValue}
                onChange={(e) => onSearch(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full h-10 rounded-full border border-slate-200 pl-4 pr-12 text-sm outline-none bg-slate-50 transition-all focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
              />
              <div className="absolute right-1.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full flex items-center justify-center" style={{ background: settings.primaryColor }}>
                <Search size={14} color="white" />
              </div>
            </div>
          </div>

          {/* Rating — desktop only */}
          <div className="hidden md:flex items-center gap-1.5 flex-shrink-0 text-sm">
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, i) => <Star key={i} size={13} fill="#FFB800" stroke="#FFB800" />)}
            </div>
            <span className="font-semibold text-slate-700">{settings.googleRating || "4.4"}</span>
            <span className="text-slate-400">· {settings.googleReviewCount || "127"} {reviewsLabel}</span>
          </div>

          {/* Language Switcher — desktop only */}
          <div className="hidden md:flex items-center gap-3 flex-shrink-0">
            <LanguageSwitcher />
          </div>
        </div>

        {/* Mobile language row */}
        <div className="flex md:hidden items-center justify-end pb-2 -mt-1">
          <LanguageSwitcher />
        </div>
      </div>
    </nav>
  );
}
