// app/admin/login/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Lock } from "lucide-react";
import { useAuthStore } from "@/lib/auth";
import { useWoodizStore } from "@/lib/store";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { markAuthenticated } = useAuthStore();
  const { settings } = useWoodizStore();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Vérification côté serveur — lit directement en MySQL
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const json = await res.json();

      if (json.ok) {
        markAuthenticated();
        router.push("/admin");
      } else {
        setError(json.error ?? "Identifiant ou mot de passe incorrect");
        setLoading(false);
      }
    } catch {
      setError("Erreur réseau, réessaie.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "#0f172a" }}>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full opacity-10"
          style={{ background: settings.primaryColor, filter: "blur(80px)" }} />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full opacity-10"
          style={{ background: settings.primaryColor, filter: "blur(80px)" }} />
      </div>

      <div className="relative w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center font-black text-2xl mx-auto mb-4 shadow-xl"
            style={{ background: settings.primaryColor, color: settings.accentColor, fontFamily: "Poppins, sans-serif" }}>
            {settings.logoText}
          </div>
          <h1 className="text-white font-extrabold text-2xl" style={{ fontFamily: "Poppins, sans-serif" }}>
            {settings.siteName}
          </h1>
          <p className="text-slate-400 text-sm mt-1">Interface d&apos;administration</p>
        </div>

        <div className="bg-white rounded-3xl p-8 shadow-2xl">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: `${settings.primaryColor}20` }}>
              <Lock size={16} style={{ color: settings.primaryColor }} />
            </div>
            <span className="font-bold text-slate-800 text-sm" style={{ fontFamily: "Poppins, sans-serif" }}>
              Connexion sécurisée
            </span>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">
                Identifiant
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full h-11 rounded-xl border border-slate-200 px-4 text-sm outline-none bg-slate-50 transition-all focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
                placeholder="admin"
                autoComplete="username"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">
                Mot de passe
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-11 rounded-xl border border-slate-200 px-4 pr-11 text-sm outline-none bg-slate-50 transition-all focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-2.5 rounded-xl">
                <span>⚠️</span> {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-xl text-white font-bold text-sm transition-all hover:opacity-90 active:scale-[.98] disabled:opacity-60 mt-1 flex items-center justify-center gap-2"
              style={{ background: settings.primaryColor, fontFamily: "Poppins, sans-serif" }}
            >
              {loading
                ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : "Se connecter →"}
            </button>
          </form>
        </div>

        <p className="text-center text-slate-600 text-xs mt-6">
          ← <a href="/" className="hover:text-slate-400 transition-colors">Retour au site</a>
        </p>
      </div>
    </div>
  );
}
