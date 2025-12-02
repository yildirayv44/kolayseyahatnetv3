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
} from "lucide-react";
import { signOut } from "@/lib/auth";
import { useRouter } from "next/navigation";

const menuItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/ulkeler", label: "Ülkeler", icon: Globe2 },
  { href: "/admin/vize-paketleri", label: "Vize Paketleri", icon: Package },
  { href: "/admin/bloglar", label: "Bloglar", icon: FileText },
  { href: "/admin/danismanlar", label: "Danışmanlar", icon: Users },
  { href: "/admin/sayfalar", label: "Sayfa Yönetimi", icon: FileCode },
  { href: "/admin/basvurular", label: "Başvurular", icon: ClipboardList },
  { href: "/admin/yorumlar", label: "Yorumlar", icon: MessageSquare },
  { href: "/admin/ayarlar", label: "Ayarlar", icon: Settings },
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
      <nav className="flex-1 space-y-1 p-4">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-primary text-white"
                  : "text-slate-700 hover:bg-slate-100"
              }`}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </Link>
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
