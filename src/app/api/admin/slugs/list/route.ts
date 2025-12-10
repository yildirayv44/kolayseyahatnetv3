import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function GET() {
  try {
    // Get all taxonomies
    const { data: taxonomies, error: taxError } = await supabase
      .from("taxonomies")
      .select("id, slug, type, model_id")
      .order("slug");

    if (taxError) throw taxError;

    if (!taxonomies) {
      return NextResponse.json({ slugs: [] });
    }

    // Get content details based on type
    const slugsWithContent = await Promise.all(
      taxonomies.map(async (tax) => {
        let content_name = "Unknown";
        let status = 0;
        let url = `https://www.kolayseyahat.net/${tax.slug}`;

        try {
          if (tax.type === "Country\\CountryController@menuDetail") {
            const { data: menu } = await supabase
              .from("country_menus")
              .select("name, status")
              .eq("id", tax.model_id)
              .maybeSingle();

            if (menu) {
              content_name = menu.name;
              status = menu.status;
            }
          } else if (
            tax.type === "Blog\\BlogController@detail" ||
            tax.type === "Country\\CountryController@blogDetail"
          ) {
            const { data: blog } = await supabase
              .from("blogs")
              .select("title, status")
              .eq("id", tax.model_id)
              .maybeSingle();

            if (blog) {
              content_name = blog.title;
              status = blog.status;
            }
          } else if (tax.type === "Country\\CountryController@detail") {
            const { data: country } = await supabase
              .from("countries")
              .select("name, status")
              .eq("id", tax.model_id)
              .maybeSingle();

            if (country) {
              content_name = country.name;
              status = country.status;
            }
          } else if (tax.type === "Consultant\\ConsultantController@detail") {
            const { data: consultant } = await supabase
              .from("consultants")
              .select("name, status")
              .eq("id", tax.model_id)
              .maybeSingle();

            if (consultant) {
              content_name = consultant.name;
              status = consultant.status;
            }
          }
        } catch (error) {
          console.error(`Error fetching content for ${tax.id}:`, error);
        }

        return {
          id: tax.id,
          slug: tax.slug,
          type: tax.type,
          model_id: tax.model_id,
          content_name,
          status,
          url,
        };
      })
    );

    return NextResponse.json({ slugs: slugsWithContent });
  } catch (error: any) {
    console.error("Error listing slugs:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
