// components/admin/tabs/PromosTab.tsx
"use client";

import { useState } from "react";
import { Plus, Edit2, Trash2, ToggleLeft, ToggleRight, GripVertical, ExternalLink, Image as ImageIcon, CreditCard } from "lucide-react";
import { useWoodizStore, Promo } from "@/lib/store";
import ImageUploadField from "@/components/admin/ImageUploadField";

const EMPTY_PROMO: Promo = {
  id: 0, title: "", price: "", badge: "", bg: "#FFF9C4",
  textColor: "#1A1A2E", active: true, image: "", order: 99, type: "card",
};

const BG_PRESETS = [
  { label: "Jaune", bg: "#FFF9C4", text: "#1A1A2E" },
  { label: "Sombre", bg: "#1E1B3A", text: "#ffffff" },
  { label: "Orange", bg: "#FF6B35", text: "#ffffff" },
  { label: "Brun", bg: "#2B1408", text: "#ffffff" },
  { label: "Vert", bg: "#065F46", text: "#ffffff" },
  { label: "Bleu", bg: "#1E40AF", text: "#ffffff" },
  { label: "Violet", bg: "#5B2D8E", text: "#ffffff" },
  { label: "Rose", bg: "#BE185D", text: "#ffffff" },
];

const LOCALES = [
  { locale: "en", flag: "🇬🇧", label: "English" },
  { locale: "it", flag: "🇮🇹", label: "Italiano" },
  { locale: "es", flag: "🇪🇸", label: "Español" },
];

export default function PromosTab() {
  const { promos, savePromo, deletePromo, togglePromo, settings, translations } = useWoodizStore();
  const [showForm, setShowForm] = useState(false);
  const [editPromo, setEditPromo] = useState<Promo | null>(null);

  const sorted = [...promos].sort((a, b) => a.order - b.order);
  const activeLocales = translations.filter(t => t.locale !== "fr");

  function openNew() { setEditPromo({ ...EMPTY_PROMO }); setShowForm(true); }
  function openEdit(p: Promo) { setEditPromo({ ...p }); setShowForm(true); }

  function handleSave() {
    if (!editPromo || !editPromo.title) return;
    savePromo(editPromo);
    setShowForm(false);
    setEditPromo(null);
  }

  function setTranslation(locale: string, field: "title" | "badge" | "ctaText", value: string) {
    if (!editPromo) return;
    setEditPromo({
      ...editPromo,
      translations: {
        ...(editPromo.translations || {}),
        [locale]: { ...(editPromo.translations?.[locale] || { title: "", badge: "" }), [field]: value },
      },
    });
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-extrabold text-2xl text-slate-800" style={{ fontFamily: "Poppins, sans-serif" }}>
            Gestion des Offres
          </h1>
          <p className="text-slate-400 text-sm mt-1">{promos.filter(p => p.active).length} offre(s) active(s) · 2 types : Carte & Bannière</p>
        </div>
        <button onClick={openNew} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-semibold shadow-md hover:opacity-90"
          style={{ background: settings.primaryColor }}>
          <Plus size={16} /> Nouvelle offre
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Preview */}
        <div>
          <h2 className="font-bold text-sm text-slate-500 uppercase tracking-wide mb-3">Aperçu en temps réel</h2>
          <div className="flex flex-col gap-3">
            {sorted.filter(p => p.active).map(promo => (
              promo.type === "banner" ? (
                /* Banner style */
                <div key={promo.id} className="rounded-[18px] overflow-hidden relative min-h-[100px] flex items-center p-5"
                  style={{ background: promo.bgImage ? "transparent" : promo.bg }}>
                  {promo.bgImage && (
                    <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${promo.bgImage})`, filter: "brightness(0.4)" }} />
                  )}
                  {!promo.bgImage && <div className="absolute inset-0" style={{ background: promo.bg }} />}
                  <div className="relative z-10 flex-1">
                    <div className="font-black text-lg leading-tight mb-1" style={{ color: promo.textColor, fontFamily: "Poppins, sans-serif" }}>
                      {promo.title}
                    </div>
                    {promo.badge && <div className="text-sm opacity-80" style={{ color: promo.textColor }}>{promo.badge}</div>}
                    {promo.link && (
                      <div className="flex items-center gap-1 mt-2 text-xs font-semibold opacity-70" style={{ color: promo.textColor }}>
                        <ExternalLink size={11} /> {promo.link.replace(/^https?:\/\//, "")}
                      </div>
                    )}
                  </div>
                  <div className="relative z-10 ml-4">
                    <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2 text-sm font-bold" style={{ color: promo.textColor }}>
                      {promo.ctaText || "J'en profite →"}
                    </div>
                  </div>
                </div>
              ) : (
                /* Card style */
                <div key={promo.id} className="rounded-[18px] p-5 min-h-[130px] flex flex-col justify-between shadow-sm" style={{ background: promo.bg }}>
                  <div>
                    <span className="inline-block text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full mb-2"
                      style={{ background: "rgba(0,0,0,0.12)", color: promo.textColor }}>{promo.badge || "Badge"}</span>
                    <div className="font-bold text-sm leading-snug" style={{ color: promo.textColor, fontFamily: "Poppins, sans-serif" }}>
                      {promo.title || "Titre de l'offre"}
                    </div>
                  </div>
                  <div className="font-black text-2xl mt-2" style={{ color: (promo as any).priceColor || settings.primaryColor, fontFamily: "Poppins, sans-serif" }}>
                    {promo.price || "0,00€"}
                  </div>
                </div>
              )
            ))}
          </div>
        </div>

        {/* List */}
        <div className="flex flex-col gap-3">
          <h2 className="font-bold text-sm text-slate-500 uppercase tracking-wide mb-0">Gestion</h2>
          {sorted.map(promo => (
            <div key={promo.id} className={`bg-white rounded-2xl p-4 border flex items-center gap-3 shadow-sm ${promo.active ? "border-slate-100" : "border-slate-200 opacity-60"}`}>
              <GripVertical size={16} className="text-slate-300 flex-shrink-0" />
              <div className="w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center overflow-hidden"
                style={{ background: promo.bg }}>
                {promo.type === "banner" ? <ImageIcon size={16} className="text-white/70" /> : <CreditCard size={16} className="opacity-50" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm text-slate-800 truncate">{promo.title}</div>
                <div className="text-xs text-slate-400 flex items-center gap-2">
                  <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${promo.type === "banner" ? "bg-purple-100 text-purple-600" : "bg-blue-100 text-blue-600"}`}>
                    {promo.type === "banner" ? "Bannière" : "Carte"}
                  </span>
                  {promo.price && <span>{promo.price}</span>}
                </div>
                {activeLocales.length > 0 && (
                  <div className="flex gap-1 mt-1">
                    {activeLocales.map(t => (
                      <span key={t.locale} className={`text-[10px] px-1.5 py-0.5 rounded-full ${promo.translations?.[t.locale]?.title ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-400"}`}>
                        {t.flag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <button onClick={() => togglePromo(promo.id)}
                  className={`text-xs font-semibold px-2.5 py-1.5 rounded-full flex items-center gap-1 ${promo.active ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                  {promo.active ? <ToggleRight size={13} /> : <ToggleLeft size={13} />}
                  {promo.active ? "Active" : "Inactive"}
                </button>
                <button onClick={() => openEdit(promo)} className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 flex items-center justify-center">
                  <Edit2 size={13} />
                </button>
                <button onClick={() => { if (confirm("Supprimer cette offre ?")) deletePromo(promo.id); }}
                  className="w-7 h-7 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 flex items-center justify-center">
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Form Modal */}
      {showForm && editPromo && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/40 p-4" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="border-b border-slate-100 px-7 py-5 flex items-center justify-between sticky top-0 bg-white z-10 rounded-t-3xl">
              <h2 className="font-bold text-lg text-slate-800" style={{ fontFamily: "Poppins, sans-serif" }}>
                {editPromo.id ? "Modifier l'offre" : "Nouvelle offre"}
              </h2>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-700 text-2xl">&times;</button>
            </div>

            <div className="p-7 flex flex-col gap-5">
              {/* Type selector */}
              <div>
                <label className="form-label">Type d'offre</label>
                <div className="grid grid-cols-2 gap-3 mt-2">
                  <button type="button" onClick={() => setEditPromo({ ...editPromo, type: "card" })}
                    className={`p-3 rounded-xl border-2 text-left transition-all ${editPromo.type !== "banner" ? "border-amber-400 bg-amber-50" : "border-slate-100"}`}>
                    <div className="flex items-center gap-2 font-semibold text-sm text-slate-700"><CreditCard size={15} /> Carte</div>
                    <div className="text-xs text-slate-400 mt-1">Fond coloré + prix + badge</div>
                  </button>
                  <button type="button" onClick={() => setEditPromo({ ...editPromo, type: "banner" })}
                    className={`p-3 rounded-xl border-2 text-left transition-all ${editPromo.type === "banner" ? "border-purple-400 bg-purple-50" : "border-slate-100"}`}>
                    <div className="flex items-center gap-2 font-semibold text-sm text-slate-700"><ImageIcon size={15} /> Bannière</div>
                    <div className="text-xs text-slate-400 mt-1">Image de fond + lien CTA</div>
                  </button>
                </div>
              </div>

              {/* Mini preview */}
              {editPromo.type === "banner" ? (
                <div className="rounded-2xl overflow-hidden relative min-h-[90px] flex items-center p-4" style={{ background: editPromo.bgImage ? "transparent" : editPromo.bg }}>
                  {editPromo.bgImage && <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${editPromo.bgImage})`, filter: "brightness(0.35)" }} />}
                  {!editPromo.bgImage && <div className="absolute inset-0" style={{ background: editPromo.bg }} />}
                  <div className="relative z-10 flex-1">
                    <div className="font-black text-base leading-snug" style={{ color: editPromo.textColor, fontFamily: "Poppins, sans-serif" }}>
                      {editPromo.title || "Titre de la bannière"}
                    </div>
                    {editPromo.badge && <div className="text-xs opacity-80 mt-1" style={{ color: editPromo.textColor }}>{editPromo.badge}</div>}
                  </div>
                  <div className="relative z-10 ml-3">
                    <div className="bg-white/25 rounded-lg px-3 py-1.5 text-xs font-bold" style={{ color: editPromo.textColor }}>{editPromo.ctaText || "J'en profite →"}</div>
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl p-5 min-h-[120px] flex flex-col justify-between" style={{ background: editPromo.bg }}>
                  <div>
                    <span className="text-[10px] font-bold uppercase px-2 py-1 rounded-full"
                      style={{ background: "rgba(0,0,0,0.12)", color: editPromo.textColor }}>
                      {editPromo.badge || "Badge"}
                    </span>
                    <div className="font-bold text-sm mt-2 leading-snug" style={{ color: editPromo.textColor, fontFamily: "Poppins, sans-serif" }}>
                      {editPromo.title || "Titre de l'offre"}
                    </div>
                  </div>
                  <div className="font-black text-2xl" style={{ color: (editPromo as any).priceColor || settings.primaryColor, fontFamily: "Poppins, sans-serif" }}>
                    {editPromo.price || "0,00€"}
                  </div>
                </div>
              )}

              {/* FR fields */}
              <div className="bg-slate-50 rounded-xl p-4">
                <div className="text-xs font-bold text-slate-500 mb-3">🇫🇷 Français (principal)</div>
                <div className="flex flex-col gap-3">
                  <div>
                    <label className="form-label">Titre *</label>
                    <input className="form-input" value={editPromo.title}
                      onChange={e => setEditPromo({ ...editPromo, title: e.target.value })}
                      placeholder={editPromo.type === "banner" ? "Frais de livraison OFFERTS !" : "1 Pizza + 1 Boisson offerte"} />
                  </div>
                  {editPromo.type !== "banner" && (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="form-label">Prix affiché</label>
                        <input className="form-input" value={editPromo.price}
                          onChange={e => setEditPromo({ ...editPromo, price: e.target.value })} placeholder="10,90€" />
                      </div>
                      <div>
                        <label className="form-label">Badge</label>
                        <input className="form-input" value={editPromo.badge}
                          onChange={e => setEditPromo({ ...editPromo, badge: e.target.value })} placeholder="Menu Midi" />
                      </div>
                    </div>
                  )}
                  {editPromo.type !== "banner" && (
                    <ImageUploadField
                      label="Image de la carte (optionnel)"
                      value={editPromo.image || ""}
                      onChange={(v) => setEditPromo({ ...editPromo, image: v })}
                      idbKey={`promo:cardImage:${editPromo.id || "new"}`}
                      placeholder="https://..."
                      quality={0.82}
                      maxDim={800}
                    />
                  )}
                  {editPromo.type === "banner" && (
                    <div>
                      <label className="form-label">Sous-titre / Description</label>
                      <input className="form-input" value={editPromo.badge}
                        onChange={e => setEditPromo({ ...editPromo, badge: e.target.value })} placeholder="Profitez de l'offre exclusive !" />
                    </div>
                  )}
                </div>
              </div>

              {/* Banner-specific fields */}
              {editPromo.type === "banner" && (
                <div className="bg-purple-50 rounded-xl p-4 flex flex-col gap-3">
                  <div className="text-xs font-bold text-purple-600 mb-1">🖼️ Options Bannière</div>
                  <ImageUploadField
                    label="Image de fond"
                    value={editPromo.bgImage || ""}
                    onChange={(v) => setEditPromo({ ...editPromo, bgImage: v })}
                    idbKey={`promo:bgImage:${editPromo.id || "new"}`}
                    placeholder="https://images.unsplash.com/..."
                    quality={0.78}
                    maxDim={1400}
                  />
                  <div>
                    <label className="form-label flex items-center gap-2"><ExternalLink size={12} /> Lien de destination</label>
                    <input className="form-input" value={editPromo.link || ""}
                      onChange={e => setEditPromo({ ...editPromo, link: e.target.value })}
                      placeholder="https://deliveroo.fr" />
                    <p className="text-xs text-slate-400 mt-1">Cliquer sur la bannière ouvrira ce lien.</p>
                  </div>
                  <div>
                    <label className="form-label">Texte du bouton CTA</label>
                    <input className="form-input" value={editPromo.ctaText || ""}
                      onChange={e => setEditPromo({ ...editPromo, ctaText: e.target.value })}
                      placeholder="J'en profite →" />
                    <p className="text-xs text-slate-400 mt-1">Par défaut : "J'en profite →"</p>
                  </div>
                </div>
              )}

              {/* Translations */}
              {activeLocales.length > 0 && (
                <div>
                  <label className="form-label">Traductions</label>
                  <div className="flex flex-col gap-3">
                    {activeLocales.map(({ locale, flag, label }) => (
                      <div key={locale} className="border border-slate-100 rounded-xl p-3">
                        <div className="text-xs font-bold text-slate-500 mb-2">{flag} {label}</div>
                        <div className="flex flex-col gap-2">
                          <input className="form-input text-sm" placeholder={`Titre en ${label}`}
                            value={editPromo.translations?.[locale]?.title || ""}
                            onChange={e => setTranslation(locale, "title", e.target.value)} />
                          <input className="form-input text-sm" placeholder={`Badge en ${label} (optionnel)`}
                            value={editPromo.translations?.[locale]?.badge || ""}
                            onChange={e => setTranslation(locale, "badge", e.target.value)} />
                          {editPromo.type === "banner" && (
                            <input className="form-input text-sm" placeholder={`Bouton CTA en ${label} (ex: Get the deal →)`}
                              value={editPromo.translations?.[locale]?.ctaText || ""}
                              onChange={e => setTranslation(locale, "ctaText", e.target.value)} />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Colors */}
              <div>
                <label className="form-label">Couleur de fond</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {BG_PRESETS.map(preset => (
                    <button key={preset.label} type="button"
                      onClick={() => setEditPromo({ ...editPromo, bg: preset.bg, textColor: preset.text })}
                      className={`w-9 h-9 rounded-xl border-2 transition-all ${editPromo.bg === preset.bg ? "border-amber-400 scale-110" : "border-transparent"}`}
                      style={{ background: preset.bg }} title={preset.label} />
                  ))}
                </div>
                <div className="flex gap-3 flex-wrap">
                  <div className="flex items-center gap-2">
                    <label className="form-label mb-0 text-xs">Fond</label>
                    <input type="color" value={editPromo.bg} onChange={e => setEditPromo({ ...editPromo, bg: e.target.value })} className="rounded-lg w-9 h-9 cursor-pointer" />
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="form-label mb-0 text-xs">Texte</label>
                    <input type="color" value={editPromo.textColor} onChange={e => setEditPromo({ ...editPromo, textColor: e.target.value })} className="rounded-lg w-9 h-9 cursor-pointer" />
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="form-label mb-0 text-xs">Prix</label>
                    <input type="color" value={(editPromo as any).priceColor || editPromo.textColor} onChange={e => setEditPromo({ ...editPromo, priceColor: e.target.value } as any)} className="rounded-lg w-9 h-9 cursor-pointer" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Ordre</label>
                  <input type="number" min="1" className="form-input" value={editPromo.order}
                    onChange={e => setEditPromo({ ...editPromo, order: parseInt(e.target.value) })} />
                </div>
                <div className="flex flex-col justify-end">
                  <label className="flex items-center gap-2.5 cursor-pointer py-2">
                    <input type="checkbox" checked={editPromo.active} onChange={e => setEditPromo({ ...editPromo, active: e.target.checked })} className="w-4 h-4 rounded accent-amber-400" />
                    <span className="text-sm font-medium text-slate-600">Offre active</span>
                  </label>
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={handleSave} className="flex-1 py-3 rounded-xl text-white font-bold hover:opacity-90" style={{ background: settings.primaryColor }}>
                  {editPromo.id ? "Enregistrer" : "Créer l'offre"}
                </button>
                <button onClick={() => setShowForm(false)} className="px-5 py-3 rounded-xl bg-slate-100 text-slate-600 font-semibold hover:bg-slate-200">Annuler</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
