import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      id,
      country_code,
      country_name,
      visa_status,
      allowed_stay,
      conditions,
      notes,
      application_method,
      available_methods,
    } = body;

    if (!country_code) {
      return NextResponse.json(
        { error: "country_code is required" },
        { status: 400 }
      );
    }

    // Determine primary visa_status from available_methods
    let primaryStatus = "visa-required";
    if (available_methods && available_methods.length > 0) {
      if (available_methods.includes("visa-free")) {
        primaryStatus = "visa-free";
      } else if (available_methods.includes("visa-on-arrival")) {
        primaryStatus = "visa-on-arrival";
      } else if (available_methods.includes("evisa")) {
        primaryStatus = "eta";
      } else if (available_methods.includes("embassy")) {
        primaryStatus = "visa-required";
      }
    }

    const updateData = {
      country_code,
      country_name,
      visa_status: primaryStatus,
      allowed_stay,
      conditions,
      notes,
      application_method: available_methods?.[0] || "embassy",
      available_methods: available_methods || [],
      updated_at: new Date().toISOString(),
    };

    // Upsert (insert or update)
    const { data, error } = await supabase
      .from("visa_requirements")
      .upsert(updateData, {
        onConflict: "country_code",
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // ⚡ CACHE INVALIDATION: Revalidate country page when visa requirements change
    try {
      // Get country slug from country_code
      const { data: country } = await supabase
        .from("countries")
        .select("slug")
        .eq("country_code", country_code)
        .maybeSingle();

      if (country?.slug) {
        // Revalidate the specific country page
        revalidatePath(`/tr/${country.slug}`);
        revalidatePath(`/en/${country.slug}`);
        revalidatePath(`/${country.slug}`);
        console.log(`✅ Cache revalidated for: /${country.slug}`);
      }

      // Revalidate all country pages
      revalidatePath("/[locale]/[slug]", "page");
    } catch (cacheError) {
      console.error("Cache revalidation error:", cacheError);
      // Don't fail the request if cache revalidation fails
    }

    return NextResponse.json({
      success: true,
      requirement: data,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
