import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const productId = parseInt(id);

    if (isNaN(productId)) {
      return NextResponse.json(
        { error: "Geçersiz ürün ID" },
        { status: 400 }
      );
    }

    const { error } = await supabaseAdmin
      .from("products")
      .delete()
      .eq("id", productId);

    if (error) {
      console.error("Delete error:", error);
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
