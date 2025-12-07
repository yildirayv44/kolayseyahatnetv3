import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { AuthGuard } from "@/components/admin/AuthGuard";
import { AIAssistant } from "@/components/admin/AIAssistant";
import { KeyboardShortcuts } from "@/components/admin/KeyboardShortcuts";
import { Metadata } from "next";
import "../globals.css";

export const metadata: Metadata = {
  title: "Admin Panel | Kolay Seyahat",
  description: "Kolay Seyahat yönetim paneli",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <AuthGuard>
          <div className="flex h-screen overflow-hidden bg-slate-50">
            {/* Sidebar */}
            <AdminSidebar />

            {/* Main Content */}
            <div className="flex flex-1 flex-col overflow-hidden">
              <AdminHeader />
              <main className="flex-1 overflow-y-auto p-6">{children}</main>
            </div>
          </div>
          
          {/* AI Assistant - Floating */}
          <AIAssistant />
          
          {/* Keyboard Shortcuts */}
          <KeyboardShortcuts />
        </AuthGuard>
      </body>
    </html>
  );
}
