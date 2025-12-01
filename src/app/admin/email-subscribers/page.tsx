import { createClient } from "@supabase/supabase-js";
import { Mail, Download, Calendar, Tag, CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

async function getEmailSubscribers() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );

  const { data, error } = await supabase
    .from("email_subscribers")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching email subscribers:", error);
    return [];
  }

  return data || [];
}

export default async function EmailSubscribersPage() {
  const subscribers = await getEmailSubscribers();

  const stats = {
    total: subscribers.length,
    exitIntent: subscribers.filter((s) => s.source === "exit_intent").length,
    used: subscribers.filter((s) => s.is_used).length,
    unused: subscribers.filter((s) => !s.is_used).length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Email Aboneleri</h1>
          <p className="text-sm text-slate-600">
            Exit intent popup ve diğer kaynaklardan toplanan emailler
          </p>
        </div>
        <Link
          href="/admin"
          className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          ← Geri
        </Link>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
              <Mail className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900">{stats.total}</div>
              <div className="text-xs text-slate-600">Toplam Abone</div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100">
              <Tag className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900">{stats.exitIntent}</div>
              <div className="text-xs text-slate-600">Exit Intent</div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100">
              <CheckCircle className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900">{stats.used}</div>
              <div className="text-xs text-slate-600">Kullanıldı</div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100">
              <XCircle className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900">{stats.unused}</div>
              <div className="text-xs text-slate-600">Kullanılmadı</div>
            </div>
          </div>
        </div>
      </div>

      {/* Export Button */}
      <div className="flex justify-end">
        <button
          onClick={() => {
            const csv = [
              ["Email", "Kaynak", "İndirim Kodu", "Kullanıldı", "Tarih"],
              ...subscribers.map((s) => [
                s.email,
                s.source,
                s.discount_code,
                s.is_used ? "Evet" : "Hayır",
                new Date(s.created_at).toLocaleString("tr-TR"),
              ]),
            ]
              .map((row) => row.join(","))
              .join("\n");

            const blob = new Blob([csv], { type: "text/csv" });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `email-subscribers-${new Date().toISOString().split("T")[0]}.csv`;
            a.click();
          }}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark"
        >
          <Download className="h-4 w-4" />
          CSV İndir
        </button>
      </div>

      {/* Table */}
      <div className="card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700">
                  Email
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700">
                  Kaynak
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700">
                  İndirim Kodu
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700">
                  Durum
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700">
                  Tarih
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {subscribers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-sm text-slate-500">
                    Henüz abone yok
                  </td>
                </tr>
              ) : (
                subscribers.map((subscriber) => (
                  <tr key={subscriber.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-slate-400" />
                        <span className="text-sm font-medium text-slate-900">
                          {subscriber.email}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 rounded-full bg-purple-50 px-2 py-1 text-xs font-medium text-purple-700">
                        <Tag className="h-3 w-3" />
                        {subscriber.source}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-mono text-sm font-semibold text-primary">
                        {subscriber.discount_code}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {subscriber.is_used ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700">
                          <CheckCircle className="h-3 w-3" />
                          Kullanıldı
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-orange-50 px-2 py-1 text-xs font-medium text-orange-700">
                          <XCircle className="h-3 w-3" />
                          Bekliyor
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 text-xs text-slate-600">
                        <Calendar className="h-3 w-3" />
                        {new Date(subscriber.created_at).toLocaleDateString("tr-TR", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Info */}
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
        <h3 className="mb-2 text-sm font-semibold text-blue-900">
          💡 İndirim Kodu Kullanımı
        </h3>
        <p className="text-xs text-blue-700">
          Müşteri <span className="font-bold">HOSGELDIN10</span> kodunu kullandığında, bu
          listeden ilgili email'in durumunu "Kullanıldı" olarak işaretleyebilirsiniz.
        </p>
      </div>
    </div>
  );
}
