"use client";

import { MapPin, Calendar, Heart, AlertCircle, Plane, FileText, Phone, CheckCircle2 } from "lucide-react";

interface ExtendedCountryInfoProps {
  country: any;
  locale: 'tr' | 'en';
}

export function ExtendedCountryInfo({ country, locale }: ExtendedCountryInfoProps) {
  const hasCountryInfo = country.capital || country.currency || country.language || country.timezone;
  const hasPopularCities = country.popular_cities && country.popular_cities.length > 0;
  const hasTravelTips = country.travel_tips && country.travel_tips.length > 0;
  const hasApplicationSteps = country.application_steps && country.application_steps.length > 0;
  // Check both new array format and old HTML format for backward compatibility
  const hasRequiredDocs = (country.required_documents && country.required_documents.length > 0) || country.req_document;
  const hasImportantNotes = country.important_notes && country.important_notes.length > 0;
  const hasEmergencyContacts = country.emergency_contacts && 
    (country.emergency_contacts.embassy || country.emergency_contacts.emergencyNumber || 
     country.emergency_contacts.police || country.emergency_contacts.ambulance);

  // Hiçbir extended field yoksa component'i gösterme
  if (!hasCountryInfo && !hasPopularCities && !hasTravelTips && !hasApplicationSteps && 
      !hasRequiredDocs && !hasImportantNotes && !hasEmergencyContacts && !country.best_time_to_visit && 
      !country.health_requirements && !country.customs_regulations && !country.why_kolay_seyahat) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Ülke Bilgileri */}
      {hasCountryInfo && (
        <section className="card">
          <div className="mb-4 flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-bold text-slate-900">
              {locale === 'en' ? 'Country Information' : 'Ülke Bilgileri'}
            </h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {country.capital && (
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <div className="text-sm font-semibold text-slate-600">
                  {locale === 'en' ? 'Capital' : 'Başkent'}
                </div>
                <div className="mt-1 text-lg font-bold text-slate-900">{country.capital}</div>
              </div>
            )}
            {country.currency && (
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <div className="text-sm font-semibold text-slate-600">
                  {locale === 'en' ? 'Currency' : 'Para Birimi'}
                </div>
                <div className="mt-1 text-lg font-bold text-slate-900">
                  {country.currency}
                </div>
              </div>
            )}
            {country.language && (
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <div className="text-sm font-semibold text-slate-600">
                  {locale === 'en' ? 'Language' : 'Resmi Dil'}
                </div>
                <div className="mt-1 text-lg font-bold text-slate-900">{country.language}</div>
              </div>
            )}
            {country.timezone && (
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <div className="text-sm font-semibold text-slate-600">
                  {locale === 'en' ? 'Timezone' : 'Saat Dilimi'}
                </div>
                <div className="mt-1 text-lg font-bold text-slate-900">{country.timezone}</div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Popüler Şehirler */}
      {hasPopularCities && (
        <section className="card">
          <div className="mb-4 flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-bold text-slate-900">
              {locale === 'en' ? 'Popular Cities' : 'Popüler Şehirler'}
            </h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {country.popular_cities.map((city: string, index: number) => (
              <span
                key={index}
                className="rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold text-primary"
              >
                {city}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* En İyi Ziyaret Zamanı */}
      {country.best_time_to_visit && (
        <section className="card">
          <div className="mb-4 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-bold text-slate-900">
              {locale === 'en' ? 'Best Time to Visit' : 'En İyi Ziyaret Zamanı'}
            </h2>
          </div>
          <p className="text-slate-700">{country.best_time_to_visit}</p>
        </section>
      )}

      {/* Seyahat İpuçları */}
      {hasTravelTips && (
        <section className="card">
          <div className="mb-4 flex items-center gap-2">
            <Plane className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-bold text-slate-900">
              {locale === 'en' ? 'Travel Tips' : 'Seyahat İpuçları'}
            </h2>
          </div>
          <ul className="space-y-2">
            {country.travel_tips.map((tip: string, index: number) => (
              <li key={index} className="flex items-start gap-2">
                <span className="mt-1 text-primary">•</span>
                <span className="flex-1 text-slate-700">{tip}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Başvuru Adımları */}
      {hasApplicationSteps && (
        <section className="card border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-blue-50">
          <div className="mb-4 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-bold text-slate-900">
              {locale === 'en' ? 'Application Steps' : 'Başvuru Adımları'}
            </h2>
          </div>
          <ol className="space-y-3">
            {country.application_steps.map((step: string, index: number) => (
              <li key={index} className="flex items-start gap-3">
                <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
                  {index + 1}
                </span>
                <span className="flex-1 pt-1 text-slate-700">{step}</span>
              </li>
            ))}
          </ol>
        </section>
      )}

      {/* Gerekli Belgeler - REMOVED: Already shown above in main content section */}

      {/* Önemli Notlar */}
      {hasImportantNotes && (
        <section className="card border-2 border-yellow-200 bg-yellow-50/50">
          <div className="mb-4 flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-yellow-600" />
            <h2 className="text-xl font-bold text-slate-900">
              {locale === 'en' ? 'Important Notes' : 'Önemli Notlar'}
            </h2>
          </div>
          <ul className="space-y-2">
            {country.important_notes.map((note: string, index: number) => (
              <li key={index} className="flex items-start gap-2">
                <span className="mt-1 text-yellow-600">⚠</span>
                <span className="flex-1 text-slate-700">{note}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Sağlık Gereksinimleri */}
      {country.health_requirements && (
        <section className="card">
          <div className="mb-4 flex items-center gap-2">
            <Heart className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-bold text-slate-900">
              {locale === 'en' ? 'Health Requirements' : 'Sağlık Gereksinimleri'}
            </h2>
          </div>
          <p className="text-slate-700 whitespace-pre-line">{country.health_requirements}</p>
        </section>
      )}

      {/* Gümrük Kuralları */}
      {country.customs_regulations && (
        <section className="card">
          <div className="mb-4 flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-bold text-slate-900">
              {locale === 'en' ? 'Customs Regulations' : 'Gümrük Kuralları'}
            </h2>
          </div>
          <p className="text-slate-700 whitespace-pre-line">{country.customs_regulations}</p>
        </section>
      )}

      {/* Acil Durum Bilgileri */}
      {hasEmergencyContacts && (
        <section className="card border-2 border-red-200 bg-red-50/50">
          <div className="mb-4 flex items-center gap-2">
            <Phone className="h-5 w-5 text-red-600" />
            <h2 className="text-xl font-bold text-slate-900">
              {locale === 'en' ? 'Emergency Contacts' : 'Acil Durum İletişim Bilgileri'}
            </h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {country.emergency_contacts.embassy && (
              <div className="rounded-lg border border-red-200 bg-white p-4">
                <div className="text-sm font-semibold text-red-600">
                  {locale === 'en' ? 'Turkish Embassy' : 'Türk Elçiliği/Konsolosluğu'}
                </div>
                <div className="mt-1 text-slate-900">{country.emergency_contacts.embassy}</div>
              </div>
            )}
            {country.emergency_contacts.emergencyNumber && (
              <div className="rounded-lg border border-red-200 bg-white p-4">
                <div className="text-sm font-semibold text-red-600">
                  {locale === 'en' ? 'Emergency Number' : 'Acil Durum'}
                </div>
                <div className="mt-1 text-lg font-bold text-slate-900">
                  {country.emergency_contacts.emergencyNumber}
                </div>
              </div>
            )}
            {country.emergency_contacts.police && (
              <div className="rounded-lg border border-red-200 bg-white p-4">
                <div className="text-sm font-semibold text-red-600">
                  {locale === 'en' ? 'Police' : 'Polis'}
                </div>
                <div className="mt-1 text-lg font-bold text-slate-900">
                  {country.emergency_contacts.police}
                </div>
              </div>
            )}
            {country.emergency_contacts.ambulance && (
              <div className="rounded-lg border border-red-200 bg-white p-4">
                <div className="text-sm font-semibold text-red-600">
                  {locale === 'en' ? 'Ambulance' : 'Ambulans'}
                </div>
                <div className="mt-1 text-lg font-bold text-slate-900">
                  {country.emergency_contacts.ambulance}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Neden Kolay Seyahat */}
      {country.why_kolay_seyahat && (
        <section className="card border-2 border-primary/20 bg-primary/5">
          <div className="mb-4 flex items-center gap-2">
            <Heart className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-bold text-slate-900">
              {locale === 'en' ? 'Why Kolay Seyahat?' : 'Neden Kolay Seyahat?'}
            </h2>
          </div>
          <p className="text-slate-700 whitespace-pre-line">{country.why_kolay_seyahat}</p>
        </section>
      )}
    </div>
  );
}
