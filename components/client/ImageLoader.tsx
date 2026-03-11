// components/client/ImageLoader.tsx
// Resolves __idb: image references — first tries local IndexedDB (fast),
// then falls back to server KV (works on any browser/device).
"use client";
import { useEffect } from "react";
import { useWoodizStore } from "@/lib/store";
import { getImage, saveImage } from "@/lib/imageDb";
import { getImageFromServer } from "@/lib/serverImages";

async function resolveKey(idbRef: string): Promise<string | null> {
  const key = idbRef.slice("__idb:".length);
  const local = await getImage(key).catch(() => null);
  if (local) return local;
  const remote = await getImageFromServer(key);
  if (remote) {
    saveImage(key, remote).catch(() => {});
    return remote;
  }
  return null;
}

async function resolveAllImages() {
  const state = useWoodizStore.getState();
  const { products, settings, promos, categories } = state;

  // ── 1. Product images ────────────────────────────────────────────────
  const resolvedProducts = await Promise.all(
    products.map(async (product) => {
      if (!product.img?.startsWith("__idb:")) return product;
      const dataUrl = await resolveKey(product.img);
      return dataUrl ? { ...product, img: dataUrl } : product;
    })
  );
  if (resolvedProducts.some((p, i) => p !== products[i])) {
    useWoodizStore.setState({ products: resolvedProducts });
  }

  // ── 2. Slider slides ─────────────────────────────────────────────────
  let slidesChanged = false;
  const resolvedSlides = await Promise.all(
    (settings.sliderSlides ?? []).map(async (s, i) => {
      if (s.type !== "image" || !s.value?.startsWith("__idb:")) return s;
      const dataUrl = await resolveKey(s.value);
      if (dataUrl) { slidesChanged = true; return { ...s, value: dataUrl }; }
      return s;
    })
  );

  // ── 3. Favicon ───────────────────────────────────────────────────────
  let resolvedFaviconUrl = settings.faviconUrl;
  let faviconChanged = false;
  if (settings.faviconUrl?.startsWith("__idb:")) {
    const dataUrl = await resolveKey(settings.faviconUrl);
    if (dataUrl) { resolvedFaviconUrl = dataUrl; faviconChanged = true; }
  }

  if (slidesChanged || faviconChanged) {
    useWoodizStore.setState((s) => ({
      settings: {
        ...s.settings,
        ...(slidesChanged ? { sliderSlides: resolvedSlides } : {}),
        ...(faviconChanged ? { faviconUrl: resolvedFaviconUrl } : {}),
      },
    }));
  }

  // ── 4. Promo images ──────────────────────────────────────────────────
  const resolvedPromos = await Promise.all(
    promos.map(async (promo) => {
      if (!promo.image?.startsWith("__idb:")) return promo;
      const dataUrl = await resolveKey(promo.image);
      return dataUrl ? { ...promo, image: dataUrl } : promo;
    })
  );
  if (resolvedPromos.some((p, i) => p !== promos[i])) {
    useWoodizStore.setState({ promos: resolvedPromos });
  }

  // ── 5. Category icons ────────────────────────────────────────────────
  const freshCategories = useWoodizStore.getState().categories;
  const resolvedCategories = await Promise.all(
    freshCategories.map(async (cat) => {
      if (!cat.iconUrl?.startsWith("__idb:")) return cat;
      const dataUrl = await resolveKey(cat.iconUrl);
      return dataUrl ? { ...cat, iconUrl: dataUrl } : cat;
    })
  );
  if (resolvedCategories.some((c, i) => c !== freshCategories[i])) {
    useWoodizStore.setState({ categories: resolvedCategories });
  }
}

export default function ImageLoader() {
  useEffect(() => {
    // Run once on mount (resolves from localStorage/IndexedDB)
    resolveAllImages();

    // Run again after KV data arrives (resolves freshly loaded __idb: refs from Redis)
    const onKvReady = () => resolveAllImages();
    window.addEventListener("woodiz-kv-ready", onKvReady);
    return () => window.removeEventListener("woodiz-kv-ready", onKvReady);
  }, []);

  return null;
}
