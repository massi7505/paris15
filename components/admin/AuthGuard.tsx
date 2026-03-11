// components/admin/AuthGuard.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/lib/auth";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  const router   = useRouter();
  const pathname = usePathname();
  // Empêche le flash de redirection pendant la réhydratation côté client
  const [hydrated, setHydrated] = useState(false);

  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    // Réhydrater le store depuis sessionStorage (côté client uniquement)
    // Nécessaire car skipHydration=true dans lib/auth.ts (évite les erreurs SSR)
    useAuthStore.persist.rehydrate();
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return; // Attendre la réhydratation avant de rediriger
    if (!isAuthenticated && !isLoginPage) {
      router.replace("/admin/login");
    }
  }, [isAuthenticated, isLoginPage, router, hydrated]);

  // Spinner pendant la réhydratation initiale
  if (!hydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Sur la page login, toujours afficher
  if (isLoginPage) return <>{children}</>;

  // Sur les pages admin, attendre l'authentification
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}
