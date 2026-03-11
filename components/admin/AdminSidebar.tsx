// components/admin/AdminSidebar.tsx
"use client";

import { useState } from "react";
import {
  LayoutDashboard, Pizza, Layers, Tag, Image as ImageIcon, Globe, Palette, Settings,
  ChevronLeft, ChevronRight, ExternalLink, Bell, MessageCircle,
  Clock,
  Shield, LogOut, Star, FileText, Save, Search, Package, TrendingUp, Smartphone,
} from "lucide-react";
import { useWoodizStore } from "@/lib/store";
import { useAuthStore } from "@/lib/auth";
import { useRouter } from "next/navigation";

const TABS = [
  { id: "dashboard",   label: "Tableau de bord",   icon: LayoutDashboard },
  { id: "products",    label: "Produits",           icon: Pizza },
  { id: "categories",  label: "Catégories",         icon: Layers },
  { id: "promos",      label: "Offres",             icon: Tag },
  { id: "slider",      label: "Slider / Images",    icon: ImageIcon },
  { id: "features",    label: "Bande icônes",       icon: Star },
  { id: "notification",label: "Notification bar",   icon: Bell },
  { id: "appbanner",   label: "Bannière App",       icon: Smartphone },
  { id: "schedule",    label: "Horaires",            icon: Clock },
  { id: "faq",         label: "FAQ",                icon: MessageCircle },
  { id: "reviews",     label: "Avis Clients",       icon: TrendingUp },
  { id: "googlePopup", label: "Popup Avis Google",  icon: Search },
  { id: "footer",      label: "Footer",             icon: Package },
  { id: "legal",       label: "Pages légales",      icon: FileText },
  { id: "languages",   label: "Langues",            icon: Globe },
  { id: "seo",         label: "SEO & Sitemap",      icon: Save },
  { id: "design",      label: "Design & Couleurs",  icon: Palette },
  { id: "security",    label: "Sécurité",           icon: Shield },
  { id: "settings",    label: "Paramètres & Affichage", icon: Settings },
];

interface AdminSidebarProps {
  activeTab: string;
  setActiveTab: (t: string) => void;
}

export default function AdminSidebar({ activeTab, setActiveTab }: AdminSidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const { settings } = useWoodizStore();
  const { logout } = useAuthStore();
  const router = useRouter();

  function handleLogout() {
    logout();
    router.push("/admin/login");
  }

  return (
    <div
      className="flex flex-col transition-all duration-300 flex-shrink-0"
      style={{ width: collapsed ? 68 : 240, background: "#0f172a", minHeight: "100vh" }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-16 border-b border-white/10 flex-shrink-0">
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center font-black text-sm flex-shrink-0"
          style={{ background: settings.primaryColor, color: settings.accentColor, fontFamily: "Poppins, sans-serif" }}
        >
          {settings.logoText}
        </div>
        {!collapsed && (
          <div>
            <div className="font-extrabold text-white text-sm" style={{ fontFamily: "Poppins, sans-serif" }}>
              {settings.siteName}
            </div>
            <div className="text-slate-400 text-[10px]">Interface Admin</div>
          </div>
        )}
      </div>

      {/* Nav items */}
      <nav className="flex-1 p-2 flex flex-col gap-0.5 overflow-y-auto">
        {TABS.map(({ id, label, icon: Icon }) => {
          const isActive = activeTab === id;
          return (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left w-full"
              style={{
                background: isActive ? `${settings.primaryColor}25` : "transparent",
                color: isActive ? settings.primaryColor : "#94a3b8",
              }}
              title={collapsed ? label : undefined}
            >
              <Icon size={17} className="flex-shrink-0" />
              {!collapsed && <span className="truncate">{label}</span>}
            </button>
          );
        })}
      </nav>

      {/* Bottom actions */}
      <div className="p-2 border-t border-white/10">
        <a
          href="/"
          target="_blank"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-all w-full mb-0.5"
          title={collapsed ? "Voir le site" : undefined}
        >
          <ExternalLink size={17} className="flex-shrink-0" />
          {!collapsed && <span>Voir le site</span>}
        </a>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all w-full mb-0.5"
          title={collapsed ? "Déconnexion" : undefined}
        >
          <LogOut size={17} className="flex-shrink-0" />
          {!collapsed && <span>Déconnexion</span>}
        </button>
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-all w-full"
          title={collapsed ? "Développer" : undefined}
        >
          {collapsed
            ? <ChevronRight size={17} />
            : <><ChevronLeft size={17} /><span>Réduire</span></>
          }
        </button>
      </div>
    </div>
  );
}
