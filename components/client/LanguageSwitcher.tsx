// components/client/LanguageSwitcher.tsx
"use client";
import { useState, useEffect } from "react";
import { useWoodizStore } from "@/lib/store";

const LOCALE_LABEL: Record<string, string> = {
  fr: "FR", en: "EN", it: "IT", es: "ES", de: "DE", pt: "PT", nl: "NL", ar: "AR", zh: "ZH", ja: "JA",
};

export default function LanguageSwitcher() {
  const { translations, activeLocale, setLocale } = useWoodizStore();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return <div className="w-20 h-7" />;

  // Only show enabled languages
  const enabledTranslations = translations.filter((t) => t.enabled !== false);
  if (enabledTranslations.length <= 1) return null;

  return (
    <div className="flex items-center gap-0.5">
      {enabledTranslations.map((t) => {
        const label = LOCALE_LABEL[t.locale] ?? t.locale.toUpperCase();
        const isActive = activeLocale === t.locale;
        return (
          <button
            key={t.locale}
            onClick={() => setLocale(t.locale)}
            title={t.label}
            className={`rounded-md px-2 py-1 text-xs font-bold transition-all leading-none ${
              isActive
                ? "text-slate-900 bg-slate-100"
                : "text-slate-400 hover:text-slate-600"
            }`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
