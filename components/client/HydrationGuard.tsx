// components/client/HydrationGuard.tsx
"use client";
import { useEffect, useState } from "react";

/**
 * Blocks rendering until both:
 * 1. Zustand localStorage rehydration is done
 * 2. Redis (KV) data is loaded
 *
 * StoreHydration.tsx dispatches "woodiz-kv-ready" after Redis loads.
 * This prevents any flash of stale/default data.
 */
export default function HydrationGuard({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Listen for the KV ready event from StoreHydration
    const onReady = () => setReady(true);
    window.addEventListener("woodiz-kv-ready", onReady);

    // Safety fallback: show content after 3s even if Redis fails
    const timeout = setTimeout(() => setReady(true), 3000);

    return () => {
      window.removeEventListener("woodiz-kv-ready", onReady);
      clearTimeout(timeout);
    };
  }, []);

  if (!ready) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "#ffffff" }}
      >
        <div
          className="w-9 h-9 rounded-full border-[3px] animate-spin"
          style={{ borderColor: "#F59E0B", borderTopColor: "transparent" }}
        />
      </div>
    );
  }

  return <>{children}</>;
}
