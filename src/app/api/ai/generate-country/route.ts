import { NextRequest, NextResponse } from "next/server";
import { generateCountryContent } from "@/lib/openai";

export async function POST(request: NextRequest) {
  try {
    const { countryName } = await request.json();

    if (!countryName) {
      return NextResponse.json(
        { error: "Ülke adı gerekli" },
        { status: 400 }
      );
    }

    const content = await generateCountryContent(countryName);

    return NextResponse.json({ content });
  } catch (error: any) {
    console.error("Generate country error:", error);
    return NextResponse.json(
      { error: error.message || "İçerik oluşturulamadı" },
      { status: 500 }
    );
  }
}
