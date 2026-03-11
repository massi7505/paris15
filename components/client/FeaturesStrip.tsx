// components/client/FeaturesStrip.tsx
"use client";
import { useState, useEffect } from "react";
import { useWoodizStore } from "@/lib/store";

// SVG icons per feature key
function IconDough({ color }: { color: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z"/>
      <path d="M8.5 8.5c0 0 1-2 3.5-2s3.5 2 3.5 2"/>
      <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
    </svg>
  );
}

function IconFresh({ color }: { color: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M2 22 16 8"/>
      <path d="M17.5 6.5a4.5 4.5 0 1 1-9 0"/>
      <path d="M9 10c0 3 2.5 5 5.5 5"/>
    </svg>
  );
}

function IconFast({ color }: { color: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
    </svg>
  );
}

function IconDefault({ color }: { color: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10"/>
      <line x1="12" y1="8" x2="12" y2="16"/>
      <line x1="8" y1="12" x2="16" y2="12"/>
    </svg>
  );
}

function FeatureIcon({ labelKey, color }: { labelKey: string; color: string }) {
  if (labelKey.includes("dough")) return <IconDough color={color} />;
  if (labelKey.includes("fresh")) return <IconFresh color={color} />;
  if (labelKey.includes("fast")) return <IconFast color={color} />;
  return <IconDefault color={color} />;
}

export default function FeaturesStrip() {
  const { settings, t } = useWoodizStore();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const features = (settings.features || []).filter((f) => f.active);
  if (features.length === 0) return null;

  const FR_FALLBACK: Record<string, string> = {
    "features.dough": "Pâte maison",
    "features.dough_sub": "Préparée chaque jour",
    "features.fresh": "Ingrédients frais",
    "features.fresh_sub": "Du marché local",
    "features.fast": "Prête en 15 min",
    "features.fast_sub": "À emporter",
  };

  const primaryColor = settings.primaryColor || "#f59e0b";
  const bgColor = `${primaryColor}18`;

  return (
    <section className="py-6">
      <div
        className="grid gap-3"
        style={{ gridTemplateColumns: `repeat(${features.length}, minmax(0, 1fr))` }}
      >
        {features.map((f, i) => {
          const label = mounted ? t(f.labelKey) : FR_FALLBACK[f.labelKey] || "";
          const sub = mounted ? t(f.subKey) : FR_FALLBACK[f.subKey] || "";
          return (
            <div
              key={i}
              className="bg-white rounded-2xl p-3 sm:p-4 text-center shadow-sm hover:-translate-y-1 hover:shadow-md transition-all flex flex-col items-center gap-2"
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: bgColor }}
              >
                <FeatureIcon labelKey={f.labelKey} color={primaryColor} />
              </div>
              <div>
                <div className="font-bold text-xs text-slate-800 leading-tight" style={{ fontFamily: "Poppins, sans-serif" }}>
                  {label}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5 leading-snug">{sub}</div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
