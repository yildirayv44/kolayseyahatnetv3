import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    // Fetch all menus
    const { data: menus, error: menusError } = await supabase
      .from("country_menus")
      .select("*")
      .order("sorted");

    if (menusError) {
      return NextResponse.json({ error: menusError.message }, { status: 500 });
    }

    // Fetch country relations from pivot table
    const { data: relations, error: relError } = await supabase
      .from("country_to_menus")
      .select("country_id, country_menu_id");

    if (relError) {
      console.error("Error fetching relations:", relError);
    }

    // Fetch all countries for mapping
    const { data: countries, error: countriesError } = await supabase
      .from("countries")
      .select("id, name, slug")
      .eq("status", 1);

    if (countriesError) {
      console.error("Error fetching countries:", countriesError);
    }

    // Fetch slugs from taxonomies
    const menuIds = (menus || []).map(m => m.id);
    const { data: taxonomies } = await supabase
      .from("taxonomies")
      .select("model_id, slug")
      .eq("type", "Country\\CountryController@menuDetail")
      .in("model_id", menuIds);

    // Map country_id and slug to each menu
    const menusWithCountries = (menus || []).map(menu => {
      const relation = relations?.find(r => r.country_menu_id === menu.id);
      const country = relation ? countries?.find(c => c.id === relation.country_id) : null;
      const taxonomy = taxonomies?.find(t => t.model_id === menu.id);
      
      return {
        ...menu,
        slug: taxonomy?.slug || menu.slug || null,
        country_id: relation?.country_id || null,
        country: country || null,
      };
    });

    return NextResponse.json({ menus: menusWithCountries });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
