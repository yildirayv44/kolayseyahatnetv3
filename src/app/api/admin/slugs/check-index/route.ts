import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json({ error: "URL required" }, { status: 400 });
    }

    // Check if URL is indexed in Google using site: search
    // Note: This is a simplified check. For production, consider using Google Search Console API
    const searchUrl = `https://www.google.com/search?q=site:${encodeURIComponent(url)}`;
    
    try {
      const response = await fetch(searchUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });

      const html = await response.text();
      
      // Check if Google returns results
      // This is a basic check - Google may block automated requests
      const isIndexed = !html.includes('did not match any documents') && 
                       !html.includes('hiçbir belgeyle eşleşmedi');

      return NextResponse.json({ 
        indexed: isIndexed,
        checked_at: new Date().toISOString()
      });
    } catch (fetchError) {
      // If fetch fails, return unknown status
      return NextResponse.json({ 
        indexed: undefined,
        error: "Could not check index status",
        checked_at: new Date().toISOString()
      });
    }
  } catch (error: any) {
    console.error("Error checking Google index:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
