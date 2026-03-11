// components/client/ProductCard.tsx
"use client";
import Image from "next/image";
import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { Product, useWoodizStore } from "@/lib/store";
import { getImage } from "@/lib/imageDb";
import { formatPrice } from "@/lib/utils";

interface ProductCardProps {
  product: Product;
  primaryColor: string;
  onOpen: (product: Product) => void;
  onAddToCart?: (product: Product) => void;
  vertical?: boolean;
}

const FALLBACK_IMG = "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=600";

/** Returns true only for URLs that next/image can render without crashing */
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

/** Skip Next.js image optimizer for external URLs — laisse le browser fetch directement.
 *  Cellar, Unsplash, etc. sont servis avec leurs propres CDN — inutile de passer par /_next/image */
function shouldUnoptimize(src: string): boolean {
  return src.startsWith("data:") || src.startsWith("http:") || src.startsWith("https:");
}

export default function ProductCard({ product, primaryColor, onOpen, vertical = false }: ProductCardProps) {
  const { activeLocale, t } = useWoodizStore();
  const [mounted, setMounted] = useState(false);

  // Resolved image src: starts with the safe static value, then upgrades
  // asynchronously if the product image is stored in IndexedDB (__idb:* key).
  const [imgSrc, setImgSrc] = useState<string>(
    isValidImgSrc(product.img) ? product.img! : FALLBACK_IMG
  );

  useEffect(() => {
    setMounted(true);

    const raw = product.img;
    if (!raw) return;

    // Already a usable URL — nothing to do
    if (isValidImgSrc(raw)) {
      setImgSrc(raw);
      return;
    }

    // __idb:product:1  →  IDB key = "product:1"
    if (raw.startsWith("__idb:")) {
      const idbKey = raw.slice("__idb:".length); // e.g. "product:1"
      getImage(idbKey)
        .then((dataUrl) => {
          if (dataUrl) setImgSrc(dataUrl);
          // else keep FALLBACK_IMG
        })
        .catch(() => {
          // IDB unavailable or key missing — keep FALLBACK_IMG
        });
    }
  }, [product.img]);

  const outOfStock = !product.inStock;

  // Get translated name/desc (only after mount to avoid hydration mismatch)
  const displayName = mounted && activeLocale !== "fr" && product.translations?.[activeLocale]?.name
    ? product.translations[activeLocale].name : product.name;
  const displayDesc = mounted && activeLocale !== "fr" && product.translations?.[activeLocale]?.desc
    ? product.translations[activeLocale].desc : product.desc;

  if (vertical) {
    return (
      <article
        onClick={() => !outOfStock && onOpen(product)}
        className={`relative bg-white rounded-[18px] border border-slate-100 shadow-sm overflow-hidden group transition-all duration-300 flex items-center gap-4 p-3 ${
          outOfStock ? "cursor-not-allowed opacity-70" : "cursor-pointer hover:shadow-lg hover:border-slate-200"
        }`}
      >
        {/* Thumbnail 1:1 */}
        <div className="relative w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden bg-amber-50">
          <Image src={imgSrc} alt={displayName} fill className="object-cover" sizes="80px" unoptimized={shouldUnoptimize(imgSrc)} />
          {product.badge && (
            <span className="absolute top-1 left-1 text-[8px] font-bold px-1.5 py-0.5 rounded-full text-white uppercase"
              style={{ background: product.badgeColor || primaryColor }}>
              {product.badge}
            </span>
          )}
        </div>
        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-sm text-slate-900 leading-tight" style={{ fontFamily: "Poppins, sans-serif" }}>{displayName}</h3>
          <p className="text-[11px] text-slate-400 leading-relaxed mt-0.5 line-clamp-1">{displayDesc}</p>
          {product.allergens.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
              {product.allergens.slice(0, 3).map((a) => (
                <span key={a} className="text-[9px] font-semibold bg-amber-50 text-amber-800 px-1.5 py-0.5 rounded-lg">{a}</span>
              ))}
            </div>
          )}
        </div>
        {/* Price */}
        <div className="flex-shrink-0 text-right">
          <span className="font-black text-base text-slate-900 block" style={{ fontFamily: "Poppins, sans-serif" }}>{formatPrice(product.price)}</span>
          {outOfStock && <span className="text-[9px] font-bold text-slate-400 uppercase">{mounted ? t("product.out_of_stock") : "Rupture"}</span>}
        </div>
      </article>
    );
  }

  return (
    <article
      onClick={() => !outOfStock && onOpen(product)}
      className={`relative bg-white rounded-[18px] border border-slate-100 shadow-sm overflow-hidden group transition-all duration-300 ${
        outOfStock ? "card-out-of-stock cursor-not-allowed" : "cursor-pointer hover:-translate-y-1 hover:shadow-xl"
      }`}
    >
      {/* Image — strictly 1:1 */}
      <div className="relative w-full" style={{ paddingBottom: "100%" }}>
        <div className="absolute inset-0 bg-amber-50 overflow-hidden">
          <Image
            src={imgSrc}
            alt={displayName}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            unoptimized={shouldUnoptimize(imgSrc)}
          />
        </div>

        {product.badge && (
          <span
            className="absolute top-2 left-2 z-10 text-[10px] font-bold tracking-wide px-2.5 py-1 rounded-full text-white uppercase"
            style={{ background: product.badgeColor || primaryColor }}
          >
            {product.badge}
          </span>
        )}

        {outOfStock && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/20">
            <span className="bg-black/70 text-white text-xs font-bold px-4 py-1.5 rounded-full">{mounted ? t("product.out_of_stock") : "Rupture de stock"}</span>
          </div>
        )}

        <button
          onClick={(e) => e.stopPropagation()}
          className="absolute top-2 right-2 z-10 w-8 h-8 rounded-full bg-white/90 hover:bg-red-50 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
        >
          <Heart size={14} className="text-slate-400 hover:text-red-500 transition-colors" />
        </button>
      </div>

      {/* Body */}
      <div className="p-2 sm:p-3">
        <h3 className="font-bold text-xs sm:text-sm text-slate-900 mb-1 leading-tight" style={{ fontFamily: "Poppins, sans-serif" }}>
          {displayName}
        </h3>
        <p className="text-[10px] sm:text-[11px] text-slate-400 leading-relaxed mb-2 line-clamp-2">{displayDesc}</p>

        {product.allergens.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2 sm:mb-3">
            {product.allergens.map((a) => (
              <span key={a} className="text-[8px] sm:text-[9px] font-semibold bg-amber-50 text-amber-800 px-1.5 py-0.5 rounded-lg">{a}</span>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between">
          <span className="font-black text-sm sm:text-base text-slate-900" style={{ fontFamily: "Poppins, sans-serif" }}>
            {formatPrice(product.price)}
          </span>
          {outOfStock && (
            <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wide">{mounted ? t("product.out_of_stock") : "Rupture de stock"}</span>
          )}
        </div>
      </div>
    </article>
  );
}
