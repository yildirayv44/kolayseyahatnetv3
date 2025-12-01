import { Settings, Globe, Mail, Phone, MapPin, Clock } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Ayarlar</h2>
        <p className="text-sm text-slate-600">Site ayarlarını yönetin</p>
      </div>

      {/* Settings Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* General Settings */}
        <div className="card">
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-lg bg-primary p-2">
              <Settings className="h-5 w-5 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900">Genel Ayarlar</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-900">Site Adı</label>
              <input
                type="text"
                defaultValue="Kolay Seyahat"
                className="mt-1 w-full rounded-lg border border-slate-200 px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-900">Site Açıklaması</label>
              <textarea
                rows={3}
                defaultValue="Profesyonel vize danışmanlığı hizmeti"
                className="mt-1 w-full rounded-lg border border-slate-200 px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-900">Site URL</label>
              <div className="relative mt-1">
                <Globe className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input
                  type="url"
                  defaultValue="https://kolayseyahat.net"
                  className="w-full rounded-lg border border-slate-200 py-2 pl-10 pr-4 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Contact Settings */}
        <div className="card">
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-lg bg-emerald-500 p-2">
              <Phone className="h-5 w-5 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900">İletişim Bilgileri</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-900">Telefon</label>
              <div className="relative mt-1">
                <Phone className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input
                  type="tel"
                  defaultValue="0212 909 99 71"
                  className="w-full rounded-lg border border-slate-200 py-2 pl-10 pr-4 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-900">E-posta</label>
              <div className="relative mt-1">
                <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  defaultValue="vize@kolayseyahat.net"
                  className="w-full rounded-lg border border-slate-200 py-2 pl-10 pr-4 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-900">Adres</label>
              <div className="relative mt-1">
                <MapPin className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                <textarea
                  rows={3}
                  defaultValue="İstanbul, Türkiye"
                  className="w-full rounded-lg border border-slate-200 py-2 pl-10 pr-4 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-900">Çalışma Saatleri</label>
              <div className="relative mt-1">
                <Clock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  defaultValue="Pazartesi - Cuma: 09:00 - 18:00"
                  className="w-full rounded-lg border border-slate-200 py-2 pl-10 pr-4 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button className="rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:bg-primary-dark hover:shadow-xl">
          Değişiklikleri Kaydet
        </button>
      </div>
    </div>
  );
}
