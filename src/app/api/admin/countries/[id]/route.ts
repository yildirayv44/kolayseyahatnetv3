import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Server-side Supabase client with service role (bypasses RLS)
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // 1. Ülkeyi güncelle
    const { data, error } = await supabase
      .from("countries")
      .update(body)
      .eq("id", id)
      .select();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // 2. Taxonomy'yi güncelle (slug değiştiyse)
    if (body.slug) {
      // Önce mevcut taxonomy var mı kontrol et
      const { data: existingTax } = await supabase
        .from("taxonomies")
        .select("id")
        .eq("model_id", id)
        .eq("type", "Country\\CountryController@detail")
        .maybeSingle();

      if (existingTax) {
        // Varsa güncelle
        await supabase
          .from("taxonomies")
          .update({ slug: body.slug })
          .eq("id", existingTax.id);
      } else {
        // Yoksa oluştur
        await supabase
          .from("taxonomies")
          .insert([
            {
              model_id: parseInt(id),
              slug: body.slug,
              type: "Country\\CountryController@detail",
            },
          ]);
      }
    }

    return NextResponse.json({ data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
