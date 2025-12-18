"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Edit, Trash2, Eye, Sparkles, Search, Filter, RefreshCw, Languages, Loader2, CheckSquare, Square } from "lucide-react";

interface Country {
  id: number;
  name: string;
  title: string;
  title_en?: string;
  contents_en?: string;
  status: number;
  country_code: string | null;
  slug: string;
}

interface VisaRequirement {
  countryCode: string;
  visaStatus: string;
}

export function CountriesListWithFilters({ initialCountries }: { initialCountries: Country[] }) {
  const [countries, setCountries] = useState<Country[]>(initialCountries);
  const [filteredCountries, setFilteredCountries] = useState<Country[]>(initialCountries);
  const [visaData, setVisaData] = useState<Record<string, VisaRequirement>>({});
  const [loading, setLoading] = useState(false);
  const [translating, setTranslating] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  
  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [visaStatusFilter, setVisaStatusFilter] = useState<"all" | "visa-free" | "visa-on-arrival" | "eta" | "visa-required">("all");
  const [codeFilter, setCodeFilter] = useState<"all" | "with-code" | "without-code">("all");
  const [enFilter, setEnFilter] = useState<"all" | "missing-en">("all");

  // Load visa requirements
  useEffect(() => {
    fetch('/api/admin/visa-requirements/fetch-passportindex')
      .then(res => res.json())
      .then(data => {
        const visaMap: Record<string, VisaRequirement> = {};
        data.data?.forEach((v: any) => {
          visaMap[v.countryCode] = {
            countryCode: v.countryCode,
            visaStatus: v.visaStatus
          };
        });
        setVisaData(visaMap);
      })
      .catch(console.error);
  }, []);

  // Apply filters
  useEffect(() => {
    let filtered = [...countries];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(c => 
        c.name.toLowerCase().includes(query) ||
        c.title?.toLowerCase().includes(query) ||
        c.country_code?.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(c => 
        statusFilter === "active" ? c.status === 1 : c.status !== 1
      );
    }

    // Country code filter
    if (codeFilter !== "all") {
      filtered = filtered.filter(c => 
        codeFilter === "with-code" ? c.country_code : !c.country_code
      );
    }

    // Visa status filter
    if (visaStatusFilter !== "all") {
      filtered = filtered.filter(c => {
        if (!c.country_code) return false;
        const visa = visaData[c.country_code];
        return visa?.visaStatus === visaStatusFilter;
      });
    }

    // English content filter
    if (enFilter === "missing-en") {
      filtered = filtered.filter(c => !c.title_en || !c.contents_en);
    }

    setFilteredCountries(filtered);
  }, [searchQuery, statusFilter, codeFilter, visaStatusFilter, enFilter, countries, visaData]);

  // Toggle selection
  const toggleSelect = (id: number) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  // Select all filtered
  const selectAll = () => {
    if (selectedIds.size === filteredCountries.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredCountries.map(c => c.id)));
    }
  };

  // Translate selected countries
  const translateSelected = async () => {
    if (selectedIds.size === 0) {
      alert("Lütfen çevirmek istediğiniz ülkeleri seçin!");
      return;
    }

    if (!confirm(`${selectedIds.size} ülke İngilizce'ye çevrilecek. Devam etmek istiyor musunuz?`)) {
      return;
    }

    setTranslating(true);
    let successCount = 0;
    let errorCount = 0;

    for (const id of selectedIds) {
      try {
        const response = await fetch('/api/admin/seo/translate-missing', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'country', id }),
        });
        const data = await response.json();
        if (data.success) {
          successCount++;
        } else {
          errorCount++;
        }
      } catch {
        errorCount++;
      }
    }

    // Also translate extended fields
    try {
      await fetch('/api/admin/seo/translate-json-fields', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ limit: selectedIds.size }),
      });
    } catch {}

    setTranslating(false);
    setSelectedIds(new Set());
    alert(`✅ ${successCount} ülke başarıyla çevrildi${errorCount > 0 ? `, ${errorCount} hata oluştu` : ''}!\n\nSayfayı yenileyerek sonuçları görebilirsiniz.`);
    
    // Refresh page to show updated data
    window.location.reload();
  };

  const getVisaStatusBadge = (countryCode: string | null) => {
    if (!countryCode) {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600">
          Kod Yok
        </span>
      );
    }

    const visa = visaData[countryCode];
    if (!visa) {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600">
          Yükleniyor...
        </span>
      );
    }

    const statusConfig: Record<string, { label: string; className: string }> = {
      'visa-free': { label: '✅ Vizesiz', className: 'bg-green-100 text-green-700' },
      'visa-on-arrival': { label: '🛬 Varışta', className: 'bg-blue-100 text-blue-700' },
      'eta': { label: '📧 eTA', className: 'bg-cyan-100 text-cyan-700' },
      'visa-required': { label: '🏛️ Vize Gerekli', className: 'bg-orange-100 text-orange-700' },
    };

    const config = statusConfig[visa.visaStatus] || { label: visa.visaStatus, className: 'bg-slate-100 text-slate-600' };

    return (
      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold ${config.className}`}>
        {config.label}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Ülkeler</h2>
          <p className="text-sm text-slate-600">
            {filteredCountries.length} / {countries.length} ülke gösteriliyor
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/admin/ulkeler/toplu-ceviri"
            className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-600 px-4 py-2 text-sm font-semibold text-white shadow-lg transition-all hover:from-blue-700 hover:to-cyan-700"
          >
            <Languages className="h-4 w-4" />
            Toplu Çeviri
          </Link>
          <Link
            href="/admin/ulkeler/toplu-kod-ata"
            className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-lg transition-all hover:from-green-700 hover:to-emerald-700"
          >
            <RefreshCw className="h-4 w-4" />
            Toplu Kod Ata
          </Link>
          <Link
            href="/admin/ulkeler/toplu-ekle"
            className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-lg transition-all hover:from-purple-700 hover:to-blue-700"
          >
            <Sparkles className="h-4 w-4" />
            AI ile Toplu Ekle
          </Link>
          <Link
            href="/admin/ulkeler/yeni"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-lg transition-all hover:bg-primary-dark"
          >
            <Plus className="h-4 w-4" />
            Yeni Ülke Ekle
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="card space-y-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
          <Filter className="h-4 w-4" />
          Filtreler
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Ülke adı, başlık veya kod..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-slate-200 py-2 pl-10 pr-4 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="all">Tüm Durumlar</option>
            <option value="active">Aktif</option>
            <option value="inactive">Pasif</option>
          </select>

          {/* Code Filter */}
          <select
            value={codeFilter}
            onChange={(e) => setCodeFilter(e.target.value as any)}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="all">Tüm Kodlar</option>
            <option value="with-code">Kod Var</option>
            <option value="without-code">Kod Yok</option>
          </select>

          {/* Visa Status Filter */}
          <select
            value={visaStatusFilter}
            onChange={(e) => setVisaStatusFilter(e.target.value as any)}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="all">Tüm Vize Durumları</option>
            <option value="visa-free">✅ Vizesiz</option>
            <option value="visa-on-arrival">🛬 Varışta Vize</option>
            <option value="eta">📧 eTA</option>
            <option value="visa-required">🏛️ Vize Gerekli</option>
          </select>

          {/* English Content Filter */}
          <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm hover:bg-slate-50">
            <input
              type="checkbox"
              checked={enFilter === "missing-en"}
              onChange={(e) => setEnFilter(e.target.checked ? "missing-en" : "all")}
              className="rounded border-slate-300 text-primary focus:ring-primary"
            />
            <Languages className="h-4 w-4 text-orange-500" />
            <span className="text-slate-700">İngilizce Eksik</span>
          </label>
        </div>

        {/* Active Filters Summary */}
        {(searchQuery || statusFilter !== "all" || codeFilter !== "all" || visaStatusFilter !== "all" || enFilter !== "all") && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-600">Aktif filtreler:</span>
            {searchQuery && (
              <span className="rounded-full bg-primary/10 px-2 py-1 text-xs text-primary">
                Arama: "{searchQuery}"
              </span>
            )}
            {statusFilter !== "all" && (
              <span className="rounded-full bg-primary/10 px-2 py-1 text-xs text-primary">
                Durum: {statusFilter === "active" ? "Aktif" : "Pasif"}
              </span>
            )}
            {codeFilter !== "all" && (
              <span className="rounded-full bg-primary/10 px-2 py-1 text-xs text-primary">
                Kod: {codeFilter === "with-code" ? "Var" : "Yok"}
              </span>
            )}
            {visaStatusFilter !== "all" && (
              <span className="rounded-full bg-primary/10 px-2 py-1 text-xs text-primary">
                Vize: {visaStatusFilter}
              </span>
            )}
            {enFilter !== "all" && (
              <span className="rounded-full bg-orange-100 px-2 py-1 text-xs text-orange-700">
                🌍 İngilizce Eksik
              </span>
            )}
            <button
              onClick={() => {
                setSearchQuery("");
                setStatusFilter("all");
                setCodeFilter("all");
                setVisaStatusFilter("all");
                setEnFilter("all");
              }}
              className="text-xs text-slate-600 hover:text-slate-900"
            >
              Temizle
            </button>
          </div>
        )}
      </div>

      {/* Bulk Actions */}
      {selectedIds.size > 0 && (
        <div className="card flex items-center justify-between bg-blue-50 border-blue-200">
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-blue-900">
              {selectedIds.size} ülke seçildi
            </span>
            <button
              onClick={() => setSelectedIds(new Set())}
              className="text-xs text-blue-600 hover:text-blue-800"
            >
              Seçimi Temizle
            </button>
          </div>
          <button
            onClick={translateSelected}
            disabled={translating}
            className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 px-4 py-2 text-sm font-semibold text-white hover:from-purple-700 hover:to-blue-700 disabled:opacity-50"
          >
            {translating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Çevriliyor...
              </>
            ) : (
              <>
                <Languages className="h-4 w-4" />
                Seçilenleri İngilizce'ye Çevir
              </>
            )}
          </button>
        </div>
      )}

      {/* Countries Table */}
      <div className="card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr className="border-b border-slate-200 text-left text-sm text-slate-600">
                <th className="px-4 py-4">
                  <button
                    onClick={selectAll}
                    className="flex items-center justify-center text-slate-600 hover:text-primary"
                    title={selectedIds.size === filteredCountries.length ? "Tümünü Kaldır" : "Tümünü Seç"}
                  >
                    {selectedIds.size === filteredCountries.length && filteredCountries.length > 0 ? (
                      <CheckSquare className="h-5 w-5 text-primary" />
                    ) : (
                      <Square className="h-5 w-5" />
                    )}
                  </button>
                </th>
                <th className="px-4 py-4 font-semibold">ID</th>
                <th className="px-4 py-4 font-semibold">Ülke Adı</th>
                <th className="px-4 py-4 font-semibold">Kod</th>
                <th className="px-4 py-4 font-semibold">Vize Durumu</th>
                <th className="px-4 py-4 font-semibold">EN</th>
                <th className="px-4 py-4 font-semibold">Durum</th>
                <th className="px-4 py-4 font-semibold text-right">İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {filteredCountries.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-sm text-slate-500">
                    Filtrelerinize uygun ülke bulunamadı
                  </td>
                </tr>
              ) : (
                filteredCountries.map((country) => (
                  <tr key={country.id} className={`border-b border-slate-100 hover:bg-slate-50 ${selectedIds.has(country.id) ? 'bg-blue-50' : ''}`}>
                    <td className="px-4 py-4">
                      <button
                        onClick={() => toggleSelect(country.id)}
                        className="flex items-center justify-center text-slate-600 hover:text-primary"
                      >
                        {selectedIds.has(country.id) ? (
                          <CheckSquare className="h-5 w-5 text-primary" />
                        ) : (
                          <Square className="h-5 w-5" />
                        )}
                      </button>
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-600">{country.id}</td>
                    <td className="px-4 py-4 text-sm font-medium text-slate-900">{country.name}</td>
                    <td className="px-4 py-4">
                      {country.country_code ? (
                        <span className="font-mono text-xs font-semibold text-slate-700">
                          {country.country_code}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-4">{getVisaStatusBadge(country.country_code)}</td>
                    <td className="px-4 py-4">
                      {country.title_en && country.contents_en ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-700">
                          ✓ Var
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-2 py-1 text-xs font-semibold text-orange-700">
                          ✗ Eksik
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                          country.status === 1
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {country.status === 1 ? "Aktif" : "Pasif"}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/${country.slug}`}
                          target="_blank"
                          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"
                          title="Görüntüle"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        <Link
                          href={`/admin/ulkeler/${country.id}/duzenle`}
                          className="rounded-lg p-2 text-blue-600 hover:bg-blue-50"
                          title="Düzenle"
                        >
                          <Edit className="h-4 w-4" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
