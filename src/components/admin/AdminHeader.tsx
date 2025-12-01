"use client";

import { useEffect, useState } from "react";
import { getCurrentUser, User } from "@/lib/auth";
import { Bell, User as UserIcon } from "lucide-react";

export function AdminHeader() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    getCurrentUser().then(setUser);
  }, []);

  return (
    <header className="border-b border-slate-200 bg-white px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Admin Panel</h1>
          <p className="text-sm text-slate-500">Hoş geldiniz, {user?.name || user?.email}</p>
        </div>

        <div className="flex items-center gap-4">
          <button className="relative rounded-lg p-2 text-slate-600 hover:bg-slate-100">
            <Bell className="h-5 w-5" />
            <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500"></span>
          </button>

          <div className="flex items-center gap-3 rounded-lg border border-slate-200 px-3 py-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white">
              <UserIcon className="h-4 w-4" />
            </div>
            <div className="text-sm">
              <p className="font-semibold text-slate-900">{user?.name || "Admin"}</p>
              <p className="text-xs text-slate-500">{user?.role || "admin"}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
