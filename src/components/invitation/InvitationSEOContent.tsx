"use client";

import { FileText, Shield, Clock, CheckCircle, Globe2, Sparkles, AlertCircle } from "lucide-react";

interface Props {
  locale: "tr" | "en";
}

export function InvitationSEOContent({ locale }: Props) {
  return (
    <section className="border-t border-slate-200 bg-gradient-to-b from-slate-50 to-white py-16">
      <div className="mx-auto max-w-6xl px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-900 md:text-4xl">
            {locale === "en" ? "About Visa Invitation Letters" : "Vize Davetiye Mektupları Hakkında"}
          </h2>
          <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">
            {locale === "en" 
              ? "Everything you need to know about invitation letters for visa applications"
              : "Vize başvuruları için davetiye mektupları hakkında bilmeniz gereken her şey"}
          </p>
        </div>

        {locale === "en" ? (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {/* Card 1 */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">What is an Invitation Letter?</h3>
              <p className="mt-2 text-sm text-slate-600">
                A visa invitation letter is an official document that supports your visa application by confirming 
                that you have accommodation and/or financial support during your stay in the destination country.
                It serves as proof of your travel purpose and local connections.
              </p>
            </div>

            {/* Card 2 */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                <Clock className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">When Do You Need One?</h3>
              <ul className="mt-2 space-y-2 text-sm text-slate-600">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                  <span>Visiting friends or family abroad</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                  <span>Business meetings and conferences</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                  <span>When someone sponsors your trip</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                  <span>Tourist visas to certain countries</span>
                </li>
              </ul>
            </div>

            {/* Card 3 */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-purple-100">
                <Shield className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">What Should It Include?</h3>
              <ul className="mt-2 space-y-2 text-sm text-slate-600">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-purple-500 mt-0.5 shrink-0" />
                  <span>Host's full name and contact info</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-purple-500 mt-0.5 shrink-0" />
                  <span>Guest's name and passport details</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-purple-500 mt-0.5 shrink-0" />
                  <span>Purpose and duration of visit</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-purple-500 mt-0.5 shrink-0" />
                  <span>Accommodation address</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-purple-500 mt-0.5 shrink-0" />
                  <span>Financial responsibility statement</span>
                </li>
              </ul>
            </div>

            {/* Card 4 */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-orange-100">
                <Globe2 className="h-6 w-6 text-orange-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Countries That Require It</h3>
              <p className="mt-2 text-sm text-slate-600">
                Many countries require invitation letters for visa applications, including Schengen countries, 
                UK, USA, Canada, Australia, and more. Requirements vary by country and visa type.
              </p>
            </div>

            {/* Card 5 */}
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

            {/* Card 6 */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Important Tips</h3>
              <ul className="mt-2 space-y-2 text-sm text-slate-600">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                  <span>Use accurate and truthful information</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                  <span>Sign the letter before submission</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                  <span>Include supporting documents</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                  <span>Check embassy requirements</span>
                </li>
              </ul>
            </div>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {/* Card 1 */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Davetiye Mektubu Nedir?</h3>
              <p className="mt-2 text-sm text-slate-600">
                Vize davetiye mektubu, vize başvurunuzu destekleyen ve gideceğiniz ülkede konaklama ve/veya 
                mali destek sağlandığını doğrulayan resmi bir belgedir. Seyahat amacınızı ve yerel bağlantılarınızı kanıtlar.
              </p>
            </div>

            {/* Card 2 */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                <Clock className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Ne Zaman Gereklidir?</h3>
              <ul className="mt-2 space-y-2 text-sm text-slate-600">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                  <span>Yurt dışındaki arkadaş veya aileyi ziyaret</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                  <span>İş toplantıları ve konferanslar</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                  <span>Sponsor edilen seyahatler</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                  <span>Belirli ülkelere turist vizesi</span>
                </li>
              </ul>
            </div>

            {/* Card 3 */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-purple-100">
                <Shield className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Neler İçermelidir?</h3>
              <ul className="mt-2 space-y-2 text-sm text-slate-600">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-purple-500 mt-0.5 shrink-0" />
                  <span>Davet edenin tam adı ve iletişim bilgileri</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-purple-500 mt-0.5 shrink-0" />
                  <span>Davet edilenin adı ve pasaport bilgileri</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-purple-500 mt-0.5 shrink-0" />
                  <span>Ziyaretin amacı ve süresi</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-purple-500 mt-0.5 shrink-0" />
                  <span>Konaklama adresi</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-purple-500 mt-0.5 shrink-0" />
                  <span>Mali sorumluluk beyanı</span>
                </li>
              </ul>
            </div>

            {/* Card 4 */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-orange-100">
                <Globe2 className="h-6 w-6 text-orange-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Hangi Ülkeler İster?</h3>
              <p className="mt-2 text-sm text-slate-600">
                Schengen ülkeleri, İngiltere, ABD, Kanada, Avustralya ve daha birçok ülke vize başvurularında 
                davetiye mektubu talep eder. Gereksinimler ülkeye ve vize türüne göre değişir.
              </p>
            </div>

            {/* Card 5 */}
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

            {/* Card 6 */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Önemli İpuçları</h3>
              <ul className="mt-2 space-y-2 text-sm text-slate-600">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                  <span>Doğru ve gerçek bilgiler kullanın</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                  <span>Mektubu göndermeden önce imzalayın</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                  <span>Destekleyici belgeler ekleyin</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                  <span>Büyükelçilik gereksinimlerini kontrol edin</span>
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
                  <h4 className="font-semibold text-slate-900">Is the invitation letter legally binding?</h4>
                  <p className="mt-2 text-sm text-slate-600">
                    While not a legal contract, the invitation letter is an official document that represents your commitment 
                    to host the visitor. Providing false information can have legal consequences.
                  </p>
                </div>
                <div className="rounded-lg border border-slate-200 bg-white p-5">
                  <h4 className="font-semibold text-slate-900">Do I need to notarize the letter?</h4>
                  <p className="mt-2 text-sm text-slate-600">
                    Requirements vary by country. Some countries require notarization while others accept a simple signed letter. 
                    Check with the specific embassy for their requirements.
                  </p>
                </div>
                <div className="rounded-lg border border-slate-200 bg-white p-5">
                  <h4 className="font-semibold text-slate-900">Can I invite multiple people?</h4>
                  <p className="mt-2 text-sm text-slate-600">
                    Yes, you can invite multiple guests in a single letter. Our tool allows you to add multiple guests 
                    with their individual details.
                  </p>
                </div>
                <div className="rounded-lg border border-slate-200 bg-white p-5">
                  <h4 className="font-semibold text-slate-900">What language should the letter be in?</h4>
                  <p className="mt-2 text-sm text-slate-600">
                    The letter should typically be in the official language of the destination country or in English. 
                    Our tool supports 12 different languages.
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="rounded-lg border border-slate-200 bg-white p-5">
                  <h4 className="font-semibold text-slate-900">Davetiye mektubu yasal olarak bağlayıcı mı?</h4>
                  <p className="mt-2 text-sm text-slate-600">
                    Yasal bir sözleşme olmasa da, davetiye mektubu ziyaretçiyi ağırlama taahhüdünüzü temsil eden resmi bir belgedir. 
                    Yanlış bilgi vermek yasal sonuçlar doğurabilir.
                  </p>
                </div>
                <div className="rounded-lg border border-slate-200 bg-white p-5">
                  <h4 className="font-semibold text-slate-900">Mektubu noter onaylatmam gerekir mi?</h4>
                  <p className="mt-2 text-sm text-slate-600">
                    Gereksinimler ülkeye göre değişir. Bazı ülkeler noter onayı isterken, bazıları basit imzalı mektubu kabul eder. 
                    Belirli büyükelçiliğin gereksinimlerini kontrol edin.
                  </p>
                </div>
                <div className="rounded-lg border border-slate-200 bg-white p-5">
                  <h4 className="font-semibold text-slate-900">Birden fazla kişiyi davet edebilir miyim?</h4>
                  <p className="mt-2 text-sm text-slate-600">
                    Evet, tek bir mektupta birden fazla misafir davet edebilirsiniz. Aracımız, bireysel detaylarıyla 
                    birden fazla misafir eklemenize olanak tanır.
                  </p>
                </div>
                <div className="rounded-lg border border-slate-200 bg-white p-5">
                  <h4 className="font-semibold text-slate-900">Mektup hangi dilde olmalı?</h4>
                  <p className="mt-2 text-sm text-slate-600">
                    Mektup genellikle hedef ülkenin resmi dilinde veya İngilizce olmalıdır. 
                    Aracımız 12 farklı dili desteklemektedir.
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
