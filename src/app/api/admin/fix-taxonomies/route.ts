import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function generateSlug(name: string): string {
  return name
    .toLowerCase()
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
    console.log("🔧 Starting taxonomy fix...");

    // 1. Get all countries
    const { data: countries, error: countriesError } = await supabase
      .from("countries")
      .select("id, name")
      .order("id", { ascending: true });

    if (countriesError) {
      throw new Error(`Failed to fetch countries: ${countriesError.message}`);
    }

    console.log(`📊 Found ${countries?.length || 0} countries`);

    // 2. Get existing taxonomies
    const { data: existingTaxonomies, error: taxonomiesError } = await supabase
      .from("taxonomies")
      .select("model_id")
      .eq("type", "Country\\CountryController@detail");

    if (taxonomiesError) {
      throw new Error(`Failed to fetch taxonomies: ${taxonomiesError.message}`);
    }

    const existingModelIds = new Set(existingTaxonomies?.map(t => t.model_id) || []);
    console.log(`📋 Found ${existingModelIds.size} existing taxonomies`);

    // 3. Find countries without taxonomies
    const countriesWithoutTaxonomy = countries?.filter(c => !existingModelIds.has(c.id)) || [];
    console.log(`🔍 Found ${countriesWithoutTaxonomy.length} countries without taxonomy`);

    if (countriesWithoutTaxonomy.length === 0) {
      return NextResponse.json({
        success: true,
        message: "All countries already have taxonomies",
        fixed: 0,
        total: countries?.length || 0,
      });
    }

    // 4. Create taxonomies for missing countries
    const results = {
      success: [] as any[],
      failed: [] as any[],
    };

    for (const country of countriesWithoutTaxonomy) {
      const slug = generateSlug(country.name);
      
      console.log(`📝 Creating taxonomy for ${country.name} (ID: ${country.id}) -> ${slug}`);

      const { error: insertError } = await supabase
        .from("taxonomies")
        .insert({
          model_id: country.id,
          type: "Country\\CountryController@detail",
          slug: slug,
          locale: "tr",
        });

      if (insertError) {
        console.error(`❌ Failed for ${country.name}:`, insertError.message);
        results.failed.push({
          id: country.id,
          name: country.name,
          error: insertError.message,
        });
      } else {
        console.log(`✅ Created taxonomy for ${country.name}`);
        results.success.push({
          id: country.id,
          name: country.name,
          slug: slug,
        });
      }
    }

    console.log(`✅ Fixed ${results.success.length} taxonomies`);
    console.log(`❌ Failed ${results.failed.length} taxonomies`);

    return NextResponse.json({
      success: true,
      message: `Fixed ${results.success.length} out of ${countriesWithoutTaxonomy.length} countries`,
      fixed: results.success.length,
      failed: results.failed.length,
      total: countries?.length || 0,
      details: {
        success: results.success,
        failed: results.failed,
      },
    });
  } catch (error: any) {
    console.error("❌ Fix taxonomies error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
