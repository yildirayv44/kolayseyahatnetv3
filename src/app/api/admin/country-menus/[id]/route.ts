import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Fetch menu
    const { data: menu, error: menuError } = await supabase
      .from("country_menus")
      .select("*")
      .eq("id", id)
      .single();

    if (menuError) {
      return NextResponse.json({ error: menuError.message }, { status: 500 });
    }

    // Fetch country relation
    const { data: relation } = await supabase
      .from("country_to_menus")
      .select("country_id")
      .eq("country_menu_id", id)
      .maybeSingle();

    // Fetch slug and meta from taxonomies
    const { data: taxonomy } = await supabase
      .from("taxonomies")
      .select("slug, title, description, title_en, description_en")
      .eq("model_id", id)
      .eq("type", "Country\\CountryController@menuDetail")
      .maybeSingle();

    return NextResponse.json({
      menu: {
        ...menu,
        slug: taxonomy?.slug || menu.slug || null,
        meta_title: taxonomy?.title || null,
        meta_description: taxonomy?.description || null,
        meta_title_en: taxonomy?.title_en || null,
        meta_description_en: taxonomy?.description_en || null,
        country_id: relation?.country_id || null,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    // Update menu (without slug and meta, they're stored in taxonomies)
    const { error: menuError } = await supabase
      .from("country_menus")
      .update(menuData)
      .eq("id", id);

    if (menuError) {
      return NextResponse.json({ error: menuError.message }, { status: 500 });
    }

    // Update slug and meta in taxonomies
    if (slug || meta_title || meta_description || meta_title_en || meta_description_en) {
      const updateData: any = {};
      if (slug) updateData.slug = slug;
      if (meta_title !== undefined) updateData.title = meta_title;
      if (meta_description !== undefined) updateData.description = meta_description;
      if (meta_title_en !== undefined) updateData.title_en = meta_title_en;
      if (meta_description_en !== undefined) updateData.description_en = meta_description_en;

      const { error: taxError } = await supabase
        .from("taxonomies")
        .update(updateData)
        .eq("model_id", id)
        .eq("type", "Country\\CountryController@menuDetail");

      if (taxError) {
        console.error("Error updating taxonomy:", taxError);
      }
    }

    // Update country relation
    if (country_id) {
      // Delete old relation
      await supabase
        .from("country_to_menus")
        .delete()
        .eq("country_menu_id", id);

      // Insert new relation
      const { error: relError } = await supabase
        .from("country_to_menus")
        .insert({
          country_id,
          country_menu_id: Number(id),
        });

      if (relError) {
        console.error("Error updating relation:", relError);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Delete relation first
    await supabase
      .from("country_to_menus")
      .delete()
      .eq("country_menu_id", id);
    
    // Delete menu
    const { error } = await supabase
      .from("country_menus")
      .delete()
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
