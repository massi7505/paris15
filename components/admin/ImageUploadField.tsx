// components/admin/ImageUploadField.tsx
// Upload direct vers Clever Cloud Cellar via /api/upload
// Retourne une URL publique permanente (plus de base64 en mémoire)

"use client";
import { useRef, useState } from "react";
import { Upload, Link, X, Image as ImageIcon, Loader2 } from "lucide-react";
import { compressToAvif, formatBytes } from "@/lib/avifCompress";

interface Props {
  value: string;
  onChange: (url: string) => void;
  idbKey: string;
  label?: string;
  placeholder?: string;
  className?: string;
  quality?: number;
  maxDim?: number;
}

interface CompressInfo {
  format: string;
  savings: number;
  origSize: string;
  newSize: string;
}

export default function ImageUploadField({
  value, onChange, idbKey, label,
  placeholder = "https://...", className = "",
  quality = 0.78, maxDim = 1200,
}: Props) {
  const [mode, setMode]           = useState<"url" | "upload">(
    value && !value.startsWith("data:") && value.startsWith("http") ? "url" : "upload"
  );
  const [compressing, setCompressing] = useState(false);
  const [compressInfo, setCompressInfo] = useState<CompressInfo | null>(null);
  const [error, setError]         = useState<string | null>(null);
  const [dragOver, setDragOver]   = useState(false);
  const inputRef                  = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    if (!file.type.startsWith("image/")) return;
    setCompressing(true);
    setCompressInfo(null);
    setError(null);

    try {
      // 1. Compresser côté client
      const result  = await compressToAvif(file, quality, maxDim);
      const base64  = result.dataUrl.split(",")[1];
      const byteStr = atob(base64);
      const arr     = new Uint8Array(byteStr.length);
      for (let i = 0; i < byteStr.length; i++) arr[i] = byteStr.charCodeAt(i);

      const mimeType  = result.format === "avif" ? "image/avif" : "image/webp";
      const ext       = result.format === "avif" ? "avif" : "webp";
      const blob      = new Blob([arr], { type: mimeType });
      const uploadFile = new File([blob], `${idbKey.replace(/:/g, "-")}.${ext}`, { type: mimeType });

      // 2. Envoyer vers /api/upload → Clever Cloud Cellar
      const form = new FormData();
      form.append("file", uploadFile);
      form.append("key",  idbKey); // hint pour le nom du fichier B2

      const res  = await fetch("/api/upload", { method: "POST", body: form });
      const json = await res.json();

      if (!res.ok || !json.ok) {
        setError(json.error ?? `Erreur ${res.status}`);
        return;
      }

      // 3. Stocker l'URL publique B2 directement dans le store
      onChange(json.url);
      setCompressInfo({
        format:   result.format.toUpperCase(),
        savings:  result.savings,
        origSize: formatBytes(result.originalSize),
        newSize:  formatBytes(result.compressedSize),
      });
      setMode("upload");
    } catch (e) {
      console.error("Upload error:", e);
      setError(e instanceof Error ? e.message : "Erreur inconnue");
    } finally {
      setCompressing(false);
    }
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = "";
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  function clearImage() {
    onChange("");
    setCompressInfo(null);
    setError(null);
  }

  const hasImage = !!value;

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {label && <label className="form-label">{label}</label>}

      {/* Tabs URL / Upload */}
      <div className="flex gap-1.5 bg-slate-100 p-1 rounded-xl w-fit">
        <button type="button" onClick={() => setMode("upload")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${mode === "upload" ? "bg-white shadow text-slate-800" : "text-slate-500 hover:text-slate-700"}`}>
          <Upload size={12} /> Upload
        </button>
        <button type="button" onClick={() => setMode("url")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${mode === "url" ? "bg-white shadow text-slate-800" : "text-slate-500 hover:text-slate-700"}`}>
          <Link size={12} /> URL
        </button>
      </div>

      {/* Erreur */}
      {error && (
        <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          ⚠️ {error}
        </div>
      )}

      {mode === "url" ? (
        <div className="relative">
          <input
            className="form-input pr-8"
            value={value?.startsWith("data:") ? "" : (value || "")}
            onChange={(e) => { setCompressInfo(null); onChange(e.target.value); }}
            placeholder={placeholder}
          />
          {hasImage && !value?.startsWith("data:") && (
            <button type="button" onClick={clearImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-red-500">
              <X size={14} />
            </button>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => !compressing && inputRef.current?.click()}
            className={`relative border-2 border-dashed rounded-xl transition-all cursor-pointer overflow-hidden
              ${dragOver ? "border-amber-400 bg-amber-50" : "border-slate-200 hover:border-slate-300 bg-slate-50"}
              ${hasImage ? "h-28" : "h-20"}`}
          >
            <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleInputChange} />
            {hasImage ? (
              <>
                <img src={value} alt="" className="w-full h-full object-cover opacity-80" />
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                  <span className="text-white text-xs font-semibold">Changer</span>
                </div>
                <button type="button" onClick={(e) => { e.stopPropagation(); clearImage(); }}
                  className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center shadow hover:bg-red-600 z-10">
                  <X size={11} />
                </button>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full gap-1.5">
                {compressing ? (
                  <>
                    <Loader2 size={20} className="text-amber-500 animate-spin" />
                    <span className="text-xs text-slate-500">Upload vers Hostinger…</span>
                  </>
                ) : (
                  <>
                    <ImageIcon size={20} className="text-slate-400" />
                    <span className="text-xs text-slate-500">Glisser ou <span className="text-amber-500 font-semibold">parcourir</span></span>
                    <span className="text-[10px] text-slate-400">Compresse → Enregistré sur Hostinger</span>
                  </>
                )}
              </div>
            )}
          </div>

          {compressInfo && (
            <div className="flex items-center gap-2 text-[11px] bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-1.5">
              <span className="font-bold text-emerald-600">✓ {compressInfo.format} sur Hostinger</span>
              <span className="text-slate-400">{compressInfo.origSize} → {compressInfo.newSize}</span>
              {compressInfo.savings > 0 && (
                <span className="ml-auto font-bold text-emerald-600">−{compressInfo.savings}%</span>
              )}
            </div>
          )}

          {!hasImage && !compressing && (
            <button type="button" onClick={() => inputRef.current?.click()}
              className="flex items-center justify-center gap-2 py-2 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
              <Upload size={14} /> Choisir un fichier
            </button>
          )}
        </div>
      )}
    </div>
  );
}
