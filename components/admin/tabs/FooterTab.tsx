// components/admin/tabs/FooterTab.tsx
"use client";
import { useState } from "react";
import { Save, Plus, Trash2, ToggleLeft, ToggleRight, Phone, ExternalLink } from "lucide-react";
import { useWoodizStore, FooterConfig, OrderButton, StoreSchedule } from "@/lib/store";

const DAY_LABELS = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];
const BUTTON_PRESETS: Omit<OrderButton, "id">[] = [
  { enabled: true, label: "Commander par téléphone", url: "tel:+33100000000", bgColor: "#F59E0B", textColor: "#1A1A2E", type: "phone" },
  { enabled: true, label: "Commander sur", url: "https://ubereats.com", bgColor: "#06C167", textColor: "#FFFFFF", type: "ubereats" },
  { enabled: true, label: "Commander sur", url: "https://deliveroo.fr", bgColor: "#00CCBC", textColor: "#FFFFFF", type: "deliveroo" },
  { enabled: true, label: "Commander", url: "https://", bgColor: "#1A1A2E", textColor: "#FFFFFF", type: "custom" },
];
const TYPE_ICONS: Record<string, string> = { phone: "📞", ubereats: "🟢", deliveroo: "🩵", custom: "🔗" };
const TYPE_LABELS: Record<string, string> = { phone: "Téléphone", ubereats: "UberEats", deliveroo: "Deliveroo", custom: "Personnalisé" };

function fmt(t: string) { return t ? t.replace(":", "h") : ""; }
function scheduleToText(s: StoreSchedule): string {
  const parts: string[] = [];
  if (s.lunchEnabled) parts.push(`${fmt(s.lunchOpen)}–${fmt(s.lunchClose)}`);
  if (s.dinnerEnabled) parts.push(`${fmt(s.dinnerOpen)}–${fmt(s.dinnerClose)}`);
  const text = parts.join(" / ");
  if (s.closedDays.length > 0) {
    const closed = s.closedDays.map(d => DAY_LABELS[d]).join(", ");
    return `${text} · Fermé ${closed}`;
  }
  return text;
}

export default function FooterTab() {
  const { settings, updateSettings } = useWoodizStore();
  const [form, setForm] = useState<FooterConfig>({
    ...settings.footerConfig,
    googleRating: settings.googleRating || settings.footerConfig?.googleRating || "4.4",
    googleReviewCount: settings.googleReviewCount || settings.footerConfig?.googleReviewCount || "127",
  });
  const DEFAULT_SCHEDULE: StoreSchedule = { lunchEnabled: true, lunchOpen: "11:00", lunchClose: "14:30", dinnerEnabled: true, dinnerOpen: "18:00", dinnerClose: "02:00", closedDays: [] };
  const [schedule, setSchedule] = useState<StoreSchedule>(settings.storeSchedule ?? DEFAULT_SCHEDULE);
  const [orderButtons, setOrderButtons] = useState<OrderButton[]>(settings.orderButtons ?? [
    { id: "phone", enabled: true, label: "Commander par téléphone", url: "tel:+33100000000", bgColor: "#F59E0B", textColor: "#1A1A2E", type: "phone" },
    { id: "ubereats", enabled: true, label: "Commander sur", url: "https://ubereats.com", bgColor: "#06C167", textColor: "#FFFFFF", type: "ubereats" },
    { id: "deliveroo", enabled: true, label: "Commander sur", url: "https://deliveroo.fr", bgColor: "#00CCBC", textColor: "#FFFFFF", type: "deliveroo" },
  ]);

  function handleSave() {
    updateSettings({ footerConfig: form, googleRating: form.googleRating, googleReviewCount: form.googleReviewCount, orderButtons, storeSchedule: schedule, openHours: scheduleToText(schedule) });
  }
  function toggle(field: keyof FooterConfig) { setForm(f => ({ ...f, [field]: !f[field] })); }
  function addLink() { setForm(f => ({ ...f, customLinks: [...(f.customLinks || []), { label: "", url: "" }] })); }
  function removeLink(i: number) { setForm(f => ({ ...f, customLinks: f.customLinks.filter((_, idx) => idx !== i) })); }
  function updateLink(i: number, field: "label" | "url", value: string) { setForm(f => ({ ...f, customLinks: f.customLinks.map((l, idx) => idx === i ? { ...l, [field]: value } : l) })); }
  function updateButton(id: string, patch: Partial<OrderButton>) { setOrderButtons(bs => bs.map(b => b.id === id ? { ...b, ...patch } : b)); }
  function addButton(preset: Omit<OrderButton, "id">) { setOrderButtons(bs => [...bs, { ...preset, id: `custom_${Date.now()}` }]); }
  function removeButton(id: string) { setOrderButtons(bs => bs.filter(b => b.id !== id)); }
  function toggleButton(id: string) { updateButton(id, { enabled: !orderButtons.find(b => b.id === id)?.enabled }); }
  function toggleDay(day: number) { setSchedule(s => ({ ...s, closedDays: s.closedDays.includes(day) ? s.closedDays.filter(d => d !== day) : [...s.closedDays, day] })); }

  const toggles = [
    { field: "showContact" as const, label: "Bloc Contact & Horaires" },
    { field: "showCategories" as const, label: "Bloc Notre Carte" },
    { field: "showSocial" as const, label: "Bloc Suivez-nous / Social" },
    { field: "showReviews" as const, label: "Note Google dans le footer" },
    { field: "showLegalLinks" as const, label: "Liens légaux (CGU, Confidentialité...)" },
  ];

  return (
    <div className="p-8">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="font-extrabold text-2xl text-slate-800" style={{ fontFamily: "Poppins, sans-serif" }}>Footer</h1>
          <p className="text-slate-400 text-sm mt-1">Personnalisez le pied de page du site</p>
        </div>
        <button onClick={handleSave} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-semibold hover:opacity-90" style={{ background: settings.primaryColor }}>
          <Save size={16} /> Sauvegarder
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Sections toggle */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
          <h2 className="font-bold text-slate-800 mb-4">Sections visibles</h2>
          <div className="flex flex-col gap-3">
            {toggles.map(({ field, label }) => (
              <label key={field} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0 cursor-pointer">
                <span className="text-sm text-slate-700">{label}</span>
                <div className={`relative w-10 h-5 rounded-full transition-colors ${form[field] ? "bg-emerald-400" : "bg-slate-200"}`} onClick={() => toggle(field)}>
                  <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${form[field] ? "translate-x-5" : "translate-x-0.5"}`} />
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Reviews settings */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
          <h2 className="font-bold text-slate-800 mb-1">Note Google globale</h2>
          <p className="text-xs text-slate-400 mb-4">Affiché dans la Navbar, les avis et le footer</p>
          <div className="flex items-center gap-3 mb-5 p-4 bg-slate-50 rounded-xl">
            <div className="flex gap-0.5">{[1,2,3,4,5].map(i => <svg key={i} width="18" height="18" viewBox="0 0 24 24" fill={i <= Math.floor(parseFloat(form.googleRating||"0")) ? "#FFB800" : "#E5E7EB"} stroke={i <= Math.floor(parseFloat(form.googleRating||"0")) ? "#FFB800" : "#E5E7EB"} strokeWidth="1.5"><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/></svg>)}</div>
            <span className="font-black text-xl text-slate-800">{form.googleRating||"—"}</span>
            <span className="text-slate-400 text-sm">/ 5 · {form.googleReviewCount||"0"} {form.reviewsLabel||"avis"}</span>
          </div>
          <div className="flex flex-col gap-4">
            <div>
              <label className="form-label">Note (1.0 – 5.0)</label>
              <div className="flex gap-2 items-center">
                <input type="range" min="1" max="5" step="0.1" value={parseFloat(form.googleRating||"4.4")} onChange={e => setForm({...form, googleRating: parseFloat(e.target.value).toFixed(1)})} className="flex-1 accent-amber-400" />
                <input className="form-input w-20 text-center font-bold" value={form.googleRating} onChange={e => setForm({...form, googleRating: e.target.value})} placeholder="4.4" />
              </div>
            </div>
            <div>
              <label className="form-label">Nombre d'avis</label>
              <input className="form-input" value={form.googleReviewCount} onChange={e => setForm({...form, googleReviewCount: e.target.value})} placeholder="127" />
            </div>
            <div>
              <label className="form-label">Label</label>
              <input className="form-input" value={form.reviewsLabel} onChange={e => setForm({...form, reviewsLabel: e.target.value})} placeholder="avis Google" />
            </div>
          </div>
        </div>

        {/* ORDER BUTTONS */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm lg:col-span-2">
          <div className="mb-4">
            <h2 className="font-bold text-slate-800">🛒 Boutons Commander</h2>
            <p className="text-xs text-slate-400 mt-0.5">UberEats, Deliveroo, téléphone… personnalisez les boutons du footer</p>
          </div>
          <div className="flex flex-wrap gap-2 mb-5">
            {BUTTON_PRESETS.map(preset => {
              const already = preset.type !== "custom" && orderButtons.some(b => b.type === preset.type);
              return (
                <button key={preset.type} onClick={() => !already && addButton(preset)} disabled={already}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${already ? "border-emerald-200 bg-emerald-50 text-emerald-600 cursor-default" : "border-slate-200 hover:border-amber-400 hover:bg-amber-50 text-slate-600"}`}>
                  {TYPE_ICONS[preset.type]} + {TYPE_LABELS[preset.type]}{already ? " ✓" : ""}
                </button>
              );
            })}
          </div>
          {orderButtons.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-6 border-2 border-dashed border-slate-100 rounded-xl">Aucun bouton. Cliquez ci-dessus pour en ajouter.</p>
          ) : (
            <div className="flex flex-col gap-4">
              {orderButtons.map(btn => (
                <div key={btn.id} className={`rounded-2xl border p-4 flex flex-col gap-3 ${btn.enabled ? "border-slate-100" : "border-slate-200 opacity-60"}`}>
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{TYPE_ICONS[btn.type]}</span>
                    <span className="font-semibold text-sm text-slate-700 flex-1">{TYPE_LABELS[btn.type]}</span>
                    <button onClick={() => toggleButton(btn.id)} className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-full ${btn.enabled ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                      {btn.enabled ? <ToggleRight size={13}/> : <ToggleLeft size={13}/>} {btn.enabled ? "Actif" : "Inactif"}
                    </button>
                    <button onClick={() => removeButton(btn.id)} className="w-7 h-7 rounded-lg bg-red-50 text-red-400 hover:bg-red-100 flex items-center justify-center"><Trash2 size={13}/></button>
                  </div>
                  {/* Live preview */}
                  <div className="flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold" style={{ background: btn.bgColor, color: btn.textColor }}>
                    <div className="flex items-center gap-2">
                      {btn.type === "phone" && <Phone size={14}/>}
                      <span>{btn.label}</span>
                      {btn.type === "ubereats" && <span className="font-black text-[11px]">Uber Eats</span>}
                      {btn.type === "deliveroo" && <span className="font-black text-[11px]">Deliveroo</span>}
                    </div>
                    <ExternalLink size={14}/>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="form-label text-xs">Texte du bouton</label>
                      <input className="form-input text-sm" value={btn.label} onChange={e => updateButton(btn.id, {label: e.target.value})} placeholder="Commander sur…" />
                    </div>
                    <div>
                      <label className="form-label text-xs">{btn.type === "phone" ? "Numéro (tel:+33...)" : "URL"}</label>
                      <input className="form-input text-sm" value={btn.url} onChange={e => updateButton(btn.id, {url: e.target.value})} placeholder={btn.type === "phone" ? "tel:+33100000000" : "https://…"} />
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <label className="form-label text-xs mb-0">Fond</label>
                        <input type="color" value={btn.bgColor} onChange={e => updateButton(btn.id, {bgColor: e.target.value})} className="w-9 h-9 rounded-lg cursor-pointer border border-slate-200" />
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="form-label text-xs mb-0">Texte</label>
                        <input type="color" value={btn.textColor} onChange={e => updateButton(btn.id, {textColor: e.target.value})} className="w-9 h-9 rounded-lg cursor-pointer border border-slate-200" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* STORE SCHEDULE */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm lg:col-span-2">
          <h2 className="font-bold text-slate-800 mb-1">🕐 Horaires d'ouverture</h2>
          <p className="text-xs text-slate-400 mb-5">Génère automatiquement le texte affiché dans le footer.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
            {/* Lunch */}
            <div className={`rounded-2xl border p-4 ${schedule.lunchEnabled ? "border-amber-200 bg-amber-50/30" : "border-slate-100 opacity-60"}`}>
              <div className="flex items-center justify-between mb-3">
                <span className="font-bold text-sm text-slate-700">☀️ Service du midi</span>
                <button onClick={() => setSchedule(s => ({...s, lunchEnabled: !s.lunchEnabled}))} className={`relative w-10 h-5 rounded-full transition-colors ${schedule.lunchEnabled ? "bg-amber-400" : "bg-slate-200"}`}>
                  <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${schedule.lunchEnabled ? "translate-x-5" : "translate-x-0.5"}`}/>
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="form-label text-xs">Ouverture</label><input type="time" className="form-input text-sm" value={schedule.lunchOpen} onChange={e => setSchedule(s => ({...s, lunchOpen: e.target.value}))}/></div>
                <div><label className="form-label text-xs">Fermeture</label><input type="time" className="form-input text-sm" value={schedule.lunchClose} onChange={e => setSchedule(s => ({...s, lunchClose: e.target.value}))}/></div>
              </div>
            </div>
            {/* Dinner */}
            <div className={`rounded-2xl border p-4 ${schedule.dinnerEnabled ? "border-indigo-200 bg-indigo-50/30" : "border-slate-100 opacity-60"}`}>
              <div className="flex items-center justify-between mb-3">
                <span className="font-bold text-sm text-slate-700">🌙 Service du soir</span>
                <button onClick={() => setSchedule(s => ({...s, dinnerEnabled: !s.dinnerEnabled}))} className={`relative w-10 h-5 rounded-full transition-colors ${schedule.dinnerEnabled ? "bg-indigo-400" : "bg-slate-200"}`}>
                  <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${schedule.dinnerEnabled ? "translate-x-5" : "translate-x-0.5"}`}/>
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="form-label text-xs">Ouverture</label><input type="time" className="form-input text-sm" value={schedule.dinnerOpen} onChange={e => setSchedule(s => ({...s, dinnerOpen: e.target.value}))}/></div>
                <div><label className="form-label text-xs">Fermeture (peut dépasser minuit)</label><input type="time" className="form-input text-sm" value={schedule.dinnerClose} onChange={e => setSchedule(s => ({...s, dinnerClose: e.target.value}))}/></div>
              </div>
            </div>
          </div>
          <div className="mb-4">
            <label className="form-label">Jours de fermeture</label>
            <div className="flex gap-2 flex-wrap mt-1">
              {DAY_LABELS.map((day, idx) => (
                <button key={day} type="button" onClick={() => toggleDay(idx)}
                  className={`w-11 h-11 rounded-xl text-xs font-bold border-2 transition-all ${schedule.closedDays.includes(idx) ? "bg-red-500 text-white border-red-500" : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"}`}>
                  {day}
                </button>
              ))}
            </div>
            <p className="text-xs text-slate-400 mt-1">Rouge = fermé ce jour</p>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl text-sm text-slate-600 flex items-center gap-2">
            <span>🕐</span><span className="font-medium">{scheduleToText(schedule) || "—"}</span>
          </div>
        </div>

        {/* Contact info */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm lg:col-span-2">
          <h2 className="font-bold text-slate-800 mb-4">Informations de contact & texte footer</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className="form-label">📍 Adresse</label><input className="form-input" value={settings.address} onChange={e => updateSettings({address: e.target.value})} placeholder="93 Rue Lecourbe, Paris 75015"/></div>
            <div><label className="form-label">📞 Téléphone</label><input className="form-input" value={settings.phone} onChange={e => updateSettings({phone: e.target.value})} placeholder="+33 1 00 00 00 00"/></div>
            <div><label className="form-label">✉️ Email</label><input className="form-input" value={settings.email} onChange={e => updateSettings({email: e.target.value})} placeholder="contact@woodiz.fr"/></div>
            <div><label className="form-label">📸 Instagram URL</label><input className="form-input" value={settings.instagramUrl} onChange={e => updateSettings({instagramUrl: e.target.value})} placeholder="https://instagram.com/..."/></div>
            <div><label className="form-label">🗺️ Google Maps URL</label><input className="form-input" value={settings.googleUrl} onChange={e => updateSettings({googleUrl: e.target.value})} placeholder="https://g.page/..."/></div>
            <div className="md:col-span-2"><label className="form-label">📝 Texte footer</label><textarea className="form-input resize-none" rows={3} value={settings.footerText} onChange={e => updateSettings({footerText: e.target.value})} placeholder="Pizzeria artisanale…"/></div>
          </div>
          <div className="mt-4 p-3 bg-amber-50 rounded-xl text-xs text-amber-700">💡 Contact enregistré <strong>immédiatement</strong>. Horaires et boutons nécessitent <strong>Sauvegarder</strong>.</div>
        </div>

        {/* Nous suivre */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm lg:col-span-2">
          <h2 className="font-bold text-slate-800 mb-4">📲 Nous suivre</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className="form-label">📸 Instagram</label><input className="form-input" value={settings.instagramUrl} onChange={e => updateSettings({instagramUrl: e.target.value})} placeholder="https://instagram.com/woodiz_paris15"/></div>
            <div><label className="form-label">⭐ Google Avis</label><input className="form-input" value={settings.googleUrl} onChange={e => updateSettings({googleUrl: e.target.value})} placeholder="https://g.page/r/..."/></div>
          </div>
        </div>

        {/* Custom links */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-slate-800">Liens personnalisés</h2>
            <button onClick={addLink} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg text-white" style={{ background: settings.primaryColor }}>
              <Plus size={12}/> Ajouter
            </button>
          </div>
          {(form.customLinks||[]).length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-4">Aucun lien personnalisé.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {(form.customLinks||[]).map((link, i) => (
                <div key={i} className="flex gap-3 items-center">
                  <input className="form-input flex-1" placeholder="Label" value={link.label} onChange={e => updateLink(i,"label",e.target.value)}/>
                  <input className="form-input flex-1" placeholder="URL" value={link.url} onChange={e => updateLink(i,"url",e.target.value)}/>
                  <button onClick={() => removeLink(i)} className="w-8 h-8 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 flex items-center justify-center flex-shrink-0"><Trash2 size={13}/></button>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
