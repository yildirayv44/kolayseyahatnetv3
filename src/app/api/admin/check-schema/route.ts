import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    // Get one country to see its structure
    const { data, error } = await supabase
      .from("countries")
      .select("*")
      .limit(1)
      .single();

    if (error) {
      return NextResponse.json({
        success: false,
        error: error.message,
        availableColumns: []
      });
    }

    const availableColumns = data ? Object.keys(data) : [];

    return NextResponse.json({
      success: true,
      availableColumns,
      sampleData: data
    });

  } catch (error: any) {
    return NextResponse.json(
      { 
        success: false, 
        error: error.message 
      },
      { status: 500 }
    );
  }
}
