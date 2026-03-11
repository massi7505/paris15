// components/admin/tabs/SEOTab.tsx
"use client";

import { useState } from "react";
import { Globe, Save, Eye, Map, Download, ChevronDown, ChevronRight } from "lucide-react";
import { useWoodizStore } from "@/lib/store";

function slugify(text: string) {
  return text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function SitemapGenerator() {
  const { products, categories, settings } = useWoodizStore();
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const baseUrl = typeof window !== "undefined" ? (window.location.hostname === "localhost" ? "https://woodiz.fr" : `${window.location.protocol}//${window.location.host}`) : "https://woodiz.fr";

  const entries = [
    { url: baseUrl, priority: "1.0", freq: "daily", label: "Page d'accueil" },
    ...categories.filter(c => c.active).map(c => ({
      url: `${baseUrl}/#categorie-${c.id}`,
      priority: "0.7",
      freq: "weekly",
      label: `Catégorie: ${c.name}`,
    })),
    ...products.filter(p => p.inStock).map(p => ({
      url: `${baseUrl}/#produit-${slugify(p.name)}`,
      priority: "0.8",
      freq: "weekly",
      label: `Produit: ${p.name}`,
    })),
    { url: `${baseUrl}/mentions-legales`, priority: "0.3", freq: "yearly", label: "Mentions légales" },
    { url: `${baseUrl}/cgu`, priority: "0.3", freq: "yearly", label: "CGU" },
    { url: `${baseUrl}/privacy`, priority: "0.3", freq: "yearly", label: "Confidentialité" },
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries.map(e => `  <url>\n    <loc>${e.url}</loc>\n    <changefreq>${e.freq}</changefreq>\n    <priority>${e.priority}</priority>\n    <lastmod>${new Date().toISOString().split("T")[0]}</lastmod>\n  </url>`).join("\n")}\n</urlset>`;

  function copyXml() {
    navigator.clipboard.writeText(xml);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function downloadXml() {
    const blob = new Blob([xml], { type: "application/xml" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "sitemap.xml";
    a.click();
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm mt-4 overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-6 hover:bg-slate-50 transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          <Map size={18} className="text-emerald-500" />
          <div>
            <div className="font-bold text-slate-800">Générateur de Sitemap XML</div>
            <div className="text-xs text-slate-400 mt-0.5">{entries.length} URLs générées dynamiquement</div>
          </div>
        </div>
        {expanded ? <ChevronDown size={16} className="text-slate-400" /> : <ChevronRight size={16} className="text-slate-400" />}
      </button>

      {expanded && (
        <div className="border-t border-slate-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm text-slate-500">Sitemap généré avec <span className="font-semibold text-slate-700">{products.filter(p => p.inStock).length} produits</span> et <span className="font-semibold text-slate-700">{categories.filter(c => c.active).length} catégories</span></div>
            <div className="flex gap-2">
              <button onClick={copyXml} className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${copied ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
                {copied ? "✓ Copié !" : "Copier XML"}
              </button>
              <button onClick={downloadXml} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-blue-50 text-blue-600 text-xs font-semibold hover:bg-blue-100">
                <Download size={13} /> Télécharger
              </button>
            </div>
          </div>
          <div className="flex flex-col gap-1.5 max-h-48 overflow-y-auto">
            {entries.map((e, i) => (
              <div key={i} className="flex items-center gap-3 py-1.5 border-b border-slate-50 last:border-0">
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${parseFloat(e.priority) >= 0.8 ? "bg-emerald-100 text-emerald-700" : parseFloat(e.priority) >= 0.6 ? "bg-blue-100 text-blue-600" : "bg-slate-100 text-slate-500"}`}>
                  {e.priority}
                </span>
                <span className="text-xs text-slate-500 truncate flex-1">{e.label}</span>
                <span className="text-[10px] text-slate-300">{e.freq}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 p-3 bg-slate-50 rounded-xl">
            <div className="text-xs text-slate-500">
              🔗 URL Sitemap automatique : <a href="/sitemap.xml" target="_blank" className="text-blue-500 underline">/sitemap.xml</a>
              <span className="ml-2 text-slate-400">(généré par Next.js)</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SEOTab() {
  const { settings, updateSettings } = useWoodizStore();
  const [form, setForm] = useState({ ...settings });
  const [preview, setPreview] = useState<"google" | "og">("google");

  function handleSave() {
    updateSettings(form);
  }

  function f(field: keyof typeof form) {
    return {
      value: (form[field] as string) || "",
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
        setForm({ ...form, [field]: e.target.value }),
    };
  }

  const metaDescLen = (form.metaDescription || "").length;
  const metaTitleLen = (form.metaTitle || "").length;

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-extrabold text-2xl text-slate-800" style={{ fontFamily: "Poppins, sans-serif" }}>
            SEO & Textes
          </h1>
          <p className="text-slate-400 text-sm mt-1">Métadonnées, textes du site, informations de contact</p>
        </div>
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-semibold shadow-md hover:opacity-90 transition-all"
          style={{ background: settings.primaryColor }}
        >
          <Save size={16} /> Sauvegarder
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Form */}
        <div className="flex flex-col gap-6">
          {/* SEO Section */}
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
            <h2 className="font-bold text-slate-800 mb-4 flex items-center gap-2" style={{ fontFamily: "Poppins, sans-serif" }}>
              <Globe size={18} style={{ color: settings.primaryColor }} />
              Référencement (SEO)
            </h2>
            <div className="flex flex-col gap-4">
              <div>
                <label className="form-label">
                  Titre SEO (meta title)
                  <span className={`ml-2 normal-case font-normal ${metaTitleLen > 60 ? "text-red-400" : "text-slate-400"}`}>
                    {metaTitleLen}/60 caractères recommandés
                  </span>
                </label>
                <input className="form-input" {...f("metaTitle")} placeholder="WOODIZ – Pizzeria Artisanale · Paris 15ème" />
              </div>
              <div>
                <label className="form-label">
                  Description SEO
                  <span className={`ml-2 normal-case font-normal ${metaDescLen > 160 ? "text-red-400" : "text-slate-400"}`}>
                    {metaDescLen}/160 caractères recommandés
                  </span>
                </label>
                <textarea className="form-input resize-none" rows={3} {...f("metaDescription")} placeholder="Description du site pour Google..." />
              </div>
              <div>
                <label className="form-label">Mots-clés (keywords)</label>
                <input className="form-input" {...f("metaKeywords")} placeholder="pizzeria paris 15, woodiz, pizza artisanale..." />
              </div>
            </div>
          </div>

          {/* Site texts */}
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
            <h2 className="font-bold text-slate-800 mb-4" style={{ fontFamily: "Poppins, sans-serif" }}>Textes du site</h2>
            <div className="flex flex-col gap-4">
              <div>
                <label className="form-label">Nom du site</label>
                <input className="form-input" {...f("siteName")} />
              </div>
              <div>
                <label className="form-label">Slogan / Tagline</label>
                <input className="form-input" {...f("tagline")} />
              </div>
              <div>
                <label className="form-label">Titre hero (utilisez \\n pour retour à la ligne)</label>
                <textarea className="form-input resize-none" rows={2} {...f("heroTitle")} />
              </div>
              <div>
                <label className="form-label">Sous-titre hero</label>
                <input className="form-input" {...f("heroSubtitle")} />
              </div>
              <div>
                <label className="form-label">Texte footer</label>
                <textarea className="form-input resize-none" rows={2} {...f("footerText")} />
              </div>
            </div>
          </div>

          {/* Contact */}
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
            <h2 className="font-bold text-slate-800 mb-4" style={{ fontFamily: "Poppins, sans-serif" }}>Coordonnées</h2>
            <div className="flex flex-col gap-4">
              {[
                { label: "Adresse", field: "address" as const },
                { label: "Téléphone", field: "phone" as const },
                { label: "Email", field: "email" as const },
                { label: "Horaires d'ouverture", field: "openHours" as const },
                { label: "Instagram URL", field: "instagramUrl" as const },
                { label: "Google Maps URL", field: "googleUrl" as const },
              ].map(({ label, field }) => (
                <div key={field}>
                  <label className="form-label">{label}</label>
                  <input className="form-input" {...f(field)} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Previews */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Eye size={16} className="text-slate-400" />
            <h2 className="font-bold text-sm text-slate-500 uppercase tracking-wide">Aperçu SERP</h2>
            <div className="ml-auto flex gap-1.5">
              {(["google", "og"] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setPreview(p)}
                  className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${preview === p ? "bg-amber-100 text-amber-700" : "text-slate-400 hover:bg-slate-100"}`}
                >
                  {p === "google" ? "Google" : "Open Graph"}
                </button>
              ))}
            </div>
          </div>

          {preview === "google" && (
            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
              <div className="text-xs text-slate-400 mb-3">📍 Résultat Google simulé</div>
              <div className="border border-slate-200 rounded-xl p-4 bg-white">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-4 h-4 rounded-full bg-blue-600 text-white text-[8px] flex items-center justify-center font-bold">G</div>
                  <span className="text-xs text-slate-500">{form.siteName?.toLowerCase()}.fr</span>
                </div>
                <div className="text-blue-700 text-base font-medium hover:underline cursor-pointer mb-1 leading-tight">
                  {form.metaTitle || "Titre de la page"}
                </div>
                <div className="text-sm text-slate-600 leading-relaxed">
                  {form.metaDescription || "Description de la page..."}
                </div>
              </div>

              {/* Character counters visual */}
              <div className="mt-4 flex flex-col gap-2">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-500">Titre</span>
                    <span className={metaTitleLen > 60 ? "text-red-500 font-semibold" : "text-emerald-600"}>
                      {metaTitleLen}/60
                    </span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${Math.min((metaTitleLen / 60) * 100, 100)}%`,
                        background: metaTitleLen > 60 ? "#EF4444" : settings.primaryColor,
                      }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-500">Description</span>
                    <span className={metaDescLen > 160 ? "text-red-500 font-semibold" : "text-emerald-600"}>
                      {metaDescLen}/160
                    </span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${Math.min((metaDescLen / 160) * 100, 100)}%`,
                        background: metaDescLen > 160 ? "#EF4444" : settings.primaryColor,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {preview === "og" && (
            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
              <div className="text-xs text-slate-400 mb-3">📱 Aperçu partage réseaux sociaux</div>
              <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
                <div
                  className="h-40 flex items-center justify-center text-white"
                  style={{ background: `linear-gradient(135deg, ${settings.accentColor}, ${settings.primaryColor})` }}
                >
                  <div className="text-center">
                    <div className="text-3xl mb-2">🍕</div>
                    <div className="font-black text-xl" style={{ fontFamily: "Poppins, sans-serif" }}>{form.siteName}</div>
                  </div>
                </div>
                <div className="p-3">
                  <div className="text-xs text-slate-400 uppercase tracking-wide mb-1">{form.siteName?.toLowerCase()}.fr</div>
                  <div className="font-semibold text-sm text-slate-800">{form.metaTitle}</div>
                  <div className="text-xs text-slate-500 mt-1 line-clamp-2">{form.metaDescription}</div>
                </div>
              </div>
            </div>
          )}

          {/* SEO Score */}
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm mt-4">
            <h3 className="font-bold text-sm text-slate-700 mb-4">Score SEO estimé</h3>
            {[
              { label: "Titre renseigné", ok: !!form.metaTitle },
              { label: "Titre ≤ 60 caractères", ok: metaTitleLen <= 60 },
              { label: "Description renseignée", ok: !!form.metaDescription },
              { label: "Description ≤ 160 caractères", ok: metaDescLen <= 160 },
              { label: "Mots-clés définis", ok: !!form.metaKeywords },
              { label: "Adresse renseignée", ok: !!form.address },
              { label: "Téléphone renseigné", ok: !!form.phone },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-2.5 py-1.5 text-sm">
                <span className={item.ok ? "text-emerald-500" : "text-slate-300"}>{item.ok ? "✓" : "○"}</span>
                <span className={item.ok ? "text-slate-700" : "text-slate-400"}>{item.label}</span>
              </div>
            ))}
          </div>

          {/* Sitemap Generator */}
          <SitemapGenerator />
        </div>
      </div>
    </div>
  );
}
