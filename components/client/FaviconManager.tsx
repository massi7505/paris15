// components/client/FaviconManager.tsx
"use client";
import { useEffect } from "react";
import { useWoodizStore } from "@/lib/store";

export default function FaviconManager() {
  const { settings } = useWoodizStore();

  useEffect(() => {
    let link = document.querySelector<HTMLLinkElement>("link[rel~='icon']");
    if (!link) {
      link = document.createElement("link");
      link.rel = "icon";
      document.head.appendChild(link);
    }
    if (settings.faviconUrl) {
      link.href = settings.faviconUrl;
      link.type = "image/png";
    } else {
      const emoji = settings.faviconEmoji || "🍕";
      link.href = `data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>${emoji}</text></svg>`;
      link.type = "image/svg+xml";
    }
    document.title = settings.metaTitle || settings.siteName;
  }, [settings.faviconEmoji, settings.faviconUrl, settings.metaTitle, settings.siteName]);

  return null;
}
