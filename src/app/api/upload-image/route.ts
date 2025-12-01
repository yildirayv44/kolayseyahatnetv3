import { NextRequest, NextResponse } from "next/server";
import { uploadImage, validateImageFile, STORAGE_BUCKETS } from "@/lib/storage";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const bucket = formData.get("bucket") as string;

    if (!file) {
      return NextResponse.json(
        { error: "Dosya bulunamadı" },
        { status: 400 }
      );
    }

    // Validate bucket
    const validBuckets = Object.values(STORAGE_BUCKETS);
    if (!validBuckets.includes(bucket as any)) {
      return NextResponse.json(
        { error: "Geçersiz bucket" },
        { status: 400 }
      );
    }

    // Validate file
    const validation = validateImageFile(file);
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    // Upload to Supabase Storage
    const result = await uploadImage(file, bucket);

    if ("error" in result) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      url: result.url,
      path: result.path,
    });
  } catch (error: any) {
    console.error("Upload API error:", error);
    return NextResponse.json(
      { error: "Yükleme başarısız" },
      { status: 500 }
    );
  }
}
