// components/client/CookieBanner.tsx
"use client";
import { useState, useEffect } from "react";
import { useWoodizStore } from "@/lib/store";

const STORAGE_KEY = "woodiz_cookie_consent";

export default function CookieBanner() {
  const { settings, activeLocale } = useWoodizStore();
  const [visible, setVisible] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) setVisible(true);
  }, []);

  if (!mounted || !visible) return null;
  const cb = settings.cookieBanner;
  if (!cb?.enabled) return null;

  const locale = activeLocale || "fr";
  const tr = cb.translations?.[locale];
  const title = tr?.title || cb.title || "Gérer le consentement aux cookies";
  const description = tr?.description || cb.description || "";
  const acceptText = tr?.acceptText || cb.acceptText || "Accepter";
  const rejectText = tr?.rejectText || cb.rejectText || "Refuser";
  const prefsText = tr?.prefsText || cb.prefsText || "Voir les préférences";

  const accept = () => { localStorage.setItem(STORAGE_KEY, "accepted"); setVisible(false); };
  const reject = () => { localStorage.setItem(STORAGE_KEY, "rejected"); setVisible(false); };

  return (
    <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-scale-in">
        {/* Logo + title */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center font-black text-sm flex-shrink-0"
              style={{ background: settings.primaryColor, color: settings.accentColor, fontFamily: "Poppins, sans-serif" }}>
              {settings.logoText}
            </div>
            <h2 className="font-bold text-slate-900 text-base leading-tight" style={{ fontFamily: "Poppins, sans-serif" }}>
              {title}
            </h2>
          </div>
          <button onClick={reject} className="text-slate-400 hover:text-slate-600 transition-colors ml-2 flex-shrink-0">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <p className="text-slate-500 text-sm leading-relaxed mb-6">{description}</p>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={accept}
            className="flex-1 py-3 rounded-xl text-sm font-bold transition-opacity hover:opacity-90"
            style={{ background: settings.primaryColor, color: settings.accentColor, fontFamily: "Poppins, sans-serif" }}
          >
            {acceptText}
          </button>
          <button
            onClick={reject}
            className="flex-1 py-3 rounded-xl text-sm font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
          >
            {rejectText}
          </button>
          <button
            onClick={reject}
            className="flex-1 py-3 rounded-xl text-sm font-semibold bg-white text-slate-500 border border-slate-200 hover:border-slate-300 transition-colors"
          >
            {prefsText}
          </button>
        </div>

        <div className="mt-4 text-center">
          <a href="/privacy" className="text-xs text-slate-400 hover:text-slate-600 underline transition-colors">
            Politique de cookies
          </a>
        </div>
      </div>
    </div>
  );
}
