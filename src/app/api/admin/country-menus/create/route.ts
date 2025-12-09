import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      country_id, 
      slug, 
      meta_title, 
      meta_description,
      meta_title_en,
      meta_description_en,
      ...menuData 
    } = body;

    // Check if this is a category (parent_id = 0 or null)
    const isCategory = !menuData.parent_id || menuData.parent_id === 0;

    // Insert menu
    const { data: menu, error: menuError } = await supabase
      .from("country_menus")
      .insert(menuData)
      .select()
      .single();

    if (menuError) {
      return NextResponse.json({ error: menuError.message }, { status: 500 });
    }

    // Insert country relation
    if (country_id && menu) {
      const { error: relError } = await supabase
        .from("country_to_menus")
        .insert({
          country_id,
          country_menu_id: menu.id,
        });

      if (relError) {
        console.error("Error creating relation:", relError);
      }
    }

    // Only create taxonomy for sub-pages (not categories)
    if (!isCategory && slug && menu) {
      const { error: taxError } = await supabase
        .from("taxonomies")
        .insert({
          model_id: menu.id,
          slug,
          type: "Country\\CountryController@menuDetail",
          title: meta_title || menuData.name,
          description: meta_description || menuData.description,
          title_en: meta_title_en || null,
          description_en: meta_description_en || null,
        });

      if (taxError) {
        console.error("Error creating taxonomy:", taxError);
      }
    }

    return NextResponse.json({ success: true, menu });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
