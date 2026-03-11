// components/admin/tabs/DesignTab.tsx
"use client";

import { useState, useEffect } from "react";
import { Save, RefreshCw } from "lucide-react";
import { useWoodizStore } from "@/lib/store";

const COLOR_PRESETS = [
  { name: "Amber (défaut)", primary: "#F59E0B", accent: "#2B1408" },
  { name: "Rouge Tomate", primary: "#EF4444", accent: "#7F1D1D" },
  { name: "Vert Basilic", primary: "#10B981", accent: "#064E3B" },
  { name: "Bleu Royal", primary: "#3B82F6", accent: "#1E3A8A" },
  { name: "Violet", primary: "#8B5CF6", accent: "#3B0764" },
  { name: "Rose", primary: "#EC4899", accent: "#831843" },
  { name: "Orange Brûlé", primary: "#F97316", accent: "#431407" },
  { name: "Teal", primary: "#14B8A6", accent: "#134E4A" },
];

export default function DesignTab() {
  const { settings, updateSettings } = useWoodizStore();
  const [form, setForm] = useState({ ...settings });

  // Sync le formulaire quand les settings chargent depuis la BDD
  useEffect(() => {
    setForm({ ...settings });
  }, [settings.primaryColor, settings.accentColor, settings.siteName, settings.logoText]);

  function handleSave() {
    updateSettings(form);
  }

  function applyPreset(preset: (typeof COLOR_PRESETS)[0]) {
    setForm({ ...form, primaryColor: preset.primary, accentColor: preset.accent });
  }

  // Live preview of the logo
  const logoPreview = (
    <div className="flex items-center gap-2.5">
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center font-black text-base"
        style={{ background: form.primaryColor, color: form.accentColor, fontFamily: "Poppins, sans-serif" }}
      >
        {form.logoText}
      </div>
      <div>
        <div className="font-black text-lg" style={{ fontFamily: "Poppins, sans-serif", color: form.accentColor }}>
          {form.siteName}
        </div>
        <div className="text-[9px] font-bold tracking-widest uppercase" style={{ color: form.primaryColor }}>
          Paris 15ème
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-extrabold text-2xl text-slate-800" style={{ fontFamily: "Poppins, sans-serif" }}>
            Design & Couleurs
          </h1>
          <p className="text-slate-400 text-sm mt-1">Personnalisez l'apparence du site en temps réel</p>
        </div>
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-semibold shadow-md hover:opacity-90 transition-all"
          style={{ background: settings.primaryColor }}
        >
          <Save size={16} /> Appliquer
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Controls */}
        <div className="flex flex-col gap-6">
          {/* Color presets */}
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
            <h2 className="font-bold text-slate-800 mb-4" style={{ fontFamily: "Poppins, sans-serif" }}>Thèmes prédéfinis</h2>
            <div className="grid grid-cols-2 gap-2">
              {COLOR_PRESETS.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => applyPreset(preset)}
                  className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all hover:shadow-sm ${
                    form.primaryColor === preset.primary ? "border-amber-400 ring-2 ring-amber-100" : "border-slate-100 hover:border-slate-200"
                  }`}
                >
                  <div className="flex gap-1 flex-shrink-0">
                    <div className="w-5 h-5 rounded-full" style={{ background: preset.primary }} />
                    <div className="w-5 h-5 rounded-full" style={{ background: preset.accent }} />
                  </div>
                  <span className="text-xs font-medium text-slate-600">{preset.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Custom colors */}
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
            <h2 className="font-bold text-slate-800 mb-4" style={{ fontFamily: "Poppins, sans-serif" }}>Couleurs personnalisées</h2>
            <div className="flex flex-col gap-5">
              {[
                { label: "Couleur principale (boutons, badges, accents)", field: "primaryColor" as const },
                { label: "Couleur secondaire (hero, navbar logo, footer)", field: "accentColor" as const },
              ].map(({ label, field }) => (
                <div key={field}>
                  <label className="form-label">{label}</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={form[field]}
                      onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                      className="w-12 h-12 rounded-xl border border-slate-200 cursor-pointer p-0"
                    />
                    <input
                      type="text"
                      value={form[field]}
                      onChange={(e) => {
                        if (/^#[0-9A-Fa-f]{0,6}$/.test(e.target.value)) {
                          setForm({ ...form, [field]: e.target.value });
                        }
                      }}
                      className="form-input w-32"
                      placeholder="#F59E0B"
                    />
                    <div
                      className="flex-1 h-10 rounded-xl"
                      style={{ background: form[field] }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Logo & Favicon */}
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
            <h2 className="font-bold text-slate-800 mb-4" style={{ fontFamily: "Poppins, sans-serif" }}>Logo & Favicon</h2>
            <div className="flex flex-col gap-4">
              <div>
                <label className="form-label">Lettre / Texte du logo</label>
                <input
                  className="form-input"
                  value={form.logoText}
                  onChange={(e) => setForm({ ...form, logoText: e.target.value })}
                  maxLength={2}
                  placeholder="W"
                />
              </div>
              <div>
                <label className="form-label">Emoji favicon</label>
                <div className="flex items-center gap-3">
                  <input
                    className="form-input w-24 text-center text-2xl"
                    value={form.faviconEmoji}
                    onChange={(e) => setForm({ ...form, faviconEmoji: e.target.value })}
                    maxLength={4}
                  />
                  <span className="text-sm text-slate-400">Affiché dans l'onglet du navigateur</span>
                </div>
              </div>
              <div>
                <label className="form-label">URL favicon personnalisé (optionnel)</label>
                <input
                  className="form-input"
                  value={(form as any).faviconUrl || ""}
                  onChange={(e) => setForm({ ...form, faviconUrl: e.target.value } as any)}
                  placeholder="https://... (PNG/ICO — prioritaire sur l'emoji)"
                />
                <p className="text-xs text-slate-400 mt-1">Si renseigné, cette image sera utilisée à la place de l'emoji.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Preview Panel */}
        <div className="flex flex-col gap-4">
          <h2 className="font-bold text-sm text-slate-500 uppercase tracking-wide">Aperçu en temps réel</h2>

          {/* Navbar preview */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-3 py-1.5 bg-slate-100 flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
              <span className="ml-2 text-xs text-slate-400 font-mono">woodiz.fr</span>
              <span className="ml-1 text-xs">{form.faviconEmoji}</span>
            </div>
            <div className="p-4 border-b border-slate-100">
              {logoPreview}
            </div>

            {/* Hero preview */}
            <div className="mx-4 my-3 rounded-xl overflow-hidden" style={{ background: form.accentColor, height: 140 }}>
              <div className="p-5 text-white h-full flex flex-col justify-between">
                <div>
                  <div className="font-black text-lg leading-tight mb-1" style={{ fontFamily: "Poppins, sans-serif" }}>
                    {form.heroTitle?.split("\\n")[0] || "La pizza artisanale"}
                    <br />
                    <span style={{ color: form.primaryColor }}>
                      {form.heroTitle?.split("\\n")[1] || "livrée chez vous"}
                    </span>
                  </div>
                  <div className="text-white/60 text-xs">{form.heroSubtitle}</div>
                </div>
                <div>
                  <span
                    className="inline-block text-xs font-bold px-4 py-1.5 rounded-full text-white"
                    style={{ background: form.primaryColor }}
                  >
                    Voir la carte →
                  </span>
                </div>
              </div>
            </div>

            {/* Sample elements */}
            <div className="p-4 flex flex-wrap gap-2">
              <span
                className="text-xs font-bold px-3 py-1.5 rounded-full text-white"
                style={{ background: form.primaryColor }}
              >
                Bestseller
              </span>
              <span
                className="text-xs font-bold px-3 py-1.5 rounded-full text-white"
                style={{ background: form.accentColor }}
              >
                Classique
              </span>
              <span
                className="text-xs font-semibold px-3 py-1.5 rounded-full border"
                style={{ borderColor: form.primaryColor, color: form.primaryColor }}
              >
                Base Tomate
              </span>
              <button
                className="w-7 h-7 rounded-full flex items-center justify-center text-white"
                style={{ background: form.primaryColor }}
              >
                +
              </button>
            </div>
          </div>

          {/* Footer preview */}
          <div className="rounded-2xl p-5" style={{ background: form.accentColor }}>
            <div className="text-xs text-white/40 mb-2 uppercase tracking-widest">Footer preview</div>
            {logoPreview}
            <p className="text-white/40 text-xs mt-2 leading-relaxed">{form.footerText}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
