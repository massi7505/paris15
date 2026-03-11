// components/admin/tabs/CategoriesTab.tsx
"use client";

import { useState, useRef } from "react";
import { Plus, Edit2, Trash2, GripVertical, Eye, EyeOff, Upload, X } from "lucide-react";
import { useWoodizStore, Category } from "@/lib/store";
import { slugify } from "@/lib/utils";

const EMPTY_CAT: Category = { id: "", name: "", icon: "🍕", order: 99, active: true, description: "" };
const EMOJI_OPTIONS = ["🍅", "🥛", "⭐", "🍮", "🥤", "🍕", "🥗", "🍖", "🥩", "🥙", "🌮", "🥪"];

export default function CategoriesTab() {
  const { categories, products, saveCategory, deleteCategory, settings } = useWoodizStore();
  const [showForm, setShowForm] = useState(false);
  const [editCat, setEditCat] = useState<Category | null>(null);
  const [iconMode, setIconMode] = useState<"emoji" | "url" | "upload">("emoji");
  const fileRef = useRef<HTMLInputElement>(null);

  const sorted = [...categories].sort((a, b) => a.order - b.order);

  function openNew() {
    setEditCat({ ...EMPTY_CAT });
    setIconMode("emoji");
    setShowForm(true);
  }

  function openEdit(c: Category) {
    setEditCat({ ...c });
    setIconMode(c.iconUrl ? (c.iconUrl.startsWith("data:") ? "upload" : "url") : "emoji");
    setShowForm(true);
  }

  function handleSave() {
    if (!editCat || !editCat.name) return;
    const id = editCat.id || slugify(editCat.name);
    saveCategory({ ...editCat, id });
    setShowForm(false);
    setEditCat(null);
  }

  function toggleActive(cat: Category) {
    saveCategory({ ...cat, active: !cat.active });
  }

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !editCat) return;
    e.target.value = "";
    const form = new FormData();
    form.append("file", file);
    fetch("/api/upload", { method: "POST", body: form })
      .then((r) => r.json())
      .then((json) => { if (json.ok && json.url) setEditCat((prev) => prev ? { ...prev, iconUrl: json.url } : prev); })
      .catch(console.error);
  }

  function clearIcon() {
    if (!editCat) return;
    setEditCat({ ...editCat, iconUrl: "" });
    setIconMode("emoji");
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-extrabold text-2xl text-slate-800" style={{ fontFamily: "Poppins, sans-serif" }}>
            Gestion des Catégories
          </h1>
          <p className="text-slate-400 text-sm mt-1">{categories.length} catégories · Ordre d'affichage éditable</p>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-semibold shadow-md hover:opacity-90 transition-all"
          style={{ background: settings.primaryColor }}
        >
          <Plus size={16} /> Nouvelle catégorie
        </button>
      </div>

      {/* Categories list */}
      <div className="flex flex-col gap-3">
        {sorted.map((cat) => {
          const productCount = products.filter((p) => p.category === cat.id).length;
          return (
            <div
              key={cat.id}
              className={`bg-white rounded-2xl p-5 shadow-sm border flex items-center gap-4 transition-all ${
                cat.active ? "border-slate-100" : "border-slate-200 opacity-60"
              }`}
            >
              <GripVertical size={18} className="text-slate-300 cursor-grab flex-shrink-0" />

              {/* Icon display: image or emoji */}
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 overflow-hidden"
                style={{ background: cat.active ? "#FEF3C7" : "#F1F5F9" }}
              >
                {cat.iconUrl ? (
                  <img src={cat.iconUrl} alt={cat.name} className="w-full h-full object-cover" />
                ) : (
                  cat.icon
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="font-bold text-slate-800" style={{ fontFamily: "Poppins, sans-serif" }}>
                    {cat.name}
                  </span>
                  <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">#{cat.order}</span>
                  {cat.iconUrl && <span className="text-xs text-blue-500 bg-blue-50 px-2 py-0.5 rounded-full">🖼 Image</span>}
                  {!cat.active && <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">Masquée</span>}
                </div>
                {cat.description && <p className="text-sm text-slate-400 truncate">{cat.description}</p>}
                <div className="text-xs text-slate-400 mt-1">{productCount} produit{productCount > 1 ? "s" : ""}</div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <button onClick={() => toggleActive(cat)}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${cat.active ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-100" : "bg-slate-50 text-slate-400 hover:bg-slate-100"}`}
                  title={cat.active ? "Masquer" : "Afficher"}>
                  {cat.active ? <Eye size={15} /> : <EyeOff size={15} />}
                </button>
                <button onClick={() => openEdit(cat)} className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 flex items-center justify-center transition-colors">
                  <Edit2 size={14} />
                </button>
                <button onClick={() => { if (confirm(`Supprimer la catégorie "${cat.name}" ?`)) deleteCategory(cat.id); }}
                  className="w-8 h-8 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 flex items-center justify-center transition-colors">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Form Modal */}
      {showForm && editCat && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/40 p-4" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="border-b border-slate-100 px-7 py-5 flex items-center justify-between sticky top-0 bg-white z-10">
              <h2 className="font-bold text-lg text-slate-800" style={{ fontFamily: "Poppins, sans-serif" }}>
                {editCat.id ? "Modifier la catégorie" : "Nouvelle catégorie"}
              </h2>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-700 text-2xl">&times;</button>
            </div>

            <div className="p-7 flex flex-col gap-5">

              {/* Icon type selector */}
              <div>
                <label className="form-label">Type d'icône</label>
                <div className="flex gap-2 mb-3">
                  {[{ key: "emoji", label: "Emoji" }, { key: "url", label: "URL image" }, { key: "upload", label: "Uploader" }].map(({ key, label }) => (
                    <button key={key} type="button"
                      onClick={() => { setIconMode(key as any); if (key === "emoji") setEditCat({ ...editCat, iconUrl: "" }); }}
                      className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all ${iconMode === key ? "text-white" : "bg-slate-100 text-slate-500 hover:bg-slate-200"}`}
                      style={iconMode === key ? { background: settings.primaryColor } : {}}
                    >{label}</button>
                  ))}
                </div>

                {/* Emoji mode */}
                {iconMode === "emoji" && (
                  <>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {EMOJI_OPTIONS.map((e) => (
                        <button key={e} type="button" onClick={() => setEditCat({ ...editCat, icon: e, iconUrl: "" })}
                          className={`w-10 h-10 rounded-xl text-xl transition-all ${editCat.icon === e ? "bg-amber-100 ring-2 ring-amber-400" : "bg-slate-50 hover:bg-slate-100"}`}>
                          {e}
                        </button>
                      ))}
                    </div>
                    <input className="form-input" value={editCat.icon}
                      onChange={(e) => setEditCat({ ...editCat, icon: e.target.value, iconUrl: "" })}
                      placeholder="Emoji personnalisé" />
                  </>
                )}

                {/* URL mode */}
                {iconMode === "url" && (
                  <div>
                    <input className="form-input" value={editCat.iconUrl || ""}
                      onChange={(e) => setEditCat({ ...editCat, iconUrl: e.target.value })}
                      placeholder="https://exemple.com/image.png" />
                    {editCat.iconUrl && (
                      <div className="mt-2 flex items-center gap-3">
                        <div className="w-16 h-12 rounded-xl overflow-hidden bg-slate-100">
                          <img src={editCat.iconUrl} alt="preview" className="w-full h-full object-cover" />
                        </div>
                        <button onClick={clearIcon} className="text-xs text-red-500 flex items-center gap-1"><X size={12} /> Supprimer</button>
                      </div>
                    )}
                  </div>
                )}

                {/* Upload mode */}
                {iconMode === "upload" && (
                  <div>
                    <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                    {editCat.iconUrl ? (
                      <div className="flex items-center gap-3">
                        <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-100">
                          <img src={editCat.iconUrl} alt="preview" className="w-full h-full object-cover" />
                        </div>
                        <div className="flex flex-col gap-2">
                          <button onClick={() => fileRef.current?.click()}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 text-slate-600 hover:bg-slate-200">
                            <Upload size={12} /> Changer
                          </button>
                          <button onClick={clearIcon} className="flex items-center gap-1 text-xs text-red-500"><X size={12} /> Supprimer</button>
                        </div>
                      </div>
                    ) : (
                      <button onClick={() => fileRef.current?.click()}
                        className="w-full py-8 rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center gap-2 text-slate-400 hover:border-amber-300 hover:text-amber-500 transition-all">
                        <Upload size={24} />
                        <span className="text-sm font-medium">Cliquer pour uploader une image</span>
                        <span className="text-xs">PNG, JPG, WebP</span>
                      </button>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label className="form-label">Nom de la catégorie *</label>
                <input className="form-input" value={editCat.name}
                  onChange={(e) => setEditCat({ ...editCat, name: e.target.value })}
                  placeholder="ex: Base Tomate" />
              </div>

              <div>
                <label className="form-label">Description (optionnelle)</label>
                <input className="form-input" value={editCat.description || ""}
                  onChange={(e) => setEditCat({ ...editCat, description: e.target.value })}
                  placeholder="Pizzas sur base sauce tomate..." />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Ordre d'affichage</label>
                  <input type="number" min="1" className="form-input" value={editCat.order}
                    onChange={(e) => setEditCat({ ...editCat, order: parseInt(e.target.value) || 1 })} />
                </div>
                <div className="flex flex-col justify-end">
                  <label className="flex items-center gap-2.5 cursor-pointer py-2">
                    <input type="checkbox" checked={editCat.active}
                      onChange={(e) => setEditCat({ ...editCat, active: e.target.checked })}
                      className="w-4 h-4 rounded accent-amber-400" />
                    <span className="text-sm font-medium text-slate-600">Catégorie active</span>
                  </label>
                </div>
              </div>

              {/* Translations */}
              <div>
                <label className="form-label">Traductions (EN / IT / ES)</label>
                <div className="flex flex-col gap-3 mt-2 p-3 bg-slate-50 rounded-xl">
                  {[{locale:"en",flag:"🇬🇧"},{locale:"it",flag:"🇮🇹"},{locale:"es",flag:"🇪🇸"}].map(({locale,flag}) => (
                    <div key={locale}>
                      <div className="text-xs font-bold text-slate-400 mb-1">{flag} {locale.toUpperCase()}</div>
                      <input className="form-input text-sm"
                        value={editCat.translations?.[locale]?.name || ""}
                        onChange={(e) => setEditCat({ ...editCat, translations: { ...editCat.translations, [locale]: { ...editCat.translations?.[locale], name: e.target.value } } })}
                        placeholder={`Nom en ${locale}`} />
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={handleSave}
                  className="flex-1 py-3 rounded-xl text-white font-bold hover:opacity-90 transition-opacity"
                  style={{ background: settings.primaryColor }}>
                  {editCat.id ? "Enregistrer" : "Créer"}
                </button>
                <button onClick={() => setShowForm(false)} className="px-5 py-3 rounded-xl bg-slate-100 text-slate-600 font-semibold hover:bg-slate-200">
                  Annuler
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}