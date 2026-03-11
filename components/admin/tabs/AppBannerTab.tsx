// components/admin/tabs/AppBannerTab.tsx
"use client";

import { useState } from "react";
import { Smartphone, Eye, Save, X } from "lucide-react";
import { useWoodizStore, AppBanner } from "@/lib/store";

const DEFAULT_BANNER: AppBanner = {
  enabled: false, icon: "🛵", iconBg: "#10B981",
  title: "L'appli qui vous facilite la vie !",
  subtitle: "⭐⭐⭐⭐⭐ 2,517 de notes",
  buttonText: "Ouvrir", buttonLink: "", buttonBg: "#10B981",
  buttonTextColor: "#ffffff", bgColor: "#1A1A2E", textColor: "#ffffff", closeable: true,
};

const PRESETS = [
  { label: "Sombre", bg: "#1A1A2E", text: "#fff" },
  { label: "Vert", bg: "#065F46", text: "#fff" },
  { label: "Violet", bg: "#4C1D95", text: "#fff" },
  { label: "Bleu", bg: "#1E3A8A", text: "#fff" },
  { label: "Brun", bg: "#2B1408", text: "#fff" },
  { label: "Orange", bg: "#EA580C", text: "#fff" },
];

const BTN_PRESETS = [
  { label: "Vert", bg: "#10B981", text: "#fff" },
  { label: "Ambre", bg: "#F59E0B", text: "#1A1A2E" },
  { label: "Violet", bg: "#8B5CF6", text: "#fff" },
  { label: "Rouge", bg: "#EF4444", text: "#fff" },
  { label: "Blanc", bg: "#ffffff", text: "#1A1A2E" },
];

export default function AppBannerTab() {
  const { settings, updateSettings } = useWoodizStore();
  const [form, setForm] = useState<AppBanner>({ ...DEFAULT_BANNER, ...(settings.appBanner || {}) });

  function save() { updateSettings({ appBanner: { ...form } }); }

  function toggle() {
    const next = { ...form, enabled: !form.enabled };
    setForm(next);
    updateSettings({ appBanner: next });
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="font-extrabold text-2xl text-slate-800" style={{ fontFamily: "Poppins, sans-serif" }}>
          Bannière App / Annonce
        </h1>
        <p className="text-slate-400 text-sm mt-1">Bandeau style "Installer l'app" en haut du site — fermable par l'utilisateur</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Form */}
        <div className="flex flex-col gap-5">

          {/* Enable */}
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center justify-between">
            <div>
              <div className="font-bold text-slate-800 flex items-center gap-2"><Smartphone size={16} /> Activer la bannière</div>
              <div className="text-xs text-slate-400 mt-0.5">Affichée en haut du site, sous la notification bar</div>
            </div>
            <button onClick={toggle}
              className={`relative w-12 h-6 rounded-full transition-all duration-300 ${form.enabled ? "bg-emerald-400" : "bg-slate-200"}`}>
              <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all duration-300 ${form.enabled ? "left-6" : "left-0.5"}`} />
            </button>
          </div>

          {/* Icon + Texts */}
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex flex-col gap-4">
            <h3 className="font-bold text-sm text-slate-700">Icône & Textes</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="form-label">Icône (emoji)</label>
                <input className="form-input text-2xl text-center" value={form.icon || ""} maxLength={4}
                  onChange={e => setForm({ ...form, icon: e.target.value })} placeholder="🛵" />
              </div>
              <div>
                <label className="form-label">Couleur fond icône</label>
                <div className="flex items-center gap-2">
                  <input type="color" value={form.iconBg || "#10B981"} onChange={e => setForm({ ...form, iconBg: e.target.value })} className="w-10 h-10 rounded-lg cursor-pointer" />
                  <input className="form-input flex-1 text-sm" value={form.iconBg || "#10B981"} onChange={e => setForm({ ...form, iconBg: e.target.value })} />
                </div>
              </div>
            </div>
            <div>
              <label className="form-label">Titre *</label>
              <input className="form-input" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                placeholder="L'appli qui vous facilite la vie !" />
            </div>
            <div>
              <label className="form-label">Sous-titre / Note (optionnel)</label>
              <input className="form-input" value={form.subtitle || ""} onChange={e => setForm({ ...form, subtitle: e.target.value })}
                placeholder="⭐⭐⭐⭐⭐ 2,517 de notes" />
            </div>
          </div>

          {/* Button */}
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex flex-col gap-4">
            <h3 className="font-bold text-sm text-slate-700">Bouton d'action</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="form-label">Texte du bouton</label>
                <input className="form-input" value={form.buttonText || ""} onChange={e => setForm({ ...form, buttonText: e.target.value })} placeholder="Ouvrir" />
              </div>
              <div>
                <label className="form-label">Lien du bouton</label>
                <input className="form-input" value={form.buttonLink || ""} onChange={e => setForm({ ...form, buttonLink: e.target.value })} placeholder="https://..." />
              </div>
            </div>
            <div>
              <label className="form-label text-xs">Couleur bouton</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {BTN_PRESETS.map(p => (
                  <button key={p.label} type="button" title={p.label}
                    onClick={() => setForm({ ...form, buttonBg: p.bg, buttonTextColor: p.text })}
                    className={`w-8 h-8 rounded-lg border-2 transition-all ${form.buttonBg === p.bg ? "border-amber-400 scale-110" : "border-transparent"}`}
                    style={{ background: p.bg }} />
                ))}
              </div>
              <div className="flex gap-3">
                <div className="flex items-center gap-2">
                  <label className="text-xs text-slate-500">Fond</label>
                  <input type="color" value={form.buttonBg || "#10B981"} onChange={e => setForm({ ...form, buttonBg: e.target.value })} className="w-9 h-9 rounded cursor-pointer" />
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-xs text-slate-500">Texte</label>
                  <input type="color" value={form.buttonTextColor || "#fff"} onChange={e => setForm({ ...form, buttonTextColor: e.target.value })} className="w-9 h-9 rounded cursor-pointer" />
                </div>
              </div>
            </div>
          </div>

          {/* Background color */}
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex flex-col gap-4">
            <h3 className="font-bold text-sm text-slate-700">Couleurs du bandeau</h3>
            <div className="flex flex-wrap gap-2 mb-1">
              {PRESETS.map(p => (
                <button key={p.label} type="button" title={p.label}
                  onClick={() => setForm({ ...form, bgColor: p.bg, textColor: p.text })}
                  className={`w-9 h-9 rounded-xl border-2 transition-all ${form.bgColor === p.bg ? "border-amber-400 scale-110" : "border-transparent"}`}
                  style={{ background: p.bg }} />
              ))}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="form-label text-xs">Fond du bandeau</label>
                <div className="flex items-center gap-2">
                  <input type="color" value={form.bgColor || "#1A1A2E"} onChange={e => setForm({ ...form, bgColor: e.target.value })} className="w-9 h-9 rounded cursor-pointer" />
                  <input className="form-input flex-1 text-sm" value={form.bgColor || "#1A1A2E"} onChange={e => setForm({ ...form, bgColor: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="form-label text-xs">Texte du bandeau</label>
                <div className="flex items-center gap-2">
                  <input type="color" value={form.textColor || "#ffffff"} onChange={e => setForm({ ...form, textColor: e.target.value })} className="w-9 h-9 rounded cursor-pointer" />
                  <input className="form-input flex-1 text-sm" value={form.textColor || "#ffffff"} onChange={e => setForm({ ...form, textColor: e.target.value })} />
                </div>
              </div>
            </div>

            <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors">
              <input type="checkbox" checked={form.closeable !== false} onChange={e => setForm({ ...form, closeable: e.target.checked })} className="w-4 h-4 rounded accent-amber-400" />
              <div>
                <div className="text-sm font-medium text-slate-700 flex items-center gap-2"><X size={13} /> Fermable par l'utilisateur</div>
                <div className="text-xs text-slate-400">Affiche une croix × pour masquer le bandeau</div>
              </div>
            </label>
          </div>

          <button onClick={save} className="w-full py-3 rounded-xl text-white font-bold hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
            style={{ background: settings.primaryColor }}>
            <Save size={16} /> Sauvegarder
          </button>
        </div>

        {/* Live preview */}
        <div>
          <h2 className="font-bold text-sm text-slate-500 uppercase tracking-wide mb-3 flex items-center gap-2">
            <Eye size={14} /> Aperçu en temps réel
          </h2>
          <div className="rounded-2xl overflow-hidden border border-slate-100 shadow-sm bg-slate-50">
            {/* Browser chrome */}
            <div className="bg-slate-200 px-3 py-2 flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
              </div>
              <div className="flex-1 bg-white rounded px-3 py-1 text-xs text-slate-400">woodiz.fr</div>
            </div>

            {/* Banner preview */}
            {form.enabled ? (
              <div className="flex items-center gap-3 px-3 py-2.5" style={{ background: form.bgColor || "#1A1A2E" }}>
                {form.closeable !== false && (
                  <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 opacity-50" style={{ background: "rgba(255,255,255,0.1)" }}>
                    <X size={12} style={{ color: form.textColor || "#fff" }} />
                  </div>
                )}
                {form.icon && (
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0" style={{ background: form.iconBg || "#10B981" }}>
                    {form.icon}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-xs leading-tight truncate" style={{ color: form.textColor || "#fff" }}>{form.title || "Titre..."}</div>
                  {form.subtitle && <div className="text-[10px] opacity-70 truncate" style={{ color: form.textColor || "#fff" }}>{form.subtitle}</div>}
                </div>
                {form.buttonText && (
                  <div className="px-3 py-1.5 rounded-lg text-xs font-bold flex-shrink-0" style={{ background: form.buttonBg || "#10B981", color: form.buttonTextColor || "#fff" }}>
                    {form.buttonText}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center text-xs text-slate-400 py-3 flex items-center justify-center gap-2">
                <Smartphone size={14} /> Bannière désactivée
              </div>
            )}

            {/* Fake nav */}
            <div className="bg-white border-b border-slate-100 px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full" style={{ background: settings.primaryColor }} />
                <span className="font-black text-xs" style={{ color: settings.accentColor }}>WOODIZ</span>
              </div>
              <div className="text-[10px] text-slate-400">Rechercher...</div>
            </div>
            <div className="p-4">
              <div className="rounded-xl bg-slate-200 h-20 mb-3" />
              <div className="grid grid-cols-3 gap-2">
                {[...Array(3)].map((_, i) => <div key={i} className="rounded-lg bg-slate-200 h-8" />)}
              </div>
            </div>
          </div>

          <div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
            <div className="text-xs font-bold text-blue-700 mb-2">💡 Exemples d'utilisation</div>
            <div className="flex flex-col gap-1.5">
              {[
                "🛵 Installer l'application mobile",
                "🍕 Commander sur Uber Eats / Deliveroo",
                "⭐ Laisser un avis Google",
                "📣 Annonce spéciale / événement",
                "🎁 Offre de bienvenue",
              ].map((ex, i) => (
                <div key={i} className="text-xs text-blue-600">{ex}</div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
