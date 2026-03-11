// lib/auth.ts — Session admin côté client
// Persistée dans sessionStorage : survit aux rechargements de page
// mais se réinitialise à la fermeture du navigateur (sécurité).
// L'authentification réelle est vérifiée par /api/auth → MySQL.

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface AuthStore {
  isAuthenticated: boolean;
  markAuthenticated: () => void;
  logout: () => void;
}

// Stockage sessionStorage côté client uniquement (SSR-safe)
const sessionStorageSafe = createJSONStorage(() => {
  if (typeof window === "undefined") {
    // SSR : stockage fictif qui ne fait rien
    return {
      getItem:    (_key: string) => null,
      setItem:    (_key: string, _value: string) => {},
      removeItem: (_key: string) => {},
    };
  }
  return sessionStorage;
});

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      markAuthenticated: () => set({ isAuthenticated: true }),
      logout: () => set({ isAuthenticated: false }),
    }),
    {
      name:    "woodiz-admin-session",
      storage: sessionStorageSafe,
      // skipHydration : évite les erreurs d'hydratation SSR (valeur false côté serveur)
      // Le composant AuthGuard appelle rehydrate() au montage côté client.
      skipHydration: true,
    }
  )
);
