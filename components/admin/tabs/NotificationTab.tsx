// components/admin/tabs/NotificationTab.tsx
"use client";

import { useState } from "react";
import { Bell, BellOff, Eye, Link, X } from "lucide-react";
import { useWoodizStore } from "@/lib/store";

const PRESETS = [
  { label: "Ambre", bg: "#F59E0B", text: "#1A1A2E" },
  { label: "Sombre", bg: "#1E1B3A", text: "#ffffff" },
  { label: "Rouge", bg: "#EF4444", text: "#ffffff" },
  { label: "Vert", bg: "#10B981", text: "#ffffff" },
  { label: "Violet", bg: "#8B5CF6", text: "#ffffff" },
  { label: "Bleu", bg: "#3B82F6", text: "#ffffff" },
  { label: "Brun", bg: "#2B1408", text: "#ffffff" },
  { label: "Rose", bg: "#EC4899", text: "#ffffff" },
];

export default function NotificationTab() {
  const { settings, updateSettings } = useWoodizStore();
  const nb = settings.notificationBar ?? { enabled: false, text: "", bgColor: "#F59E0B", textColor: "#1A1A2E", link: "", closeable: true };
  const [form, setForm] = useState({ closeable: true, link: "", ...nb });

  function save() { updateSettings({ notificationBar: { ...form } }); }

  function toggle() {
    const next = { ...form, enabled: !form.enabled };
    setForm(next);
    updateSettings({ notificationBar: next });
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="font-extrabold text-2xl text-slate-800" style={{ fontFamily: "Poppins, sans-serif" }}>
          Barre de Notification
        </h1>
        <p className="text-slate-400 text-sm mt-1">Bandeau pleine largeur en haut du site — personnalisable, fermable, cliquable</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col gap-5">

          {/* Enable */}
          <div className="flex items-center justify-between">
            <div>
              <div className="font-bold text-slate-800">Activer la barre</div>
              <div className="text-sm text-slate-400">Bandeau affiché en haut du site</div>
            </div>
            <button onClick={toggle}
              className={`relative w-12 h-6 rounded-full transition-all duration-300 ${form.enabled ? "bg-emerald-400" : "bg-slate-200"}`}>
              <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all duration-300 ${form.enabled ? "left-6" : "left-0.5"}`} />
            </button>
          </div>

          {/* Text */}
          <div>
            <label className="form-label">Texte du bandeau</label>
            <input className="form-input" value={form.text}
              onChange={e => setForm({ ...form, text: e.target.value })}
              placeholder="🍕 Livraison gratuite dès 25€ !" />
          </div>

          {/* Link */}
          <div>
            <label className="form-label flex items-center gap-2"><Link size={12} /> Lien (optionnel)</label>
            <input className="form-input" value={form.link || ""}
              onChange={e => setForm({ ...form, link: e.target.value })}
              placeholder="https://votre-lien.com" />
            <p className="text-xs text-slate-400 mt-1">Si renseigné, cliquer ouvre ce lien dans un nouvel onglet.</p>
          </div>

          {/* Closeable */}
          <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors">
            <input type="checkbox" checked={form.closeable ?? true}
              onChange={e => setForm({ ...form, closeable: e.target.checked })}
              className="w-4 h-4 rounded accent-amber-400" />
            <div>
              <div className="text-sm font-medium text-slate-700 flex items-center gap-2"><X size={13} /> Fermable</div>
              <div className="text-xs text-slate-400">Affiche une croix × pour que l'utilisateur ferme la barre</div>
            </div>
          </label>

          {/* Color presets */}
          <div>
            <label className="form-label">Thème couleur</label>
            <div className="flex flex-wrap gap-2 mb-3">
              {PRESETS.map(p => (
                <button key={p.label} type="button" title={p.label}
                  onClick={() => setForm({ ...form, bgColor: p.bg, textColor: p.text })}
                  className={`w-9 h-9 rounded-xl border-2 transition-all ${form.bgColor === p.bg ? "border-amber-400 scale-110" : "border-transparent"}`}
                  style={{ background: p.bg }} />
              ))}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="form-label text-xs">Fond</label>
                <div className="flex items-center gap-2">
                  <input type="color" value={form.bgColor} onChange={e => setForm({ ...form, bgColor: e.target.value })} className="rounded-lg w-9 h-9 cursor-pointer" />
                  <input className="form-input flex-1 text-sm" value={form.bgColor} onChange={e => setForm({ ...form, bgColor: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="form-label text-xs">Texte</label>
                <div className="flex items-center gap-2">
                  <input type="color" value={form.textColor} onChange={e => setForm({ ...form, textColor: e.target.value })} className="rounded-lg w-9 h-9 cursor-pointer" />
                  <input className="form-input flex-1 text-sm" value={form.textColor} onChange={e => setForm({ ...form, textColor: e.target.value })} />
                </div>
              </div>
            </div>
          </div>

          <button onClick={save} className="w-full py-2.5 rounded-xl text-white text-sm font-semibold hover:opacity-90 transition-opacity"
            style={{ background: settings.primaryColor }}>
            Sauvegarder
          </button>
        </div>

        {/* Preview */}
        <div>
          <h2 className="font-bold text-sm text-slate-500 uppercase tracking-wide mb-3 flex items-center gap-2">
            <Eye size={14} /> Aperçu en temps réel
          </h2>
          <div className="rounded-2xl overflow-hidden border border-slate-100 shadow-sm bg-slate-50">
            <div className="bg-slate-200 px-3 py-2 flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
              </div>
              <div className="flex-1 bg-white rounded-md px-3 py-1 text-xs text-slate-400">woodiz.fr</div>
            </div>

            {form.enabled ? (
              <div className="text-center text-sm font-semibold py-2.5 px-8 relative flex items-center justify-center"
                style={{ background: form.bgColor, color: form.textColor }}>
                <span className="flex-1 text-center">{form.text || "Votre message ici..."}</span>
                {form.closeable && (
                  <div className="absolute right-3 w-5 h-5 rounded-full opacity-60 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.12)" }}>
                    <X size={11} />
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center text-xs text-slate-400 py-3 flex items-center justify-center gap-2">
                <BellOff size={14} /> Barre désactivée
              </div>
            )}

            <div className="bg-white border-b border-slate-100 px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full" style={{ background: settings.primaryColor }} />
                <span className="font-black text-sm" style={{ color: settings.accentColor }}>WOODIZ</span>
              </div>
              <div className="text-xs text-slate-400">Rechercher...</div>
            </div>
            <div className="p-4">
              <div className="rounded-xl bg-slate-200 h-24 mb-3" />
              <div className="grid grid-cols-3 gap-2">
                {[...Array(3)].map((_, i) => <div key={i} className="rounded-lg bg-slate-200 h-10" />)}
              </div>
            </div>
          </div>

          <div className="mt-3 flex items-center gap-2">
            {form.enabled
              ? <><Bell size={14} className="text-emerald-500" /><span className="text-sm text-emerald-600 font-medium">Barre active</span></>
              : <><BellOff size={14} className="text-slate-400" /><span className="text-sm text-slate-400">Barre masquée</span></>
            }
          </div>

          <div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
            <div className="text-xs font-bold text-blue-700 mb-1">💡 Conseil</div>
            <div className="text-xs text-blue-600">Pour une annonce app/livraison style Deliveroo avec icône et bouton, utilisez l'onglet <strong>Bannière App</strong>.</div>
          </div>
        </div>
      </div>
    </div>
  );
}
