/**
 * AI Content Generation for Bilateral Visa Pages
 * Generates SEO-optimized content for source-destination visa pages
 */

import { supabase } from '@/lib/supabase';

interface VisaRequirementData {
  source_country_code: string;
  destination_country_code: string;
  visa_status: string;
  allowed_stay: string | null;
  conditions: string | null;
  visa_cost: string | null;
  processing_time: string | null;
  application_method: string | null;
}

interface CountryData {
  code: string;
  name: string;
  name_en: string | null;
}

interface GeneratedContent {
  meta_title: string;
  meta_description: string;
  h1_title: string;
  intro_text: string;
  requirements_section: string;
  process_section: string;
  faq_json: Array<{ question: string; answer: string }>;
}

/**
 * Generate AI content for a bilateral visa page
 */
export async function generateVisaPageContent(
  sourceCountryCode: string,
  destinationCountryCode: string,
  locale: 'tr' | 'en' = 'tr'
): Promise<GeneratedContent> {
  // Fetch visa requirement data
  const { data: visaReq } = await supabase
    .from('visa_requirements')
    .select('*')
    .eq('source_country_code', sourceCountryCode)
    .eq('country_code', destinationCountryCode)
    .single();

  // Fetch country data
  const { data: countries } = await supabase
    .from('countries')
    .select('country_code, name, name_en')
    .in('country_code', [sourceCountryCode, destinationCountryCode]);

  const sourceCountry = countries?.find(c => c.country_code === sourceCountryCode);
  const destinationCountry = countries?.find(c => c.country_code === destinationCountryCode);

  if (!sourceCountry || !destinationCountry) {
    throw new Error('Country data not found');
  }

  const sourceName = locale === 'en' ? (sourceCountry.name_en || sourceCountry.name) : sourceCountry.name;
  const destinationName = locale === 'en' ? (destinationCountry.name_en || destinationCountry.name) : destinationCountry.name;

  // Generate content based on visa status
  const visaStatus = visaReq?.visa_status || 'visa-required';
  const allowedStay = visaReq?.allowed_stay;
  const processingTime = visaReq?.processing_time;
  const applicationMethod = visaReq?.application_method;

  if (locale === 'tr') {
    return generateTurkishContent(
      sourceName,
      destinationName,
      visaStatus,
      allowedStay,
      processingTime,
      applicationMethod,
      visaReq
    );
  } else {
    return generateEnglishContent(
      sourceName,
      destinationName,
      visaStatus,
      allowedStay,
      processingTime,
      applicationMethod,
      visaReq
    );
  }
}

function generateTurkishContent(
  sourceName: string,
  destinationName: string,
  visaStatus: string,
  allowedStay: string | null,
  processingTime: string | null,
  applicationMethod: string | null,
  visaReq: any
): GeneratedContent {
  const visaStatusText = getVisaStatusText(visaStatus, 'tr');
  const stayDuration = allowedStay || '';

  // Meta Title (max 60 chars)
  const meta_title = `${sourceName} - ${destinationName} Vize Başvurusu | Kolay Seyahat`;

  // Meta Description (max 155 chars)
  const meta_description = `${sourceName} vatandaşları için ${destinationName} vize gereklilikleri, başvuru süreci ve gerekli belgeler. ${visaStatusText}. Detaylı bilgi için tıklayın.`;

  // H1 Title
  const h1_title = `${sourceName}'dan ${destinationName}'a Vize Başvurusu`;

  // Intro Text
  let intro_text = `${sourceName} vatandaşları ${destinationName}'a seyahat etmek için `;
  
  if (visaStatus === 'visa-free') {
    intro_text += `vize almalarına gerek yoktur. ${stayDuration ? `${stayDuration} süreyle vizesiz kalabilirsiniz.` : 'Vizesiz giriş yapabilirsiniz.'}`;
  } else if (visaStatus === 'visa-on-arrival') {
    intro_text += `varışta vize alabilirler. ${stayDuration ? `${stayDuration} süreyle kalış için ` : ''}Havalimanında vize işlemleri tamamlanır.`;
  } else if (visaStatus === 'eta' || visaStatus === 'evisa') {
    intro_text += `elektronik vize (e-vize) başvurusu yapmaları gerekmektedir. Online başvuru ile ${processingTime || 'kısa sürede'} vize alabilirsiniz.`;
  } else {
    intro_text += `vize başvurusu yapmaları gerekmektedir. ${processingTime ? `İşlem süresi yaklaşık ${processingTime}.` : 'Konsolosluk randevusu almanız gerekir.'}`;
  }

  intro_text += `\n\nBu sayfada ${destinationName} vizesi için gerekli belgeler, başvuru süreci ve önemli bilgiler yer almaktadır.`;

  // Requirements Section
  const requirements_section = generateRequirementsSection(visaStatus, destinationName, 'tr');

  // Process Section
  const process_section = generateProcessSection(visaStatus, applicationMethod, destinationName, 'tr');

  // FAQ
  const faq_json = generateFAQ(sourceName, destinationName, visaStatus, allowedStay, processingTime, 'tr');

  return {
    meta_title,
    meta_description,
    h1_title,
    intro_text,
    requirements_section,
    process_section,
    faq_json
  };
}

function generateEnglishContent(
  sourceName: string,
  destinationName: string,
  visaStatus: string,
  allowedStay: string | null,
  processingTime: string | null,
  applicationMethod: string | null,
  visaReq: any
): GeneratedContent {
  const visaStatusText = getVisaStatusText(visaStatus, 'en');
  const stayDuration = allowedStay || '';

  const meta_title = `${sourceName} - ${destinationName} Visa Application | Kolay Seyahat`;
  const meta_description = `${destinationName} visa requirements for ${sourceName} citizens. ${visaStatusText}. Application process, required documents and detailed information.`;
  const h1_title = `${sourceName} to ${destinationName} Visa Application`;

  let intro_text = `${sourceName} citizens `;
  
  if (visaStatus === 'visa-free') {
    intro_text += `do not need a visa to travel to ${destinationName}. ${stayDuration ? `You can stay visa-free for ${stayDuration}.` : 'Visa-free entry is allowed.'}`;
  } else if (visaStatus === 'visa-on-arrival') {
    intro_text += `can obtain a visa on arrival in ${destinationName}. ${stayDuration ? `For stays up to ${stayDuration}, ` : ''}Visa processing is completed at the airport.`;
  } else if (visaStatus === 'eta' || visaStatus === 'evisa') {
    intro_text += `need to apply for an electronic visa (e-visa) to ${destinationName}. You can obtain your visa ${processingTime || 'quickly'} through online application.`;
  } else {
    intro_text += `need to apply for a visa to ${destinationName}. ${processingTime ? `Processing time is approximately ${processingTime}.` : 'You need to schedule a consulate appointment.'}`;
  }

  intro_text += `\n\nThis page contains required documents, application process and important information for ${destinationName} visa.`;

  const requirements_section = generateRequirementsSection(visaStatus, destinationName, 'en');
  const process_section = generateProcessSection(visaStatus, applicationMethod, destinationName, 'en');
  const faq_json = generateFAQ(sourceName, destinationName, visaStatus, allowedStay, processingTime, 'en');

  return {
    meta_title,
    meta_description,
    h1_title,
    intro_text,
    requirements_section,
    process_section,
    faq_json
  };
}

function getVisaStatusText(status: string, locale: 'tr' | 'en'): string {
  const statusMap: Record<string, { tr: string; en: string }> = {
    'visa-free': { tr: 'Vizesiz giriş', en: 'Visa-free entry' },
    'visa-on-arrival': { tr: 'Varışta vize', en: 'Visa on arrival' },
    'eta': { tr: 'E-vize gerekli', en: 'E-visa required' },
    'evisa': { tr: 'E-vize gerekli', en: 'E-visa required' },
    'visa-required': { tr: 'Vize gerekli', en: 'Visa required' }
  };
  return statusMap[status]?.[locale] || statusMap['visa-required'][locale];
}

function generateRequirementsSection(visaStatus: string, destinationName: string, locale: 'tr' | 'en'): string {
  if (locale === 'tr') {
    if (visaStatus === 'visa-free') {
      return `<h2>Gerekli Belgeler</h2>
<ul>
<li>En az 6 ay geçerli pasaport</li>
<li>Dönüş bileti</li>
<li>Konaklama belgesi (otel rezervasyonu)</li>
<li>Yeterli mali kaynak belgesi</li>
</ul>`;
    } else if (visaStatus === 'visa-on-arrival') {
      return `<h2>Gerekli Belgeler</h2>
<ul>
<li>En az 6 ay geçerli pasaport</li>
<li>Pasaport fotoğrafı (2 adet)</li>
<li>Dönüş bileti</li>
<li>Konaklama belgesi</li>
<li>Vize ücreti (nakit veya kredi kartı)</li>
</ul>`;
    } else {
      return `<h2>Gerekli Belgeler</h2>
<ul>
<li>En az 6 ay geçerli pasaport</li>
<li>Vize başvuru formu (doldurulmuş ve imzalı)</li>
<li>Pasaport fotoğrafı (2 adet, biyometrik)</li>
<li>Seyahat sigortası</li>
<li>Dönüş uçak bileti</li>
<li>Otel rezervasyonu veya davet mektubu</li>
<li>Banka hesap özeti (son 3 ay)</li>
<li>İş belgesi veya öğrenci belgesi</li>
</ul>`;
    }
  } else {
    if (visaStatus === 'visa-free') {
      return `<h2>Required Documents</h2>
<ul>
<li>Valid passport (at least 6 months)</li>
<li>Return ticket</li>
<li>Accommodation proof (hotel reservation)</li>
<li>Proof of sufficient funds</li>
</ul>`;
    } else if (visaStatus === 'visa-on-arrival') {
      return `<h2>Required Documents</h2>
<ul>
<li>Valid passport (at least 6 months)</li>
<li>Passport photos (2 pieces)</li>
<li>Return ticket</li>
<li>Accommodation proof</li>
<li>Visa fee (cash or credit card)</li>
</ul>`;
    } else {
      return `<h2>Required Documents</h2>
<ul>
<li>Valid passport (at least 6 months)</li>
<li>Visa application form (completed and signed)</li>
<li>Passport photos (2 pieces, biometric)</li>
<li>Travel insurance</li>
<li>Return flight ticket</li>
<li>Hotel reservation or invitation letter</li>
<li>Bank statement (last 3 months)</li>
<li>Employment or student certificate</li>
</ul>`;
    }
  }
}

function generateProcessSection(visaStatus: string, applicationMethod: string | null, destinationName: string, locale: 'tr' | 'en'): string {
  if (locale === 'tr') {
    if (visaStatus === 'visa-free') {
      return `<h2>Giriş Süreci</h2>
<ol>
<li>Gerekli belgeleri hazırlayın</li>
<li>Uçak biletinizi alın</li>
<li>Otel rezervasyonunuzu yapın</li>
<li>${destinationName} havalimanına gidin</li>
<li>Pasaport kontrolünden geçin</li>
<li>Ülkeye giriş yapın</li>
</ol>`;
    } else if (visaStatus === 'visa-on-arrival') {
      return `<h2>Başvuru Süreci</h2>
<ol>
<li>Gerekli belgeleri hazırlayın</li>
<li>Uçak biletinizi alın</li>
<li>${destinationName} havalimanına gidin</li>
<li>Vize başvuru masasına gidin</li>
<li>Belgeleri teslim edin ve ücreti ödeyin</li>
<li>Vizenizi alın (genellikle 15-30 dakika)</li>
<li>Pasaport kontrolünden geçin</li>
</ol>`;
    } else if (visaStatus === 'eta' || visaStatus === 'evisa') {
      return `<h2>Başvuru Süreci</h2>
<ol>
<li>Online başvuru formunu doldurun</li>
<li>Gerekli belgeleri yükleyin</li>
<li>Vize ücretini online ödeyin</li>
<li>Başvurunuzu gönderin</li>
<li>E-posta ile onay bekleyin (genellikle 1-3 iş günü)</li>
<li>E-vizenizi yazdırın</li>
<li>Seyahatinizde e-vizeyi yanınızda bulundurun</li>
</ol>`;
    } else {
      return `<h2>Başvuru Süreci</h2>
<ol>
<li>Online randevu alın (konsolosluk/vize merkezi)</li>
<li>Gerekli belgeleri hazırlayın</li>
<li>Vize başvuru formunu doldurun</li>
<li>Randevu gününde konsolosluğa gidin</li>
<li>Belgeleri teslim edin ve biyometrik verilerinizi verin</li>
<li>Vize ücretini ödeyin</li>
<li>Başvuru sonucunu bekleyin (genellikle 5-15 iş günü)</li>
<li>Vizenizi teslim alın</li>
</ol>`;
    }
  } else {
    if (visaStatus === 'visa-free') {
      return `<h2>Entry Process</h2>
<ol>
<li>Prepare required documents</li>
<li>Book your flight ticket</li>
<li>Make hotel reservation</li>
<li>Arrive at ${destinationName} airport</li>
<li>Pass through passport control</li>
<li>Enter the country</li>
</ol>`;
    } else if (visaStatus === 'visa-on-arrival') {
      return `<h2>Application Process</h2>
<ol>
<li>Prepare required documents</li>
<li>Book your flight ticket</li>
<li>Arrive at ${destinationName} airport</li>
<li>Go to visa application desk</li>
<li>Submit documents and pay the fee</li>
<li>Receive your visa (usually 15-30 minutes)</li>
<li>Pass through passport control</li>
</ol>`;
    } else if (visaStatus === 'eta' || visaStatus === 'evisa') {
      return `<h2>Application Process</h2>
<ol>
<li>Fill out online application form</li>
<li>Upload required documents</li>
<li>Pay visa fee online</li>
<li>Submit your application</li>
<li>Wait for email confirmation (usually 1-3 business days)</li>
<li>Print your e-visa</li>
<li>Carry e-visa with you during travel</li>
</ol>`;
    } else {
      return `<h2>Application Process</h2>
<ol>
<li>Schedule appointment online (consulate/visa center)</li>
<li>Prepare required documents</li>
<li>Fill out visa application form</li>
<li>Go to consulate on appointment day</li>
<li>Submit documents and provide biometric data</li>
<li>Pay visa fee</li>
<li>Wait for application result (usually 5-15 business days)</li>
<li>Collect your visa</li>
</ol>`;
    }
  }
}

function generateFAQ(
  sourceName: string,
  destinationName: string,
  visaStatus: string,
  allowedStay: string | null,
  processingTime: string | null,
  locale: 'tr' | 'en'
): Array<{ question: string; answer: string }> {
  if (locale === 'tr') {
    const faqs = [
      {
        question: `${sourceName} vatandaşları ${destinationName}'a vize almadan gidebilir mi?`,
        answer: visaStatus === 'visa-free' 
          ? `Evet, ${sourceName} vatandaşları ${destinationName}'a vizesiz seyahat edebilir. ${allowedStay ? `${allowedStay} süreyle kalabilirsiniz.` : ''}`
          : `Hayır, ${sourceName} vatandaşları ${destinationName}'a gitmek için vize almaları gerekmektedir.`
      },
      {
        question: `${destinationName} vizesi için ne kadar süre gerekiyor?`,
        answer: processingTime 
          ? `${destinationName} vizesi için işlem süresi yaklaşık ${processingTime}.`
          : visaStatus === 'visa-free' 
            ? 'Vize almanıza gerek yok.'
            : 'İşlem süresi başvuru yoğunluğuna göre değişebilir, genellikle 5-15 iş günü sürmektedir.'
      },
      {
        question: `${destinationName} vizesi için hangi belgeler gerekli?`,
        answer: 'Gerekli belgeler arasında geçerli pasaport, pasaport fotoğrafı, seyahat sigortası, dönüş bileti ve konaklama belgesi bulunmaktadır. Detaylı liste yukarıda yer almaktadır.'
      },
      {
        question: `${destinationName} vizesi ücreti ne kadar?`,
        answer: 'Vize ücreti vize türüne ve kalış süresine göre değişiklik göstermektedir. Güncel ücret bilgisi için konsoloslukla iletişime geçmenizi öneririz.'
      },
      {
        question: `${destinationName}'da ne kadar süre kalabilirim?`,
        answer: allowedStay 
          ? `${allowedStay} süreyle kalabilirsiniz.`
          : 'Kalış süresi vize türüne göre değişmektedir. Detaylı bilgi için konsolosluğa başvurunuz.'
      }
    ];
    return faqs;
  } else {
    const faqs = [
      {
        question: `Can ${sourceName} citizens travel to ${destinationName} without a visa?`,
        answer: visaStatus === 'visa-free'
          ? `Yes, ${sourceName} citizens can travel to ${destinationName} visa-free. ${allowedStay ? `You can stay for ${allowedStay}.` : ''}`
          : `No, ${sourceName} citizens need to obtain a visa to travel to ${destinationName}.`
      },
      {
        question: `How long does it take to get a ${destinationName} visa?`,
        answer: processingTime
          ? `Processing time for ${destinationName} visa is approximately ${processingTime}.`
          : visaStatus === 'visa-free'
            ? 'You do not need a visa.'
            : 'Processing time varies depending on application volume, usually takes 5-15 business days.'
      },
      {
        question: `What documents are required for ${destinationName} visa?`,
        answer: 'Required documents include valid passport, passport photos, travel insurance, return ticket and accommodation proof. Detailed list is provided above.'
      },
      {
        question: `How much does a ${destinationName} visa cost?`,
        answer: 'Visa fee varies depending on visa type and duration of stay. We recommend contacting the consulate for current fee information.'
      },
      {
        question: `How long can I stay in ${destinationName}?`,
        answer: allowedStay
          ? `You can stay for ${allowedStay}.`
          : 'Duration of stay depends on visa type. Please contact the consulate for detailed information.'
      }
    ];
    return faqs;
  }
}
