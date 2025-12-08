"use client";

import { CheckCircle, Clock, Globe, XCircle, TrendingUp } from "lucide-react";

interface VisaRequirement {
  countryCode: string;
  visaStatus: string;
  allowedStay: string | null;
}

interface Props {
  visaData: Record<string, VisaRequirement>;
  totalCountries: number;
}

export function VisaMap({ visaData, totalCountries }: Props) {
  // Calculate statistics
  const statusCounts = Object.values(visaData).reduce((acc, visa) => {
    acc[visa.visaStatus] = (acc[visa.visaStatus] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const stats = [
    {
      status: 'visa-free',
      label: 'Vizesiz Giriş',
      count: statusCounts['visa-free'] || 0,
      icon: CheckCircle,
      color: 'bg-green-50 border-green-200',
      iconColor: 'text-green-600',
      textColor: 'text-green-900'
    },
    {
      status: 'visa-on-arrival',
      label: 'Varışta Vize',
      count: statusCounts['visa-on-arrival'] || 0,
      icon: Clock,
      color: 'bg-blue-50 border-blue-200',
      iconColor: 'text-blue-600',
      textColor: 'text-blue-900'
    },
    {
      status: 'eta',
      label: 'eTA Gerekli',
      count: statusCounts['eta'] || 0,
      icon: Globe,
      color: 'bg-cyan-50 border-cyan-200',
      iconColor: 'text-cyan-600',
      textColor: 'text-cyan-900'
    },
    {
      status: 'visa-required',
      label: 'Vize Gerekli',
      count: statusCounts['visa-required'] || 0,
      icon: XCircle,
      color: 'bg-orange-50 border-orange-200',
      iconColor: 'text-orange-600',
      textColor: 'text-orange-900'
    },
  ];

  const totalWithData = Object.keys(visaData).length;
  const visaFreePercentage = totalWithData > 0 
    ? Math.round(((statusCounts['visa-free'] || 0) / totalWithData) * 100)
    : 0;

  return (
    <div className="space-y-4">
      {/* Main Stats Card */}
      <div className="card">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-1">Türkiye Pasaportu Vize İstatistikleri</h2>
            <p className="text-sm text-slate-600">
              {totalCountries} ülke için vize durumu bilgisi
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-lg bg-green-50 px-3 py-2 border border-green-200">
            <TrendingUp className="h-5 w-5 text-green-600" />
            <div className="text-right">
              <div className="text-2xl font-bold text-green-900">{visaFreePercentage}%</div>
              <div className="text-xs text-green-600">Vizesiz</div>
            </div>
          </div>
        </div>

        {/* Status Cards Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.status}
                className={`rounded-lg border p-4 ${stat.color} transition-all hover:shadow-md`}
              >
                <div className="flex items-center gap-3">
                  <div className={`rounded-lg bg-white p-2 ${stat.iconColor}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className={`text-2xl font-bold ${stat.textColor}`}>
                      {stat.count}
                    </div>
                    <div className="text-xs text-slate-600 mt-0.5">
                      {stat.label}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
