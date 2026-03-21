"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Search, Filter, Globe, CheckCircle, XCircle, Clock, FileText } from 'lucide-react';

interface VisaRequirement {
  country_code: string;
  country_name: string;
  visa_status: string;
  allowed_stay: string | null;
  application_method: string;
  conditions: string | null;
  flag_emoji: string | null;
}

interface VisaRequirementsTableProps {
  sourceCountryCode: string;
  sourceCountryName: string;
  sourceCountryFlag: string;
  locale: 'tr' | 'en';
}

export function VisaRequirementsTable({ 
  sourceCountryCode, 
  sourceCountryName,
  sourceCountryFlag,
  locale 
}: VisaRequirementsTableProps) {
  const [requirements, setRequirements] = useState<VisaRequirement[]>([]);
  const [filteredRequirements, setFilteredRequirements] = useState<VisaRequirement[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const t = locale === 'en' ? {
    title: 'Visa Requirements for',
    subtitle: 'Visa-free, visa on arrival, e-visa and visa required information for',
    search: 'Search country...',
    filterAll: 'All Countries',
    filterVisaFree: 'Visa Free',
    filterVisaOnArrival: 'Visa on Arrival',
    filterEta: 'e-Visa',
    filterRequired: 'Visa Required',
    country: 'Country',
    visaStatus: 'Visa Status',
    allowedStay: 'Allowed Stay',
    applicationMethod: 'Application Method',
    conditions: 'Conditions',
    visaFree: 'Visa Free',
    visaOnArrival: 'Visa on Arrival',
    eta: 'e-Visa',
    visaRequired: 'Visa Required',
    notRequired: 'Not Required',
    onArrival: 'On Arrival',
    online: 'Online',
    embassy: 'Embassy',
    loading: 'Loading visa requirements...',
    noResults: 'No countries found',
    stats: 'Statistics',
    totalCountries: 'Total Countries',
  } : {
    title: 'Vize Gereklilikleri',
    subtitle: 'Vizesiz giriş, varışta vize, e-vize ve konsolosluk başvurusu gerektiren tüm ülkeler için',
    search: 'Ülke ara...',
    filterAll: 'Tüm Ülkeler',
    filterVisaFree: 'Vizesiz Giriş',
    filterVisaOnArrival: 'Varışta Vize',
    filterEta: 'e-Vize',
    filterRequired: 'Vize Gerekli',
    country: 'Ülke',
    visaStatus: 'Vize Durumu',
    allowedStay: 'Kalış Süresi',
    applicationMethod: 'Başvuru Yöntemi',
    conditions: 'Koşullar',
    visaFree: 'Vizesiz Giriş',
    visaOnArrival: 'Varışta Vize',
    eta: 'e-Vize',
    visaRequired: 'Vize Gerekli',
    notRequired: 'Gerekli Değil',
    onArrival: 'Varışta',
    online: 'Online',
    embassy: 'Konsolosluk',
    loading: 'Vize gereklilikleri yükleniyor...',
    noResults: 'Ülke bulunamadı',
    stats: 'İstatistikler',
    totalCountries: 'Toplam Ülke',
  };

  useEffect(() => {
    fetchVisaRequirements();
  }, [sourceCountryCode]);

  useEffect(() => {
    filterRequirements();
  }, [searchQuery, statusFilter, requirements]);

  const fetchVisaRequirements = async () => {
    setLoading(true);
    try {
      // Fetch visa requirements
      const { data: visaData, error: visaError } = await supabase
        .from('visa_requirements')
        .select('country_code, visa_status, allowed_stay, application_method, conditions')
        .eq('source_country_code', sourceCountryCode);

      if (visaError) throw visaError;

      if (!visaData || visaData.length === 0) {
        setRequirements([]);
        setFilteredRequirements([]);
        return;
      }

      // Get country codes
      const countryCodes = visaData.map(v => v.country_code);

      // Fetch country details
      const { data: countriesData, error: countriesError } = await supabase
        .from('countries')
        .select('country_code, name, flag_emoji')
        .in('country_code', countryCodes);

      if (countriesError) throw countriesError;

      // Create country lookup map
      const countryMap = new Map(
        (countriesData || []).map(c => [c.country_code, c])
      );

      // Combine data
      const formattedData: VisaRequirement[] = visaData.map((item: any) => {
        const country = countryMap.get(item.country_code);
        return {
          country_code: item.country_code,
          country_name: country?.name || item.country_code,
          visa_status: item.visa_status,
          allowed_stay: item.allowed_stay,
          application_method: item.application_method,
          conditions: item.conditions,
          flag_emoji: country?.flag_emoji,
        };
      });

      // Sort by country name
      formattedData.sort((a, b) => a.country_name.localeCompare(b.country_name));

      setRequirements(formattedData);
      setFilteredRequirements(formattedData);
    } catch (error) {
      console.error('Error fetching visa requirements:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterRequirements = () => {
    let filtered = requirements;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(req =>
        req.country_name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(req => req.visa_status === statusFilter);
    }

    setFilteredRequirements(filtered);
  };

  const getVisaStatusBadge = (status: string) => {
    const badges = {
      'visa-free': {
        icon: CheckCircle,
        text: t.visaFree,
        className: 'bg-green-100 text-green-800 border-green-300',
      },
      'visa-on-arrival': {
        icon: Clock,
        text: t.visaOnArrival,
        className: 'bg-blue-100 text-blue-800 border-blue-300',
      },
      'eta': {
        icon: FileText,
        text: t.eta,
        className: 'bg-purple-100 text-purple-800 border-purple-300',
      },
      'visa-required': {
        icon: XCircle,
        text: t.visaRequired,
        className: 'bg-orange-100 text-orange-800 border-orange-300',
      },
    };

    const badge = badges[status as keyof typeof badges] || badges['visa-required'];
    const Icon = badge.icon;

    return (
      <span className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold ${badge.className}`}>
        <Icon className="h-3 w-3" />
        {badge.text}
      </span>
    );
  };

  const stats = {
    total: requirements.length,
    visaFree: requirements.filter(r => r.visa_status === 'visa-free').length,
    visaOnArrival: requirements.filter(r => r.visa_status === 'visa-on-arrival').length,
    eta: requirements.filter(r => r.visa_status === 'eta').length,
    visaRequired: requirements.filter(r => r.visa_status === 'visa-required').length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Globe className="mx-auto h-12 w-12 animate-spin text-primary" />
          <p className="mt-4 text-gray-600">{t.loading}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          <span className="text-4xl mr-2">{sourceCountryFlag}</span>
          {sourceCountryName} {t.title}
        </h1>
        <p className="text-gray-600">
          {t.subtitle} {requirements.length} {locale === 'en' ? 'countries' : 'ülke'}
        </p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          <div className="text-sm text-gray-600">{t.totalCountries}</div>
        </div>
        <div className="bg-green-50 rounded-lg border border-green-200 p-4 text-center">
          <div className="text-2xl font-bold text-green-800">{stats.visaFree}</div>
          <div className="text-sm text-green-700">{t.filterVisaFree}</div>
        </div>
        <div className="bg-blue-50 rounded-lg border border-blue-200 p-4 text-center">
          <div className="text-2xl font-bold text-blue-800">{stats.visaOnArrival}</div>
          <div className="text-sm text-blue-700">{t.filterVisaOnArrival}</div>
        </div>
        <div className="bg-purple-50 rounded-lg border border-purple-200 p-4 text-center">
          <div className="text-2xl font-bold text-purple-800">{stats.eta}</div>
          <div className="text-sm text-purple-700">{t.filterEta}</div>
        </div>
        <div className="bg-orange-50 rounded-lg border border-orange-200 p-4 text-center">
          <div className="text-2xl font-bold text-orange-800">{stats.visaRequired}</div>
          <div className="text-sm text-orange-700">{t.filterRequired}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder={t.search}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-gray-300 pl-10 pr-4 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === 'all'
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {t.filterAll}
            </button>
            <button
              onClick={() => setStatusFilter('visa-free')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === 'visa-free'
                  ? 'bg-green-600 text-white'
                  : 'bg-green-100 text-green-700 hover:bg-green-200'
              }`}
            >
              {t.filterVisaFree}
            </button>
            <button
              onClick={() => setStatusFilter('visa-on-arrival')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === 'visa-on-arrival'
                  ? 'bg-blue-600 text-white'
                  : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
              }`}
            >
              {t.filterVisaOnArrival}
            </button>
            <button
              onClick={() => setStatusFilter('eta')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === 'eta'
                  ? 'bg-purple-600 text-white'
                  : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
              }`}
            >
              {t.filterEta}
            </button>
            <button
              onClick={() => setStatusFilter('visa-required')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === 'visa-required'
                  ? 'bg-orange-600 text-white'
                  : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
              }`}
            >
              {t.filterRequired}
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  {t.country}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  {t.visaStatus}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  {t.allowedStay}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  {t.conditions}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {filteredRequirements.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center">
                    <Globe className="mx-auto h-12 w-12 text-gray-300" />
                    <p className="mt-2 text-sm text-gray-500">{t.noResults}</p>
                  </td>
                </tr>
              ) : (
                filteredRequirements.map((req) => (
                  <tr key={req.country_code} className="hover:bg-gray-50">
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{req.flag_emoji}</span>
                        <span className="font-medium text-gray-900">{req.country_name}</span>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      {getVisaStatusBadge(req.visa_status)}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">
                      {req.allowed_stay || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {req.conditions || '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Results count */}
      <div className="text-center text-sm text-gray-600">
        {locale === 'en' 
          ? `Showing ${filteredRequirements.length} of ${requirements.length} countries`
          : `${requirements.length} ülkeden ${filteredRequirements.length} tanesi gösteriliyor`
        }
      </div>
    </div>
  );
}
