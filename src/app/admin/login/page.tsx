"use client";

import dynamic from "next/dynamic";

const LoginForm = dynamic(() => import("./LoginForm"), {
  ssr: false,
  loading: () => (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
        <p className="mt-4 text-sm text-slate-600">Yükleniyor...</p>
      </div>
    </div>
  ),
});

export default function AdminLoginPage() {
  return <LoginForm />;
}
