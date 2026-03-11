// components/admin/tabs/SliderTab.tsx
"use client";

import { useState } from "react";
import { Plus, Trash2, GripVertical, Image as ImageIcon, Palette, Type, Globe } from "lucide-react";
import { useWoodizStore, SliderSlide } from "@/lib/store";
import ImageUploadField from "@/components/admin/ImageUploadField";

const TEXT_SIZES_TITLE = ["sm", "md", "lg", "xl", "2xl"] as const;
const TEXT_SIZES_SUB = ["xs", "sm", "md", "lg"] as const;
const titleSizeLabel: Record<string, string> = { sm: "Petit", md: "Moyen", lg: "Grand", xl: "Très grand", "2xl": "Énorme" };
const subSizeLabel: Record<string, string> = { xs: "Petit", sm: "Moyen", md: "Grand", lg: "Très grand" };

export default function SliderTab() {
  const { settings, updateSettings, translations } = useWoodizStore();
  const [newType, setNewType] = useState<"image" | "color">("image");
  const [newValue, setNewValue] = useState("");
  const [newInputMode, setNewInputMode] = useState<"upload" | "url">("upload");
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides: SliderSlide[] = settings.sliderSlides?.length
    ? settings.sliderSlides
    : settings.sliderImages.map((url) => ({ type: "image" as const, value: url, textSizeTitle: "xl" as const, textSizeSubtitle: "md" as const }));

  function updateSlides(next: SliderSlide[]) {
    updateSettings({ sliderSlides: next, sliderImages: next.filter((s) => s.type === "image").map((s) => s.value) });
  }

  function addSlide() {
    if (!newValue.trim() && newType === "image") return;
    const val = newType === "color" ? (newValue || "#2B1408") : newValue.trim();
    updateSlides([...slides, { type: newType, value: val, textSizeTitle: "xl", textSizeSubtitle: "md", useCustomText: false, customTitle: "", customSubtitle: "" }]);
    setNewValue("");
  }

  function removeSlide(i: number) {
    updateSlides(slides.filter((_, idx) => idx !== i));
    setCurrentSlide(0);
  }

  function moveUp(i: number) {
    if (i === 0) return;
    const arr = [...slides];
    [arr[i - 1], arr[i]] = [arr[i], arr[i - 1]];
    updateSlides(arr);
  }

  function moveDown(i: number) {
    if (i === slides.length - 1) return;
    const arr = [...slides];
    [arr[i], arr[i + 1]] = [arr[i + 1], arr[i]];
    updateSlides(arr);
  }

  function updateSlide(i: number, patch: Partial<SliderSlide>) {
    updateSlides(slides.map((s, idx) => idx === i ? { ...s, ...patch } : s));
  }

  const current = slides[currentSlide];

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="font-extrabold text-2xl text-slate-800" style={{ fontFamily: "Poppins, sans-serif" }}>Slider & Images</h1>
        <p className="text-slate-400 text-sm mt-1">{slides.length} slide(s) dans le slider</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: Preview + Controls */}
        <div>
          <h2 className="font-bold text-sm text-slate-500 uppercase tracking-wide mb-3">Aperçu du slider</h2>
          <div className="relative rounded-2xl overflow-hidden bg-slate-900" style={{ height: 280 }}>
            {slides.length > 0 && current ? (
              <>
                {current.type === "image" ? (
                  <img src={current.value} alt="" className="w-full h-full object-cover opacity-80" key={currentSlide} />
                ) : (
                  <div className="absolute inset-0" style={{ background: current.value }} />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-8 left-6 right-6 z-10">
                  <div className="text-white font-black leading-tight mb-1" style={{
                    fontSize: current.textSizeTitle === "2xl" ? 28 : current.textSizeTitle === "xl" ? 22 : current.textSizeTitle === "lg" ? 18 : 15,
                    fontFamily: "Poppins, sans-serif"
                  }}>
                    {current.useCustomText && current.customTitle ? current.customTitle : "La pizza artisanale"}
                  </div>
                  <div className="text-white/70 text-xs">
                    {current.useCustomText && current.customSubtitle ? current.customSubtitle : "Pâte maison · Ø 31cm"}
                  </div>
                </div>
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
                  {slides.map((_, i) => (
                    <button key={i} onClick={() => setCurrentSlide(i)} className="h-2 rounded-full transition-all"
                      style={{ width: i === currentSlide ? 24 : 8, background: i === currentSlide ? settings.primaryColor : "rgba(255,255,255,0.5)", border: "none", cursor: "pointer", padding: 0 }} />
                  ))}
                </div>
                <div className="absolute top-3 left-3 bg-black/50 text-white text-xs px-2.5 py-1 rounded-full flex items-center gap-1.5">
                  {current.type === "color" ? <Palette size={10} /> : <ImageIcon size={10} />}
                  {currentSlide + 1} / {slides.length}
                </div>
              </>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                <ImageIcon size={40} className="mb-3 opacity-30" />
                <p className="text-sm">Aucune slide</p>
              </div>
            )}
          </div>

          {/* Controls for current slide */}
          {current && (
            <div className="mt-4 flex flex-col gap-3">
              {/* Custom text toggle */}
              <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Type size={14} className="text-slate-500" />
                    <span className="font-bold text-sm text-slate-700">Texte personnalisé</span>
                  </div>
                  <button
                    onClick={() => updateSlide(currentSlide, { useCustomText: !current.useCustomText })}
                    className={`relative w-10 h-5 rounded-full transition-all ${current.useCustomText ? "bg-emerald-400" : "bg-slate-200"}`}
                  >
                    <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${current.useCustomText ? "left-5" : "left-0.5"}`} />
                  </button>
                </div>
                {current.useCustomText && (
                  <div className="flex flex-col gap-2">
                    <input
                      className="form-input text-sm"
                      value={current.customTitle || ""}
                      onChange={(e) => updateSlide(currentSlide, { customTitle: e.target.value })}
                      placeholder="Titre de cette slide... (FR)"
                    />
                    <input
                      className="form-input text-sm"
                      value={current.customSubtitle || ""}
                      onChange={(e) => updateSlide(currentSlide, { customSubtitle: e.target.value })}
                      placeholder="Sous-titre de cette slide... (FR)"
                    />
                    {/* Per-locale translations */}
                    {translations.filter(tr => tr.locale !== "fr").map((tr) => (
                      <div key={tr.locale} className="border border-slate-100 rounded-xl p-3 bg-slate-50 mt-1">
                        <div className="flex items-center gap-1.5 mb-2">
                          <Globe size={12} className="text-slate-400" />
                          <span className="text-xs font-bold text-slate-500">{tr.flag} {tr.label}</span>
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <input
                            className="form-input text-sm"
                            value={((current as any).translations?.[tr.locale]?.title) || ""}
                            onChange={(e) => {
                              const trans = { ...((current as any).translations || {}), [tr.locale]: { ...((current as any).translations?.[tr.locale] || {}), title: e.target.value } };
                              updateSlide(currentSlide, { translations: trans } as any);
                            }}
                            placeholder={`Titre (${tr.locale.toUpperCase()})...`}
                          />
                          <input
                            className="form-input text-sm"
                            value={((current as any).translations?.[tr.locale]?.subtitle) || ""}
                            onChange={(e) => {
                              const trans = { ...((current as any).translations || {}), [tr.locale]: { ...((current as any).translations?.[tr.locale] || {}), subtitle: e.target.value } };
                              updateSlide(currentSlide, { translations: trans } as any);
                            }}
                            placeholder={`Sous-titre (${tr.locale.toUpperCase()})...`}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {!current.useCustomText && (
                  <p className="text-xs text-slate-400">Utilise le texte global défini dans SEO & Textes</p>
                )}
              </div>

              {/* Text sizes */}
              <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
                <h3 className="font-bold text-sm text-slate-700 mb-3">Taille du texte — Slide {currentSlide + 1}</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="form-label text-xs">Titre</label>
                    <div className="flex gap-1 flex-wrap mt-1">
                      {TEXT_SIZES_TITLE.map((size) => (
                        <button key={size} onClick={() => updateSlide(currentSlide, { textSizeTitle: size })}
                          className="px-2 py-1 rounded-lg text-xs font-semibold transition-all"
                          style={{ background: current.textSizeTitle === size ? settings.primaryColor : "#F1F5F9", color: current.textSizeTitle === size ? "#fff" : "#64748B" }}>
                          {titleSizeLabel[size]}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="form-label text-xs">Sous-titre</label>
                    <div className="flex gap-1 flex-wrap mt-1">
                      {TEXT_SIZES_SUB.map((size) => (
                        <button key={size} onClick={() => updateSlide(currentSlide, { textSizeSubtitle: size })}
                          className="px-2 py-1 rounded-lg text-xs font-semibold transition-all"
                          style={{ background: current.textSizeSubtitle === size ? settings.primaryColor : "#F1F5F9", color: current.textSizeSubtitle === size ? "#fff" : "#64748B" }}>
                          {subSizeLabel[size]}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Add slide */}
          <div className="mt-3 bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
            <h3 className="font-bold text-sm text-slate-700 mb-3">Ajouter une slide</h3>
            {/* Slide type: image vs color */}
            <div className="flex gap-2 mb-3">
              <button onClick={() => setNewType("image")} className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition-all"
                style={{ background: newType === "image" ? settings.primaryColor : "#F1F5F9", color: newType === "image" ? "#fff" : "#64748B" }}>
                <ImageIcon size={14} /> Image
              </button>
              <button onClick={() => setNewType("color")} className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition-all"
                style={{ background: newType === "color" ? settings.primaryColor : "#F1F5F9", color: newType === "color" ? "#fff" : "#64748B" }}>
                <Palette size={14} /> Couleur unie
              </button>
            </div>

            {newType === "image" ? (
              <div className="flex flex-col gap-2">
                {/* Upload / URL sub-tabs */}
                <div className="flex gap-1 bg-slate-100 p-0.5 rounded-lg w-fit mb-1">
                  <button
                    onClick={() => setNewInputMode("upload")}
                    className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${newInputMode === "upload" ? "bg-white shadow text-slate-800" : "text-slate-500"}`}
                  >Upload</button>
                  <button
                    onClick={() => setNewInputMode("url")}
                    className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${newInputMode === "url" ? "bg-white shadow text-slate-800" : "text-slate-500"}`}
                  >URL</button>
                </div>

                {newInputMode === "upload" ? (
                  <div className="flex flex-col gap-2">
                    <ImageUploadField
                      value={newValue}
                      onChange={setNewValue}
                      idbKey={`slider:new:${Date.now()}`}
                      placeholder="https://..."
                      quality={0.78}
                      maxDim={1600}
                    />
                    <button
                      onClick={() => { if (newValue) { addSlide(); setNewValue(""); } }}
                      disabled={!newValue}
                      className="w-full py-2.5 rounded-xl text-white text-sm font-semibold flex items-center justify-center gap-1.5 hover:opacity-90 transition-opacity disabled:opacity-40"
                      style={{ background: settings.primaryColor }}
                    >
                      <Plus size={15} /> Ajouter cette slide
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input className="form-input flex-1" value={newValue} onChange={(e) => setNewValue(e.target.value)} placeholder="https://..." onKeyDown={(e) => e.key === "Enter" && addSlide()} />
                    <button onClick={addSlide} className="px-4 py-2.5 rounded-xl text-white text-sm font-semibold flex items-center gap-1.5 hover:opacity-90 transition-opacity" style={{ background: settings.primaryColor }}>
                      <Plus size={15} /> Ajouter
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <input type="color" value={newValue || "#2B1408"} onChange={(e) => setNewValue(e.target.value)} className="w-12 h-10 rounded-lg border border-slate-200 cursor-pointer" />
                <input className="form-input flex-1" value={newValue} onChange={(e) => setNewValue(e.target.value)} placeholder="#2B1408" />
                <button onClick={addSlide} className="px-4 py-2.5 rounded-xl text-white text-sm font-semibold flex items-center gap-1.5 hover:opacity-90 transition-opacity" style={{ background: settings.primaryColor }}>
                  <Plus size={15} /> Ajouter
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right: Slide list */}
        <div>
          <h2 className="font-bold text-sm text-slate-500 uppercase tracking-wide mb-3">Slides ({slides.length})</h2>
          <div className="flex flex-col gap-3">
            {slides.map((slide, i) => (
              <div key={i}
                className={`bg-white rounded-2xl p-3 border flex items-center gap-3 shadow-sm cursor-pointer transition-all ${currentSlide === i ? "border-amber-400 ring-2 ring-amber-100" : "border-slate-100 hover:border-slate-200"}`}
                onClick={() => setCurrentSlide(i)}
              >
                <GripVertical size={16} className="text-slate-300 flex-shrink-0" />
                {slide.type === "image" ? (
                  <img src={slide.value} alt="" className="w-16 h-12 rounded-xl object-cover flex-shrink-0" />
                ) : (
                  <div className="w-16 h-12 rounded-xl flex-shrink-0 flex items-center justify-center" style={{ background: slide.value }}>
                    <Palette size={16} className="text-white/60" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    {slide.type === "color" ? (
                      <span className="text-[10px] font-bold bg-purple-100 text-purple-600 px-1.5 py-0.5 rounded-full">Couleur</span>
                    ) : (
                      <span className="text-[10px] font-bold bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-full">Image</span>
                    )}
                    {slide.useCustomText && <span className="text-[10px] font-bold bg-amber-100 text-amber-600 px-1.5 py-0.5 rounded-full">Texte custom</span>}
                  </div>
                  <div className="text-xs text-slate-600 truncate font-medium">
                    {slide.useCustomText && slide.customTitle ? slide.customTitle : `Slide ${i + 1}`}
                  </div>
                  <div className="text-[10px] text-slate-400 truncate">{slide.value}</div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button onClick={(e) => { e.stopPropagation(); moveUp(i); }} disabled={i === 0} className="w-6 h-6 rounded flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-30 transition-all">↑</button>
                  <button onClick={(e) => { e.stopPropagation(); moveDown(i); }} disabled={i === slides.length - 1} className="w-6 h-6 rounded flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-30 transition-all">↓</button>
                  <button onClick={(e) => { e.stopPropagation(); removeSlide(i); }} className="w-7 h-7 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 flex items-center justify-center transition-colors"><Trash2 size={13} /></button>
                </div>
              </div>
            ))}
            {slides.length === 0 && (
              <div className="border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center text-slate-400">
                <ImageIcon size={32} className="mx-auto mb-2 opacity-30" />
                <p className="text-sm">Aucune slide</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
