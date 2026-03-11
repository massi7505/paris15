// components/ui/Toast.tsx
"use client";

import { useEffect } from "react";
import { useWoodizStore } from "@/lib/store";
import { CheckCircle, XCircle, Info } from "lucide-react";

export default function Toast() {
  const { toast, clearToast } = useWoodizStore();

  useEffect(() => {
    if (toast) {
      const t = setTimeout(clearToast, 3000);
      return () => clearTimeout(t);
    }
  }, [toast, clearToast]);

  if (!toast) return null;

  const colors = {
    success: "bg-emerald-500",
    error: "bg-red-500",
    info: "bg-blue-500",
  };

  const icons = {
    success: <CheckCircle size={16} />,
    error: <XCircle size={16} />,
    info: <Info size={16} />,
  };

  return (
    <div
      className={`fixed bottom-7 left-1/2 z-[9999] flex items-center gap-2 px-6 py-3 rounded-full text-white text-sm font-semibold shadow-2xl animate-slide-up ${colors[toast.type]}`}
      style={{ fontFamily: "Poppins, sans-serif" }}
    >
      {icons[toast.type]}
      {toast.msg}
    </div>
  );
}
