import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function generateSlug(name: string): string {
  return name
    // First replace Turkish uppercase characters before toLowerCase
    .replace(/İ/g, 'i')
    .replace(/I/g, 'i')
    .replace(/Ğ/g, 'g')
    .replace(/Ü/g, 'u')
    .replace(/Ş/g, 's')
    .replace(/Ö/g, 'o')
    .replace(/Ç/g, 'c')
    .toLowerCase()
    // Then replace lowercase Turkish characters
    .replace(/ı/g, 'i')
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export async function POST(request: NextRequest) {
  try {
    console.log("🔧 Starting slug fix for all taxonomies...");

    // 1. Get all countries with their taxonomies
    const { data: countries, error: countriesError } = await supabase
      .from("countries")
      .select("id, name")
      .order("id", { ascending: true });

    if (countriesError) {
      throw new Error(`Failed to fetch countries: ${countriesError.message}`);
    }

    console.log(`📊 Found ${countries?.length || 0} countries`);

    // 2. Get all taxonomies
    const { data: taxonomies, error: taxonomiesError } = await supabase
      .from("taxonomies")
      .select("*")
      .eq("type", "Country\\CountryController@detail");

    if (taxonomiesError) {
      throw new Error(`Failed to fetch taxonomies: ${taxonomiesError.message}`);
    }

    const taxonomyMap = new Map(taxonomies?.map(t => [t.model_id, t]) || []);

    const results = {
      updated: [] as any[],
      unchanged: [] as any[],
      failed: [] as any[],
    };

    // 3. Check and fix each country's slug
    for (const country of countries || []) {
      const correctSlug = generateSlug(country.name);
      const taxonomy = taxonomyMap.get(country.id);

      if (!taxonomy) {
        console.log(`⏭️ Skipping ${country.name} - no taxonomy`);
        continue;
      }

      if (taxonomy.slug === correctSlug) {
        console.log(`✓ ${country.name} - slug correct: ${correctSlug}`);
        results.unchanged.push({
          id: country.id,
          name: country.name,
          slug: correctSlug,
        });
        continue;
      }

      console.log(`🔄 Fixing ${country.name}: ${taxonomy.slug} → ${correctSlug}`);

      const { error: updateError } = await supabase
        .from("taxonomies")
        .update({ slug: correctSlug })
        .eq("model_id", country.id)
        .eq("type", "Country\\CountryController@detail");

      if (updateError) {
        console.error(`❌ Failed to update ${country.name}:`, updateError.message);
        results.failed.push({
          id: country.id,
          name: country.name,
          oldSlug: taxonomy.slug,
          newSlug: correctSlug,
          error: updateError.message,
        });
      } else {
        console.log(`✅ Updated ${country.name}`);
        results.updated.push({
          id: country.id,
          name: country.name,
          oldSlug: taxonomy.slug,
          newSlug: correctSlug,
        });
      }
    }

    console.log(`✅ Updated ${results.updated.length} slugs`);
    console.log(`✓ ${results.unchanged.length} slugs already correct`);
    console.log(`❌ Failed ${results.failed.length} slugs`);

    return NextResponse.json({
      success: true,
      message: `Fixed ${results.updated.length} slugs, ${results.unchanged.length} already correct, ${results.failed.length} failed`,
      updated: results.updated.length,
      unchanged: results.unchanged.length,
      failed: results.failed.length,
      total: countries?.length || 0,
      details: results,
    });
  } catch (error: any) {
    console.error("❌ Fix slug error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
