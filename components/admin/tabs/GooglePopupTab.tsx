// components/admin/tabs/GooglePopupTab.tsx
"use client";
import { useState } from "react";
import { Save, Star, X } from "lucide-react";
import { useWoodizStore, GoogleReviewPopup } from "@/lib/store";

function GoogleLogoSVG({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
    </svg>
  );
}

export default function GooglePopupTab() {
  const { googleReviewPopup, saveGoogleReviewPopup, settings, translations, saveTranslation } = useWoodizStore();
  const [form, setForm] = useState<GoogleReviewPopup>({ ...googleReviewPopup });

  // Per-locale popup translations
  const otherLocales = translations.filter(t => t.locale !== "fr");

  function setLocalePopup(locale: string, field: "popup.title" | "popup.subtitle" | "popup.button" | "popup.later", value: string) {
    const tr = translations.find(t => t.locale === locale);
    if (!tr) return;
    saveTranslation({ ...tr, strings: { ...tr.strings, [field]: value } });
  }

  function getLocaleValue(locale: string, key: string, fallback: string) {
    const tr = translations.find(t => t.locale === locale);
    return tr?.strings?.[key] || "";
  }

  function handleSave() { saveGoogleReviewPopup(form); }

  return (
    <div className="p-8">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="font-extrabold text-2xl text-slate-800" style={{ fontFamily: "Poppins, sans-serif" }}>Popup Avis Google</h1>
          <p className="text-slate-400 text-sm mt-1">Popup pour demander un avis Google aux clients</p>
        </div>
        <button onClick={handleSave} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-semibold hover:opacity-90"
          style={{ background: settings.primaryColor }}>
          <Save size={16} /> Sauvegarder
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Config left column */}
        <div className="flex flex-col gap-5">
          {/* Activation */}
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
            <h2 className="font-bold text-slate-800 mb-4">Activation & Comportement</h2>
            <div className="flex flex-col gap-4">
              {[
                { field: "enabled" as const, label: "Activer le popup", sub: "Afficher le popup aux visiteurs" },
                { field: "showOnce" as const, label: "Afficher une seule fois", sub: "Ne plus afficher après fermeture" },
              ].map(({ field, label, sub }) => (
                <label key={field} className="flex items-center justify-between cursor-pointer">
                  <div>
                    <div className="font-medium text-sm text-slate-700">{label}</div>
                    <div className="text-xs text-slate-400">{sub}</div>
                  </div>
                  <div className={`relative w-10 h-5 rounded-full cursor-pointer transition-colors ${form[field] ? "bg-emerald-400" : "bg-slate-200"}`}
                    onClick={() => setForm({ ...form, [field]: !form[field] })}>
                    <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${form[field] ? "translate-x-5" : "translate-x-0.5"}`} />
                  </div>
                </label>
              ))}
              <div>
                <label className="form-label">Délai avant affichage (secondes)</label>
                <input className="form-input" type="number" min={0} max={300} value={form.delaySeconds}
                  onChange={(e) => setForm({ ...form, delaySeconds: parseInt(e.target.value) || 0 })} />
              </div>
            </div>
          </div>

          {/* Content FR */}
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
            <h2 className="font-bold text-slate-800 mb-4">🇫🇷 Contenu (Français)</h2>
            <div className="flex flex-col gap-4">
              <div>
                <label className="form-label">Lien Google Review</label>
                <input className="form-input" value={form.googleReviewUrl}
                  onChange={(e) => setForm({ ...form, googleReviewUrl: e.target.value })}
                  placeholder="https://g.page/r/votre-id/review" />
                <p className="text-xs text-slate-400 mt-1">Ce lien est aussi utilisé par le bouton "Voir tous les avis" sur la page.</p>
              </div>
              <div>
                <label className="form-label">Titre</label>
                <input className="form-input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              </div>
              <div>
                <label className="form-label">Sous-titre</label>
                <textarea className="form-input resize-none" rows={2} value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} />
              </div>
              <div>
                <label className="form-label">Texte du bouton</label>
                <input className="form-input" value={form.buttonText} onChange={(e) => setForm({ ...form, buttonText: e.target.value })} />
              </div>
              <div>
                <label className="form-label">Texte "Plus tard"</label>
                <input className="form-input" placeholder="Plus tard"
                  value={translations.find(t => t.locale === "fr")?.strings?.["popup.later"] || ""}
                  onChange={(e) => {
                    const tr = translations.find(t => t.locale === "fr");
                    if (tr) saveTranslation({ ...tr, strings: { ...tr.strings, "popup.later": e.target.value } });
                  }} />
              </div>
              <div>
                <label className="form-label">Couleur d'accent</label>
                <div className="flex gap-2">
                  <input type="color" className="w-10 h-10 rounded-lg cursor-pointer border border-slate-200" value={form.accentColor}
                    onChange={(e) => setForm({ ...form, accentColor: e.target.value })} />
                  <input className="form-input flex-1" value={form.accentColor} onChange={(e) => setForm({ ...form, accentColor: e.target.value })} />
                </div>
              </div>
            </div>
          </div>

          {/* Translations for other locales */}
          {otherLocales.length > 0 && (
            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
              <h2 className="font-bold text-slate-800 mb-4">Traductions du popup</h2>
              {otherLocales.map(tr => (
                <div key={tr.locale} className="mb-5 last:mb-0">
                  <div className="text-sm font-bold text-slate-600 mb-3">{tr.flag} {tr.label}</div>
                  <div className="flex flex-col gap-2">
                    {[
                      { key: "popup.title", placeholder: "Titre" },
                      { key: "popup.subtitle", placeholder: "Sous-titre" },
                      { key: "popup.button", placeholder: "Bouton principal" },
                      { key: "popup.later", placeholder: 'Bouton "Plus tard"' },
                    ].map(({ key, placeholder }) => (
                      <input key={key} className="form-input text-sm"
                        placeholder={placeholder}
                        value={getLocaleValue(tr.locale, key, "")}
                        onChange={(e) => setLocalePopup(tr.locale, key as any, e.target.value)}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Live preview */}
        <div>
          <div className="sticky top-20">
            <h2 className="font-bold text-slate-800 mb-3 text-sm">Aperçu du popup</h2>
            <div className="bg-slate-200 rounded-2xl p-8 flex items-center justify-center min-h-[400px]">
              <div className="bg-white rounded-3xl shadow-2xl max-w-xs w-full overflow-hidden" style={{ border: `2px solid ${form.accentColor}20` }}>
                <div className="h-1.5" style={{ background: `linear-gradient(90deg, ${form.accentColor}, #FDE68A, ${form.accentColor})` }} />
                <div className="p-6 relative">
                  <button className="absolute top-4 right-4 w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center">
                    <X size={12} className="text-slate-400" />
                  </button>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-center">
                      <GoogleLogoSVG size={28} />
                    </div>
                    <div>
                      <div className="font-bold text-xs text-slate-900">Google Reviews</div>
                      <div className="flex gap-0.5 mt-0.5">{[...Array(5)].map((_, i) => <Star key={i} size={10} fill="#FFB800" stroke="#FFB800" />)}</div>
                    </div>
                  </div>
                  <h3 className="font-extrabold text-sm text-slate-900 mb-1.5 leading-tight">{form.title}</h3>
                  <p className="text-xs text-slate-500 mb-4 leading-relaxed">{form.subtitle}</p>
                  <button className="w-full py-2.5 rounded-2xl font-bold text-xs text-white" style={{ background: form.accentColor }}>{form.buttonText}</button>
                  <button className="w-full py-2 mt-1.5 text-xs text-slate-400 font-medium">Plus tard</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
