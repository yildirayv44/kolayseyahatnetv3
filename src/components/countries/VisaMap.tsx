"use client";

import { useState } from "react";
import { CheckCircle, Clock, Globe, XCircle } from "lucide-react";

interface VisaRequirement {
  countryCode: string;
  visaStatus: string;
  allowedStay: string | null;
}

interface Props {
  visaData: Record<string, VisaRequirement>;
}

export function VisaMap({ visaData }: Props) {
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'visa-free': '#10b981', // green
      'visa-on-arrival': '#3b82f6', // blue
      'eta': '#06b6d4', // cyan
      'visa-required': '#f97316', // orange
    };
    return colors[status] || '#94a3b8'; // slate
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      'visa-free': 'Vizesiz',
      'visa-on-arrival': 'Varışta Vize',
      'eta': 'eTA Gerekli',
      'visa-required': 'Vize Gerekli',
    };
    return labels[status] || 'Bilinmiyor';
  };

  const getStatusIcon = (status: string) => {
    const icons: Record<string, any> = {
      'visa-free': CheckCircle,
      'visa-on-arrival': Clock,
      'eta': Globe,
      'visa-required': XCircle,
    };
    return icons[status] || Globe;
  };

  // Simplified world regions with visa status
  const regions = [
    { name: 'Avrupa', x: 50, y: 30, width: 15, height: 12, countries: ['GB', 'DE', 'FR', 'IT', 'ES'] },
    { name: 'Asya', x: 70, y: 35, width: 20, height: 15, countries: ['JP', 'KR', 'CN', 'TH', 'SG'] },
    { name: 'Afrika', x: 48, y: 50, width: 12, height: 18, countries: ['ZA', 'EG', 'KE', 'MA'] },
    { name: 'Kuzey Amerika', x: 15, y: 25, width: 18, height: 15, countries: ['US', 'CA', 'MX'] },
    { name: 'Güney Amerika', x: 25, y: 55, width: 12, height: 20, countries: ['BR', 'AR', 'CL'] },
    { name: 'Okyanusya', x: 85, y: 60, width: 10, height: 8, countries: ['AU', 'NZ'] },
    { name: 'Orta Doğu', x: 58, y: 42, width: 10, height: 8, countries: ['AE', 'SA', 'IL', 'QA'] },
  ];

  const getRegionStatus = (countries: string[]) => {
    const statuses = countries.map(code => visaData[code]?.visaStatus).filter(Boolean);
    if (statuses.length === 0) return 'unknown';
    
    // Return most common status
    const counts: Record<string, number> = {};
    statuses.forEach(s => counts[s] = (counts[s] || 0) + 1);
    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
  };

  return (
    <div className="card space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">Dünya Vize Haritası</h2>
        <p className="text-sm text-slate-600">
          Türkiye pasaportu ile vize durumlarını harita üzerinde görüntüleyin
        </p>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded" style={{ backgroundColor: '#10b981' }}></div>
          <CheckCircle className="h-4 w-4 text-green-600" />
          <span>Vizesiz</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded" style={{ backgroundColor: '#3b82f6' }}></div>
          <Clock className="h-4 w-4 text-blue-600" />
          <span>Varışta Vize</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded" style={{ backgroundColor: '#06b6d4' }}></div>
          <Globe className="h-4 w-4 text-cyan-600" />
          <span>eTA</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded" style={{ backgroundColor: '#f97316' }}></div>
          <XCircle className="h-4 w-4 text-orange-600" />
          <span>Vize Gerekli</span>
        </div>
      </div>

      {/* Simplified World Map */}
      <div className="relative w-full aspect-[2/1] bg-slate-50 rounded-lg overflow-hidden border border-slate-200">
        <svg
          viewBox="0 0 100 60"
          className="w-full h-full"
          style={{ backgroundColor: '#f8fafc' }}
        >
          {/* Ocean */}
          <rect x="0" y="0" width="100" height="60" fill="#e0f2fe" />
          
          {/* Regions */}
          {regions.map((region) => {
            const status = getRegionStatus(region.countries);
            const color = getStatusColor(status);
            const isHovered = hoveredCountry === region.name;
            
            return (
              <g key={region.name}>
                <rect
                  x={region.x}
                  y={region.y}
                  width={region.width}
                  height={region.height}
                  fill={color}
                  fillOpacity={isHovered ? 0.9 : 0.7}
                  stroke="#1e293b"
                  strokeWidth="0.2"
                  rx="0.5"
                  className="cursor-pointer transition-all"
                  onMouseEnter={() => setHoveredCountry(region.name)}
                  onMouseLeave={() => setHoveredCountry(null)}
                />
                <text
                  x={region.x + region.width / 2}
                  y={region.y + region.height / 2}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="white"
                  fontSize="2"
                  fontWeight="bold"
                  className="pointer-events-none"
                  style={{ textShadow: '0 0 2px rgba(0,0,0,0.5)' }}
                >
                  {region.name}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Hover Tooltip */}
        {hoveredCountry && (
          <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-3 border border-slate-200">
            <div className="font-semibold text-slate-900">{hoveredCountry}</div>
            <div className="text-sm text-slate-600 mt-1">
              Bölge vize durumlarını görmek için ülke kartlarına bakın
            </div>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="text-xs text-slate-500 italic">
        * Harita bölgesel vize durumlarını gösterir. Detaylı bilgi için ülke kartlarına tıklayın.
      </div>
    </div>
  );
}
