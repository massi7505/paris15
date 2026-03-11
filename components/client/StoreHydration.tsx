// components/client/StoreHydration.tsx
// Charge le store depuis MySQL au démarrage, puis sauvegarde les changements.
"use client";
import { useEffect, useRef } from "react";
import { useWoodizStore } from "@/lib/store";

// ─── Détection locale navigateur ────────────────────────────────────────────

function detectLocale(supported: string[]): string | null {
  if (typeof navigator === "undefined") return null;
  const langs = navigator.languages?.length ? navigator.languages : [navigator.language];
  for (const lang of langs) {
    const code = lang.split("-")[0].toLowerCase();
    if (supported.includes(code)) return code;
  }
  return null;
}

// ─── Chargement depuis MySQL ─────────────────────────────────────────────────

async function loadFromDB(): Promise<any | null> {
  try {
    const res = await fetch("/api/store");
    const json = await res.json();
    return json?.ok && json?.data ? json.data : null;
  } catch (e) {
    console.warn("[StoreHydration] Chargement DB échoué:", e);
    return null;
  }
}

// ─── Sauvegarde vers MySQL ───────────────────────────────────────────────────

let saveTimeout: ReturnType<typeof setTimeout> | null = null;
// Empêche la boucle infinie : setState (depuis serveur) → subscribe → save → setState...
let isApplyingServerData = false;

async function saveToDB(state: any): Promise<void> {
  try {
    const payload = {
      settings:          state.settings,
      categories:        state.categories,
      products:          state.products,
      promos:            state.promos,
      faqs:              state.faqs,
      legalPages:        state.legalPages,
      reviews:           state.reviews,
      googleReviewPopup: state.googleReviewPopup,
      translations:      state.translations,
      activeLocale:      state.activeLocale,
      adminCredentials:  state.adminCredentials,
    };

    const res = await fetch("/api/store", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => `HTTP ${res.status}`);
      console.error("[StoreHydration] Sauvegarde échouée:", res.status, errText);
      if (typeof window !== "undefined" && window.location.pathname.startsWith("/admin")) {
        window.dispatchEvent(
          new CustomEvent("woodiz-save-error", {
            detail: `Erreur sauvegarde (${res.status}): ${errText.slice(0, 120)}`,
          })
        );
      }
      return;
    }

    const json = await res.json().catch(() => ({}));

    // Mettre à jour les IDs (nouveaux produits) sans déclencher un nouveau save
    if (json?.savedProducts?.length) {
      isApplyingServerData = true;
      useWoodizStore.setState({ products: json.savedProducts });
      isApplyingServerData = false;
    }

    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("woodiz-save-ok"));
    }
  } catch (e) {
    console.error("[StoreHydration] Erreur réseau:", e);
    if (typeof window !== "undefined" && window.location.pathname.startsWith("/admin")) {
      window.dispatchEvent(
        new CustomEvent("woodiz-save-error", {
          detail: `Erreur réseau: ${String(e).slice(0, 120)}`,
        })
      );
    }
  }
}

// ─── Composant ───────────────────────────────────────────────────────────────

export default function StoreHydration() {
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    async function init() {
      // 1. Charger les données depuis MySQL
      const data = await loadFromDB();

      if (data) {
        // Appliquer sans déclencher de save intermédiaire
        isApplyingServerData = true;
        if (data.settings)
          useWoodizStore.setState((s) => ({ settings: { ...s.settings, ...data.settings } }));
        if (data.categories)        useWoodizStore.setState({ categories: data.categories });
        if (data.products)          useWoodizStore.setState({ products: data.products });
        if (data.promos)            useWoodizStore.setState({ promos: data.promos });
        if (data.faqs)              useWoodizStore.setState({ faqs: data.faqs });
        if (data.legalPages)        useWoodizStore.setState({ legalPages: data.legalPages });
        if (data.reviews)           useWoodizStore.setState({ reviews: data.reviews });
        if (data.googleReviewPopup) useWoodizStore.setState({ googleReviewPopup: data.googleReviewPopup });
        if (data.translations)      useWoodizStore.setState({ translations: data.translations });
        if (data.adminCredentials)  useWoodizStore.setState({ adminCredentials: data.adminCredentials });
        isApplyingServerData = false;
      }

      // 2. Notifier que les données sont prêtes
      window.dispatchEvent(new CustomEvent("woodiz-kv-ready"));

      // 3. Détecter la langue du navigateur (sauf choix manuel)
      const manualLocale = localStorage.getItem("woodiz-locale-manual");
      if (!manualLocale) {
        const store = useWoodizStore.getState();
        const supported = store.translations
          .filter((t) => t.enabled !== false)
          .map((t) => t.locale);
        const detected = detectLocale(supported);
        if (detected && detected !== store.activeLocale) {
          store.setLocale(detected);
        }
      }

      // 4. Sauvegarder les changements avec debounce (1.5s)
      useWoodizStore.subscribe((state) => {
        if (isApplyingServerData) return;
        if (saveTimeout) clearTimeout(saveTimeout);
        saveTimeout = setTimeout(() => saveToDB(state), 1500);
      });
    }

    init();
  }, []);

  return null;
}
