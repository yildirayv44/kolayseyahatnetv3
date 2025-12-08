"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { CheckCircle, Clock, Globe, FileText, CreditCard } from "lucide-react";

interface VisaRequirementBadgeProps {
  countryCode?: string;
  countryName?: string;
  className?: string;
}

interface VisaInfo {
  visa_status: string;
  allowed_stay: string | null;
  conditions: string | null;
  visa_cost: string | null;
  processing_time: string | null;
  application_method: string | null;
}

const VISA_STATUS_CONFIG = {
  'visa-free': {
    icon: CheckCircle,
    label: 'Vizesiz Giriş',
    color: 'bg-green-50 border-green-200 text-green-800',
    iconColor: 'text-green-600',
  },
  'visa-on-arrival': {
    icon: Globe,
    label: 'Varışta Vize',
    color: 'bg-blue-50 border-blue-200 text-blue-800',
    iconColor: 'text-blue-600',
  },
  'eta': {
    icon: FileText,
    label: 'ETA Gerekli',
    color: 'bg-cyan-50 border-cyan-200 text-cyan-800',
    iconColor: 'text-cyan-600',
  },
  'evisa': {
    icon: FileText,
    label: 'E-Vize Gerekli',
    color: 'bg-purple-50 border-purple-200 text-purple-800',
    iconColor: 'text-purple-600',
  },
  'visa-required': {
    icon: FileText,
    label: 'Vize Gerekli',
    color: 'bg-orange-50 border-orange-200 text-orange-800',
    iconColor: 'text-orange-600',
  },
  'no-admission': {
    icon: CheckCircle,
    label: 'Giriş Yasak',
    color: 'bg-red-50 border-red-200 text-red-800',
    iconColor: 'text-red-600',
  },
};

export function VisaRequirementBadge({ countryCode, countryName, className = '' }: VisaRequirementBadgeProps) {
  const [visaInfo, setVisaInfo] = useState<VisaInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!countryCode) {
      setLoading(false);
      return;
    }

    fetchVisaInfo();
  }, [countryCode]);

  const fetchVisaInfo = async () => {
    try {
      const { data, error } = await supabase
        .from('visa_requirements')
        .select('visa_status, allowed_stay, conditions, visa_cost, processing_time, application_method')
        .eq('country_code', countryCode)
        .single();

      if (error) {
        console.error('Error fetching visa info:', error);
        setVisaInfo(null);
      } else {
        setVisaInfo(data);
      }
    } catch (error) {
      console.error('Error:', error);
      setVisaInfo(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={`animate-pulse rounded-lg border-2 bg-gray-50 p-4 ${className}`}>
        <div className="h-4 w-32 rounded bg-gray-200"></div>
      </div>
    );
  }

  if (!visaInfo) {
    return null;
  }

  const config = VISA_STATUS_CONFIG[visaInfo.visa_status as keyof typeof VISA_STATUS_CONFIG];
  if (!config) return null;

  const Icon = config.icon;

  return (
    <div className={`rounded-lg border-2 p-6 ${config.color} ${className}`}>
      <div className="flex items-start gap-4">
        <div className={`rounded-full bg-white p-3 ${config.iconColor}`}>
          <Icon className="h-6 w-6" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-bold">{config.label}</h3>
          <p className="mt-1 text-sm opacity-90">
            Türk vatandaşları için {countryName || 'bu ülke'} vize gerekliliği
          </p>

          <div className="mt-4 space-y-2">
            {visaInfo.allowed_stay && (
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4" />
                <span><strong>Kalış Süresi:</strong> {visaInfo.allowed_stay}</span>
              </div>
            )}
            
            {visaInfo.visa_cost && (
              <div className="flex items-center gap-2 text-sm">
                <CreditCard className="h-4 w-4" />
                <span><strong>Ücret:</strong> {visaInfo.visa_cost}</span>
              </div>
            )}

            {visaInfo.processing_time && visaInfo.application_method !== 'not-required' && (
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4" />
                <span><strong>İşlem Süresi:</strong> {visaInfo.processing_time}</span>
              </div>
            )}

            {visaInfo.conditions && (
              <div className="mt-3 rounded-lg bg-white/50 p-3 text-sm">
                <strong>Koşullar:</strong> {visaInfo.conditions}
              </div>
            )}
          </div>

          {visaInfo.application_method && visaInfo.application_method !== 'not-required' && (
            <div className="mt-4 rounded-lg bg-white p-3 text-sm">
              <strong>Başvuru Yöntemi:</strong>{' '}
              {visaInfo.application_method === 'online' && '💻 Online başvuru'}
              {visaInfo.application_method === 'embassy' && '🏛️ Elçilik başvurusu'}
              {visaInfo.application_method === 'on-arrival' && '🛬 Varışta alınır'}
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 rounded-lg bg-white/70 p-3 text-xs">
        <strong>ℹ️ Not:</strong> Bu bilgiler PassportIndex'e dayanmaktadır. Seyahat öncesi mutlaka 
        güncel bilgileri ilgili ülkenin resmi kaynaklarından kontrol edin.
      </div>
    </div>
  );
}
