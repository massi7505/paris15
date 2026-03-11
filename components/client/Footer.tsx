// components/client/Footer.tsx
"use client";
import { Star, MapPin, Phone, Mail, Clock } from "lucide-react";
import { useState, useEffect } from "react";
import { SiteSettings, Category, useWoodizStore } from "@/lib/store";
import OrderButtons from "./OrderButtons";

interface FooterProps {
  settings: SiteSettings;
  categories: Category[];
  onCategorySelect: (id: string) => void;
}

export default function Footer({ settings, categories, onCategorySelect }: FooterProps) {
  const { t, getCategoryName } = useWoodizStore();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const fc = settings.footerConfig;
  const googleUrl = settings.googleUrl;
  const activeCats = [...categories].filter((c) => c.active).sort((a, b) => a.order - b.order);

  return (
    <footer style={{ background: settings.accentColor || "#150904" }} className="rounded-t-3xl mt-20">
      <div className="max-w-screen-xl mx-auto px-6 pt-12 pb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">

          {/* Brand */}
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-full flex items-center justify-center font-black text-sm"
                style={{ background: settings.primaryColor, color: settings.accentColor, fontFamily: "Poppins, sans-serif" }}>
                {settings.logoText}
              </div>
              <span className="font-extrabold text-lg text-white" style={{ fontFamily: "Poppins, sans-serif" }}>{settings.siteName}</span>
            </div>
            <p className="text-white/50 text-sm leading-relaxed">{settings.footerText}</p>
            {fc?.showReviews !== false && (
              <div className="flex gap-0.5 mt-4 items-center">
                {[...Array(5)].map((_, i) => <Star key={i} size={13} fill="#FFB800" stroke="#FFB800" />)}
                <span className="text-white font-bold text-xs ml-1.5">
                  {fc?.googleRating || settings.googleRating || "4.4"} · {fc?.googleReviewCount || settings.googleReviewCount || "127"} {fc?.reviewsLabel || t("nav.reviews")} Google
                </span>
              </div>
            )}
          </div>

          {/* Contact */}
          {fc?.showContact !== false && (
            <div>
              <div className="text-white font-bold text-sm mb-4" style={{ fontFamily: "Poppins, sans-serif" }}>
                {mounted ? t("footer.contact") : "Contact"} & {mounted ? t("footer.hours") : "Horaires"}
              </div>
              <div className="flex flex-col gap-3">
                <div className="flex items-start gap-2 text-white/50 text-sm">
                  <MapPin size={14} className="mt-0.5 flex-shrink-0" style={{ color: settings.primaryColor }} />
                  {settings.address}
                </div>
                <div className="flex items-center gap-2 text-white/50 text-sm">
                  <Phone size={14} style={{ color: settings.primaryColor }} />
                  {settings.phone}
                </div>
                <div className="flex items-center gap-2 text-white/50 text-sm">
                  <Mail size={14} style={{ color: settings.primaryColor }} />
                  {settings.email}
                </div>
                <div className="flex items-start gap-2 text-white/50 text-sm">
                  <Clock size={14} className="mt-0.5 flex-shrink-0" style={{ color: settings.primaryColor }} />
                  <span>{settings.openHours}</span>
                </div>
              </div>
            </div>
          )}

          {/* Categories */}
          {fc?.showCategories !== false && (
            <div>
              <div className="text-white font-bold text-sm mb-4" style={{ fontFamily: "Poppins, sans-serif" }}>
                {mounted ? t("footer.our_menu") : "Notre Carte"}
              </div>
              <div className="flex flex-col gap-2">
                {activeCats.map((cat) => (
                  <button key={cat.id} onClick={() => onCategorySelect(cat.id)}
                    className="text-white/50 hover:text-white text-sm text-left transition-colors">
                    {cat.icon} {mounted ? getCategoryName(cat.id) : cat.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Order Buttons */}
          <div>
            <div className="text-white font-bold text-sm mb-4" style={{ fontFamily: "Poppins, sans-serif" }}>
              🛒 {mounted ? t("footer.order") : "Commander"}
            </div>
            <OrderButtons />
          </div>

          {/* Social & Links */}
          {fc?.showSocial !== false && (
            <div>
              <div className="text-white font-bold text-sm mb-4" style={{ fontFamily: "Poppins, sans-serif" }}>
                {mounted ? t("footer.follow_us") : "Suivez-nous"}
              </div>
              <div className="flex flex-col gap-3">
                <a href={settings.instagramUrl} target="_blank" rel="noreferrer"
                  className="text-white/50 hover:text-white text-sm transition-colors flex items-center gap-2">
                  📸 Instagram
                </a>
                <a href={settings.googleUrl} target="_blank" rel="noreferrer"
                  className="text-white/50 hover:text-white text-sm transition-colors flex items-center gap-2">
                  🗺️ Google Maps
                </a>
                {(fc?.customLinks || []).map((link, i) => (
                  <a key={i} href={link.url} target="_blank" rel="noreferrer"
                    className="text-white/50 hover:text-white text-sm transition-colors flex items-center gap-2">
                    🔗 {link.label}
                  </a>
                ))}
              </div>
              <div className="mt-6 p-4 rounded-xl" style={{ background: "rgba(255,255,255,0.06)" }}>
                <div className="text-white/70 text-xs leading-relaxed">
                  🍕 Pizzeria artisanale<br />
                  📍 Métro Volontaires<br />
                  ⭐ Note Google : {settings.googleRating || "4.4"}/5
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 pt-6 flex flex-col md:flex-row justify-between items-center gap-3">
          <div className="text-white/30 text-xs">
            © 2025 {settings.siteName} · {mounted ? t("footer.rights") : "Tous droits réservés."} · <span className="text-white/20">by <a href="https://adsbooster.fr" target="_blank" rel="noreferrer" className="hover:text-white/50 transition-colors">Adsbooster Paris</a></span>
          </div>
          {fc?.showLegalLinks !== false && (
            <div className="flex flex-wrap gap-4 md:gap-6">
              <a href="/mentions-legales" className="text-white/30 hover:text-white/60 text-xs transition-colors">{mounted ? t("legal.mentions") : "Mentions légales"}</a>
              <a href="/cgu" className="text-white/30 hover:text-white/60 text-xs transition-colors">{mounted ? t("legal.cgu") : "CGU"}</a>
              <a href="/privacy" className="text-white/30 hover:text-white/60 text-xs transition-colors">{mounted ? t("legal.privacy") : "Politique de confidentialité"}</a>
            </div>
          )}
        </div>
      </div>
    </footer>
  );
}
