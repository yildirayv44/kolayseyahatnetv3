import { Metadata } from 'next';
import { Breadcrumb } from '@/components/shared/Breadcrumb';
import { generateFAQSchema, generateBreadcrumbSchema } from '@/components/shared/SEOHead';
import { AskQuestionForm } from '@/components/country/AskQuestionForm';

interface BilateralVisaPageProps {
  data: any;
  locale: 'tr' | 'en';
}

export function BilateralVisaPage({ data, locale }: BilateralVisaPageProps) {
  const isEnglish = locale === 'en';
  const sourceCountry = data.source_country;
  const destinationCountry = data.destination_country;

  // Use custom content if enabled, otherwise use AI-generated content
  const content = data.use_custom_content && data.custom_content 
    ? data.custom_content 
    : {
        intro: data.intro_text,
        requirements: data.requirements_section,
        process: data.process_section
      };

  const breadcrumbItems = [
    { 
      label: isEnglish ? 'Home' : 'Ana Sayfa', 
      url: isEnglish ? '/en' : '/' 
    },
    { 
      label: isEnglish ? 'Visa Information' : 'Vize Bilgileri', 
      url: isEnglish ? '/en/visa' : '/vize' 
    },
    { 
      label: `${sourceCountry.name} - ${destinationCountry.name}`, 
      url: `/${data.slug}` 
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <Breadcrumb items={breadcrumbItems} />
        </div>
      </div>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center gap-8 mb-6">
            <div className="text-center">
              <div className="text-6xl mb-2">{sourceCountry.flag_emoji}</div>
              <h2 className="text-xl font-semibold">{sourceCountry.name}</h2>
            </div>
            <div className="text-4xl">→</div>
            <div className="text-center">
              <div className="text-6xl mb-2">{destinationCountry.flag_emoji}</div>
              <h2 className="text-xl font-semibold">{destinationCountry.name}</h2>
            </div>
          </div>
          <h1 className="text-4xl font-bold text-center mb-4">
            {data.h1_title}
          </h1>
          <p className="text-xl text-center text-blue-100 max-w-3xl mx-auto">
            {data.meta_description}
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Introduction */}
          <div className="bg-white rounded-lg shadow-md p-8 mb-8">
            <div 
              className="prose prose-lg max-w-none"
              dangerouslySetInnerHTML={{ 
                __html: typeof content === 'string' ? content : content.intro 
              }}
            />
          </div>

          {/* Requirements Section */}
          {(typeof content !== 'string' && content.requirements) && (
            <div className="bg-white rounded-lg shadow-md p-8 mb-8">
              <div 
                className="prose prose-lg max-w-none"
                dangerouslySetInnerHTML={{ __html: content.requirements }}
              />
            </div>
          )}

          {/* Process Section */}
          {(typeof content !== 'string' && content.process) && (
            <div className="bg-white rounded-lg shadow-md p-8 mb-8">
              <div 
                className="prose prose-lg max-w-none"
                dangerouslySetInnerHTML={{ __html: content.process }}
              />
            </div>
          )}

          {/* Important Notes */}
          {data.important_notes && (
            <div 
              className="mb-8"
              dangerouslySetInnerHTML={{ __html: data.important_notes }}
            />
          )}

          {/* Travel Tips */}
          {data.travel_tips && (
            <div className="bg-white rounded-lg shadow-md p-8 mb-8">
              <div 
                className="prose prose-lg max-w-none"
                dangerouslySetInnerHTML={{ __html: data.travel_tips }}
              />
            </div>
          )}

          {/* Health Requirements */}
          {data.health_requirements && (
            <div className="bg-white rounded-lg shadow-md p-8 mb-8">
              <div 
                className="prose prose-lg max-w-none"
                dangerouslySetInnerHTML={{ __html: data.health_requirements }}
              />
            </div>
          )}

          {/* Customs Rules */}
          {data.customs_rules && (
            <div className="bg-white rounded-lg shadow-md p-8 mb-8">
              <div 
                className="prose prose-lg max-w-none"
                dangerouslySetInnerHTML={{ __html: data.customs_rules }}
              />
            </div>
          )}

          {/* Why Kolay Seyahat */}
          {data.why_kolay_seyahat && (
            <div className="bg-white rounded-lg shadow-md p-8 mb-8">
              <div 
                className="prose prose-lg max-w-none"
                dangerouslySetInnerHTML={{ __html: data.why_kolay_seyahat }}
              />
            </div>
          )}

          {/* Popular Cities */}
          {(locale === 'en' ? data.popular_cities_en : data.popular_cities) && (
            <div className="bg-white rounded-lg shadow-md p-8 mb-8">
              <h2 className="text-2xl font-bold mb-6">
                🏙️ {isEnglish ? 'Popular Cities' : 'Popüler Şehirler'}
              </h2>
              <div 
                className="prose prose-lg max-w-none"
                dangerouslySetInnerHTML={{ 
                  __html: locale === 'en' ? data.popular_cities_en : data.popular_cities 
                }}
              />
            </div>
          )}

          {/* Best Time to Visit */}
          {(locale === 'en' ? data.best_time_to_visit_en : data.best_time_to_visit) && (
            <div className="bg-white rounded-lg shadow-md p-8 mb-8">
              <h2 className="text-2xl font-bold mb-6">
                📅 {isEnglish ? 'Best Time to Visit' : 'En İyi Ziyaret Zamanı'}
              </h2>
              <div 
                className="prose prose-lg max-w-none"
                dangerouslySetInnerHTML={{ 
                  __html: locale === 'en' ? data.best_time_to_visit_en : data.best_time_to_visit 
                }}
              />
            </div>
          )}

          {/* Application Steps */}
          {(locale === 'en' ? data.application_steps_en : data.application_steps) && (
            <div className="bg-white rounded-lg shadow-md p-8 mb-8">
              <h2 className="text-2xl font-bold mb-6">
                📋 {isEnglish ? 'Application Steps' : 'Başvuru Adımları'}
              </h2>
              <div 
                className="prose prose-lg max-w-none"
                dangerouslySetInnerHTML={{ 
                  __html: locale === 'en' ? data.application_steps_en : data.application_steps 
                }}
              />
            </div>
          )}

          {/* Country Info & Emergency */}
          {data.country_info && (
            <div className="bg-white rounded-lg shadow-md p-8 mb-8">
              <h2 className="text-2xl font-bold mb-6">
                🌍 {isEnglish ? 'Country Information & Emergency' : 'Ülke Bilgileri & Acil Durum'}
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <p className="mb-2"><strong>{isEnglish ? 'Capital' : 'Başkent'}:</strong> {data.country_info.capital}</p>
                  <p className="mb-2"><strong>{isEnglish ? 'Official Language' : 'Resmi Dil'}:</strong> {data.country_info.language}</p>
                  <p className="mb-2"><strong>{isEnglish ? 'Currency' : 'Para Birimi'}:</strong> {data.country_info.currency}</p>
                  <p className="mb-2"><strong>{isEnglish ? 'Timezone' : 'Saat Dilimi'}:</strong> {data.country_info.timezone}</p>
                </div>
                <div className="bg-red-50 p-4 rounded-lg">
                  <h3 className="font-bold text-red-800 mb-3">🚨 {isEnglish ? 'Emergency Numbers' : 'Acil Durum İletişim Bilgileri'}</h3>
                  <p className="mb-1"><strong>{isEnglish ? 'Police' : 'Polis'}:</strong> {data.country_info.emergency_numbers.police}</p>
                  <p className="mb-1"><strong>{isEnglish ? 'Ambulance' : 'Ambulans'}:</strong> {data.country_info.emergency_numbers.ambulance}</p>
                  <p className="mb-1"><strong>{isEnglish ? 'Fire Department' : 'İtfaiye'}:</strong> {data.country_info.emergency_numbers.fire}</p>
                </div>
              </div>
            </div>
          )}

          {/* FAQ Section */}
          {data.faq_json && data.faq_json.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-8 mb-8">
              <h2 className="text-2xl font-bold mb-6">
                {isEnglish ? 'Frequently Asked Questions' : 'Sık Sorulan Sorular'}
              </h2>
              <div className="space-y-6">
                {data.faq_json.map((faq: any, index: number) => (
                  <div key={index} className="border-b pb-6 last:border-b-0">
                    <h3 className="text-lg font-semibold mb-2 text-gray-900">
                      {faq.question}
                    </h3>
                    <p className="text-gray-700">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Ask Question Form */}
          <div className="bg-white rounded-lg shadow-md p-8 mb-8">
            <h2 className="text-2xl font-bold mb-6">
              {isEnglish ? `${destinationCountry.name} Visa Questions` : `${destinationCountry.name} Vizesi Hakkında Soru Sor`}
            </h2>
            <p className="text-gray-600 mb-6">
              {isEnglish 
                ? 'Our expert consultants will answer your questions shortly.'
                : 'Uzman danışmanlarımız sorularınızı kısa sürede yanıtlayacak.'}
            </p>
            <AskQuestionForm 
              countryId={0}
              countryName={destinationCountry.name}
              locale={locale}
            />
          </div>

          {/* CTA Section */}
          <div className="bg-blue-600 text-white rounded-lg shadow-md p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">
              {isEnglish 
                ? 'Need Help with Your Visa Application?' 
                : 'Vize Başvurunuzda Yardıma mı İhtiyacınız Var?'}
            </h2>
            <p className="text-lg mb-6">
              {isEnglish
                ? 'Our expert team is ready to assist you with your visa application process.'
                : 'Uzman ekibimiz vize başvuru sürecinizde size yardımcı olmaya hazır.'}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="tel:02129099971"
                className="inline-flex items-center justify-center gap-2 bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
              >
                📞 0212 909 99 71 {isEnglish ? 'Call' : 'Ara'}
              </a>
              <a
                href={isEnglish ? '/en/vize-basvuru-formu-std' : '/vize-basvuru-formu-std'}
                className="inline-flex items-center justify-center gap-2 bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
              >
                {isEnglish ? 'Apply Online' : 'Online Başvuru Yap'}
              </a>
            </div>
          </div>

          {/* Structured Data */}
          {data.faq_json && data.faq_json.length > 0 && (
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{
                __html: JSON.stringify(generateFAQSchema(data.faq_json))
              }}
            />
          )}
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(generateBreadcrumbSchema(
                breadcrumbItems.map(item => ({ name: item.label, url: item.url }))
              ))
            }}
          />
        </div>
      </div>
    </div>
  );
}
