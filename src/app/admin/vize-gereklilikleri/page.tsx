"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { 
  Download, 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Globe,
  Search,
  Filter,
  ArrowUpDown
} from "lucide-react";

interface VisaRequirement {
  id: number;
  country_code: string;
  country_name: string;
  visa_status: string;
  allowed_stay: string | null;
  conditions: string | null;
  visa_cost: string | null;
  processing_time: string | null;
  application_method: string | null;
  last_updated: string;
}

const VISA_STATUS_COLORS = {
  'visa-free': 'bg-green-100 text-green-800 border-green-300',
  'visa-on-arrival': 'bg-blue-100 text-blue-800 border-blue-300',
  'eta': 'bg-cyan-100 text-cyan-800 border-cyan-300',
  'evisa': 'bg-purple-100 text-purple-800 border-purple-300',
  'visa-required': 'bg-orange-100 text-orange-800 border-orange-300',
  'no-admission': 'bg-red-100 text-red-800 border-red-300',
};

const VISA_STATUS_LABELS = {
  'visa-free': '✅ Vizesiz',
  'visa-on-arrival': '🛬 Varışta Vize',
  'eta': '📧 ETA',
  'evisa': '💻 E-Vize',
  'visa-required': '🏛️ Vize Gerekli',
  'no-admission': '🚫 Giriş Yok',
};

export default function VisaRequirementsPage() {
  const [requirements, setRequirements] = useState<VisaRequirement[]>([]);
  const [filteredRequirements, setFilteredRequirements] = useState<VisaRequirement[]>([]);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const [tableExists, setTableExists] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [stats, setStats] = useState({
    total: 0,
    visaFree: 0,
    visaOnArrival: 0,
    eta: 0,
    evisa: 0,
    visaRequired: 0,
  });

  useEffect(() => {
    fetchRequirements();
    fetchStats();
  }, []);

  useEffect(() => {
    filterRequirements();
  }, [requirements, searchQuery, filterStatus]);

  const fetchRequirements = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('visa_requirements')
        .select('*')
        .order('country_name', { ascending: true });

      if (error) {
        if (error.message.includes('does not exist') || error.message.includes('schema cache')) {
          setTableExists(false);
          setRequirements([]);
        } else {
          throw error;
        }
      } else {
        setTableExists(true);
        setRequirements(data || []);
      }
    } catch (error: any) {
      console.error('Error fetching requirements:', error);
      if (!error.message.includes('does not exist') && !error.message.includes('schema cache')) {
        alert('Veri yüklenirken hata oluştu: ' + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/visa-requirements/import');
      const data = await response.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const filterRequirements = () => {
    let filtered = requirements;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(req =>
        req.country_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        req.country_code.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(req => req.visa_status === filterStatus);
    }

    setFilteredRequirements(filtered);
  };

  const handleImport = async () => {
    if (!confirm('PassportIndex verilerini içe aktarmak istediğinizden emin misiniz? Mevcut veriler güncellenecek.')) {
      return;
    }

    setImporting(true);
    try {
      const response = await fetch('/api/admin/visa-requirements/import', {
        method: 'POST',
      });
      const data = await response.json();

      if (data.success) {
        alert(`✅ İçe aktarma başarılı!\n\nYeni: ${data.stats.imported}\nGüncellenen: ${data.stats.updated}\nHata: ${data.stats.errors}`);
        fetchRequirements();
        fetchStats();
      } else {
        alert('❌ İçe aktarma başarısız: ' + data.error);
      }
    } catch (error: any) {
      console.error('Import error:', error);
      alert('İçe aktarma sırasında hata oluştu: ' + error.message);
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Migration Warning */}
      {!tableExists && (
        <div className="rounded-lg border-2 border-red-200 bg-red-50 p-6">
          <div className="flex items-start gap-4">
            <XCircle className="h-6 w-6 flex-shrink-0 text-red-600" />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-red-900">Tablo Bulunamadı</h3>
              <p className="mt-2 text-sm text-red-700">
                <code>visa_requirements</code> tablosu henüz oluşturulmamış. Devam etmek için migration'ı çalıştırmanız gerekiyor.
              </p>
              <div className="mt-4 space-y-2">
                <p className="text-sm font-semibold text-red-900">Adımlar:</p>
                <ol className="ml-4 list-decimal space-y-1 text-sm text-red-700">
                  <li>Supabase Dashboard'a gidin → SQL Editor</li>
                  <li>
                    <code className="rounded bg-red-100 px-2 py-1 text-xs">
                      /supabase/migrations/create_visa_requirements_table.sql
                    </code> dosyasını açın
                  </li>
                  <li>SQL kodunu kopyalayıp SQL Editor'da çalıştırın</li>
                  <li>
                    <code className="rounded bg-red-100 px-2 py-1 text-xs">
                      /supabase/migrations/add_country_code_and_visa_link.sql
                    </code> dosyasını da çalıştırın
                  </li>
                  <li>Bu sayfayı yenileyin</li>
                </ol>
              </div>
              <div className="mt-4">
                <button
                  onClick={() => window.location.reload()}
                  className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
                >
                  <RefreshCw className="h-4 w-4" />
                  Sayfayı Yenile
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Vize Gereklilikleri</h1>
          <p className="mt-1 text-sm text-gray-500">
            Türkiye vatandaşları için ülkelere göre vize gereklilikleri (PassportIndex)
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={fetchRequirements}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm ring-1 ring-gray-300 hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Yenile
          </button>
          <button
            onClick={handleImport}
            disabled={importing}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary/90 disabled:opacity-50"
          >
            <Download className={`h-4 w-4 ${importing ? 'animate-bounce' : ''}`} />
            {importing ? 'İçe Aktarılıyor...' : 'PassportIndex\'ten İçe Aktar'}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-6">
        <div className="rounded-lg bg-white p-4 shadow-sm ring-1 ring-gray-200">
          <div className="text-sm font-medium text-gray-500">Toplam</div>
          <div className="mt-1 text-2xl font-bold text-gray-900">{stats.total}</div>
        </div>
        <div className="rounded-lg bg-green-50 p-4 shadow-sm ring-1 ring-green-200">
          <div className="text-sm font-medium text-green-700">Vizesiz</div>
          <div className="mt-1 text-2xl font-bold text-green-900">{stats.visaFree}</div>
        </div>
        <div className="rounded-lg bg-blue-50 p-4 shadow-sm ring-1 ring-blue-200">
          <div className="text-sm font-medium text-blue-700">Varışta</div>
          <div className="mt-1 text-2xl font-bold text-blue-900">{stats.visaOnArrival}</div>
        </div>
        <div className="rounded-lg bg-cyan-50 p-4 shadow-sm ring-1 ring-cyan-200">
          <div className="text-sm font-medium text-cyan-700">ETA</div>
          <div className="mt-1 text-2xl font-bold text-cyan-900">{stats.eta}</div>
        </div>
        <div className="rounded-lg bg-purple-50 p-4 shadow-sm ring-1 ring-purple-200">
          <div className="text-sm font-medium text-purple-700">E-Vize</div>
          <div className="mt-1 text-2xl font-bold text-purple-900">{stats.evisa}</div>
        </div>
        <div className="rounded-lg bg-orange-50 p-4 shadow-sm ring-1 ring-orange-200">
          <div className="text-sm font-medium text-orange-700">Vize Gerekli</div>
          <div className="mt-1 text-2xl font-bold text-orange-900">{stats.visaRequired}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Ülke adı veya kodu ara..."
              className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="rounded-lg border border-gray-300 px-4 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          <option value="all">Tüm Durumlar</option>
          <option value="visa-free">Vizesiz</option>
          <option value="visa-on-arrival">Varışta Vize</option>
          <option value="eta">ETA</option>
          <option value="evisa">E-Vize</option>
          <option value="visa-required">Vize Gerekli</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-lg bg-white shadow-sm ring-1 ring-gray-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Ülke
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Durum
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Kalış Süresi
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Ücret
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  İşlem Süresi
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Başvuru
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <RefreshCw className="mx-auto h-8 w-8 animate-spin text-gray-400" />
                    <p className="mt-2 text-sm text-gray-500">Yükleniyor...</p>
                  </td>
                </tr>
              ) : filteredRequirements.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <Globe className="mx-auto h-12 w-12 text-gray-300" />
                    <p className="mt-2 text-sm text-gray-500">
                      {searchQuery || filterStatus !== 'all' 
                        ? 'Sonuç bulunamadı' 
                        : 'Henüz veri yok. "İçe Aktar" butonuna tıklayın.'}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredRequirements.map((req) => (
                  <tr key={req.id} className="hover:bg-gray-50">
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-sm font-semibold text-gray-700">
                          {req.country_code}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{req.country_name}</div>
                          <div className="text-xs text-gray-500">{req.country_code}</div>
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${VISA_STATUS_COLORS[req.visa_status as keyof typeof VISA_STATUS_COLORS]}`}>
                        {VISA_STATUS_LABELS[req.visa_status as keyof typeof VISA_STATUS_LABELS]}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {req.allowed_stay || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {req.visa_cost || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {req.processing_time || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {req.application_method === 'not-required' && '✅ Gerekli değil'}
                      {req.application_method === 'online' && '💻 Online'}
                      {req.application_method === 'embassy' && '🏛️ Elçilik'}
                      {req.application_method === 'on-arrival' && '🛬 Varışta'}
                      {!req.application_method && '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer Info */}
      <div className="rounded-lg bg-blue-50 p-4 text-sm text-blue-700">
        <strong>ℹ️ Not:</strong> Bu veriler PassportIndex'e dayanmaktadır ve bilgilendirme amaçlıdır. 
        Seyahat öncesi mutlaka ilgili ülkenin resmi kaynaklarından güncel bilgileri kontrol edin.
      </div>
    </div>
  );
}
