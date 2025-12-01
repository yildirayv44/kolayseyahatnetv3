import { Star, Award, Globe2, Zap, ShieldCheck, Users } from "lucide-react";

export function TrustBadges() {
  const badges = [
    {
      icon: Star,
      value: "4.9/5",
      label: "Müşteri Memnuniyeti",
      color: "text-amber-500",
      bg: "bg-amber-50",
    },
    {
      icon: Users,
      value: "10,000+",
      label: "Başarılı Başvuru",
      color: "text-emerald-500",
      bg: "bg-emerald-50",
    },
    {
      icon: Globe2,
      value: "20+",
      label: "Ülke Deneyimi",
      color: "text-blue-500",
      bg: "bg-blue-50",
    },
    {
      icon: Zap,
      value: "48 Saat",
      label: "Hızlı Randevu",
      color: "text-orange-500",
      bg: "bg-orange-50",
    },
    {
      icon: ShieldCheck,
      value: "%98",
      label: "Onay Oranı",
      color: "text-green-500",
      bg: "bg-green-50",
    },
    {
      icon: Award,
      value: "15 Yıl",
      label: "Tecrübe",
      color: "text-purple-500",
      bg: "bg-purple-50",
    },
  ];

  return (
    <section className="py-8">
      <div className="mx-auto max-w-6xl px-4">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            Neden Kolay Seyahat?
          </h2>
          <p className="text-slate-600">
            Binlerce mutlu müşterimizin güvendiği profesyonel hizmet
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          {badges.map((badge, index) => (
            <div
              key={index}
              className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white p-4 text-center transition-all hover:border-primary hover:shadow-lg"
            >
              <div
                className={`mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full ${badge.bg} transition-transform group-hover:scale-110`}
              >
                <badge.icon className={`h-6 w-6 ${badge.color}`} />
              </div>
              <div className="text-2xl font-bold text-slate-900 mb-1">
                {badge.value}
              </div>
              <div className="text-xs text-slate-600 font-medium">
                {badge.label}
              </div>
              
              {/* Hover effect */}
              <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
            </div>
          ))}
        </div>

        {/* Trust Indicators */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm text-slate-600">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
            <span>SSL Güvenli Ödeme</span>
          </div>
          <div className="flex items-center gap-2">
            <Award className="h-4 w-4 text-blue-500" />
            <span>TÜRSAB Üyesi</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-purple-500" />
            <span>7/24 Destek</span>
          </div>
        </div>
      </div>
    </section>
  );
}
