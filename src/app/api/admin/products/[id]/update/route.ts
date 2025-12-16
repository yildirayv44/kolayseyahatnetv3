import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const productId = parseInt(id);
    const body = await request.json();

    if (isNaN(productId)) {
      return NextResponse.json(
        { error: "Geçersiz ürün ID" },
        { status: 400 }
      );
    }

    const { error } = await supabaseAdmin
      .from("products")
      .update(body)
      .eq("id", productId);

    if (error) {
      console.error("Update error:", error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
