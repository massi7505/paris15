// components/admin/tabs/FeaturesTab.tsx
"use client";
import { useState } from "react";
import { Save, Plus, Trash2 } from "lucide-react";
import { useWoodizStore, FeatureItem } from "@/lib/store";

const LOCALE_LIST = [
  { locale: "fr", flag: "🇫🇷", label: "Français" },
  { locale: "en", flag: "🇬🇧", label: "English" },
  { locale: "it", flag: "🇮🇹", label: "Italiano" },
  { locale: "es", flag: "🇪🇸", label: "Español" },
];

const FEATURE_KEYS = ["features.dough", "features.fresh", "features.fast"];
const FEATURE_SUB_KEYS = ["features.dough_sub", "features.fresh_sub", "features.fast_sub"];

export default function FeaturesTab() {
  const { settings, updateSettings, translations, saveTranslation } = useWoodizStore();
  const [features, setFeatures] = useState<FeatureItem[]>(
    settings.features?.length ? [...settings.features] : [
      { icon: "🍕", labelKey: "features.dough", subKey: "features.dough_sub", active: true },
      { icon: "🌿", labelKey: "features.fresh", subKey: "features.fresh_sub", active: true },
      { icon: "⚡", labelKey: "features.fast", subKey: "features.fast_sub", active: true },
    ]
  );

  function getStr(locale: string, key: string) {
    return translations.find(t => t.locale === locale)?.strings?.[key] || "";
  }

  function setStr(locale: string, key: string, value: string) {
    const tr = translations.find(t => t.locale === locale);
    if (!tr) return;
    saveTranslation({ ...tr, strings: { ...tr.strings, [key]: value } });
  }

  function updateFeature(i: number, field: keyof FeatureItem, value: any) {
    setFeatures(f => f.map((item, idx) => idx === i ? { ...item, [field]: value } : item));
  }

  function addFeature() {
    const key = `features.custom${Date.now()}`;
    setFeatures(f => [...f, { icon: "✨", labelKey: key, subKey: key + "_sub", active: true }]);
  }

  function removeFeature(i: number) {
    setFeatures(f => f.filter((_, idx) => idx !== i));
  }

  function handleSave() {
    updateSettings({ features });
  }

  return (
    <div className="p-8">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="font-extrabold text-2xl text-slate-800" style={{ fontFamily: "Poppins, sans-serif" }}>Bandeaux Avantages</h1>
          <p className="text-slate-400 text-sm mt-1">Les 3 icônes sous le hero slider (pâte maison, ingrédients frais, etc.)</p>
        </div>
        <button onClick={handleSave} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-semibold hover:opacity-90"
          style={{ background: settings.primaryColor }}>
          <Save size={16} /> Sauvegarder
        </button>
      </div>

      <div className="flex flex-col gap-5">
        {features.map((f, i) => (
          <div key={i} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{f.icon}</span>
                <span className="font-bold text-slate-700">{getStr("fr", f.labelKey) || f.labelKey}</span>
              </div>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 text-sm text-slate-500 cursor-pointer">
                  Actif
                  <div className={`relative w-10 h-5 rounded-full transition-colors ${f.active ? "bg-emerald-400" : "bg-slate-200"}`}
                    onClick={() => updateFeature(i, "active", !f.active)}>
                    <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${f.active ? "translate-x-5" : "translate-x-0.5"}`} />
                  </div>
                </label>
                {features.length > 1 && (
                  <button onClick={() => removeFeature(i)} className="w-8 h-8 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 flex items-center justify-center">
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </div>

            {/* Icon picker */}
            <div className="mb-4">
              <label className="form-label">Icône (emoji)</label>
              <div className="flex gap-2 flex-wrap mb-2">
                {["🍕","🌿","⚡","🔥","🥗","🫒","🧀","🍅","🌾","⭐","🎉","🏆","❤️","🌍","✨","🍃"].map(emoji => (
                  <button key={emoji} onClick={() => updateFeature(i, "icon", emoji)}
                    className={`text-xl p-1.5 rounded-lg transition-all ${f.icon === emoji ? "ring-2 bg-amber-50" : "hover:bg-slate-50"}`}
                    style={{ "--tw-ring-color": settings.primaryColor } as React.CSSProperties}>
                    {emoji}
                  </button>
                ))}
              </div>
              <input className="form-input" value={f.icon} onChange={(e) => updateFeature(i, "icon", e.target.value)} placeholder="Ou tapez votre emoji" />
            </div>

            {/* Translations grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {LOCALE_LIST.map(({ locale, flag, label: locLabel }) => (
                <div key={locale} className="border border-slate-100 rounded-xl p-3">
                  <div className="text-xs font-bold text-slate-500 mb-2">{flag} {locLabel}</div>
                  <input className="form-input text-sm mb-2"
                    placeholder={`Titre (ex: Pâte maison)`}
                    value={getStr(locale, f.labelKey)}
                    onChange={(e) => setStr(locale, f.labelKey, e.target.value)} />
                  <input className="form-input text-sm"
                    placeholder={`Sous-titre (ex: Préparée chaque jour)`}
                    value={getStr(locale, f.subKey)}
                    onChange={(e) => setStr(locale, f.subKey, e.target.value)} />
                </div>
              ))}
            </div>
          </div>
        ))}

        <button onClick={addFeature}
          className="flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-dashed border-slate-200 text-slate-400 hover:border-slate-300 hover:text-slate-500 transition-all font-medium text-sm">
          <Plus size={16} /> Ajouter un avantage
        </button>
      </div>
    </div>
  );
}
