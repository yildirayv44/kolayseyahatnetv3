import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// All countries in the world (195+ countries)
const ALL_WORLD_COUNTRIES = [
  // Europe
  { name: "Almanya", code: "DE", region: "Avrupa", visaRequired: false },
  { name: "Fransa", code: "FR", region: "Avrupa", visaRequired: false },
  { name: "İtalya", code: "IT", region: "Avrupa", visaRequired: false },
  { name: "İspanya", code: "ES", region: "Avrupa", visaRequired: false },
  { name: "İngiltere", code: "GB", region: "Avrupa", visaRequired: true },
  { name: "Hollanda", code: "NL", region: "Avrupa", visaRequired: false },
  { name: "Belçika", code: "BE", region: "Avrupa", visaRequired: false },
  { name: "İsviçre", code: "CH", region: "Avrupa", visaRequired: false },
  { name: "Avusturya", code: "AT", region: "Avrupa", visaRequired: false },
  { name: "Yunanistan", code: "GR", region: "Avrupa", visaRequired: false },
  { name: "Portekiz", code: "PT", region: "Avrupa", visaRequired: false },
  { name: "İsveç", code: "SE", region: "Avrupa", visaRequired: false },
  { name: "Norveç", code: "NO", region: "Avrupa", visaRequired: false },
  { name: "Danimarka", code: "DK", region: "Avrupa", visaRequired: false },
  { name: "Finlandiya", code: "FI", region: "Avrupa", visaRequired: false },
  { name: "İzlanda", code: "IS", region: "Avrupa", visaRequired: false },
  { name: "İrlanda", code: "IE", region: "Avrupa", visaRequired: true },
  { name: "Polonya", code: "PL", region: "Avrupa", visaRequired: false },
  { name: "Çekya", code: "CZ", region: "Avrupa", visaRequired: false },
  { name: "Macaristan", code: "HU", region: "Avrupa", visaRequired: false },
  { name: "Romanya", code: "RO", region: "Avrupa", visaRequired: false },
  { name: "Bulgaristan", code: "BG", region: "Avrupa", visaRequired: false },
  { name: "Hırvatistan", code: "HR", region: "Avrupa", visaRequired: false },
  { name: "Slovenya", code: "SI", region: "Avrupa", visaRequired: false },
  { name: "Slovakya", code: "SK", region: "Avrupa", visaRequired: false },
  { name: "Estonya", code: "EE", region: "Avrupa", visaRequired: false },
  { name: "Letonya", code: "LV", region: "Avrupa", visaRequired: false },
  { name: "Litvanya", code: "LT", region: "Avrupa", visaRequired: false },
  { name: "Lüksemburg", code: "LU", region: "Avrupa", visaRequired: false },
  { name: "Malta", code: "MT", region: "Avrupa", visaRequired: false },
  { name: "Kıbrıs", code: "CY", region: "Avrupa", visaRequired: false },
  { name: "Sırbistan", code: "RS", region: "Avrupa", visaRequired: false },
  { name: "Karadağ", code: "ME", region: "Avrupa", visaRequired: false },
  { name: "Bosna Hersek", code: "BA", region: "Avrupa", visaRequired: false },
  { name: "Arnavutluk", code: "AL", region: "Avrupa", visaRequired: false },
  { name: "Kuzey Makedonya", code: "MK", region: "Avrupa", visaRequired: false },
  { name: "Ukrayna", code: "UA", region: "Avrupa", visaRequired: false },
  { name: "Moldova", code: "MD", region: "Avrupa", visaRequired: false },
  { name: "Belarus", code: "BY", region: "Avrupa", visaRequired: true },
  { name: "Rusya", code: "RU", region: "Avrupa", visaRequired: true },

  // Americas
  { name: "Amerika", code: "US", region: "Amerika", visaRequired: true },
  { name: "Kanada", code: "CA", region: "Amerika", visaRequired: true },
  { name: "Meksika", code: "MX", region: "Amerika", visaRequired: false },
  { name: "Brezilya", code: "BR", region: "Amerika", visaRequired: false },
  { name: "Arjantin", code: "AR", region: "Amerika", visaRequired: false },
  { name: "Şili", code: "CL", region: "Amerika", visaRequired: false },
  { name: "Kolombiya", code: "CO", region: "Amerika", visaRequired: false },
  { name: "Peru", code: "PE", region: "Amerika", visaRequired: false },
  { name: "Ekvador", code: "EC", region: "Amerika", visaRequired: false },
  { name: "Venezuela", code: "VE", region: "Amerika", visaRequired: false },
  { name: "Uruguay", code: "UY", region: "Amerika", visaRequired: false },
  { name: "Paraguay", code: "PY", region: "Amerika", visaRequired: false },
  { name: "Bolivya", code: "BO", region: "Amerika", visaRequired: false },
  { name: "Küba", code: "CU", region: "Amerika", visaRequired: true },
  { name: "Dominik Cumhuriyeti", code: "DO", region: "Amerika", visaRequired: false },
  { name: "Kosta Rika", code: "CR", region: "Amerika", visaRequired: false },
  { name: "Panama", code: "PA", region: "Amerika", visaRequired: false },
  { name: "Guatemala", code: "GT", region: "Amerika", visaRequired: false },
  { name: "Honduras", code: "HN", region: "Amerika", visaRequired: false },
  { name: "El Salvador", code: "SV", region: "Amerika", visaRequired: false },
  { name: "Nikaragua", code: "NI", region: "Amerika", visaRequired: false },

  // Asia
  { name: "Japonya", code: "JP", region: "Asya", visaRequired: false },
  { name: "Güney Kore", code: "KR", region: "Asya", visaRequired: false },
  { name: "Çin", code: "CN", region: "Asya", visaRequired: true },
  { name: "Hindistan", code: "IN", region: "Asya", visaRequired: true },
  { name: "Tayland", code: "TH", region: "Asya", visaRequired: false },
  { name: "Malezya", code: "MY", region: "Asya", visaRequired: false },
  { name: "Singapur", code: "SG", region: "Asya", visaRequired: false },
  { name: "Endonezya", code: "ID", region: "Asya", visaRequired: false },
  { name: "Filipinler", code: "PH", region: "Asya", visaRequired: false },
  { name: "Vietnam", code: "VN", region: "Asya", visaRequired: false },
  { name: "Hong Kong", code: "HK", region: "Asya", visaRequired: false },
  { name: "Tayvan", code: "TW", region: "Asya", visaRequired: false },
  { name: "Azerbaycan", code: "AZ", region: "Asya", visaRequired: false },
  { name: "Gürcistan", code: "GE", region: "Asya", visaRequired: false },
  { name: "Kazakistan", code: "KZ", region: "Asya", visaRequired: false },
  { name: "Özbekistan", code: "UZ", region: "Asya", visaRequired: false },
  { name: "Kırgızistan", code: "KG", region: "Asya", visaRequired: false },
  { name: "Tacikistan", code: "TJ", region: "Asya", visaRequired: false },
  { name: "Türkmenistan", code: "TM", region: "Asya", visaRequired: true },
  { name: "Moğolistan", code: "MN", region: "Asya", visaRequired: false },
  { name: "Nepal", code: "NP", region: "Asya", visaRequired: false },
  { name: "Sri Lanka", code: "LK", region: "Asya", visaRequired: true },
  { name: "Myanmar", code: "MM", region: "Asya", visaRequired: true },
  { name: "Kamboçya", code: "KH", region: "Asya", visaRequired: false },
  { name: "Laos", code: "LA", region: "Asya", visaRequired: false },
  { name: "Bangladeş", code: "BD", region: "Asya", visaRequired: true },
  { name: "Pakistan", code: "PK", region: "Asya", visaRequired: true },
  { name: "Afganistan", code: "AF", region: "Asya", visaRequired: true },

  // Middle East
  { name: "Birleşik Arap Emirlikleri", code: "AE", region: "Orta Doğu", visaRequired: false },
  { name: "Suudi Arabistan", code: "SA", region: "Orta Doğu", visaRequired: true },
  { name: "Katar", code: "QA", region: "Orta Doğu", visaRequired: false },
  { name: "Kuveyt", code: "KW", region: "Orta Doğu", visaRequired: false },
  { name: "Bahreyn", code: "BH", region: "Orta Doğu", visaRequired: false },
  { name: "Umman", code: "OM", region: "Orta Doğu", visaRequired: false },
  { name: "İsrail", code: "IL", region: "Orta Doğu", visaRequired: false },
  { name: "Ürdün", code: "JO", region: "Orta Doğu", visaRequired: false },
  { name: "Lübnan", code: "LB", region: "Orta Doğu", visaRequired: false },
  { name: "İran", code: "IR", region: "Orta Doğu", visaRequired: true },
  { name: "Irak", code: "IQ", region: "Orta Doğu", visaRequired: true },
  { name: "Suriye", code: "SY", region: "Orta Doğu", visaRequired: true },
  { name: "Yemen", code: "YE", region: "Orta Doğu", visaRequired: true },

  // Africa
  { name: "Güney Afrika", code: "ZA", region: "Afrika", visaRequired: false },
  { name: "Mısır", code: "EG", region: "Afrika", visaRequired: true },
  { name: "Fas", code: "MA", region: "Afrika", visaRequired: false },
  { name: "Tunus", code: "TN", region: "Afrika", visaRequired: false },
  { name: "Cezayir", code: "DZ", region: "Afrika", visaRequired: true },
  { name: "Kenya", code: "KE", region: "Afrika", visaRequired: true },
  { name: "Tanzanya", code: "TZ", region: "Afrika", visaRequired: true },
  { name: "Uganda", code: "UG", region: "Afrika", visaRequired: true },
  { name: "Etiyopya", code: "ET", region: "Afrika", visaRequired: true },
  { name: "Nijerya", code: "NG", region: "Afrika", visaRequired: true },
  { name: "Gana", code: "GH", region: "Afrika", visaRequired: true },
  { name: "Senegal", code: "SN", region: "Afrika", visaRequired: false },
  { name: "Fildişi Sahili", code: "CI", region: "Afrika", visaRequired: true },
  { name: "Kamerun", code: "CM", region: "Afrika", visaRequired: true },
  { name: "Zimbabve", code: "ZW", region: "Afrika", visaRequired: true },
  { name: "Botsvana", code: "BW", region: "Afrika", visaRequired: false },
  { name: "Namibya", code: "NA", region: "Afrika", visaRequired: false },
  { name: "Mozambik", code: "MZ", region: "Afrika", visaRequired: true },
  { name: "Madagaskar", code: "MG", region: "Afrika", visaRequired: true },
  { name: "Mauritius", code: "MU", region: "Afrika", visaRequired: false },
  { name: "Seyşeller", code: "SC", region: "Afrika", visaRequired: false },

  // Oceania
  { name: "Avustralya", code: "AU", region: "Okyanusya", visaRequired: true },
  { name: "Yeni Zelanda", code: "NZ", region: "Okyanusya", visaRequired: true },
  { name: "Fiji", code: "FJ", region: "Okyanusya", visaRequired: false },
  { name: "Papua Yeni Gine", code: "PG", region: "Okyanusya", visaRequired: true },
  { name: "Yeni Kaledonya", code: "NC", region: "Okyanusya", visaRequired: false },
  { name: "Fransız Polinezyası", code: "PF", region: "Okyanusya", visaRequired: false },

  // Caribbean
  { name: "Jamaika", code: "JM", region: "Karayipler", visaRequired: false },
  { name: "Barbados", code: "BB", region: "Karayipler", visaRequired: false },
  { name: "Trinidad ve Tobago", code: "TT", region: "Karayipler", visaRequired: false },
  { name: "Bahama", code: "BS", region: "Karayipler", visaRequired: false },
  { name: "Haiti", code: "HT", region: "Karayipler", visaRequired: true },

  // Additional countries
  { name: "Ermenistan", code: "AM", region: "Asya", visaRequired: false },
  { name: "Kıbrıs (Kuzey)", code: "CY-N", region: "Avrupa", visaRequired: false },
  { name: "Kosova", code: "XK", region: "Avrupa", visaRequired: false },
  { name: "Liechtenstein", code: "LI", region: "Avrupa", visaRequired: false },
  { name: "Monako", code: "MC", region: "Avrupa", visaRequired: false },
  { name: "San Marino", code: "SM", region: "Avrupa", visaRequired: false },
  { name: "Vatikan", code: "VA", region: "Avrupa", visaRequired: false },
  { name: "Andorra", code: "AD", region: "Avrupa", visaRequired: false },
];

export async function GET() {
  try {
    // Get existing countries from database
    const { data: existingCountries, error } = await supabase
      .from("countries")
      .select("name, id");

    if (error) {
      console.error("Database error:", error);
      return NextResponse.json(
        { success: false, error: "Failed to fetch existing countries" },
        { status: 500 }
      );
    }

    // Find missing countries
    const existingNames = new Set(existingCountries?.map(c => c.name.toLowerCase()) || []);
    const missingCountries = ALL_WORLD_COUNTRIES.filter(
      country => !existingNames.has(country.name.toLowerCase())
    );

    return NextResponse.json({
      success: true,
      allCountries: ALL_WORLD_COUNTRIES,
      existingCountries: existingCountries || [],
      missingCountries,
      stats: {
        total: ALL_WORLD_COUNTRIES.length,
        existing: existingCountries?.length || 0,
        missing: missingCountries.length,
      },
    });
  } catch (error: any) {
    console.error("Error finding missing countries:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
