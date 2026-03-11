// components/client/FeaturedProducts.tsx
"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { useWoodizStore, Product } from "@/lib/store";
import { getImage } from "@/lib/imageDb";
import { formatPrice } from "@/lib/utils";

const FALLBACK_IMG = "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400";

function isValidImgSrc(src?: string): boolean {
  if (!src) return false;
  if (src.startsWith("data:image/") || src.startsWith("/")) return true;
  try { const { protocol } = new URL(src); return protocol === "http:" || protocol === "https:"; } catch { return false; }
}

function FeaturedCard({ product, primaryColor, onOpen }: { product: Product; primaryColor: string; onOpen: (p: Product) => void }) {
  const { activeLocale } = useWoodizStore();
  const [imgSrc, setImgSrc] = useState(isValidImgSrc(product.img) ? product.img! : FALLBACK_IMG);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const raw = product.img;
    if (!raw || isValidImgSrc(raw)) return;
    if (raw.startsWith("__idb:")) {
      getImage(raw.slice("__idb:".length)).then((d) => { if (d) setImgSrc(d); }).catch(() => {});
    }
  }, [product.img]);

  const locale = mounted ? activeLocale : "fr";
  const displayName = locale !== "fr" && product.translations?.[locale]?.name ? product.translations[locale].name : product.name;

  return (
    <article
      onClick={() => product.inStock && onOpen(product)}
      className={`flex-shrink-0 w-36 sm:w-40 rounded-2xl bg-white border border-slate-100 shadow-sm overflow-hidden group transition-all ${product.inStock ? "cursor-pointer hover:-translate-y-1 hover:shadow-lg" : "opacity-60 cursor-not-allowed"}`}
    >
      <div className="relative w-full" style={{ paddingBottom: "85%" }}>
        <div className="absolute inset-0 bg-amber-50 overflow-hidden">
          <Image
            src={imgSrc}
            alt={displayName}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            sizes="160px"
            unoptimized={imgSrc.startsWith("data:")}
          />
        </div>
        {product.badge && (
          <span className="absolute top-1.5 left-1.5 z-10 text-[9px] font-bold px-2 py-0.5 rounded-full text-white uppercase"
            style={{ background: product.badgeColor || primaryColor }}>
            {product.badge}
          </span>
        )}
      </div>
      <div className="p-2.5">
        <h3 className="font-bold text-xs text-slate-900 leading-tight mb-1 line-clamp-2" style={{ fontFamily: "Poppins, sans-serif" }}>{displayName}</h3>
        <span className="font-black text-sm text-slate-900" style={{ fontFamily: "Poppins, sans-serif" }}>{formatPrice(product.price)}</span>
      </div>
    </article>
  );
}

interface FeaturedProductsProps {
  primaryColor: string;
  onOpen: (p: Product) => void;
}

export default function FeaturedProducts({ primaryColor, onOpen }: FeaturedProductsProps) {
  const { products, categories, t, settings } = useWoodizStore();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const featured = products
    .filter((p) => {
      if (!p.featured) return false;
      const cat = categories.find((c) => c.id === p.category);
      return cat?.active;
    })
    .sort((a, b) => a.order - b.order);

  if (featured.length === 0) return null;

  return (
    <section className="pb-10">
      <h2 className="font-bold text-xl text-slate-900 mb-4" style={{ fontFamily: "Poppins, sans-serif" }}>
        ⭐ <span suppressHydrationWarning>{mounted ? t("section.featured") : "Produits en Vedette"}</span>
      </h2>
      <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-none" style={{ WebkitOverflowScrolling: "touch" }}>
        {featured.map((product) => (
          <FeaturedCard key={product.id} product={product} primaryColor={primaryColor} onOpen={onOpen} />
        ))}
      </div>
    </section>
  );
}
