import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

/**
 * POST /api/admin/visa-matrix/generate-seo
 * 
 * Generate SEO content for a visa page using AI
 * 
 * Body:
 * {
 *   sourceCountryCode: string,
 *   destinationCountryCode: string,
 *   locale: string (tr or en)
 * }
 */

interface GenerateSEORequest {
  sourceCountryCode: string;
  destinationCountryCode: string;
  locale: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: GenerateSEORequest = await request.json();
    const { sourceCountryCode, destinationCountryCode, locale } = body;

    if (!sourceCountryCode || !destinationCountryCode || !locale) {
      return NextResponse.json(
        { success: false, error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Get countries
    const [sourceCountryRes, destCountryRes] = await Promise.all([
      supabase
        .from('countries')
        .select('id, name, country_code')
        .eq('country_code', sourceCountryCode)
        .eq('status', 1)
        .maybeSingle(),
      supabase
        .from('countries')
        .select('id, name, country_code')
        .eq('country_code', destinationCountryCode)
        .eq('status', 1)
        .maybeSingle(),
    ]);

    if (!sourceCountryRes.data || !destCountryRes.data) {
      return NextResponse.json(
        { success: false, error: 'Country not found' },
        { status: 404 }
      );
    }

    const sourceCountry = sourceCountryRes.data;
    const destCountry = destCountryRes.data;

    // Get visa requirement
    const { data: visaReq } = await supabase
      .from('visa_requirements')
      .select('*')
      .eq('source_country_code', sourceCountryCode)
      .eq('country_code', destinationCountryCode)
      .maybeSingle();

    if (!visaReq) {
      return NextResponse.json(
        { success: false, error: 'Visa requirement not found' },
        { status: 404 }
      );
    }

    const isEnglish = locale === 'en';

    // Generate SEO content (template-based for now)
    // In production, this would use OpenAI/Gemini API
    const metaTitle = isEnglish
      ? `${sourceCountry.name} Citizens ${destCountry.name} Visa | 2026 Requirements & Application`
      : `${sourceCountry.name} Vatandaşları İçin ${destCountry.name} Vizesi | 2026 Güncel Bilgiler`;

    const metaDescription = isEnglish
      ? `Complete guide for ${sourceCountry.name} passport holders traveling to ${destCountry.name}. Visa status: ${visaReq.visa_status}. Learn about requirements, fees, processing time, and application process.`
      : `${sourceCountry.name} pasaportu ile ${destCountry.name}'ye seyahat için kapsamlı rehber. Vize durumu: ${visaReq.visa_status}. Gereklilikler, ücretler, işlem süresi ve başvuru süreci hakkında bilgi edinin.`;

    const h1Title = isEnglish
      ? `${sourceCountry.name} Citizens ${destCountry.name} Visa Guide`
      : `${sourceCountry.name} Vatandaşları İçin ${destCountry.name} Vize Rehberi`;

    const introText = isEnglish
      ? `<p>If you are a ${sourceCountry.name} passport holder planning to visit ${destCountry.name}, understanding the visa requirements is essential. The current visa status for ${sourceCountry.name} citizens is <strong>${visaReq.visa_status}</strong>.</p>
         <p>This comprehensive guide provides all the information you need about visa requirements, application process, required documents, and processing times for ${destCountry.name}.</p>`
      : `<p>${sourceCountry.name} pasaportu sahibi olarak ${destCountry.name}'ye seyahat etmeyi planlıyorsanız, vize gerekliliklerini anlamak önemlidir. ${sourceCountry.name} vatandaşları için mevcut vize durumu <strong>${visaReq.visa_status}</strong>'dir.</p>
         <p>Bu kapsamlı rehber, ${destCountry.name} için vize gereklilikleri, başvuru süreci, gerekli belgeler ve işlem süreleri hakkında ihtiyacınız olan tüm bilgileri sağlar.</p>`;

    const requirementsSection = isEnglish
      ? `<ul>
           <li><strong>Valid Passport:</strong> Must be valid for at least 6 months beyond your intended stay</li>
           <li><strong>Visa Application Form:</strong> Completed and signed</li>
           <li><strong>Passport Photos:</strong> Recent passport-sized photographs</li>
           <li><strong>Proof of Financial Means:</strong> Bank statements or proof of sufficient funds</li>
           <li><strong>Travel Itinerary:</strong> Flight bookings and accommodation details</li>
           <li><strong>Travel Insurance:</strong> Valid travel insurance coverage</li>
         </ul>`
      : `<ul>
           <li><strong>Geçerli Pasaport:</strong> Planlanan kaldığınız sürenin en az 6 ay ötesinde geçerli olmalıdır</li>
           <li><strong>Vize Başvuru Formu:</strong> Doldurulmuş ve imzalanmış</li>
           <li><strong>Pasaport Fotoğrafları:</strong> Güncel pasaport boyutunda fotoğraflar</li>
           <li><strong>Mali Durum Belgesi:</strong> Banka hesap özetleri veya yeterli fon kanıtı</li>
           <li><strong>Seyahat Planı:</strong> Uçak rezervasyonları ve konaklama detayları</li>
           <li><strong>Seyahat Sigortası:</strong> Geçerli seyahat sigortası kapsamı</li>
         </ul>`;

    const processSection = isEnglish
      ? `<ol>
           <li><strong>Gather Required Documents:</strong> Collect all necessary documents as listed above</li>
           <li><strong>Complete Application Form:</strong> Fill out the visa application form accurately</li>
           <li><strong>Schedule Appointment:</strong> Book an appointment at the embassy or consulate if required</li>
           <li><strong>Submit Application:</strong> Submit your application with all supporting documents</li>
           <li><strong>Pay Visa Fee:</strong> Pay the required visa processing fee</li>
           <li><strong>Wait for Processing:</strong> Processing time varies, typically ${visaReq.processing_time || '2-4 weeks'}</li>
           <li><strong>Collect Visa:</strong> Once approved, collect your visa from the embassy</li>
         </ol>`
      : `<ol>
           <li><strong>Gerekli Belgeleri Toplayın:</strong> Yukarıda listelenen tüm gerekli belgeleri toplayın</li>
           <li><strong>Başvuru Formunu Doldurun:</strong> Vize başvuru formunu doğru şekilde doldurun</li>
           <li><strong>Randevu Alın:</strong> Gerekirse büyükelçilik veya konsolosluktan randevu alın</li>
           <li><strong>Başvuruyu Gönderin:</strong> Tüm destekleyici belgelerle başvurunuzu gönderin</li>
           <li><strong>Vize Ücretini Ödeyin:</strong> Gerekli vize işlem ücretini ödeyin</li>
           <li><strong>İşlem Süresini Bekleyin:</strong> İşlem süresi değişir, genellikle ${visaReq.processing_time || '2-4 hafta'}</li>
           <li><strong>Vizenizi Alın:</strong> Onaylandıktan sonra vizenizi büyükelçilikten alın</li>
         </ol>`;

    const faqJson = isEnglish
      ? [
          {
            question: `Do ${sourceCountry.name} citizens need a visa for ${destCountry.name}?`,
            answer: `Yes, ${sourceCountry.name} passport holders require ${visaReq.visa_status} to enter ${destCountry.name}.`,
          },
          {
            question: `How much does the visa cost?`,
            answer: visaReq.visa_cost || 'Visa fees vary. Please check with the embassy for current rates.',
          },
          {
            question: `How long does visa processing take?`,
            answer: visaReq.processing_time || 'Processing time typically takes 2-4 weeks.',
          },
          {
            question: `How long can I stay in ${destCountry.name}?`,
            answer: visaReq.allowed_stay || 'Stay duration depends on the visa type issued.',
          },
          {
            question: `Can I apply for the visa online?`,
            answer: visaReq.application_method === 'online' 
              ? 'Yes, you can apply for the visa online through the official portal.'
              : 'You need to apply through the embassy or consulate.',
          },
        ]
      : [
          {
            question: `${sourceCountry.name} vatandaşları ${destCountry.name} için vize gerektirir mi?`,
            answer: `Evet, ${sourceCountry.name} pasaportu sahipleri ${destCountry.name}'ye giriş için ${visaReq.visa_status} gerektirir.`,
          },
          {
            question: `Vize ücreti ne kadar?`,
            answer: visaReq.visa_cost || 'Vize ücretleri değişiklik gösterir. Güncel ücretler için büyükelçiliğe başvurun.',
          },
          {
            question: `Vize işlem süresi ne kadar?`,
            answer: visaReq.processing_time || 'İşlem süresi genellikle 2-4 hafta sürer.',
          },
          {
            question: `${destCountry.name}'de ne kadar kalabilirim?`,
            answer: visaReq.allowed_stay || 'Kalış süresi verilen vize türüne bağlıdır.',
          },
          {
            question: `Vize başvurusunu online yapabilir miyim?`,
            answer: visaReq.application_method === 'online'
              ? 'Evet, resmi portal üzerinden online vize başvurusu yapabilirsiniz.'
              : 'Büyükelçilik veya konsolosluk üzerinden başvuru yapmanız gerekmektedir.',
          },
        ];

    // Insert or update SEO content
    const { data: seoData, error: seoError } = await supabase
      .from('visa_pages_seo')
      .upsert({
        source_country_code: sourceCountryCode,
        destination_country_code: destinationCountryCode,
        locale,
        meta_title: metaTitle,
        meta_description: metaDescription,
        h1_title: h1Title,
        intro_text: introText,
        requirements_section: requirementsSection,
        process_section: processSection,
        faq_json: faqJson,
        content_status: 'generated',
        generated_at: new Date().toISOString(),
        ai_model: 'template-based',
      }, {
        onConflict: 'source_country_code,destination_country_code,locale',
      })
      .select()
      .single();

    if (seoError) {
      console.error('SEO insert error:', seoError);
      return NextResponse.json(
        { success: false, error: seoError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: seoData,
      message: `SEO content generated for ${sourceCountry.name} → ${destCountry.name} (${locale})`,
    });

  } catch (error) {
    console.error('API: /api/admin/visa-matrix/generate-seo error', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
