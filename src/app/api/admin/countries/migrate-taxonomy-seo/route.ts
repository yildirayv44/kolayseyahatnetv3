import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const dryRun = searchParams.get('dry_run') !== 'false';
  return handleMigration(dryRun);
}

export async function POST() {
  return handleMigration(false);
}

async function handleMigration(dryRun: boolean = true) {
  try {
    // Get all countries
    const { data: countries, error: countriesError } = await supabase
      .from("countries")
      .select("id, name, slug, meta_title, meta_description")
      .eq("status", 1);

    if (countriesError) throw countriesError;

    const updates: any[] = [];
    let migrated = 0;

    for (const country of countries || []) {
      if (!country.slug) continue;

      // Get taxonomy data for this country
      const { data: taxonomy } = await supabase
        .from("taxonomies")
        .select("title, description")
        .eq("slug", country.slug)
        .eq("type", "Country\\CountryController@detail")
        .maybeSingle();

      if (!taxonomy) continue;

      let needsUpdate = false;
      const updates_data: any = {};

      // Migrate meta_title from taxonomy.title if country.meta_title is empty
      if ((!country.meta_title || country.meta_title.trim() === '') && taxonomy.title) {
        updates_data.meta_title = taxonomy.title;
        needsUpdate = true;
      }

      // Migrate meta_description from taxonomy.description if country.meta_description is empty
      if (!country.meta_description && taxonomy.description) {
        updates_data.meta_description = taxonomy.description;
        needsUpdate = true;
      }

      if (needsUpdate) {
        if (!dryRun) {
          const { error: updateError } = await supabase
            .from("countries")
            .update(updates_data)
            .eq("id", country.id);

          if (updateError) {
            console.error(`Error updating ${country.name}:`, updateError);
          } else {
            migrated++;
          }
        } else {
          migrated++;
        }

        updates.push({
          id: country.id,
          name: country.name,
          slug: country.slug,
          before: {
            meta_title: country.meta_title,
            meta_description: country.meta_description,
          },
          after: updates_data,
          from_taxonomy: {
            title: taxonomy.title,
            description: taxonomy.description,
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      dry_run: dryRun,
      total_countries: countries?.length || 0,
      migrated_countries: migrated,
      updates: updates,
    });
  } catch (error: any) {
    console.error("Error migrating taxonomy SEO:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
