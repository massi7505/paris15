// components/admin/tabs/Dashboard.tsx
"use client";

import { useWoodizStore } from "@/lib/store";
import { Package, CheckCircle, XCircle, Layers, Tag, TrendingUp } from "lucide-react";

const FALLBACK_IMG = "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=80";

/** Inline img src guard: returns fallback if src is an __idb: ref not yet resolved */
function safeSrc(src?: string): string {
  if (!src) return FALLBACK_IMG;
  if (src.startsWith("__idb:")) return FALLBACK_IMG;
  return src;
}

export default function DashboardTab() {
  const { products, categories, promos, settings, toggleStock } = useWoodizStore();

  const stats = [
    { label: "Produits total", value: products.length, color: "#3B82F6", icon: Package, bg: "#EFF6FF" },
    { label: "En stock", value: products.filter((p) => p.inStock).length, color: "#10B981", icon: CheckCircle, bg: "#ECFDF5" },
    { label: "Épuisés", value: products.filter((p) => !p.inStock).length, color: "#EF4444", icon: XCircle, bg: "#FEF2F2" },
    { label: "Catégories actives", value: categories.filter((c) => c.active).length, color: "#8B5CF6", icon: Layers, bg: "#F5F3FF" },
    { label: "Offres actives", value: promos.filter((p) => p.active).length, color: settings.primaryColor, icon: Tag, bg: "#FFFBEB" },
    { label: "Produits vedettes", value: products.filter((p) => p.featured).length, color: "#F59E0B", icon: TrendingUp, bg: "#FFFBEB" },
  ];

  const outOfStock = products.filter((p) => !p.inStock);
  const featured = products.filter((p) => p.featured);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="font-extrabold text-2xl text-slate-800" style={{ fontFamily: "Poppins, sans-serif" }}>
          Tableau de bord
        </h1>
        <p className="text-slate-500 mt-1 text-sm">
          Bienvenue dans l'interface d'administration de {settings.siteName}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {stats.map((s) => (
          <div
            key={s.label}
            className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-md transition-shadow"
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
              style={{ background: s.bg }}
            >
              <s.icon size={20} style={{ color: s.color }} />
            </div>
            <div
              className="font-black text-3xl mb-1"
              style={{ color: s.color, fontFamily: "Poppins, sans-serif" }}
            >
              {s.value}
            </div>
            <div className="text-xs text-slate-400 font-medium">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Out of stock */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <h3 className="font-bold text-base text-slate-800 mb-4 flex items-center gap-2" style={{ fontFamily: "Poppins, sans-serif" }}>
            <XCircle size={18} className="text-red-500" />
            Produits épuisés ({outOfStock.length})
          </h3>
          {outOfStock.length === 0 ? (
            <div className="flex items-center gap-2 text-emerald-600 text-sm font-medium py-4">
              <CheckCircle size={16} /> Tous les produits sont en stock
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {outOfStock.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-red-50 transition-colors"
                >
                  <img
                    src={safeSrc(p.img)}
                    alt={p.name}
                    className="w-10 h-10 rounded-lg object-cover flex-shrink-0 grayscale"
                    onError={(e) => { e.currentTarget.src = FALLBACK_IMG; }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm text-slate-800 truncate">{p.name}</div>
                    <div className="text-xs text-slate-400">{p.category}</div>
                  </div>
                  <button
                    onClick={() => toggleStock(p.id)}
                    className="text-xs font-semibold px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-700 hover:bg-emerald-200 transition-colors flex-shrink-0"
                  >
                    Remettre
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Featured products */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <h3 className="font-bold text-base text-slate-800 mb-4 flex items-center gap-2" style={{ fontFamily: "Poppins, sans-serif" }}>
            <TrendingUp size={18} style={{ color: settings.primaryColor }} />
            Produits vedettes ({featured.length})
          </h3>
          {featured.length === 0 ? (
            <p className="text-slate-400 text-sm py-4">Aucun produit vedette défini</p>
          ) : (
            <div className="flex flex-col gap-2">
              {featured.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center gap-3 p-3 rounded-xl bg-amber-50/50"
                >
                  <img
                    src={safeSrc(p.img)}
                    alt={p.name}
                    className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                    onError={(e) => { e.currentTarget.src = FALLBACK_IMG; }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm text-slate-800 truncate">{p.name}</div>
                    <div className="text-xs text-slate-400">{p.price.toFixed(2).replace(".", ",")} €</div>
                  </div>
                  <span
                    className="text-xs font-bold px-2.5 py-1 rounded-full text-white"
                    style={{ background: settings.primaryColor }}
                  >
                    Vedette
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick stats bar */}
      <div
        className="mt-6 rounded-2xl p-5 text-white"
        style={{ background: `linear-gradient(135deg, ${settings.accentColor}, ${settings.primaryColor})` }}
      >
        <div className="flex flex-wrap gap-8 items-center">
          <div>
            <div className="font-black text-3xl" style={{ fontFamily: "Poppins, sans-serif" }}>
              {products.reduce((s, p) => s + (p.inStock ? 1 : 0), 0)}/{products.length}
            </div>
            <div className="text-white/70 text-xs">Produits disponibles</div>
          </div>
          <div>
            <div className="font-black text-3xl" style={{ fontFamily: "Poppins, sans-serif" }}>
              {products.length > 0 ? Math.round((products.filter((p) => p.inStock).length / products.length) * 100) : 0}%
            </div>
            <div className="text-white/70 text-xs">Taux de disponibilité</div>
          </div>
          <div>
            <div className="font-black text-3xl" style={{ fontFamily: "Poppins, sans-serif" }}>
              {products.length > 0
                ? (products.reduce((s, p) => s + p.price, 0) / products.length).toFixed(2).replace(".", ",")
                : "0,00"} €
            </div>
            <div className="text-white/70 text-xs">Prix moyen</div>
          </div>
          <div className="flex-1 text-right">
            <div className="text-white/70 text-xs mb-1">Synchronisation</div>
            <div className="inline-flex items-center gap-1.5 bg-white/20 px-3 py-1.5 rounded-full text-xs font-semibold">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              En temps réel
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
