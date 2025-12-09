import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getCountrySlug } from "@/lib/helpers";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    // Get all active countries
    const { data: countries } = await supabase
      .from("countries")
      .select("id, name")
      .eq("status", 1)
      .order("name");

    if (!countries) {
      return NextResponse.json({ error: "No countries found" }, { status: 404 });
    }

    // Check which countries use fallback slug (country-{id})
    const slugIssues = countries
      .map(c => {
        const slug = getCountrySlug(c.id);
        const isFallback = slug.startsWith('country-');
        
        return {
          id: c.id,
          name: c.name,
          slug,
          is_fallback: isFallback,
        };
      })
      .filter(c => c.is_fallback);

    // Group by similar names to find potential duplicates
    const nameGroups = new Map<string, typeof countries>();
    countries.forEach(c => {
      const normalized = c.name.toLowerCase().replace(/[^a-z]/g, '');
      if (!nameGroups.has(normalized)) {
        nameGroups.set(normalized, []);
      }
      nameGroups.get(normalized)!.push(c);
    });

    const duplicates = Array.from(nameGroups.entries())
      .filter(([_, group]) => group.length > 1)
      .map(([normalized, group]) => ({
        normalized_name: normalized,
        count: group.length,
        countries: group.map(c => ({
          id: c.id,
          name: c.name,
          slug: getCountrySlug(c.id),
        })),
      }));

    // Get countries with proper slugs
    const properSlugs = countries
      .map(c => {
        const slug = getCountrySlug(c.id);
        return {
          id: c.id,
          name: c.name,
          slug,
          is_fallback: slug.startsWith('country-'),
        };
      })
      .filter(c => !c.is_fallback);

    return NextResponse.json({
      total_active_countries: countries.length,
      countries_with_fallback_slug: slugIssues.length,
      countries_with_proper_slug: properSlugs.length,
      proper_slugs: properSlugs,
      fallback_slugs: slugIssues.slice(0, 20), // First 20 only
      potential_duplicates: duplicates.length,
      duplicates,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
