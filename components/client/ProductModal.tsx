// components/client/ProductModal.tsx
"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { X } from "lucide-react";
import { Product, useWoodizStore } from "@/lib/store";
import { getImage } from "@/lib/imageDb";
import { formatPrice } from "@/lib/utils";

const FALLBACK_IMG = "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=600";

const ALLERGEN_TRANSLATIONS: Record<string, Record<string, string>> = {
  en: {
    "🌾 Gluten": "🌾 Gluten", "🥛 Lactose": "🥛 Lactose", "🥚 Oeufs": "🥚 Eggs",
    "🐟 Poisson": "🐟 Fish", "🥜 Fruits à coque": "🥜 Tree Nuts",
    "🌱 Moutarde": "🌱 Mustard", "🌿 Céleri": "🌿 Celery", "🦐 Crustacés": "🦐 Crustaceans",
  },
  it: {
    "🌾 Gluten": "🌾 Glutine", "🥛 Lactose": "🥛 Lattosio", "🥚 Oeufs": "🥚 Uova",
    "🐟 Poisson": "🐟 Pesce", "🥜 Fruits à coque": "🥜 Frutta a guscio",
    "🌱 Moutarde": "🌱 Senape", "🌿 Céleri": "🌿 Sedano", "🦐 Crustacés": "🦐 Crostacei",
  },
  es: {
    "🌾 Gluten": "🌾 Gluten", "🥛 Lactose": "🥛 Lactosa", "🥚 Oeufs": "🥚 Huevos",
    "🐟 Poisson": "🐟 Pescado", "🥜 Fruits à coque": "🥜 Frutos secos",
    "🌱 Moutarde": "🌱 Mostaza", "🌿 Céleri": "🌿 Apio", "🦐 Crustacés": "🦐 Crustáceos",
  },
};

function isValidImgSrc(src?: string): boolean {
  if (!src) return false;
  if (src.startsWith("data:image/")) return true;
  if (src.startsWith("/")) return true;
  try {
    const { protocol } = new URL(src);
    return protocol === "http:" || protocol === "https:";
  } catch {
    return false;
  }
}

interface ProductModalProps {
  product: Product | null;
  onClose: () => void;
  primaryColor: string;
  t: (key: string) => string;
}

export default function ProductModal({ product, onClose, primaryColor, t }: ProductModalProps) {
  const { activeLocale } = useWoodizStore();
  const [mounted, setMounted] = useState(false);
  const [imgSrc, setImgSrc] = useState<string>(
    product && isValidImgSrc(product.img) ? product.img! : FALLBACK_IMG
  );

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!product) return;
    const raw = product.img;
    if (!raw) { setImgSrc(FALLBACK_IMG); return; }
    if (isValidImgSrc(raw)) { setImgSrc(raw); return; }
    if (raw.startsWith("__idb:")) {
      const idbKey = raw.slice("__idb:".length);
      getImage(idbKey)
        .then((dataUrl) => { if (dataUrl) setImgSrc(dataUrl); })
        .catch(() => {});
    }
  }, [product?.img]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  useEffect(() => {
    if (product) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [product]);

  if (!product) return null;

  const locale = mounted ? activeLocale : "fr";
  const displayName = locale !== "fr" && product.translations?.[locale]?.name
    ? product.translations[locale].name : product.name;
  const displayDesc = locale !== "fr" && product.translations?.[locale]?.desc
    ? product.translations[locale].desc : product.desc;

  const allergenMap = ALLERGEN_TRANSLATIONS[locale] || {};
  const displayAllergens = product.allergenTranslations?.[locale]?.length
    ? product.allergenTranslations[locale]
    : product.allergens.map(a => allergenMap[a] || a);
  const allergensLabel = mounted ? t("product.allergens") : "Allergènes";
  const closeLabel = mounted ? t("product.close") : "Fermer";

  return (
    <div className="fixed inset-0 z-[500] flex items-end justify-center bg-black/55 animate-fade-in" onClick={onClose}>
      <div className="bg-white rounded-t-[28px] w-full max-w-lg max-h-[92vh] overflow-y-auto animate-scale-in" onClick={(e) => e.stopPropagation()}>
        {/* Image 1:1 */}
        <div className="relative w-full rounded-t-[28px] overflow-hidden bg-amber-50" style={{ paddingBottom: "100%" }}>
          <Image
            src={imgSrc}
            alt={displayName}
            fill
            className="object-cover"
            unoptimized={imgSrc.startsWith("data:")}
          />
          <button onClick={onClose} className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white flex items-center justify-center shadow-lg hover:bg-slate-100 transition-colors z-10">
            <X size={18} />
          </button>
          {product.badge && (
            <span className="absolute top-4 left-4 text-xs font-bold tracking-wide px-3 py-1 rounded-full text-white uppercase z-10" style={{ background: product.badgeColor }}>
              {product.badge}
            </span>
          )}
        </div>

        <div className="p-6 pb-8">
          <div className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: primaryColor }}>{product.category}</div>
          <div className="flex items-start justify-between mb-4">
            <h2 className="font-black text-2xl text-slate-900" style={{ fontFamily: "Poppins, sans-serif" }} suppressHydrationWarning>{displayName}</h2>
            <span className="font-black text-2xl" style={{ color: primaryColor, fontFamily: "Poppins, sans-serif" }}>{formatPrice(product.price)}</span>
          </div>
          <div className="mb-4">
            <div className="text-xs font-semibold text-slate-500 mb-1">📋 Ingrédients</div>
            <p className="text-sm text-slate-600 leading-relaxed" suppressHydrationWarning>{displayDesc}</p>
          </div>
          {product.allergens.length > 0 && (
            <div className="mb-6">
              <div className="text-xs font-semibold text-slate-500 mb-2" suppressHydrationWarning>⚠️ {allergensLabel}</div>
              <div className="flex flex-wrap gap-2">
                {displayAllergens.map((a, i) => (
                  <span key={i} className="text-xs font-semibold bg-amber-50 text-amber-800 px-3 py-1 rounded-full border border-amber-100">{a}</span>
                ))}
              </div>
            </div>
          )}
          <p className="text-xs text-slate-400 mb-6">⚠️ Produits fabriqués dans un environnement pouvant contenir des traces de fruits à coque et gluten.</p>
          <button onClick={onClose}
            className="w-full flex items-center justify-center py-4 rounded-full text-white font-bold text-base transition-opacity hover:opacity-90 active:scale-[.98]"
            style={{ background: primaryColor, fontFamily: "Poppins, sans-serif" }} suppressHydrationWarning>
            {closeLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
