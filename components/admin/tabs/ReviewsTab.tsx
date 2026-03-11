// components/admin/tabs/ReviewsTab.tsx
"use client";
import { useState } from "react";
import { Plus, Trash2, Edit2, Check, X, Star, ToggleLeft, ToggleRight } from "lucide-react";
import { useWoodizStore, CustomerReview } from "@/lib/store";

function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <button key={s} type="button" onClick={() => onChange(s)}>
          <Star size={20} fill={s <= value ? "#FFB800" : "#E5E7EB"} stroke={s <= value ? "#FFB800" : "#E5E7EB"} />
        </button>
      ))}
    </div>
  );
}

const BLANK: Omit<CustomerReview, "id"> = { name: "", rating: 5, text: "", date: new Date().toISOString().split("T")[0], active: true, order: 0 };

export default function ReviewsTab() {
  const { reviews, saveReview, deleteReview, toggleReview, settings } = useWoodizStore();
  const [editing, setEditing] = useState<CustomerReview | null>(null);
  const [form, setForm] = useState<Omit<CustomerReview, "id">>(BLANK);

  function startNew() { setEditing({ id: 0, ...BLANK, order: reviews.length + 1 }); setForm({ ...BLANK, order: reviews.length + 1 }); }
  function startEdit(r: CustomerReview) { setEditing(r); setForm({ name: r.name, rating: r.rating, text: r.text, date: r.date, active: r.active, order: r.order }); }
  function cancel() { setEditing(null); }
  function save() {
    if (!form.name || !form.text) return;
    saveReview({ ...form, id: editing!.id || 0 });
    setEditing(null);
  }

  const sorted = [...reviews].sort((a, b) => a.order - b.order);

  return (
    <div className="p-8">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="font-extrabold text-2xl text-slate-800" style={{ fontFamily: "Poppins, sans-serif" }}>Avis Clients</h1>
          <p className="text-slate-400 text-sm mt-1">Gérez les avis affichés sur la page d'accueil</p>
        </div>
        <button onClick={startNew} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-semibold hover:opacity-90"
          style={{ background: settings.primaryColor }}>
          <Plus size={15} /> Ajouter un avis
        </button>
      </div>

      {/* Edit form */}
      {editing && (
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm mb-6">
          <h2 className="font-bold text-slate-800 mb-4">{editing.id ? "Modifier l'avis" : "Nouvel avis"}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="form-label">Nom du client</label>
              <input className="form-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Sophie M." />
            </div>
            <div>
              <label className="form-label">Date</label>
              <input className="form-input" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
            </div>
          </div>
          <div className="mb-4">
            <label className="form-label">Note</label>
            <StarPicker value={form.rating} onChange={(v) => setForm({ ...form, rating: v })} />
          </div>
          <div className="mb-4">
            <label className="form-label">Texte de l'avis</label>
            <textarea className="form-input min-h-[80px] resize-none" value={form.text} onChange={(e) => setForm({ ...form, text: e.target.value })} placeholder="Excellent ! La pizza était parfaite..." />
          </div>
          <div className="mb-4">
            <label className="form-label">Ordre d'affichage</label>
            <input className="form-input" type="number" value={form.order} onChange={(e) => setForm({ ...form, order: parseInt(e.target.value) || 0 })} />
          </div>
          <div className="flex gap-3">
            <button onClick={save} className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-semibold" style={{ background: settings.primaryColor }}>
              <Check size={14} /> Sauvegarder
            </button>
            <button onClick={cancel} className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-500 bg-slate-100">
              <X size={14} className="inline mr-1" /> Annuler
            </button>
          </div>
        </div>
      )}

      {/* Reviews list */}
      <div className="flex flex-col gap-3">
        {sorted.map((review) => (
          <div key={review.id} className={`bg-white rounded-2xl p-5 border shadow-sm ${review.active ? "border-slate-100" : "border-slate-100 opacity-60"}`}>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white text-sm flex-shrink-0"
                  style={{ background: settings.primaryColor }}>
                  {review.name.charAt(0)}
                </div>
                <div>
                  <div className="font-bold text-sm text-slate-800">{review.name}</div>
                  <div className="flex gap-0.5 mt-0.5">
                    {[...Array(5)].map((_, i) => <Star key={i} size={11} fill={i < review.rating ? "#FFB800" : "#E5E7EB"} stroke={i < review.rating ? "#FFB800" : "#E5E7EB"} />)}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">{new Date(review.date).toLocaleDateString("fr-FR")}</span>
                <button onClick={() => toggleReview(review.id)} className="text-slate-400 hover:text-amber-500 transition-colors">
                  {review.active ? <ToggleRight size={20} className="text-emerald-500" /> : <ToggleLeft size={20} />}
                </button>
                <button onClick={() => startEdit(review)} className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center hover:bg-slate-200">
                  <Edit2 size={12} className="text-slate-500" />
                </button>
                <button onClick={() => deleteReview(review.id)} className="w-7 h-7 rounded-lg bg-red-50 flex items-center justify-center hover:bg-red-100">
                  <Trash2 size={12} className="text-red-500" />
                </button>
              </div>
            </div>
            <p className="text-sm text-slate-600 mt-3 leading-relaxed">{review.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
