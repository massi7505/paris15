// components/admin/tabs/FAQTab.tsx
"use client";

import { useState } from "react";
import { Plus, Trash2, Edit2, Check, X, Eye, EyeOff } from "lucide-react";
import { useWoodizStore, FAQ } from "@/lib/store";

const EMPTY_FAQ: Omit<FAQ, "id"> = { question: "", answer: "", order: 99, active: true };

const LOCALES = [
  { locale: "en", flag: "🇬🇧", label: "English" },
  { locale: "it", flag: "🇮🇹", label: "Italiano" },
  { locale: "es", flag: "🇪🇸", label: "Español" },
];

export default function FAQTab() {
  const { settings, faqs, saveFAQ, deleteFAQ, toggleFAQ, translations } = useWoodizStore();
  const [editFAQ, setEditFAQ] = useState<FAQ | null>(null);
  const [showForm, setShowForm] = useState(false);

  const sorted = [...faqs].sort((a, b) => a.order - b.order);
  const activeLocales = LOCALES.filter(l => translations.some(t => t.locale === l.locale));

  function openNew() { setEditFAQ({ ...EMPTY_FAQ, id: 0 } as FAQ); setShowForm(true); }
  function openEdit(faq: FAQ) { setEditFAQ({ ...faq }); setShowForm(true); }

  function handleSave() {
    if (!editFAQ || !editFAQ.question.trim()) return;
    saveFAQ(editFAQ);
    setShowForm(false);
    setEditFAQ(null);
  }

  function setTranslation(locale: string, field: "question" | "answer", value: string) {
    if (!editFAQ) return;
    setEditFAQ({
      ...editFAQ,
      translations: {
        ...(editFAQ.translations || {}),
        [locale]: { ...(editFAQ.translations?.[locale] || { question: "", answer: "" }), [field]: value },
      },
    });
  }

  return (
    <div className="p-8">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="font-extrabold text-2xl text-slate-800" style={{ fontFamily: "Poppins, sans-serif" }}>
            FAQ — Questions Fréquentes
          </h1>
          <p className="text-slate-400 text-sm mt-1">{faqs.filter(f => f.active).length} question(s) active(s) sur {faqs.length}</p>
        </div>
        <button onClick={openNew} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-semibold hover:opacity-90 shadow-md"
          style={{ background: settings.primaryColor }}>
          <Plus size={15} /> Ajouter une FAQ
        </button>
      </div>

      <div className="flex flex-col gap-3">
        {sorted.map(faq => (
          <div key={faq.id} className={`bg-white rounded-2xl border shadow-sm p-5 flex items-start gap-4 ${faq.active ? "border-slate-100" : "border-slate-100 opacity-50"}`}>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">#{faq.order}</span>
                {!faq.active && <span className="text-xs font-bold bg-red-50 text-red-400 px-2 py-0.5 rounded-full">Masquée</span>}
                {activeLocales.length > 0 && (
                  <div className="flex gap-1 ml-1">
                    {activeLocales.map(l => (
                      <span key={l.locale} className={`text-[10px] px-1.5 py-0.5 rounded-full ${faq.translations?.[l.locale]?.question ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-400"}`}>
                        {l.flag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="font-bold text-slate-800 text-sm mb-1" style={{ fontFamily: "Poppins, sans-serif" }}>{faq.question}</div>
              <div className="text-sm text-slate-400 line-clamp-2">{faq.answer}</div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button onClick={() => toggleFAQ(faq.id)} className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: faq.active ? "#DCFCE7" : "#F1F5F9" }}>
                {faq.active ? <Eye size={14} className="text-emerald-600" /> : <EyeOff size={14} className="text-slate-400" />}
              </button>
              <button onClick={() => openEdit(faq)} className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center">
                <Edit2 size={14} className="text-slate-600" />
              </button>
              <button onClick={() => deleteFAQ(faq.id)} className="w-8 h-8 rounded-lg bg-red-50 hover:bg-red-100 flex items-center justify-center">
                <Trash2 size={13} className="text-red-500" />
              </button>
            </div>
          </div>
        ))}

        {faqs.length === 0 && (
          <div className="border-2 border-dashed border-slate-200 rounded-2xl p-12 text-center text-slate-400">
            <div className="text-4xl mb-3">💬</div>
            <p className="font-medium">Aucune FAQ — ajoutez votre première question</p>
          </div>
        )}
      </div>

      {/* Form Modal */}
      {showForm && editFAQ && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/40 p-4" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="border-b border-slate-100 px-7 py-5 flex items-center justify-between sticky top-0 bg-white rounded-t-3xl z-10">
              <h2 className="font-bold text-lg text-slate-800" style={{ fontFamily: "Poppins, sans-serif" }}>
                {editFAQ.id ? "Modifier la FAQ" : "Nouvelle FAQ"}
              </h2>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-700 text-2xl leading-none">&times;</button>
            </div>

            <div className="p-7 flex flex-col gap-5">
              {/* FR */}
              <div className="bg-slate-50 rounded-xl p-4">
                <div className="text-xs font-bold text-slate-500 mb-3">🇫🇷 Français (principal)</div>
                <div className="flex flex-col gap-3">
                  <div>
                    <label className="form-label">Question *</label>
                    <input className="form-input" value={editFAQ.question}
                      onChange={e => setEditFAQ({ ...editFAQ, question: e.target.value })}
                      placeholder="ex: Livrez-vous à domicile ?" />
                  </div>
                  <div>
                    <label className="form-label">Réponse *</label>
                    <textarea className="form-input resize-none" rows={3} value={editFAQ.answer}
                      onChange={e => setEditFAQ({ ...editFAQ, answer: e.target.value })}
                      placeholder="Rédigez une réponse claire et concise..." />
                  </div>
                </div>
              </div>

              {/* Translations */}
              {activeLocales.length > 0 && (
                <div>
                  <label className="form-label">Traductions</label>
                  <div className="flex flex-col gap-3">
                    {activeLocales.map(({ locale, flag, label }) => (
                      <div key={locale} className="border border-slate-100 rounded-xl p-3">
                        <div className="text-xs font-bold text-slate-500 mb-2">{flag} {label}</div>
                        <div className="flex flex-col gap-2">
                          <input className="form-input text-sm"
                            placeholder={`Question en ${label}`}
                            value={editFAQ.translations?.[locale]?.question || ""}
                            onChange={e => setTranslation(locale, "question", e.target.value)} />
                          <textarea className="form-input text-sm resize-none" rows={2}
                            placeholder={`Réponse en ${label}`}
                            value={editFAQ.translations?.[locale]?.answer || ""}
                            onChange={e => setTranslation(locale, "answer", e.target.value)} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Ordre d'affichage</label>
                  <input type="number" className="form-input" value={editFAQ.order}
                    onChange={e => setEditFAQ({ ...editFAQ, order: parseInt(e.target.value) || 99 })} />
                </div>
                <div>
                  <label className="form-label">Statut</label>
                  <div className="flex items-center gap-3 mt-1">
                    <button onClick={() => setEditFAQ({ ...editFAQ, active: true })}
                      className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all ${editFAQ.active ? "text-white" : "bg-slate-100 text-slate-500"}`}
                      style={editFAQ.active ? { background: settings.primaryColor } : {}}>Visible</button>
                    <button onClick={() => setEditFAQ({ ...editFAQ, active: false })}
                      className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all ${!editFAQ.active ? "bg-slate-600 text-white" : "bg-slate-100 text-slate-500"}`}>
                      Masquée
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button onClick={handleSave} disabled={!editFAQ.question.trim() || !editFAQ.answer.trim()}
                  className="flex-1 py-3 rounded-xl text-white text-sm font-semibold hover:opacity-90 disabled:opacity-40 flex items-center justify-center gap-2"
                  style={{ background: settings.primaryColor }}>
                  <Check size={15} /> Sauvegarder
                </button>
                <button onClick={() => setShowForm(false)} className="px-5 py-3 rounded-xl bg-slate-100 text-slate-600 text-sm font-semibold hover:bg-slate-200 flex items-center gap-2">
                  <X size={15} /> Annuler
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
