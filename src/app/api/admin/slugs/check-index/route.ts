import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json({ error: "URL required" }, { status: 400 });
    }

    // Check if URL is indexed in Google using site: search
    // Note: This uses a more reliable method with better error detection
    const searchUrl = `https://www.google.com/search?q=site:${encodeURIComponent(url)}`;
    
    try {
      const response = await fetch(searchUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7',
        }
      });

      const html = await response.text();
      
      // More comprehensive checks for indexed status
      const notIndexedPatterns = [
        'did not match any documents',
        'hiçbir belgeyle eşleşmedi',
        'Hiçbir belgeyle eşleşmedi',
        'sonuç bulunamadı',
        'No results found',
        'Aradığınız sayfayı bulamadık',
        '<div id="result-stats">0 sonuç',
        'About 0 results',
      ];

      // Check if any "not indexed" pattern exists
      const isNotIndexed = notIndexedPatterns.some(pattern => 
        html.toLowerCase().includes(pattern.toLowerCase())
      );

      // Check for positive indicators (search result elements)
      const hasSearchResults = html.includes('class="g"') || // Google result container
                              html.includes('data-hveid') || // Google result attribute
                              html.includes('search?q='); // Search results page

      // If Google blocked us (CAPTCHA), return unknown
      if (html.includes('captcha') || html.includes('unusual traffic')) {
        return NextResponse.json({ 
          indexed: undefined,
          error: "Google blocked automated check - please verify manually",
          search_url: searchUrl,
          checked_at: new Date().toISOString()
        });
      }

      // Determine indexed status
      let indexed: boolean | undefined;
      if (isNotIndexed) {
        indexed = false;
      } else if (hasSearchResults) {
        indexed = true;
      } else {
        indexed = undefined; // Uncertain
      }

      return NextResponse.json({ 
        indexed,
        search_url: searchUrl,
        checked_at: new Date().toISOString()
      });
    } catch (fetchError) {
      // If fetch fails, return unknown status with search URL for manual check
      return NextResponse.json({ 
        indexed: undefined,
        error: "Could not check index status",
        search_url: searchUrl,
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
