// components/admin/tabs/ScheduleTab.tsx
"use client";

import { useState } from "react";
import { Clock, Save, AlertTriangle } from "lucide-react";
import { useWoodizStore, StoreSchedule, ClosingAlert } from "@/lib/store";

const DAYS = [
  { num: 1, label: "Lun" },
  { num: 2, label: "Mar" },
  { num: 3, label: "Mer" },
  { num: 4, label: "Jeu" },
  { num: 5, label: "Ven" },
  { num: 6, label: "Sam" },
  { num: 0, label: "Dim" },
];

export default function ScheduleTab() {
  const { settings, updateSettings } = useWoodizStore();

  const defaultSchedule: StoreSchedule = {
    lunchEnabled: true,
    lunchOpen: "11:00",
    lunchClose: "14:30",
    dinnerEnabled: true,
    dinnerOpen: "18:00",
    dinnerClose: "22:30",
    closedDays: [],
  };

  const [schedule, setSchedule] = useState<StoreSchedule>(
    settings.storeSchedule ?? defaultSchedule
  );

  const defaultAlert: ClosingAlert = {
    enabled: true,
    minutesBefore: 60,
    text: "⚡ Vite ! Vite ! – nous fermons bientôt ! Commandez dans les {mins} min",
    bgColor: "#EF4444",
    textColor: "#FFFFFF",
  };

  const [alert, setAlert] = useState<ClosingAlert>(
    settings.closingAlert ?? defaultAlert
  );

  function toggleDay(day: number) {
    setSchedule((prev) => ({
      ...prev,
      closedDays: prev.closedDays.includes(day)
        ? prev.closedDays.filter((d) => d !== day)
        : [...prev.closedDays, day],
    }));
  }

  function handleSave() {
    updateSettings({ storeSchedule: schedule, closingAlert: alert });
  }

  const previewText = alert.text.replace("{mins}", String(alert.minutesBefore));

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="font-extrabold text-2xl text-slate-800" style={{ fontFamily: "Poppins, sans-serif" }}>
          Horaires & Fermeture
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Configurez vos horaires d'ouverture et le message de fermeture imminente
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* === SCHEDULE === */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
          <h2 className="font-bold text-slate-800 mb-5 flex items-center gap-2" style={{ fontFamily: "Poppins, sans-serif" }}>
            <Clock size={18} style={{ color: settings.primaryColor }} /> Horaires d'ouverture
          </h2>

          {/* Closed days */}
          <div className="mb-5">
            <label className="form-label mb-2">Jours de fermeture</label>
            <div className="flex gap-2 flex-wrap">
              {DAYS.map(({ num, label }) => {
                const closed = schedule.closedDays.includes(num);
                return (
                  <button
                    key={num}
                    type="button"
                    onClick={() => toggleDay(num)}
                    className={`px-3 py-1.5 rounded-xl text-sm font-semibold transition-all border ${
                      closed
                        ? "bg-red-50 text-red-500 border-red-200"
                        : "bg-emerald-50 text-emerald-700 border-emerald-200"
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-slate-400 mt-2">Cliquer sur un jour pour le marquer comme fermé (rouge)</p>
          </div>

          {/* Lunch service */}
          <div className="mb-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
            <div className="flex items-center justify-between mb-3">
              <div className="font-semibold text-slate-700 text-sm">🌞 Service du midi</div>
              <label className="flex items-center gap-2 cursor-pointer">
                <span className="text-xs text-slate-500">{schedule.lunchEnabled ? "Actif" : "Inactif"}</span>
                <div
                  onClick={() => setSchedule({ ...schedule, lunchEnabled: !schedule.lunchEnabled })}
                  className={`relative w-10 h-5 rounded-full transition-colors cursor-pointer ${schedule.lunchEnabled ? "" : "bg-slate-200"}`}
                  style={{ background: schedule.lunchEnabled ? settings.primaryColor : undefined }}
                >
                  <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${schedule.lunchEnabled ? "left-5" : "left-0.5"}`} />
                </div>
              </label>
            </div>
            {schedule.lunchEnabled && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="form-label">Ouverture</label>
                  <input type="time" className="form-input" value={schedule.lunchOpen}
                    onChange={(e) => setSchedule({ ...schedule, lunchOpen: e.target.value })} />
                </div>
                <div>
                  <label className="form-label">Fermeture</label>
                  <input type="time" className="form-input" value={schedule.lunchClose}
                    onChange={(e) => setSchedule({ ...schedule, lunchClose: e.target.value })} />
                </div>
              </div>
            )}
          </div>

          {/* Dinner service */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <div className="flex items-center justify-between mb-3">
              <div className="font-semibold text-slate-700 text-sm">🌙 Service du soir</div>
              <label className="flex items-center gap-2 cursor-pointer">
                <span className="text-xs text-slate-500">{schedule.dinnerEnabled ? "Actif" : "Inactif"}</span>
                <div
                  onClick={() => setSchedule({ ...schedule, dinnerEnabled: !schedule.dinnerEnabled })}
                  className={`relative w-10 h-5 rounded-full transition-colors cursor-pointer ${schedule.dinnerEnabled ? "" : "bg-slate-200"}`}
                  style={{ background: schedule.dinnerEnabled ? settings.primaryColor : undefined }}
                >
                  <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${schedule.dinnerEnabled ? "left-5" : "left-0.5"}`} />
                </div>
              </label>
            </div>
            {schedule.dinnerEnabled && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="form-label">Ouverture</label>
                  <input type="time" className="form-input" value={schedule.dinnerOpen}
                    onChange={(e) => setSchedule({ ...schedule, dinnerOpen: e.target.value })} />
                </div>
                <div>
                  <label className="form-label">Fermeture</label>
                  <input type="time" className="form-input" value={schedule.dinnerClose}
                    onChange={(e) => setSchedule({ ...schedule, dinnerClose: e.target.value })} />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* === CLOSING ALERT === */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-slate-800 flex items-center gap-2" style={{ fontFamily: "Poppins, sans-serif" }}>
              <AlertTriangle size={18} style={{ color: settings.primaryColor }} /> Message de fermeture imminente
            </h2>
            <div
              onClick={() => setAlert({ ...alert, enabled: !alert.enabled })}
              className={`relative w-10 h-5 rounded-full transition-colors cursor-pointer ${alert.enabled ? "" : "bg-slate-200"}`}
              style={{ background: alert.enabled ? settings.primaryColor : undefined }}
            >
              <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${alert.enabled ? "left-5" : "left-0.5"}`} />
            </div>
          </div>

          {alert.enabled && (
            <div className="flex flex-col gap-4">
              {/* Preview */}
              <div
                className="w-full py-2.5 px-4 rounded-xl text-sm font-bold text-center"
                style={{ background: alert.bgColor, color: alert.textColor }}
              >
                {previewText}
              </div>

              <div>
                <label className="form-label">Minutes avant fermeture</label>
                <input type="number" min="5" max="240" className="form-input"
                  value={alert.minutesBefore}
                  onChange={(e) => setAlert({ ...alert, minutesBefore: parseInt(e.target.value) || 60 })} />
                <p className="text-xs text-slate-400 mt-1">
                  Le message s'affichera {alert.minutesBefore} min avant la fin du service
                </p>
              </div>

              <div>
                <label className="form-label">Texte du message</label>
                <input className="form-input" value={alert.text}
                  onChange={(e) => setAlert({ ...alert, text: e.target.value })}
                  placeholder="⚡ Vite ! nous fermons dans {mins} min" />
                <p className="text-xs text-slate-400 mt-1"><code>{"{mins}"}</code> sera remplacé par le nombre de minutes restantes</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Couleur de fond</label>
                  <div className="flex items-center gap-2">
                    <input type="color" value={alert.bgColor}
                      onChange={(e) => setAlert({ ...alert, bgColor: e.target.value })}
                      className="w-10 h-10 rounded-lg border border-slate-200 cursor-pointer p-0.5" />
                    <input className="form-input flex-1" value={alert.bgColor}
                      onChange={(e) => setAlert({ ...alert, bgColor: e.target.value })} />
                  </div>
                </div>
                <div>
                  <label className="form-label">Couleur du texte</label>
                  <div className="flex items-center gap-2">
                    <input type="color" value={alert.textColor}
                      onChange={(e) => setAlert({ ...alert, textColor: e.target.value })}
                      className="w-10 h-10 rounded-lg border border-slate-200 cursor-pointer p-0.5" />
                    <input className="form-input flex-1" value={alert.textColor}
                      onChange={(e) => setAlert({ ...alert, textColor: e.target.value })} />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-6 py-3 rounded-xl text-white font-bold hover:opacity-90 transition-opacity shadow-md"
          style={{ background: settings.primaryColor }}
        >
          <Save size={16} /> Enregistrer les horaires
        </button>
      </div>
    </div>
  );
}
