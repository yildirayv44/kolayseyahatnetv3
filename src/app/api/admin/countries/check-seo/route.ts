import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    const { data: countries, error } = await supabase
      .from("countries")
      .select("id, name, title, meta_title, meta_description, created_at")
      .eq("status", 1)
      .order("created_at", { ascending: false });

    if (error) throw error;

    const issues: any[] = [];

    countries?.forEach((country) => {
      const hasKolayInTitle = country.title && country.title.includes("- Kolay Seyahat");
      const hasKolayInMeta = country.meta_title && country.meta_title.includes("Kolay Seyahat");
      const noMetaDesc = !country.meta_description || country.meta_description.length < 120;
      const noMetaTitle = !country.meta_title;

      // Only flag as issue if there's actually a problem
      const hasIssue = hasKolayInTitle || !hasKolayInMeta || noMetaDesc || noMetaTitle;

      if (hasIssue) {
        issues.push({
          id: country.id,
          name: country.name,
          title: country.title,
          meta_title: country.meta_title,
          meta_description: country.meta_description,
          created_at: country.created_at,
          problems: {
            title_has_kolay: hasKolayInTitle,
            meta_missing_kolay: !hasKolayInMeta,
            meta_desc_missing: noMetaDesc,
            meta_title_missing: noMetaTitle,
          },
        });
      }
    });

    return NextResponse.json({
      total_countries: countries?.length || 0,
      countries_with_issues: issues.length,
      issues: issues,
      all_countries: countries?.map(c => ({
        id: c.id,
        name: c.name,
        meta_title: c.meta_title,
        meta_description: c.meta_description,
      })) || [],
    });
  } catch (error: any) {
    console.error("Error checking SEO:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
