// app/mentions-legales/page.tsx
"use client";
import { useWoodizStore } from "@/lib/store";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function MentionsLegalesPage() {
  const { legalPages, settings } = useWoodizStore();
  const page = legalPages?.find((p) => p.id === "mentions");

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 mb-8 transition-colors">
          <ArrowLeft size={16} /> Retour
        </Link>
        <div className="bg-white rounded-3xl shadow-sm p-8 md:p-12">
          <h1 className="font-extrabold text-3xl text-slate-900 mb-8" style={{ fontFamily: "Poppins, sans-serif", color: settings.accentColor }}>
            {page?.title || "Mentions légales"}
          </h1>
          <div className="prose prose-slate max-w-none text-sm leading-relaxed whitespace-pre-line text-slate-700">
            {page?.content?.split("\n").map((line, i) => {
              if (line.startsWith("## ")) return <h2 key={i} className="font-bold text-lg text-slate-800 mt-6 mb-2">{line.slice(3)}</h2>;
              if (line.startsWith("**") && line.endsWith("**")) return <p key={i} className="font-bold text-slate-800 mt-4 mb-1">{line.slice(2, -2)}</p>;
              if (line === "") return <br key={i} />;
              return <p key={i}>{line}</p>;
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
