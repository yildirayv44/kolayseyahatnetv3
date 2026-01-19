"use client";

import { FileText, Shield, Clock, CheckCircle, Globe2, Sparkles, AlertCircle } from "lucide-react";

interface Props {
  locale: "tr" | "en";
}

export function VizePetitionSEOContent({ locale }: Props) {
  return (
    <section className="border-t border-slate-200 bg-gradient-to-b from-slate-50 to-white py-16">
      <div className="mx-auto max-w-6xl px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-900 md:text-4xl">
            {locale === "en" ? "About Visa Cover Letters" : "Vize Dilekçesi Hakkında"}
          </h2>
          <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">
            {locale === "en" 
              ? "Everything you need to know about cover letters for visa applications"
              : "Vize başvuruları için dilekçe hakkında bilmeniz gereken her şey"}
          </p>
        </div>

        {locale === "en" ? (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">What is a Visa Cover Letter?</h3>
              <p className="mt-2 text-sm text-slate-600">
                A visa cover letter (or personal statement) is a formal document that introduces yourself to the visa officer, 
                explains your travel purpose, and demonstrates your intent to return to your home country.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                <Clock className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Why is it Important?</h3>
              <ul className="mt-2 space-y-2 text-sm text-slate-600">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                  <span>Creates a positive first impression</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                  <span>Explains your travel intentions clearly</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                  <span>Shows strong ties to home country</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                  <span>Increases approval chances</span>
                </li>
              </ul>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-purple-100">
                <Shield className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">What Should It Include?</h3>
              <ul className="mt-2 space-y-2 text-sm text-slate-600">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-purple-500 mt-0.5 shrink-0" />
                  <span>Personal and passport information</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-purple-500 mt-0.5 shrink-0" />
                  <span>Travel dates and itinerary</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-purple-500 mt-0.5 shrink-0" />
                  <span>Purpose of visit</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-purple-500 mt-0.5 shrink-0" />
                  <span>Employment and financial details</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-purple-500 mt-0.5 shrink-0" />
                  <span>Accommodation information</span>
                </li>
              </ul>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-orange-100">
                <Globe2 className="h-6 w-6 text-orange-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Countries That Require It</h3>
              <p className="mt-2 text-sm text-slate-600">
                Most Schengen countries, UK, USA, Canada, Australia, and many others require or strongly recommend 
                a cover letter with visa applications. It's especially important for tourist and business visas.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-cyan-100">
                <Sparkles className="h-6 w-6 text-cyan-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Why Use Our Tool?</h3>
              <ul className="mt-2 space-y-2 text-sm text-slate-600">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-cyan-500 mt-0.5 shrink-0" />
                  <span>AI-powered professional formatting</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-cyan-500 mt-0.5 shrink-0" />
                  <span>Multiple language support</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-cyan-500 mt-0.5 shrink-0" />
                  <span>Country-specific templates</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-cyan-500 mt-0.5 shrink-0" />
                  <span>Instant download and copy</span>
                </li>
              </ul>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Important Tips</h3>
              <ul className="mt-2 space-y-2 text-sm text-slate-600">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                  <span>Be honest and accurate</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                  <span>Keep it concise (1-2 pages)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                  <span>Sign the letter</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                  <span>Match info with other documents</span>
                </li>
              </ul>
            </div>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Vize Dilekçesi Nedir?</h3>
              <p className="mt-2 text-sm text-slate-600">
                Vize dilekçesi (veya niyet mektubu), kendinizi vize memuruna tanıtan, seyahat amacınızı açıklayan 
                ve ülkenize geri dönme niyetinizi gösteren resmi bir belgedir.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                <Clock className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Neden Önemlidir?</h3>
              <ul className="mt-2 space-y-2 text-sm text-slate-600">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                  <span>Olumlu ilk izlenim yaratır</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                  <span>Seyahat niyetinizi açıkça belirtir</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                  <span>Ülkenize güçlü bağlarınızı gösterir</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                  <span>Onay şansınızı artırır</span>
                </li>
              </ul>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-purple-100">
                <Shield className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Neler İçermelidir?</h3>
              <ul className="mt-2 space-y-2 text-sm text-slate-600">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-purple-500 mt-0.5 shrink-0" />
                  <span>Kişisel ve pasaport bilgileri</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-purple-500 mt-0.5 shrink-0" />
                  <span>Seyahat tarihleri ve planı</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-purple-500 mt-0.5 shrink-0" />
                  <span>Ziyaret amacı</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-purple-500 mt-0.5 shrink-0" />
                  <span>Çalışma ve mali durum</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-purple-500 mt-0.5 shrink-0" />
                  <span>Konaklama bilgileri</span>
                </li>
              </ul>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-orange-100">
                <Globe2 className="h-6 w-6 text-orange-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Hangi Ülkeler İster?</h3>
              <p className="mt-2 text-sm text-slate-600">
                Schengen ülkeleri, İngiltere, ABD, Kanada, Avustralya ve daha birçok ülke vize başvurularında 
                dilekçe talep eder veya şiddetle tavsiye eder. Özellikle turist ve iş vizeleri için önemlidir.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-cyan-100">
                <Sparkles className="h-6 w-6 text-cyan-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Neden Aracımızı Kullanmalısınız?</h3>
              <ul className="mt-2 space-y-2 text-sm text-slate-600">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-cyan-500 mt-0.5 shrink-0" />
                  <span>AI destekli profesyonel format</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-cyan-500 mt-0.5 shrink-0" />
                  <span>Çoklu dil desteği</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-cyan-500 mt-0.5 shrink-0" />
                  <span>Ülkeye özel şablonlar</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-cyan-500 mt-0.5 shrink-0" />
                  <span>Anında indirme ve kopyalama</span>
                </li>
              </ul>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Önemli İpuçları</h3>
              <ul className="mt-2 space-y-2 text-sm text-slate-600">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                  <span>Dürüst ve doğru bilgi verin</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                  <span>Kısa ve öz tutun (1-2 sayfa)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                  <span>Dilekçeyi imzalayın</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                  <span>Diğer belgelerle tutarlı olun</span>
                </li>
              </ul>
            </div>
          </div>
        )}

        {/* FAQ Section */}
        <div className="mt-16">
          <h3 className="text-2xl font-bold text-slate-900 text-center mb-8">
            {locale === "en" ? "Frequently Asked Questions" : "Sıkça Sorulan Sorular"}
          </h3>
          <div className="grid gap-4 md:grid-cols-2">
            {locale === "en" ? (
              <>
                <div className="rounded-lg border border-slate-200 bg-white p-5">
                  <h4 className="font-semibold text-slate-900">Is a cover letter mandatory?</h4>
                  <p className="mt-2 text-sm text-slate-600">
                    While not always mandatory, a well-written cover letter significantly increases your chances of visa approval. 
                    Many embassies strongly recommend including one.
                  </p>
                </div>
                <div className="rounded-lg border border-slate-200 bg-white p-5">
                  <h4 className="font-semibold text-slate-900">How long should it be?</h4>
                  <p className="mt-2 text-sm text-slate-600">
                    Keep your cover letter concise - ideally 1 page, maximum 2 pages. Focus on the most important information 
                    and avoid unnecessary details.
                  </p>
                </div>
                <div className="rounded-lg border border-slate-200 bg-white p-5">
                  <h4 className="font-semibold text-slate-900">What language should I use?</h4>
                  <p className="mt-2 text-sm text-slate-600">
                    Write in the official language of the destination country or in English. Our tool supports 8 different languages 
                    to help you create the perfect letter.
                  </p>
                </div>
                <div className="rounded-lg border border-slate-200 bg-white p-5">
                  <h4 className="font-semibold text-slate-900">Should I sign the letter?</h4>
                  <p className="mt-2 text-sm text-slate-600">
                    Yes, always sign your cover letter by hand after printing. This adds authenticity and shows that you personally 
                    prepared the document.
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="rounded-lg border border-slate-200 bg-white p-5">
                  <h4 className="font-semibold text-slate-900">Dilekçe zorunlu mu?</h4>
                  <p className="mt-2 text-sm text-slate-600">
                    Her zaman zorunlu olmasa da, iyi yazılmış bir dilekçe vize onay şansınızı önemli ölçüde artırır. 
                    Birçok büyükelçilik dilekçe eklenmesini şiddetle tavsiye eder.
                  </p>
                </div>
                <div className="rounded-lg border border-slate-200 bg-white p-5">
                  <h4 className="font-semibold text-slate-900">Ne kadar uzun olmalı?</h4>
                  <p className="mt-2 text-sm text-slate-600">
                    Dilekçenizi kısa tutun - ideal olarak 1 sayfa, maksimum 2 sayfa. En önemli bilgilere odaklanın 
                    ve gereksiz detaylardan kaçının.
                  </p>
                </div>
                <div className="rounded-lg border border-slate-200 bg-white p-5">
                  <h4 className="font-semibold text-slate-900">Hangi dilde yazmalıyım?</h4>
                  <p className="mt-2 text-sm text-slate-600">
                    Hedef ülkenin resmi dilinde veya İngilizce yazın. Aracımız mükemmel dilekçe oluşturmanız için 
                    8 farklı dili desteklemektedir.
                  </p>
                </div>
                <div className="rounded-lg border border-slate-200 bg-white p-5">
                  <h4 className="font-semibold text-slate-900">Dilekçeyi imzalamalı mıyım?</h4>
                  <p className="mt-2 text-sm text-slate-600">
                    Evet, dilekçenizi yazdırdıktan sonra mutlaka elle imzalayın. Bu, özgünlük katar ve belgeyi 
                    kişisel olarak hazırladığınızı gösterir.
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
