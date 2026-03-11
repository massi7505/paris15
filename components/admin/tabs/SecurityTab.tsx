// components/admin/tabs/SecurityTab.tsx
"use client";

import { useState } from "react";
import { Eye, EyeOff, Shield, Check, AlertTriangle, Loader2 } from "lucide-react";
import { useWoodizStore } from "@/lib/store";
import { useAuthStore } from "@/lib/auth";
import { useRouter } from "next/navigation";

export default function SecurityTab() {
  const { settings, adminCredentials, updateAdminCredentials } = useWoodizStore();
  const { logout } = useAuthStore();
  const router = useRouter();

  const [form, setForm] = useState({
    username: adminCredentials.username,
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSave() {
    const errs: Record<string, string> = {};
    if (!form.username.trim()) errs.username = "L'identifiant ne peut pas être vide";
    if (!form.currentPassword) errs.currentPassword = "Saisir le mot de passe actuel";
    if (form.newPassword && form.newPassword.length < 6) errs.newPassword = "Minimum 6 caractères";
    if (form.newPassword && form.newPassword !== form.confirmPassword)
      errs.confirmPassword = "Les mots de passe ne correspondent pas";

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setSaving(true);
    setErrors({});
    setSuccess(false);

    try {
      // Vérifier le mot de passe actuel via MySQL (pas via le store client)
      const verifyRes = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: adminCredentials.username,
          password: form.currentPassword,
        }),
      });
      const verifyJson = await verifyRes.json();

      if (!verifyJson.ok) {
        setErrors({ currentPassword: "Mot de passe actuel incorrect" });
        setSaving(false);
        return;
      }

      // Mettre à jour les identifiants
      updateAdminCredentials({
        username: form.username.trim(),
        password: form.newPassword || form.currentPassword,
      });

      setForm({ ...form, currentPassword: "", newPassword: "", confirmPassword: "" });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch {
      setErrors({ currentPassword: "Erreur réseau, réessaie" });
    } finally {
      setSaving(false);
    }
  }

  function handleLogout() {
    logout();
    router.push("/admin/login");
  }

  const passwordStrength = (p: string) => {
    if (!p) return 0;
    let score = 0;
    if (p.length >= 8) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    return score;
  };

  const strength = passwordStrength(form.newPassword);
  const strengthColors = ["", "#EF4444", "#F59E0B", "#10B981", "#059669"];
  const strengthLabels = ["", "Faible", "Moyen", "Fort", "Très fort"];

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="font-extrabold text-2xl text-slate-800" style={{ fontFamily: "Poppins, sans-serif" }}>
          Sécurité & Accès
        </h1>
        <p className="text-slate-400 text-sm mt-1">Gérez vos identifiants de connexion à l&apos;interface admin</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Modifier les identifiants */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
          <div className="flex items-center gap-2 mb-5">
            <Shield size={18} style={{ color: settings.primaryColor }} />
            <h2 className="font-bold text-slate-800" style={{ fontFamily: "Poppins, sans-serif" }}>
              Modifier les identifiants
            </h2>
          </div>

          <div className="flex flex-col gap-4">
            {/* Username */}
            <div>
              <label className="form-label">Identifiant</label>
              <input
                className={`form-input ${errors.username ? "border-red-300 ring-1 ring-red-200" : ""}`}
                value={form.username}
                onChange={(e) => { setForm({ ...form, username: e.target.value }); setErrors({ ...errors, username: "" }); }}
                placeholder="admin"
              />
              {errors.username && <p className="text-xs text-red-500 mt-1">{errors.username}</p>}
            </div>

            {/* Mot de passe actuel */}
            <div>
              <label className="form-label">Mot de passe actuel *</label>
              <div className="relative">
                <input
                  type={showCurrent ? "text" : "password"}
                  className={`form-input pr-10 ${errors.currentPassword ? "border-red-300 ring-1 ring-red-200" : ""}`}
                  value={form.currentPassword}
                  onChange={(e) => { setForm({ ...form, currentPassword: e.target.value }); setErrors({ ...errors, currentPassword: "" }); }}
                  placeholder="••••••••"
                />
                <button type="button" onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showCurrent ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {errors.currentPassword && (
                <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                  <AlertTriangle size={11} /> {errors.currentPassword}
                </p>
              )}
            </div>

            {/* Nouveau mot de passe */}
            <div>
              <label className="form-label">
                Nouveau mot de passe{" "}
                <span className="text-slate-400 font-normal">(laisser vide pour ne pas changer)</span>
              </label>
              <div className="relative">
                <input
                  type={showNew ? "text" : "password"}
                  className={`form-input pr-10 ${errors.newPassword ? "border-red-300 ring-1 ring-red-200" : ""}`}
                  value={form.newPassword}
                  onChange={(e) => { setForm({ ...form, newPassword: e.target.value }); setErrors({ ...errors, newPassword: "" }); }}
                  placeholder="Nouveau mot de passe..."
                />
                <button type="button" onClick={() => setShowNew(!showNew)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {form.newPassword && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="h-1 flex-1 rounded-full transition-all"
                        style={{ background: i <= strength ? strengthColors[strength] : "#E2E8F0" }} />
                    ))}
                  </div>
                  <p className="text-xs font-medium" style={{ color: strengthColors[strength] }}>
                    {strengthLabels[strength]}
                  </p>
                </div>
              )}
              {errors.newPassword && <p className="text-xs text-red-500 mt-1">{errors.newPassword}</p>}
            </div>

            {/* Confirmer */}
            {form.newPassword && (
              <div>
                <label className="form-label">Confirmer le nouveau mot de passe</label>
                <div className="relative">
                  <input
                    type={showConfirm ? "text" : "password"}
                    className={`form-input pr-10 ${errors.confirmPassword ? "border-red-300 ring-1 ring-red-200" : ""}`}
                    value={form.confirmPassword}
                    onChange={(e) => { setForm({ ...form, confirmPassword: e.target.value }); setErrors({ ...errors, confirmPassword: "" }); }}
                    placeholder="••••••••"
                  />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {form.confirmPassword && form.newPassword === form.confirmPassword && (
                  <p className="text-xs text-emerald-500 mt-1 flex items-center gap-1">
                    <Check size={11} /> Les mots de passe correspondent
                  </p>
                )}
                {errors.confirmPassword && <p className="text-xs text-red-500 mt-1">{errors.confirmPassword}</p>}
              </div>
            )}

            {success && (
              <div className="flex items-center gap-2 text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-2.5 text-sm">
                <Check size={15} /> Identifiants mis à jour avec succès !
              </div>
            )}

            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full py-3 rounded-xl text-white text-sm font-semibold hover:opacity-90 transition-all flex items-center justify-center gap-2 mt-1 disabled:opacity-60"
              style={{ background: settings.primaryColor }}
            >
              {saving ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
              {saving ? "Vérification..." : "Sauvegarder les modifications"}
            </button>
          </div>
        </div>

        {/* Session & conseils */}
        <div className="flex flex-col gap-4">
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
            <h2 className="font-bold text-slate-800 mb-4" style={{ fontFamily: "Poppins, sans-serif" }}>
              Session actuelle
            </h2>
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
                <span className="text-sm text-slate-500">Identifiant</span>
                <span className="font-bold text-sm text-slate-800 font-mono">{adminCredentials.username}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50">
                <span className="text-sm text-emerald-700">Statut</span>
                <span className="text-xs font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Connecté
                </span>
              </div>
            </div>
          </div>

          <div className="bg-amber-50 rounded-2xl p-5 border border-amber-100">
            <h3 className="font-bold text-amber-800 text-sm mb-2">💡 Conseils de sécurité</h3>
            <ul className="text-xs text-amber-700 flex flex-col gap-1.5">
              <li>• Utilisez un mot de passe d&apos;au moins 8 caractères</li>
              <li>• Mélangez majuscules, chiffres et symboles</li>
              <li>• Ne partagez jamais vos identifiants</li>
              <li>• Déconnectez-vous après chaque session</li>
            </ul>
          </div>

          <button
            onClick={handleLogout}
            className="w-full py-3 rounded-xl bg-slate-100 text-slate-600 hover:bg-red-50 hover:text-red-600 text-sm font-semibold transition-all flex items-center justify-center gap-2"
          >
            🚪 Se déconnecter
          </button>
        </div>
      </div>
    </div>
  );
}
