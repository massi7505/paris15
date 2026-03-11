// components/admin/tabs/ProductsTab.tsx
"use client";

import { useState, useMemo, useRef } from "react";
import { Plus, Edit2, Trash2, Search, Package, ToggleLeft, ToggleRight, Star, Upload, Link as LinkIcon, Zap } from "lucide-react";
import { useWoodizStore, Product } from "@/lib/store";
import { formatPrice } from "@/lib/utils";
import { compressToAvif, formatBytes } from "@/lib/avifCompress";

const FALLBACK_IMG = "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=80";

/** Returns a renderable src — replaces __idb: refs with the fallback until resolved */
function safeSrc(src?: string): string {
  if (!src) return FALLBACK_IMG;
  if (src.startsWith("__idb:")) return FALLBACK_IMG;
  return src;
}

const EMPTY_PRODUCT: Omit<Product, "id"> = {
  name: "",
  category: "tomate",
  desc: "",
  price: 10.9,
  badge: "",
  badgeColor: "#F59E0B",
  allergens: [],
  img: "",
  inStock: true,
  order: 99,
  featured: false,
};

const ALLERGEN_OPTIONS = [
  "🌾 Gluten", "🥛 Lactose", "🥚 Oeufs", "🐟 Poisson",
  "🥜 Fruits à coque", "🌱 Moutarde", "🌿 Céleri", "🦐 Crustacés",
];

export default function ProductsTab() {
  const { products, categories, saveProduct, deleteProduct, toggleStock, settings } = useWoodizStore();
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("all");
  const [filterStock, setFilterStock] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [imgMode, setImgMode] = useState<"url" | "upload">("url");
  const [compressInfo, setCompressInfo] = useState<{ format: string; savings: number; size: string } | null>(null);
  const [compressing, setCompressing] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [priceRaw, setPriceRaw] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const avifInputRef = useRef<HTMLInputElement>(null);

  const activeCats = useMemo(
    () => [...categories].filter((c) => c.active).sort((a, b) => a.order - b.order),
    [categories]
  );

  const filtered = useMemo(() => {
    return products
      .filter((p) => {
        const matchCat = filterCat === "all" || p.category === filterCat;
        const matchSearch =
          !search ||
          p.name.toLowerCase().includes(search.toLowerCase()) ||
          p.desc.toLowerCase().includes(search.toLowerCase());
        const matchStock =
          filterStock === "all" ||
          (filterStock === "in" && p.inStock) ||
          (filterStock === "out" && !p.inStock);
        return matchCat && matchSearch && matchStock;
      })
      .sort((a, b) => a.order - b.order);
  }, [products, search, filterCat, filterStock]);

  function openNew() {
    setEditProduct({ ...EMPTY_PRODUCT, id: 0 } as Product);
    setImgMode("url");
    setPriceRaw("");
    setUploadError(null);
    setCompressInfo(null);
    setShowForm(true);
  }

  function openEdit(p: Product) {
    setEditProduct({ ...p });
    setImgMode(p.img?.startsWith("http") ? "url" : "upload");
    setPriceRaw(p.price > 0 ? String(p.price) : "");
    setUploadError(null);
    setCompressInfo(null);
    setShowForm(true);
  }

  function handleSave() {
    if (!editProduct || !editProduct.name) return;
    saveProduct(editProduct);
    setShowForm(false);
    setEditProduct(null);
  }

  function toggleAllergen(a: string) {
    if (!editProduct) return;
    const list = editProduct.allergens.includes(a)
      ? editProduct.allergens.filter((x) => x !== a)
      : [...editProduct.allergens, a];
    setEditProduct({ ...editProduct, allergens: list });
  }

  async function handleAvifCompress(file: File) {
    setCompressing(true);
    setCompressInfo(null);
    setUploadError(null);
    try {
      const result = await compressToAvif(file, 0.78, 1200);
      const base64 = result.dataUrl.split(",")[1];
      const byteStr = atob(base64);
      const arr = new Uint8Array(byteStr.length);
      for (let i = 0; i < byteStr.length; i++) arr[i] = byteStr.charCodeAt(i);
      const blobData = new Blob([arr], { type: result.format === "avif" ? "image/avif" : "image/webp" });
      const ext = result.format === "avif" ? "avif" : "webp";
      const productId = editProduct ? editProduct.id || Date.now() : Date.now();
      const uploadFile = new File([blobData], "product-" + productId + "." + ext, { type: blobData.type });
      const form = new FormData();
      form.append("file", uploadFile);
      form.append("key", `product/${productId}`); // → woodiz/product/{id}.ext sur Cellar
      const res = await fetch("/api/upload", { method: "POST", body: form });
      const json = await res.json();
      if (json.ok && json.url && editProduct) {
        setEditProduct({ ...editProduct, img: json.url });
        setCompressInfo({ format: result.format.toUpperCase(), savings: result.savings, size: formatBytes(result.compressedSize) });
      } else {
        setUploadError(json.error ?? `Erreur upload (${res.status})`);
      }
    } catch (e) {
      console.error("Upload failed:", e);
      setUploadError(e instanceof Error ? e.message : "Erreur inconnue lors de l'upload");
    } finally {
      setCompressing(false);
    }
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-extrabold text-2xl text-slate-800" style={{ fontFamily: "Poppins, sans-serif" }}>
            Gestion des Produits
          </h1>
          <p className="text-slate-400 text-sm mt-1">{products.length} produits · {products.filter((p) => !p.inStock).length} épuisés</p>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-semibold shadow-md hover:opacity-90 active:scale-[.98] transition-all"
          style={{ background: settings.primaryColor, fontFamily: "Poppins, sans-serif" }}
        >
          <Plus size={16} /> Nouveau produit
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6 bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
        <div className="relative flex-1 min-w-[180px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher..."
            className="form-input pl-9"
          />
        </div>
        <select
          value={filterCat}
          onChange={(e) => setFilterCat(e.target.value)}
          className="form-input w-auto min-w-[160px]"
        >
          <option value="all">Toutes catégories</option>
          {activeCats.map((c) => (
            <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
          ))}
        </select>
        <select
          value={filterStock}
          onChange={(e) => setFilterStock(e.target.value)}
          className="form-input w-auto"
        >
          <option value="all">Tout le stock</option>
          <option value="in">En stock</option>
          <option value="out">Épuisés</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full admin-table">
          <thead>
            <tr>
              <th>Produit</th>
              <th>Catégorie</th>
              <th>Prix</th>
              <th>Badge</th>
              <th>Stock</th>
              <th>Vedette</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((product) => {
              const cat = categories.find((c) => c.id === product.category);
              return (
                <tr key={product.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="relative w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 bg-slate-100">
                        <img
                          src={safeSrc(product.img)}
                          alt={product.name}
                          className={`w-full h-full object-cover ${!product.inStock ? "grayscale" : ""}`}
                          onError={(e) => { e.currentTarget.src = FALLBACK_IMG; }}
                        />
                        {!product.inStock && (
                          <div className="absolute inset-0 rounded-xl bg-black/20 flex items-center justify-center">
                            <span className="text-[8px] text-white font-bold">ÉPUISÉ</span>
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-800">{product.name}</div>
                        <div className="text-xs text-slate-400 max-w-[200px] truncate">{product.desc}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="text-sm">
                      {cat?.icon} {cat?.name}
                    </span>
                  </td>
                  <td>
                    <span className="font-bold text-slate-800">{formatPrice(product.price)}</span>
                  </td>
                  <td>
                    {product.badge ? (
                      <span
                        className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white"
                        style={{ background: product.badgeColor }}
                      >
                        {product.badge}
                      </span>
                    ) : (
                      <span className="text-slate-300 text-xs">—</span>
                    )}
                  </td>
                  <td>
                    <button
                      onClick={() => toggleStock(product.id)}
                      className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full transition-all ${
                        product.inStock
                          ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                          : "bg-red-100 text-red-600 hover:bg-red-200"
                      }`}
                    >
                      {product.inStock ? (
                        <><ToggleRight size={14} /> En stock</>
                      ) : (
                        <><ToggleLeft size={14} /> Épuisé</>
                      )}
                    </button>
                  </td>
                  <td>
                    <Star
                      size={18}
                      className={`cursor-pointer transition-colors ${product.featured ? "text-amber-400 fill-amber-400" : "text-slate-300"}`}
                      onClick={() => saveProduct({ ...product, featured: !product.featured })}
                    />
                  </td>
                  <td>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => openEdit(product)}
                        className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 flex items-center justify-center transition-colors"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Supprimer "${product.name}" ?`))
                            deleteProduct(product.id);
                        }}
                        className="w-8 h-8 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 flex items-center justify-center transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400">
            <Package size={40} className="mb-3 opacity-30" />
            <p className="font-medium">Aucun produit trouvé</p>
          </div>
        )}
      </div>

      {/* Form Modal */}
      {showForm && editProduct && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/40 p-4" onClick={() => setShowForm(false)}>
          <div
            className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b border-slate-100 px-7 py-5 flex items-center justify-between z-10 rounded-t-3xl">
              <h2 className="font-bold text-lg text-slate-800" style={{ fontFamily: "Poppins, sans-serif" }}>
                {editProduct.id ? "Modifier le produit" : "Nouveau produit"}
              </h2>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-700 text-2xl leading-none">&times;</button>
            </div>

            <div className="p-7 flex flex-col gap-5">
              {/* Image section */}
              <div>
                <label className="form-label mb-2 block">Image du produit</label>
                <div className="flex gap-2 mb-3">
                  <button onClick={() => setImgMode("url")} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                    style={{ background: imgMode === "url" ? settings.primaryColor : "#F1F5F9", color: imgMode === "url" ? "#fff" : "#64748B" }}>
                    <LinkIcon size={12} /> URL
                  </button>
                  <button onClick={() => setImgMode("upload")} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                    style={{ background: imgMode === "upload" ? settings.primaryColor : "#F1F5F9", color: imgMode === "upload" ? "#fff" : "#64748B" }}>
                    <Upload size={12} /> Uploader
                  </button>
                  <button onClick={() => { setImgMode("upload"); setTimeout(() => avifInputRef.current?.click(), 50); }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all bg-purple-100 text-purple-700 hover:bg-purple-200">
                    <Zap size={12} /> AVIF
                  </button>
                </div>
                <div className="flex gap-4 items-start">
                  {/* Preview 1:1 */}
                  <div className="w-24 h-24 rounded-2xl overflow-hidden bg-slate-100 flex-shrink-0 border-2 border-dashed border-slate-200" style={{ aspectRatio: "1/1" }}>
                    {editProduct.img && !editProduct.img.startsWith("__idb:") ? (
                      <img
                        src={editProduct.img}
                        alt=""
                        className="w-full h-full object-cover"
                        style={{ aspectRatio: "1/1" }}
                        onError={(e) => { e.currentTarget.src = FALLBACK_IMG; }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-3xl">🍕</div>
                    )}
                  </div>
                  <div className="flex-1">
                    {imgMode === "url" ? (
                      <input
                        className="form-input"
                        value={editProduct.img?.startsWith("data:") || editProduct.img?.startsWith("__idb:") ? "" : (editProduct.img || "")}
                        onChange={(e) => setEditProduct({ ...editProduct, img: e.target.value })}
                        placeholder="https://images.unsplash.com/..."
                      />
                    ) : (
                      <div>
                        {/* AVIF compression input */}
                        <input
                          ref={avifInputRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            await handleAvifCompress(file);
                            e.target.value = "";
                          }}
                        />
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file || !editProduct) return;
                            await handleAvifCompress(file);
                            e.target.value = "";
                          }}
                        />
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="w-full h-10 rounded-xl border-2 border-dashed border-slate-300 hover:border-amber-400 flex items-center justify-center gap-2 text-sm text-slate-500 hover:text-amber-500 transition-all"
                        >
                          <Upload size={16} />
                          {editProduct.img && !editProduct.img.startsWith("__idb:") && editProduct.img !== ""
                            ? "✓ Image uploadée — cliquer pour changer"
                            : "Choisir une image"}
                        </button>
                        <p className="text-xs text-slate-400 mt-1.5">JPG, PNG, WebP · Max 2MB</p>
                        {/* AVIF compression button */}
                        <button
                          onClick={() => avifInputRef.current?.click()}
                          disabled={compressing}
                          className="mt-2 w-full h-9 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center gap-2 text-xs text-purple-700 font-semibold hover:bg-purple-100 transition-all disabled:opacity-50"
                        >
                          <Zap size={13} />
                          {compressing ? "Compression en cours..." : "Compresser en AVIF/WebP (optimal)"}
                        </button>
                        {uploadError && (
                          <div className="mt-2 flex items-center gap-2 text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                            ⚠️ {uploadError}
                          </div>
                        )}
                        {compressInfo && (
                          <div className="mt-2 flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 rounded-lg px-3 py-2">
                            <span>✓ Uploadé sur Cellar en <strong>{compressInfo.format}</strong></span>
                            <span>·</span>
                            <span>{compressInfo.size}</span>
                            {compressInfo.savings > 0 && <span className="font-bold">−{compressInfo.savings}%</span>}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Nom du produit *</label>
                  <input
                    className="form-input"
                    value={editProduct.name}
                    onChange={(e) => setEditProduct({ ...editProduct, name: e.target.value })}
                    placeholder="ex: Margherita"
                  />
                </div>
                <div>
                  <label className="form-label">Catégorie</label>
                  <select
                    className="form-input"
                    value={editProduct.category}
                    onChange={(e) => setEditProduct({ ...editProduct, category: e.target.value })}
                  >
                    {activeCats.map((c) => (
                      <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="form-label">Description / Ingrédients</label>
                <textarea
                  className="form-input resize-none"
                  rows={3}
                  value={editProduct.desc}
                  onChange={(e) => setEditProduct({ ...editProduct, desc: e.target.value })}
                  placeholder="Sauce tomate, mozza..."
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="form-label">Prix (€)</label>
                  <input
                    type="text"
                    inputMode="decimal"
                    className="form-input"
                    value={priceRaw}
                    onChange={(e) => {
                      // Allow free typing: digits, comma, dot only
                      const val = e.target.value.replace(/[^0-9.,]/g, "");
                      setPriceRaw(val);
                      // Parse immediately so the product stays in sync
                      const num = parseFloat(val.replace(",", "."));
                      setEditProduct({ ...editProduct!, price: isNaN(num) ? 0 : num });
                    }}
                    onBlur={() => {
                      // On blur: normalize display (e.g. "10." → "10", "10,5" → "10.5")
                      const num = parseFloat(priceRaw.replace(",", "."));
                      if (!isNaN(num)) {
                        setPriceRaw(String(num));
                        setEditProduct({ ...editProduct!, price: num });
                      }
                    }}
                    placeholder="ex: 10.50 ou 9,90"
                  />
                </div>
                <div>
                  <label className="form-label">Badge texte</label>
                  <input
                    className="form-input"
                    value={editProduct.badge}
                    onChange={(e) => setEditProduct({ ...editProduct, badge: e.target.value })}
                    placeholder="Bestseller, Nouveau..."
                  />
                </div>
                <div>
                  <label className="form-label">Couleur badge</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={editProduct.badgeColor || "#F59E0B"}
                      onChange={(e) => setEditProduct({ ...editProduct, badgeColor: e.target.value })}
                      className="rounded-lg border border-slate-200"
                    />
                    <span className="text-xs text-slate-400">{editProduct.badgeColor}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="form-label">Ordre d'affichage</label>
                  <input
                    type="number"
                    min="1"
                    className="form-input"
                    value={editProduct.order}
                    onChange={(e) => setEditProduct({ ...editProduct, order: parseInt(e.target.value) || 1 })}
                  />
                </div>
                <div className="flex flex-col justify-end">
                  <label className="flex items-center gap-2.5 cursor-pointer py-2">
                    <input
                      type="checkbox"
                      checked={editProduct.inStock}
                      onChange={(e) => setEditProduct({ ...editProduct, inStock: e.target.checked })}
                      className="w-4 h-4 rounded accent-amber-400"
                    />
                    <span className="text-sm font-medium text-slate-600">En stock</span>
                  </label>
                </div>
                <div className="flex flex-col justify-end">
                  <label className="flex items-center gap-2.5 cursor-pointer py-2">
                    <input
                      type="checkbox"
                      checked={editProduct.featured || false}
                      onChange={(e) => setEditProduct({ ...editProduct, featured: e.target.checked })}
                      className="w-4 h-4 rounded accent-amber-400"
                    />
                    <span className="text-sm font-medium text-slate-600">Produit vedette</span>
                  </label>
                </div>
              </div>

              {/* Allergens */}
              <div>
                <label className="form-label">Allergènes (FR)</label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {ALLERGEN_OPTIONS.map((a) => (
                    <button
                      key={a}
                      type="button"
                      onClick={() => toggleAllergen(a)}
                      className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-all ${
                        editProduct.allergens.includes(a)
                          ? "bg-amber-100 border-amber-300 text-amber-800"
                          : "bg-slate-50 border-slate-200 text-slate-500 hover:border-amber-200"
                      }`}
                    >
                      {a}
                    </button>
                  ))}
                </div>
                {/* Free-text allergen FR */}
                <div className="mb-3">
                  <label className="form-label">Allergènes texte libre (FR)</label>
                  <input className="form-input text-sm"
                    value={(editProduct as any).allergenText?.fr || ""}
                    onChange={(e) => setEditProduct({ ...editProduct, allergenText: { ...((editProduct as any).allergenText || {}), fr: e.target.value } } as any)}
                    placeholder="ex: Contient gluten, traces de noix..." />
                </div>
                {/* Multilingual allergen translations */}
                <div className="flex flex-col gap-2 p-3 bg-orange-50 rounded-xl border border-orange-100">
                  <p className="text-xs font-bold text-orange-600 mb-1">🌍 Traductions allergènes</p>
                  {[{locale:"en",flag:"🇬🇧",label:"English",placeholder:"Contains gluten, traces of nuts..."},{locale:"it",flag:"🇮🇹",label:"Italiano",placeholder:"Contiene glutine, tracce di noci..."},{locale:"es",flag:"🇪🇸",label:"Español",placeholder:"Contiene gluten, trazas de nueces..."}].map(({locale,flag,label,placeholder}) => (
                    <div key={locale} className="grid grid-cols-1 gap-1">
                      <div className="text-xs font-bold text-orange-500">{flag} {label}</div>
                      <input className="form-input text-xs"
                        value={editProduct.allergenTranslations?.[locale]?.join(", ") || ""}
                        onChange={(e) => setEditProduct({
                          ...editProduct,
                          allergenTranslations: {
                            ...(editProduct.allergenTranslations || {}),
                            [locale]: e.target.value ? e.target.value.split(",").map(s => s.trim()).filter(Boolean) : [],
                          }
                        })}
                        placeholder={`Badges: ${placeholder.split("...")[0].split(": ")[1] || "Gluten, Lactose"} (virgule)`} />
                      <input className="form-input text-xs"
                        value={(editProduct as any).allergenText?.[locale] || ""}
                        onChange={(e) => setEditProduct({ ...editProduct, allergenText: { ...((editProduct as any).allergenText || {}), [locale]: e.target.value } } as any)}
                        placeholder={`Texte: ${placeholder}`} />
                    </div>
                  ))}
                </div>
              </div>

              {/* Product Translations */}
              <div>
                <label className="form-label">Traductions (optionnel)</label>
                <div className="flex flex-col gap-3 p-3 bg-slate-50 rounded-xl">
                  {[{locale:"en",flag:"🇬🇧",label:"English"},{locale:"it",flag:"🇮🇹",label:"Italiano"},{locale:"es",flag:"🇪🇸",label:"Español"}].map(({locale,flag,label}) => (
                    <div key={locale}>
                      <div className="text-xs font-bold text-slate-400 mb-1.5">{flag} {label}</div>
                      <div className="grid grid-cols-1 gap-2">
                        <input className="form-input text-sm"
                          value={(editProduct as any).translations?.[locale]?.name || ""}
                          onChange={(e) => setEditProduct({ ...editProduct, translations: { ...(editProduct as any).translations, [locale]: { ...(editProduct as any).translations?.[locale], name: e.target.value } } } as any)}
                          placeholder={`Nom en ${label}`} />
                        <input className="form-input text-sm"
                          value={(editProduct as any).translations?.[locale]?.desc || ""}
                          onChange={(e) => setEditProduct({ ...editProduct, translations: { ...(editProduct as any).translations, [locale]: { ...(editProduct as any).translations?.[locale], desc: e.target.value } } } as any)}
                          placeholder={`Description en ${label}`} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleSave}
                  className="flex-1 py-3 rounded-xl text-white font-bold transition-opacity hover:opacity-90"
                  style={{ background: settings.primaryColor, fontFamily: "Poppins, sans-serif" }}
                >
                  {editProduct.id ? "Enregistrer les modifications" : "Créer le produit"}
                </button>
                <button
                  onClick={() => setShowForm(false)}
                  className="px-6 py-3 rounded-xl bg-slate-100 text-slate-600 font-semibold hover:bg-slate-200 transition-colors"
                >
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