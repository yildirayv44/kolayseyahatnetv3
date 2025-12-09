import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { generateSlug } from "@/lib/helpers";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST() {
  try {
    // Get all countries (including inactive ones)
    const { data: countries } = await supabase
      .from("countries")
      .select("id, name, status");

    if (!countries) {
      return NextResponse.json({ error: "No countries found" }, { status: 404 });
    }

    // Get existing taxonomies
    const { data: existingTax } = await supabase
      .from("taxonomies")
      .select("model_id, slug")
      .eq("model_type", "country");

    const existingIds = new Set(existingTax?.map(t => t.model_id) || []);
    const existingSlugs = new Set(existingTax?.map(t => t.slug) || []);

    // Create taxonomies for missing countries
    const toCreate = countries
      .filter(c => !existingIds.has(c.id))
      .map(c => {
        let slug = generateSlug(c.name);
        let counter = 1;
        
        // Handle duplicate slugs
        while (existingSlugs.has(slug)) {
          slug = `${generateSlug(c.name)}-${counter}`;
          counter++;
        }
        
        existingSlugs.add(slug);
        
        return {
          model_type: "country",
          model_id: c.id,
          slug,
          title: `${c.name} Vizesi`,
          description: `${c.name} vizesi başvurusu için gerekli bilgiler, evraklar ve süreç hakkında detaylı bilgi.`,
        };
      });

    if (toCreate.length === 0) {
      return NextResponse.json({
        message: "All countries already have taxonomies",
        total: countries.length,
      });
    }

    // Insert in batches of 100
    const batchSize = 100;
    let created = 0;

    for (let i = 0; i < toCreate.length; i += batchSize) {
      const batch = toCreate.slice(i, i + batchSize);
      const { error } = await supabase
        .from("taxonomies")
        .insert(batch);

      if (error) {
        console.error(`Error inserting batch ${i / batchSize + 1}:`, error);
      } else {
        created += batch.length;
      }
    }

    return NextResponse.json({
      success: true,
      total_countries: countries.length,
      created_taxonomies: created,
      skipped: countries.length - created,
    });
  } catch (error: any) {
    console.error("Error creating taxonomies:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
