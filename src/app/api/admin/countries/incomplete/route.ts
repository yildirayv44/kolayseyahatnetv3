import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * Find countries with incomplete content
 * GET /api/admin/countries/incomplete
 */
export async function GET() {
  try {
    // Fetch all countries
    const { data: countries, error } = await supabase
      .from("countries")
      .select("id, name, title, description, meta_description, price, created_at, country_code")
      .eq("status", 1)
      .order("created_at", { ascending: false });

    if (error) throw error;

    // Define what makes a country "incomplete"
    const incompleteCountries = countries?.filter(country => {
      const hasNoDescription = !country.description || country.description.length < 100;
      const hasNoMetaDescription = !country.meta_description || country.meta_description.length < 100;
      const hasNoPrice = !country.price || country.price === 0;
      const hasBasicTitle = country.title === `${country.name} Vizesi`;
      
      // Country is incomplete if it has ANY missing field (more strict)
      const missingFields = [
        hasNoDescription,
        hasNoMetaDescription,
        hasNoPrice,
        hasBasicTitle
      ].filter(Boolean).length;
      
      return missingFields >= 1; // Any missing field
    }) || [];

    // Get country codes for visa data
    const countryCodes = incompleteCountries
      .map(c => c.country_code)
      .filter(Boolean);

    // Fetch visa data for these countries
    let visaData: Record<string, any> = {};
    if (countryCodes.length > 0) {
      try {
        const visaResponse = await fetch(
          `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/passport-index`,
          {
            headers: {
              'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`
            }
          }
        );
        
        if (visaResponse.ok) {
          const visaDataArray = await visaResponse.json();
          visaData = visaDataArray.reduce((acc: any, item: any) => {
            acc[item.countryCode] = item;
            return acc;
          }, {});
        }
      } catch (error) {
        console.log('Could not fetch visa data:', error);
      }
    }

    // Format incomplete countries with additional info
    const formattedCountries = incompleteCountries.map(country => {
      const missingFields = [];
      
      if (!country.description || country.description.length < 100) {
        missingFields.push('description');
      }
      if (!country.meta_description || country.meta_description.length < 100) {
        missingFields.push('meta_description');
      }
      if (!country.price || country.price === 0) {
        missingFields.push('price');
      }
      if (country.title === `${country.name} Vizesi`) {
        missingFields.push('title');
      }

      const visa = country.country_code ? visaData[country.country_code] : null;

      return {
        id: country.id,
        name: country.name,
        code: country.country_code || 'XX',
        title: country.title,
        description: country.description,
        price: country.price,
        created_at: country.created_at,
        missing_fields: missingFields,
        completeness: Math.round(((4 - missingFields.length) / 4) * 100),
        visa_status: visa?.visaStatus || 'unknown',
        visa_required: visa?.visaStatus === 'visa-required',
        region: getRegion(country.name)
      };
    });

    // Sort by creation date (newest first)
    formattedCountries.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    return NextResponse.json({
      success: true,
      total: countries?.length || 0,
      incomplete: formattedCountries.length,
      countries: formattedCountries,
      message: `${formattedCountries.length} ülkenin içeriği eksik`
    });

  } catch (error: any) {
    console.error('Incomplete countries error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// Helper function to determine region
function getRegion(countryName: string): string {
  const regions: Record<string, string[]> = {
    'Afrika': [
      'Angola', 'Burkina Faso', 'Burundi', 'Cape Verde', 'Orta Afrika Cumhuriyeti',
      'Çad', 'Kongo', 'Kongo Demokratik Cumhuriyeti', 'Cibuti', 'Ekvator Ginesi',
      'Eritre', 'Gabon', 'Gambiya', 'Gine', 'Gine-Bissau', 'Lesotho', 'Liberya',
      'Libya', 'Malawi', 'Mali', 'Moritanya', 'Nijer', 'Ruanda', 'Sao Tome ve Principe',
      'Sierra Leone', 'Somali', 'Güney Sudan', 'Sudan', 'Svaziland', 'Cezayir',
      'Etiyopya', 'Kenya', 'Madagaskar', 'Mozambik', 'Namibya', 'Senegal',
      'Seyşeller', 'Tanzanya', 'Togo', 'Tunus', 'Uganda', 'Zambiya', 'Benin',
      'Fas', 'Mısır', 'Güney Afrika'
    ],
    'Avrupa': [
      'Arnavutluk', 'Andorra', 'Belarus', 'Bosna-Hersek', 'Kıbrıs', 'Kosova',
      'Liechtenstein', 'Lüksemburg', 'Malta', 'Moldova', 'Monako', 'Karadağ',
      'Kuzey Makedonya', 'San Marino', 'Sırbistan', 'Estonya', 'Letonya',
      'Litvanya', 'Slovakya', 'Slovenya', 'Vatikan'
    ],
    'Amerika': [
      'Antigua ve Barbuda', 'Bahamas', 'Barbados', 'Belize', 'Bolivya',
      'Kosta Rika', 'Küba', 'Dominik', 'Dominik Cumhuriyeti', 'El Salvador',
      'Grenada', 'Guatemala', 'Guyana', 'Haiti', 'Honduras', 'Jamaika',
      'Nikaragua', 'Panama', 'Paraguay', 'Peru', 'Saint Kitts ve Nevis',
      'Saint Lucia', 'Saint Vincent ve Grenadinler', 'Surinam',
      'Trinidad ve Tobago', 'Uruguay', 'Venezuela'
    ],
    'Okyanusya': [
      'Fiji', 'Kiribati', 'Marshall Adaları', 'Mikronezya', 'Nauru',
      'Palau', 'Papua Yeni Gine', 'Samoa', 'Solomon Adaları', 'Tonga',
      'Tuvalu', 'Vanuatu'
    ],
    'Asya': [
      'Afganistan', 'Azerbaycan', 'Ermenistan', 'Gürcistan', 'Kazakistan',
      'Kırgızistan', 'Moğolistan', 'Özbekistan', 'Tacikistan', 'Türkmenistan'
    ],
    'Orta Doğu': [
      'Irak', 'İran', 'Lübnan', 'Suriye', 'Yemen', 'Ürdün'
    ]
  };

  for (const [region, countries] of Object.entries(regions)) {
    if (countries.includes(countryName)) {
      return region;
    }
  }

  return 'Diğer';
}
