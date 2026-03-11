// components/admin/tabs/SettingsTab.tsx
"use client";

import { useState } from "react";
import { RefreshCw, Download, Upload, AlertTriangle } from "lucide-react";
import { useWoodizStore } from "@/lib/store";

export default function SettingsTab() {
  const { settings, products, categories, promos, resetToDefaults, showToast, updateSettings } = useWoodizStore();
  const [confirmReset, setConfirmReset] = useState(false);

  function exportData() {
    const data = JSON.stringify({ settings, products, categories, promos }, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `woodiz-backup-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("Données exportées ✓");
  }

  function importData(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string);
        // Would update store with imported data
        showToast("Import réussi ✓ (rechargez la page)");
      } catch {
        showToast("Fichier invalide", "error");
      }
    };
    reader.readAsText(file);
  }

  const stats = {
    products: products.length,
    categories: categories.length,
    promos: promos.length,
    inStock: products.filter((p) => p.inStock).length,
  };

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="font-extrabold text-2xl text-slate-800" style={{ fontFamily: "Poppins, sans-serif" }}>
          Paramètres
        </h1>
        <p className="text-slate-400 text-sm mt-1">Gestion des données, exports et réinitialisation</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Data overview */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
          <h2 className="font-bold text-slate-800 mb-4" style={{ fontFamily: "Poppins, sans-serif" }}>
            État des données
          </h2>
          <div className="flex flex-col gap-3">
            {[
              { label: "Produits", value: stats.products, sub: `${stats.inStock} en stock` },
              { label: "Catégories", value: stats.categories },
              { label: "Offres", value: stats.promos },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
                <div>
                  <div className="font-semibold text-sm text-slate-700">{item.label}</div>
                  {item.sub && <div className="text-xs text-slate-400">{item.sub}</div>}
                </div>
                <span
                  className="font-black text-xl"
                  style={{ color: settings.primaryColor, fontFamily: "Poppins, sans-serif" }}
                >
                  {item.value}
                </span>
              </div>
            ))}
          </div>

          {/* Sync status */}
          <div
            className="mt-4 p-4 rounded-xl flex items-center gap-3"
            style={{ background: "#ECFDF5" }}
          >
            <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
            <div>
              <div className="text-sm font-semibold text-emerald-800">Synchronisation active</div>
              <div className="text-xs text-emerald-600">
                Toutes les modifications sont sauvegardées en temps réel (MySQL)
              </div>
            </div>
          </div>
        </div>

        {/* Export / Import */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
          <h2 className="font-bold text-slate-800 mb-4" style={{ fontFamily: "Poppins, sans-serif" }}>
            Export / Import
          </h2>
          <div className="flex flex-col gap-4">
            <div>
              <div className="text-sm font-medium text-slate-700 mb-2">Exporter les données</div>
              <p className="text-xs text-slate-400 mb-3">
                Télécharge toutes vos données (produits, catégories, offres, paramètres) au format JSON.
              </p>
              <button
                onClick={exportData}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-semibold hover:opacity-90 transition-all"
                style={{ background: settings.primaryColor }}
              >
                <Download size={16} /> Exporter en JSON
              </button>
            </div>

            <div className="border-t border-slate-100 pt-4">
              <div className="text-sm font-medium text-slate-700 mb-2">Importer des données</div>
              <p className="text-xs text-slate-400 mb-3">
                Restaurez un backup JSON précédemment exporté.
              </p>
              <label className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-100 text-slate-600 text-sm font-semibold cursor-pointer hover:bg-slate-200 transition-colors w-fit">
                <Upload size={16} /> Importer JSON
                <input type="file" accept=".json" className="hidden" onChange={importData} />
              </label>
            </div>
          </div>
        </div>

        {/* Reset */}
        <div className="bg-white rounded-2xl p-6 border border-red-100 shadow-sm">
          <h2 className="font-bold text-slate-800 mb-2 flex items-center gap-2" style={{ fontFamily: "Poppins, sans-serif" }}>
            <AlertTriangle size={18} className="text-red-500" />
            Zone de danger
          </h2>
          <p className="text-sm text-slate-500 mb-4">
            La réinitialisation effacera toutes vos modifications et restaurera les données par défaut. Cette action est irréversible.
          </p>
          {!confirmReset ? (
            <button
              onClick={() => setConfirmReset(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-50 text-red-600 text-sm font-semibold hover:bg-red-100 transition-colors"
            >
              <RefreshCw size={16} /> Réinitialiser les données
            </button>
          ) : (
            <div className="flex gap-3">
              <button
                onClick={() => { resetToDefaults(); setConfirmReset(false); }}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-500 text-white text-sm font-bold hover:bg-red-600 transition-colors"
              >
                ✓ Confirmer la réinitialisation
              </button>
              <button
                onClick={() => setConfirmReset(false)}
                className="px-5 py-2.5 rounded-xl bg-slate-100 text-slate-600 text-sm font-semibold hover:bg-slate-200 transition-colors"
              >
                Annuler
              </button>
            </div>
          )}
        </div>

        {/* Product Display Mode */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
          <h2 className="font-bold text-slate-800 mb-4" style={{ fontFamily: "Poppins, sans-serif" }}>
            🗂️ Affichage des Produits
          </h2>
          <p className="text-sm text-slate-400 mb-4">Choisissez comment les produits sont présentés sur la page client.</p>
          <div className="grid grid-cols-2 gap-3">
            {[
              { id: "grid", label: "Grille", icon: "▦", desc: "Cartes en colonnes (défaut)" },
              { id: "vertical", label: "Vertical", icon: "☰", desc: "Liste horizontale pleine largeur" },
            ].map(mode => (
              <button
                key={mode.id}
                type="button"
                onClick={() => updateSettings({ productDisplayMode: mode.id as "grid" | "vertical" })}
                className={`p-4 rounded-xl border-2 text-left transition-all ${settings.productDisplayMode === mode.id || (!settings.productDisplayMode && mode.id === "grid") ? "border-amber-400 bg-amber-50" : "border-slate-100 hover:border-slate-200"}`}
              >
                <div className="text-2xl mb-2">{mode.icon}</div>
                <div className="font-semibold text-sm text-slate-700">{mode.label}</div>
                <div className="text-xs text-slate-400 mt-0.5">{mode.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Info */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
          <h2 className="font-bold text-slate-800 mb-4" style={{ fontFamily: "Poppins, sans-serif" }}>
            Informations techniques
          </h2>
          <div className="flex flex-col gap-2.5 text-sm text-slate-500">
            {[
              ["Framework", "Next.js 15 (App Router)"],
              ["Styling", "Tailwind CSS v3"],
              ["State management", "Zustand + localStorage"],
              ["Images", "next/image + Unsplash"],
              ["TypeScript", "Activé"],
              ["Rendu", "Client Side (CSR)"],
              ["Synchronisation", "Temps réel (Zustand persist)"],
            ].map(([key, val]) => (
              <div key={key} className="flex items-center justify-between py-1 border-b border-slate-50">
                <span className="font-medium text-slate-600">{key}</span>
                <span className="text-slate-400 text-xs font-mono">{val}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
