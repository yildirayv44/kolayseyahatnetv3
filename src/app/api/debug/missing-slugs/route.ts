import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const countryId = searchParams.get('id');

  // Get all countries
  const { data: countries } = await supabase
    .from("countries")
    .select("id, name")
    .order("id");

  // Get all taxonomies
  const { data: taxonomies } = await supabase
    .from("taxonomies")
    .select("model_id, slug")
    .eq("model_type", "country");

  const taxMap = new Map(taxonomies?.map(t => [t.model_id, t.slug]) || []);

  // If specific ID requested, return its info
  if (countryId) {
    const country = countries?.find(c => c.id === parseInt(countryId));
    const slug = taxMap.get(parseInt(countryId));
    
    return NextResponse.json({
      id: country?.id,
      name: country?.name,
      slug: slug || null,
      has_taxonomy: !!slug,
    });
  }

  // Find countries without slugs
  const missing = countries?.filter(c => !taxMap.has(c.id)).map(c => ({
    id: c.id,
    name: c.name,
    suggested_slug: c.name.toLowerCase()
      .replace(/ı/g, 'i')
      .replace(/ğ/g, 'g')
      .replace(/ü/g, 'u')
      .replace(/ş/g, 's')
      .replace(/ö/g, 'o')
      .replace(/ç/g, 'c')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, ''),
  })) || [];

  return NextResponse.json({
    total_countries: countries?.length || 0,
    missing_count: missing.length,
    missing_slugs: missing,
  });
}
