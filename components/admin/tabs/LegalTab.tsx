// components/admin/tabs/LegalTab.tsx
"use client";
import { useState } from "react";
import { Save, Eye } from "lucide-react";
import { useWoodizStore, LegalPage } from "@/lib/store";

export default function LegalTab() {
  const { legalPages, saveLegalPage, settings } = useWoodizStore();
  const [activePage, setActivePage] = useState<"mentions" | "cgu" | "privacy">("mentions");
  const [preview, setPreview] = useState(false);

  const page = legalPages?.find((p) => p.id === activePage) || { id: activePage as any, title: "", content: "", enabled: true };
  const [form, setForm] = useState<LegalPage>(page);

  function switchPage(id: "mentions" | "cgu" | "privacy") {
    setActivePage(id);
    const p = legalPages?.find((p) => p.id === id);
    if (p) setForm(p);
  }

  function handleSave() { saveLegalPage(form); }

  const tabs = [
    { id: "mentions" as const, label: "Mentions légales", url: "/mentions-legales" },
    { id: "cgu" as const, label: "CGU", url: "/cgu" },
    { id: "privacy" as const, label: "Confidentialité", url: "/privacy" },
  ];

  return (
    <div className="p-8">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="font-extrabold text-2xl text-slate-800" style={{ fontFamily: "Poppins, sans-serif" }}>Pages Légales</h1>
          <p className="text-slate-400 text-sm mt-1">Mentions légales, CGU, Politique de confidentialité</p>
        </div>
        <div className="flex gap-2">
          <a href={tabs.find((t) => t.id === activePage)?.url} target="_blank"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border border-slate-200 text-slate-600 hover:border-slate-300 transition-all">
            <Eye size={14} /> Voir
          </a>
          <button onClick={handleSave}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-semibold hover:opacity-90"
            style={{ background: settings.primaryColor }}>
            <Save size={14} /> Sauvegarder
          </button>
        </div>
      </div>

      {/* Page selector */}
      <div className="flex gap-2 mb-6">
        {tabs.map((tab) => (
          <button key={tab.id} onClick={() => switchPage(tab.id)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${activePage === tab.id ? "text-white shadow-md" : "bg-white text-slate-600 border border-slate-200"}`}
            style={activePage === tab.id ? { background: settings.primaryColor } : {}}>
            {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="form-label">Titre de la page</label>
            <input className="form-input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>
          <div className="flex items-end pb-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <div className={`relative w-10 h-5 rounded-full transition-colors ${form.enabled ? "bg-emerald-400" : "bg-slate-200"}`} onClick={() => setForm({ ...form, enabled: !form.enabled })}>
                <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${form.enabled ? "translate-x-5" : "translate-x-0.5"}`} />
              </div>
              <span className="text-sm font-medium text-slate-700">Page activée</span>
            </label>
          </div>
        </div>
        <div>
          <label className="form-label">Contenu (Markdown supporté: ## Titre, **Gras**)</label>
          <textarea
            className="form-input font-mono text-xs leading-relaxed resize-none"
            rows={20}
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
            placeholder="## Titre de section&#10;&#10;**Gras** et contenu normal..."
          />
        </div>
        <p className="text-xs text-slate-400 mt-2">💡 Utilisez ## pour les titres, **texte** pour le gras, et sautez une ligne pour les paragraphes.</p>
      </div>
    </div>
  );
}
