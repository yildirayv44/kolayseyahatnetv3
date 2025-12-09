"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Globe2,
  FileText,
  Users,
  ClipboardList,
  MessageSquare,
  Settings,
  LogOut,
  Package,
  FileCode,
  HelpCircle,
  Mail,
  UserPlus,
  Image,
  TrendingUp,
  Sparkles,
  Search,
} from "lucide-react";
import { signOut } from "@/lib/auth";
import { useRouter } from "next/navigation";

const menuItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/ai-tools", label: "AI Araçlar", icon: Sparkles, highlight: true },
  { href: "/admin/ulkeler", label: "Ülkeler", icon: Globe2 },
  { href: "/admin/ulkeler/seo-duzenle", label: "SEO Düzenle", icon: Search },
  { href: "/admin/ulkeler/vize-gereklilikleri", label: "Vize Gereklilikleri", icon: FileText },
  { href: "/admin/ulkeler/alt-sayfalar", label: "Alt Sayfalar", icon: FileText },
  { href: "/admin/vize-paketleri", label: "Vize Paketleri", icon: Package },
  { href: "/admin/bloglar", label: "Bloglar", icon: FileText },
  { href: "/admin/images", label: "Görsel Tespiti", icon: Image },
  { href: "/admin/seo-analizi", label: "SEO Analizi", icon: TrendingUp },
  { href: "/admin/sorular", label: "Sorular", icon: HelpCircle },
  { href: "/admin/danismanlar", label: "Danışmanlar", icon: Users },
  { href: "/admin/sayfalar", label: "Sayfa Yönetimi", icon: FileCode },
  { href: "/admin/basvurular", label: "Başvurular", icon: ClipboardList },
  { href: "/admin/geri-bildirimler", label: "Geri Bildirimler", icon: Mail },
  { href: "/admin/affiliate-basvurular", label: "Affiliate Başvuruları", icon: UserPlus },
  { href: "/admin/yorumlar", label: "Yorumlar", icon: MessageSquare },
  { href: "/admin/ayarlar", label: "Ayarlar", icon: Settings },
  { href: "/admin/fix-taxonomies", label: "🔧 Taxonomy Düzelt", icon: Settings, divider: true },
  { href: "/admin/fix-slug", label: "🔗 Slug Düzelt", icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <aside className="flex w-64 flex-col border-r border-slate-200 bg-white">
      {/* Logo */}
      <div className="border-b border-slate-200 p-6">
        <Link href="/admin" className="text-xl font-bold text-primary">
          Kolay Seyahat
        </Link>
        <p className="mt-1 text-xs text-slate-500">Admin Panel</p>
      </div>

      {/* Menu */}
      <nav className="flex-1 space-y-1 p-4 overflow-y-auto">
        {menuItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
          const isHighlight = item.highlight;

          return (
            <div key={item.href}>
              {item.divider && (
                <div className="my-3 border-t border-slate-200">
                  <div className="mt-3 mb-2 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Sistem Araçları
                  </div>
                </div>
              )}
              <Link
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all ${
                  isActive
                    ? isHighlight
                      ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg"
                      : "bg-primary text-white"
                    : isHighlight
                    ? "text-purple-700 hover:bg-gradient-to-r hover:from-purple-50 hover:to-blue-50 border border-purple-200"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                <Icon className={`h-5 w-5 ${isHighlight && !isActive ? 'animate-pulse' : ''}`} />
                {item.label}
                {isHighlight && !isActive && (
                  <span className="ml-auto text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-bold">
                    NEW
                  </span>
                )}
              </Link>
            </div>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="border-t border-slate-200 p-4">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
        >
          <LogOut className="h-5 w-5" />
          Çıkış Yap
        </button>
      </div>
    </aside>
  );
}
