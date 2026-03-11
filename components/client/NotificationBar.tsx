// components/client/NotificationBar.tsx
"use client";
import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { useWoodizStore } from "@/lib/store";

export default function NotificationBar() {
  const { settings } = useWoodizStore();
  const { notificationBar } = settings;
  const [closed, setClosed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  if (!mounted || !notificationBar?.enabled || closed) return null;

  return (
    <div
      className="w-full text-sm font-semibold py-2.5 px-4 flex items-center justify-center relative"
      style={{ background: notificationBar.bgColor, color: notificationBar.textColor }}
    >
      {notificationBar.link ? (
        <a href={notificationBar.link} target="_blank" rel="noopener noreferrer"
          className="flex-1 text-center hover:opacity-80 transition-opacity">
          {notificationBar.text}
        </a>
      ) : (
        <span className="flex-1 text-center">{notificationBar.text}</span>
      )}
      {notificationBar.closeable !== false && (
        <button
          onClick={() => setClosed(true)}
          className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center opacity-60 hover:opacity-100 transition-opacity"
          style={{ background: "rgba(0,0,0,0.12)" }}
          aria-label="Fermer"
        >
          <X size={13} />
        </button>
      )}
    </div>
  );
}
