import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * Bulk add missing countries to database
 * POST /api/admin/countries/bulk-add
 */
export async function POST(request: NextRequest) {
  try {
    // Get existing countries
    const { data: existing } = await supabase
      .from("countries")
      .select("name");
    
    const existingNames = new Set(existing?.map(c => c.name) || []);
    
    // List of all world countries (195 UN members + others)
    const allCountries = [
      // Existing ones will be skipped
      // Afrika
      "Cezayir", "Angola", "Botsvana", "Burkina Faso", "Burundi",
      "Kamerun", "Cape Verde", "Orta Afrika Cumhuriyeti", "Çad", "Kongo",
      "Kongo Demokratik Cumhuriyeti", "Fildişi Sahili", "Cibuti", "Ekvator Ginesi",
      "Eritre", "Etiyopya", "Gabon", "Gambiya", "Gine", "Gine-Bissau",
      "Lesotho", "Liberya", "Libya", "Madagaskar", "Malawi", "Mali",
      "Moritanya", "Mauritius", "Mozambik", "Namibya", "Nijer", "Ruanda",
      "Sao Tome ve Principe", "Senegal", "Seyşeller", "Sierra Leone",
      "Somali", "Güney Sudan", "Sudan", "Svaziland", "Tunus",
      
      // Asya
      "Afganistan", "Azerbaycan", "Ermenistan", "Gürcistan", "Irak", "İran",
      "Kazakistan", "Kırgızistan", "Lübnan", "Moğolistan", "Özbekistan",
      "Suriye", "Tacikistan", "Türkmenistan", "Yemen",
      
      // Avrupa
      "Arnavutluk", "Andorra", "Belarus", "Bosna-Hersek", "Kıbrıs",
      "Kosova", "Liechtenstein", "Lüksemburg", "Malta", "Moldova",
      "Monako", "Karadağ", "Kuzey Makedonya", "San Marino", "Sırbistan",
      "Estonya", "Letonya", "Litvanya", "Slovakya", "Slovenya",
      
      // Amerika
      "Antigua ve Barbuda", "Bahamas", "Barbados", "Belize", "Bolivya",
      "Kosta Rika", "Küba", "Dominik", "Dominik Cumhuriyeti", "El Salvador",
      "Grenada", "Guatemala", "Guyana", "Haiti", "Honduras", "Jamaika",
      "Nikaragua", "Panama", "Paraguay", "Peru", "Saint Kitts ve Nevis",
      "Saint Lucia", "Saint Vincent ve Grenadinler", "Surinam",
      "Trinidad ve Tobago", "Uruguay", "Venezuela", "Şili", "Kolombiya", "Ekvador",
      
      // Okyanusya
      "Fiji", "Kiribati", "Marshall Adaları", "Mikronezya", "Nauru",
      "Palau", "Papua Yeni Gine", "Samoa", "Solomon Adaları", "Tonga",
      "Tuvalu", "Vanuatu",
      
      // Orta Doğu (ek)
      "Ürdün",
    ];
    
    // Filter out existing countries
    const newCountries = allCountries.filter(name => !existingNames.has(name));
    
    console.log(`📊 Existing countries: ${existingNames.size}`);
    console.log(`📊 New countries to add: ${newCountries.length}`);
    
    if (newCountries.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No new countries to add",
        existing: existingNames.size,
        added: 0
      });
    }
    
    // Prepare country records
    const countryRecords = newCountries.map((name, index) => ({
      name,
      title: `${name} Vizesi`,
      description: `${name} vize başvurusu için profesyonel danışmanlık hizmeti.`,
      status: 1,
      sorted: 1000 + index, // Add at the end
      price: 0,
      original_price: 0,
      discount_percentage: 0,
      visa_required: true,
    }));
    
    // Insert in batches of 50
    const batchSize = 50;
    const added = [];
    const failed = [];
    
    for (let i = 0; i < countryRecords.length; i += batchSize) {
      const batch = countryRecords.slice(i, i + batchSize);
      
      const { data, error } = await supabase
        .from("countries")
        .insert(batch)
        .select();
      
      if (error) {
        console.error(`❌ Batch ${i / batchSize + 1} failed:`, error);
        failed.push(...batch.map(c => c.name));
      } else {
        console.log(`✅ Batch ${i / batchSize + 1} added: ${data?.length} countries`);
        added.push(...(data?.map(c => c.name) || []));
      }
    }
    
    return NextResponse.json({
      success: true,
      message: `Added ${added.length} new countries`,
      existing: existingNames.size,
      added: added.length,
      failed: failed.length,
      added_countries: added,
      failed_countries: failed
    });
    
  } catch (error: any) {
    console.error('Bulk add error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
