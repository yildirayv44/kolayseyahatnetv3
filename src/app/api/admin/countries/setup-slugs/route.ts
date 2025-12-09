import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { generateSlug } from "@/lib/helpers";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Existing slug mappings from COUNTRY_ID_TO_SLUG
const EXISTING_SLUGS: Record<number, string> = {
  4: "amerika",
  6: "ingiltere",
  7: "yunanistan",
  8: "benin",
  10: "bahreyn",
  12: "rusya",
  14: "dubai",
  15: "fransa",
  16: "vietnam",
  17: "kenya",
  18: "uganda",
  19: "zambiya",
  20: "guney-kore",
  21: "bhutan",
  22: "togo",
  23: "umman",
  24: "tanzanya",
  25: "tayland-vizesi",
  26: "kanada-vizesi",
  3: "kuveyt",
  80: "bosna-hersek",
};

export async function POST() {
  try {
    const results = {
      countries_updated: 0,
      slugs_created: 0,
      errors: [] as string[],
    };

    // 1. Get all countries
    const { data: countries } = await supabase
      .from("countries")
      .select("id, name")
      .order("id");

    if (!countries) {
      return NextResponse.json({ error: "No countries found" }, { status: 404 });
    }

    // 2. Update countries table with slugs
    for (const country of countries) {
      // Use existing slug if available, otherwise generate
      const slug = EXISTING_SLUGS[country.id] || generateSlug(country.name);

      const { error } = await supabase
        .from("countries")
        .update({ slug })
        .eq("id", country.id);

      if (error) {
        results.errors.push(`Country ${country.id}: ${error.message}`);
      } else {
        results.countries_updated++;
      }
    }

    // 3. Create country_slugs entries (TR locale)
    const slugEntries = countries.map(country => ({
      country_id: country.id,
      slug: EXISTING_SLUGS[country.id] || generateSlug(country.name),
      locale: "tr",
    }));

    // Insert in batches
    const batchSize = 100;
    for (let i = 0; i < slugEntries.length; i += batchSize) {
      const batch = slugEntries.slice(i, i + batchSize);
      const { error } = await supabase
        .from("country_slugs")
        .upsert(batch, { onConflict: "country_id,locale" });

      if (error) {
        results.errors.push(`Batch ${i / batchSize + 1}: ${error.message}`);
      } else {
        results.slugs_created += batch.length;
      }
    }

    return NextResponse.json({
      success: true,
      total_countries: countries.length,
      ...results,
    });
  } catch (error: any) {
    console.error("Error setting up slugs:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

// GET endpoint to preview what will be created
export async function GET() {
  try {
    const { data: countries } = await supabase
      .from("countries")
      .select("id, name")
      .order("id")
      .limit(10);

    const preview = countries?.map(c => ({
      id: c.id,
      name: c.name,
      existing_slug: EXISTING_SLUGS[c.id] || null,
      generated_slug: generateSlug(c.name),
      final_slug: EXISTING_SLUGS[c.id] || generateSlug(c.name),
    }));

    return NextResponse.json({
      preview,
      total_with_existing_slugs: Object.keys(EXISTING_SLUGS).length,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
