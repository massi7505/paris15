// components/client/AppBanner.tsx
"use client";
import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { useWoodizStore } from "@/lib/store";

export default function AppBanner() {
  const { settings } = useWoodizStore();
  const banner = settings.appBanner;
  const [closed, setClosed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Check sessionStorage so it stays closed during session
    if (typeof window !== "undefined" && sessionStorage.getItem("woodiz-app-banner-closed")) {
      setClosed(true);
    }
  }, []);

  function close() {
    setClosed(true);
    if (typeof window !== "undefined") sessionStorage.setItem("woodiz-app-banner-closed", "1");
  }

  if (!mounted || !banner?.enabled || closed) return null;

  return (
    <div
      className="w-full flex items-center gap-3 px-3 py-2.5 shadow-sm"
      style={{ background: banner.bgColor || "#1A1A2E" }}
    >
      {/* Close */}
      {banner.closeable !== false && (
        <button
          onClick={close}
          className="w-7 h-7 flex items-center justify-center flex-shrink-0 rounded-full opacity-50 hover:opacity-100 transition-opacity"
          style={{ background: "rgba(255,255,255,0.1)" }}
          aria-label="Fermer"
        >
          <X size={14} style={{ color: banner.textColor || "#fff" }} />
        </button>
      )}

      {/* Icon */}
      {banner.icon && (
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0 shadow-sm"
          style={{ background: banner.iconBg || "#10B981" }}
        >
          {banner.icon}
        </div>
      )}

      {/* Text */}
      <div className="flex-1 min-w-0">
        <div className="font-bold text-sm leading-tight truncate" style={{ color: banner.textColor || "#fff", fontFamily: "Poppins, sans-serif" }}>
          {banner.title}
        </div>
        {banner.subtitle && (
          <div className="text-xs mt-0.5 opacity-70 truncate" style={{ color: banner.textColor || "#fff" }}>
            {banner.subtitle}
          </div>
        )}
      </div>

      {/* Action button */}
      {banner.buttonText && (
        <a
          href={banner.buttonLink || "#"}
          target={banner.buttonLink ? "_blank" : undefined}
          rel="noopener noreferrer"
          className="flex-shrink-0 px-4 py-2 rounded-xl text-sm font-bold transition-opacity hover:opacity-90 whitespace-nowrap"
          style={{ background: banner.buttonBg || "#10B981", color: banner.buttonTextColor || "#fff" }}
        >
          {banner.buttonText}
        </a>
      )}
    </div>
  );
}
