// components/client/ClosingAlert.tsx
"use client";
import { useState, useEffect } from "react";
import { useWoodizStore } from "@/lib/store";

/** Returns minutes until closing for a given service (lunch or dinner), or null if not applicable */
function minsUntilClose(openStr: string, closeStr: string): number | null {
  const [oh, om] = openStr.split(":").map(Number);
  const [ch, cm] = closeStr.split(":").map(Number);
  const now = new Date();
  const nowMins = now.getHours() * 60 + now.getMinutes();

  const openMins = oh * 60 + om;
  let closeMins = ch * 60 + cm;
  // Handle overnight (e.g. closes at 02:00 = 120 mins)
  if (closeMins <= openMins) closeMins += 24 * 60;

  // Normalize nowMins for overnight comparison
  let nowAdj = nowMins;
  if (closeMins > 24 * 60 && nowMins < openMins) nowAdj += 24 * 60;

  // We're within the service window
  if (nowAdj >= openMins && nowAdj < closeMins) {
    return closeMins - nowAdj; // mins until close
  }
  return null;
}

export default function ClosingAlert() {
  const { settings } = useWoodizStore();
  const [minsLeft, setMinsLeft] = useState<number | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const check = () => {
      const ca = settings.closingAlert;
      if (!ca?.enabled) { setMinsLeft(null); return; }

      const schedule = settings.storeSchedule;
      const threshold = ca.minutesBefore || 60;
      const now = new Date();
      const today = now.getDay(); // 0=Sun … 6=Sat

      // Check if today is a closed day
      if (schedule?.closedDays?.includes(today)) { setMinsLeft(null); return; }

      let found: number | null = null;

      // Check lunch service
      if (schedule?.lunchEnabled && schedule.lunchOpen && schedule.lunchClose) {
        const m = minsUntilClose(schedule.lunchOpen, schedule.lunchClose);
        if (m !== null && m <= threshold) found = m;
      }

      // Check dinner service
      if (found === null && schedule?.dinnerEnabled && schedule.dinnerOpen && schedule.dinnerClose) {
        const m = minsUntilClose(schedule.dinnerOpen, schedule.dinnerClose);
        if (m !== null && m <= threshold) found = m;
      }

      setMinsLeft(found);
    };

    check();
    const interval = setInterval(check, 30000);
    return () => clearInterval(interval);
  }, [settings.closingAlert, settings.storeSchedule]);

  if (!mounted || minsLeft === null || dismissed) return null;
  const ca = settings.closingAlert!;
  const text = (ca.text || "⚡ Vite ! Vite ! – nous fermons bientôt ! Commandez dans les {mins} min").replace("{mins}", String(minsLeft));

  return (
    <div
      className="w-full text-sm font-bold py-2.5 px-4 flex items-center justify-center relative"
      style={{ background: ca.bgColor || "#EF4444", color: ca.textColor || "#FFFFFF" }}
    >
      <span className="flex-1 text-center">{text}</span>
      <button
        onClick={() => setDismissed(true)}
        className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center opacity-60 hover:opacity-100 transition-opacity"
        style={{ background: "rgba(0,0,0,0.15)" }}
        aria-label="Fermer"
      >
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    </div>
  );
}
