import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const dryRun = searchParams.get('dry_run') !== 'false';
  return handleSEOFix(dryRun);
}

export async function POST() {
  return handleSEOFix(false);
}

async function handleSEOFix(dryRun: boolean = true) {
  try {
    const { data: countries, error } = await supabase
      .from("countries")
      .select("id, name, title, meta_title, meta_description, description")
      .eq("status", 1);

    if (error) throw error;

    const updates: any[] = [];
    let fixed = 0;

    for (const country of countries || []) {
      let needsUpdate = false;
      const updates_data: any = {};
      const before: any = {
        title: country.title,
        meta_title: country.meta_title,
        meta_description: country.meta_description,
      };

      // 1. Fix title - remove "- Kolay Seyahat" or "| Kolay Seyahat" if present
      if (country.title && (country.title.includes("- Kolay Seyahat") || country.title.includes("| Kolay Seyahat"))) {
        updates_data.title = country.title.replace(/\s*[-|]\s*Kolay Seyahat\s*$/i, "").trim();
        needsUpdate = true;
      }

      // 2. Fix meta_title - ensure it has "- Kolay Seyahat" at the end (not pipe)
      const hasCorrectFormat = country.meta_title && 
                              country.meta_title.includes("- Kolay Seyahat") &&
                              !country.meta_title.includes("| Kolay Seyahat");
      
      if (!country.meta_title || !hasCorrectFormat) {
        // Create meta title from title or name
        const baseTitle = country.title || `${country.name} Vizesi`;
        const cleanTitle = baseTitle.replace(/\s*[-|]\s*Kolay Seyahat\s*$/i, "").trim();
        updates_data.meta_title = `${cleanTitle} - Kolay Seyahat`;
        needsUpdate = true;
      }

      // 3. Fix meta_description - ensure it exists and is at least 120 chars
      if (!country.meta_description || country.meta_description.length < 120) {
        // Use description or create one
        if (country.description && country.description.length >= 120) {
          updates_data.meta_description = country.description.substring(0, 155);
        } else {
          updates_data.meta_description = `${country.name} vizesi için profesyonel danışmanlık hizmeti. Kolay Seyahat ile vize başvurunuzu hızlı ve güvenli şekilde tamamlayın. Uzman ekibimiz size yardımcı olmak için hazır.`;
        }
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
            fixed++;
          }
        } else {
          fixed++;
        }
        
        updates.push({
          id: country.id,
          name: country.name,
          before: before,
          after: updates_data,
        });
      }
    }

    return NextResponse.json({
      success: true,
      total_countries: countries?.length || 0,
      fixed_countries: fixed,
      updates: updates,
    });
  } catch (error: any) {
    console.error("Error fixing SEO:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
