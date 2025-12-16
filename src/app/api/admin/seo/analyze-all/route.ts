import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Create server-side Supabase client with service role key
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

interface RichSnippet {
  type: string;
  available: boolean;
  fields?: string[];
}

interface SEOScore {
  id: number;
  type: 'blog' | 'country' | 'page';
  title: string;
  slug?: string;
  url: string;
  score: number;
  issues: string[];
  suggestions: string[];
  meta_title_length: number;
  meta_description_length: number;
  content_word_count: number;
  has_meta_title: boolean;
  has_meta_description: boolean;
  has_content: boolean;
  status: 'excellent' | 'good' | 'needs_improvement' | 'poor';
  publish_status: 'published' | 'draft';
  // TR/EN comparison fields
  locale: 'tr' | 'en';
  tr_score?: number;
  en_score?: number;
  tr_issues?: string[];
  en_issues?: string[];
  // Rich Snippets
  rich_snippets?: RichSnippet[];
  // Raw data for editing
  raw_data?: {
    meta_title?: string;
    meta_title_en?: string;
    description?: string;
    description_en?: string;
    title?: string;
    title_en?: string;
    contents?: string;
    contents_en?: string;
  };
}

function analyzeContent(content: string): {
  word_count: number;
  has_headings: boolean;
  has_images: boolean;
} {
  const word_count = content.trim().split(/\s+/).length;
  const has_headings = /#{1,3}\s/.test(content);
  const has_images = /!\[.*?\]\(.*?\)/.test(content);
  
  return { word_count, has_headings, has_images };
}

// Analyze Rich Snippets availability for different content types
function analyzeRichSnippets(item: any, type: string): RichSnippet[] {
  const snippets: RichSnippet[] = [];
  
  if (type === 'country') {
    // Breadcrumb Schema - always available for countries
    snippets.push({
      type: 'Breadcrumb',
      available: true,
      fields: ['Ana Sayfa', 'Ülke Adı'],
    });
    
    // FAQ Schema - requires questions
    const hasFAQ = item.has_faq || false; // Will be set from questions count
    snippets.push({
      type: 'FAQ',
      available: hasFAQ,
      fields: hasFAQ ? ['Sorular', 'Cevaplar'] : [],
    });
    
    // HowTo Schema - always generated for visa process
    snippets.push({
      type: 'HowTo',
      available: true,
      fields: ['Vize Başvuru Adımları'],
    });
    
    // Product Schema - requires products/packages
    const hasProducts = item.has_products || false;
    snippets.push({
      type: 'Product',
      available: hasProducts,
      fields: hasProducts ? ['Paket Adı', 'Fiyat', 'Rating'] : [],
    });
    
    // Review Schema - requires comments
    const hasReviews = item.has_reviews || false;
    snippets.push({
      type: 'Review',
      available: hasReviews,
      fields: hasReviews ? ['Yorumlar', 'Puanlar'] : [],
    });
    
    // Organization Schema - always available
    snippets.push({
      type: 'Organization',
      available: true,
      fields: ['Şirket Bilgileri', 'İletişim'],
    });
  } else if (type === 'blog') {
    // Article Schema
    const hasImage = item.image_url || item.image;
    const hasDate = item.created_at || item.published_at;
    snippets.push({
      type: 'Article',
      available: !!(hasImage && hasDate),
      fields: hasImage && hasDate ? ['Başlık', 'Görsel', 'Tarih', 'Yazar'] : [],
    });
    
    // Breadcrumb Schema
    snippets.push({
      type: 'Breadcrumb',
      available: true,
      fields: ['Ana Sayfa', 'Blog', 'Yazı'],
    });
    
    // FAQ Schema - if content has Q&A format
    const contentHasFAQ = (item.contents || '').includes('?') && (item.contents || '').length > 500;
    snippets.push({
      type: 'FAQ',
      available: contentHasFAQ,
      fields: contentHasFAQ ? ['İçerikten çıkarılabilir'] : [],
    });
  } else if (type === 'page') {
    // WebPage Schema
    snippets.push({
      type: 'WebPage',
      available: true,
      fields: ['Başlık', 'Açıklama'],
    });
    
    // Breadcrumb Schema
    snippets.push({
      type: 'Breadcrumb',
      available: true,
      fields: ['Ana Sayfa', 'Sayfa'],
    });
  }
  
  return snippets;
}

function calculateSingleScore(
  meta_title: string,
  description: string,
  content: string,
  locale: 'tr' | 'en'
): { score: number; issues: string[]; suggestions: string[] } {
  let score = 0;
  const issues: string[] = [];
  const suggestions: string[] = [];
  const prefix = locale === 'en' ? '[EN] ' : '[TR] ';

  // Title analysis
  const meta_title_length = meta_title.length;

  if (meta_title_length === 0) {
    issues.push(`${prefix}Meta title eksik`);
    suggestions.push(`${prefix}Meta title ekleyin (50-60 karakter)`);
  } else if (meta_title_length < 30) {
    score += 5;
    issues.push(`${prefix}Meta title çok kısa (${meta_title_length})`);
    suggestions.push(`${prefix}Meta title uzunluğunu artırın (ideal: 50-60)`);
  } else if (meta_title_length >= 30 && meta_title_length <= 60) {
    score += 25;
  } else if (meta_title_length > 60 && meta_title_length <= 70) {
    score += 20;
    issues.push(`${prefix}Meta title biraz uzun (${meta_title_length})`);
  } else {
    score += 10;
    issues.push(`${prefix}Meta title çok uzun (${meta_title_length})`);
  }

  // Description analysis
  const meta_description_length = description.length;

  if (meta_description_length === 0) {
    issues.push(`${prefix}Meta description eksik`);
    suggestions.push(`${prefix}Meta description ekleyin (150-160 karakter)`);
  } else if (meta_description_length < 100) {
    score += 5;
    issues.push(`${prefix}Meta description çok kısa (${meta_description_length})`);
    suggestions.push(`${prefix}Meta description uzunluğunu artırın (ideal: 150-160)`);
  } else if (meta_description_length >= 100 && meta_description_length <= 160) {
    score += 25;
  } else if (meta_description_length > 160 && meta_description_length <= 180) {
    score += 20;
    issues.push(`${prefix}Meta description biraz uzun (${meta_description_length})`);
  } else {
    score += 10;
    issues.push(`${prefix}Meta description çok uzun (${meta_description_length})`);
  }

  // Content analysis
  const { word_count, has_headings, has_images } = analyzeContent(content);

  if (word_count === 0) {
    issues.push(`${prefix}İçerik eksik`);
    suggestions.push(`${prefix}İçerik ekleyin (minimum 300 kelime)`);
  } else if (word_count < 300) {
    score += 5;
    issues.push(`${prefix}İçerik çok kısa (${word_count} kelime)`);
  } else if (word_count >= 300 && word_count < 600) {
    score += 15;
    issues.push(`${prefix}İçerik kısa (${word_count} kelime)`);
  } else if (word_count >= 600 && word_count < 1000) {
    score += 25;
  } else {
    score += 30;
  }

  // Heading structure
  if (word_count > 0 && !has_headings) {
    score += 5;
    issues.push(`${prefix}Başlık yapısı eksik`);
  } else if (word_count > 0) {
    score += 10;
  }

  return { score, issues, suggestions };
}

function calculateSEOScore(item: any, type: string, locale: 'tr' | 'en' = 'tr'): SEOScore {
  const title = item.title || item.name || '';
  
  // Get TR values - prioritize meta fields, fallback to regular fields
  const tr_meta_title = item.meta_title || title;
  const tr_description = item.meta_description || item.description || '';
  const tr_content = item.contents || item.content || '';
  
  // Get EN values - prioritize meta fields, fallback to regular fields
  const en_meta_title = item.meta_title_en || item.title_en || '';
  const en_description = item.meta_description_en || item.description_en || '';
  const en_content = item.contents_en || item.content_en || '';
  
  // Calculate scores for both locales
  const trResult = calculateSingleScore(tr_meta_title, tr_description, tr_content, 'tr');
  const enResult = calculateSingleScore(en_meta_title, en_description, en_content, 'en');
  
  // Use requested locale for main score
  const mainResult = locale === 'en' ? enResult : trResult;
  const meta_title = locale === 'en' ? en_meta_title : tr_meta_title;
  const description = locale === 'en' ? en_description : tr_description;
  const content = locale === 'en' ? en_content : tr_content;
  
  const { word_count } = analyzeContent(content);

  // Determine status
  let status: 'excellent' | 'good' | 'needs_improvement' | 'poor';
  if (mainResult.score >= 80) status = 'excellent';
  else if (mainResult.score >= 60) status = 'good';
  else if (mainResult.score >= 40) status = 'needs_improvement';
  else status = 'poor';

  // Generate URL
  let url = '';
  if (type === 'blog') {
    url = item.slug ? `/blog/${item.slug}` : `/blog/${item.id}`;
  } else if (type === 'country') {
    const slug = item.slug || item.name?.toLowerCase().replace(/\s+/g, '-');
    url = `/${slug}`;
  } else if (type === 'page') {
    url = `/${item.slug}`;
  }

  // Determine publish status
  let publish_status: 'published' | 'draft' = 'draft';
  if (type === 'blog' || type === 'country') {
    publish_status = item.status === 1 ? 'published' : 'draft';
  } else if (type === 'page') {
    publish_status = item.is_published ? 'published' : 'draft';
  }

  // Analyze Rich Snippets
  const rich_snippets = analyzeRichSnippets(item, type);

  return {
    id: item.id,
    type: type as any,
    title: title,
    slug: item.slug,
    url,
    score: mainResult.score,
    issues: mainResult.issues,
    suggestions: mainResult.suggestions,
    meta_title_length: meta_title.length,
    meta_description_length: description.length,
    content_word_count: word_count,
    has_meta_title: meta_title.length > 0,
    has_meta_description: description.length > 0,
    has_content: content.length > 0,
    status,
    publish_status,
    locale,
    tr_score: trResult.score,
    en_score: enResult.score,
    tr_issues: trResult.issues,
    en_issues: enResult.issues,
    rich_snippets,
    raw_data: {
      meta_title: tr_meta_title,
      meta_title_en: en_meta_title,
      description: tr_description,
      description_en: en_description,
      title: title,
      title_en: item.title_en || '',
      contents: tr_content,
      contents_en: en_content,
    },
  };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'all', 'blog', 'country', 'page'
    const status = searchParams.get('status'); // 'excellent', 'good', 'needs_improvement', 'poor'
    const sort = searchParams.get('sort') || 'score_desc'; // 'score_asc', 'score_desc', 'title_asc', 'title_desc'

    const results: SEOScore[] = [];
    const errors: string[] = [];

    // Fetch blogs
    if (!type || type === 'all' || type === 'blog') {
      try {
        const { data: blogs, error: blogsError } = await supabase
          .from('blogs')
          .select('id, title, title_en, slug, meta_title, meta_title_en, description, description_en, contents, contents_en, status, image_url, created_at');

        if (blogsError) {
          console.error('Blogs fetch error:', blogsError);
          errors.push(`Blogs: ${blogsError.message}`);
        }

        if (blogs && blogs.length > 0) {
          // Get slugs from taxonomies for blogs without slug
          const blogsWithoutSlug = blogs.filter(b => !b.slug);
          let slugMap = new Map<number, string>();
          
          if (blogsWithoutSlug.length > 0) {
            const blogIds = blogsWithoutSlug.map(b => b.id);
            const { data: taxonomies } = await supabase
              .from('taxonomies')
              .select('model_id, slug')
              .in('model_id', blogIds)
              .like('type', '%Blog%');
            
            slugMap = new Map(taxonomies?.map(t => [t.model_id, t.slug]) || []);
          }
          
          blogs.forEach(blog => {
            // Use blog.slug if exists, otherwise use taxonomy slug
            const finalSlug = blog.slug || slugMap.get(blog.id);
            const blogWithSlug = { ...blog, slug: finalSlug };
            results.push(calculateSEOScore(blogWithSlug, 'blog'));
          });
        }
      } catch (e: any) {
        console.error('Blogs processing error:', e);
        errors.push(`Blogs processing: ${e.message}`);
      }
    }

    // Fetch countries
    if (!type || type === 'all' || type === 'country') {
      try {
        const { data: countries, error: countriesError } = await supabase
          .from('countries')
          .select('id, name, slug, title, title_en, meta_title, meta_title_en, meta_description, meta_description_en, description, description_en, contents, contents_en, status');

        if (countriesError) {
          console.error('Countries fetch error:', countriesError);
          errors.push(`Countries: ${countriesError.message}`);
        }

        if (countries && countries.length > 0) {
          countries.forEach(country => {
            results.push(calculateSEOScore(country, 'country'));
          });
        }
      } catch (e: any) {
        console.error('Countries processing error:', e);
        errors.push(`Countries processing: ${e.message}`);
      }
    }

    // Fetch custom pages
    if (!type || type === 'all' || type === 'page') {
      try {
        const { data: pages, error: pagesError } = await supabase
          .from('custom_pages')
          .select('id, slug, title, title_en, meta_description, meta_description_en, content, content_en, is_published');

        if (pagesError) {
          console.error('Pages fetch error:', pagesError);
          errors.push(`Pages: ${pagesError.message}`);
        }

        if (pages && pages.length > 0) {
          pages.forEach(page => {
            results.push(calculateSEOScore(page, 'page'));
          });
        }
      } catch (e: any) {
        console.error('Pages processing error:', e);
        errors.push(`Pages processing: ${e.message}`);
      }
    }

    // Filter by status
    let filteredResults = results;
    if (status && status !== 'all') {
      filteredResults = results.filter(r => r.status === status);
    }

    // Sort results
    filteredResults.sort((a, b) => {
      switch (sort) {
        case 'score_asc':
          return a.score - b.score;
        case 'score_desc':
          return b.score - a.score;
        case 'title_asc':
          return a.title.localeCompare(b.title);
        case 'title_desc':
          return b.title.localeCompare(a.title);
        default:
          return b.score - a.score;
      }
    });

    // Calculate statistics
    const stats = {
      total: filteredResults.length,
      excellent: filteredResults.filter(r => r.status === 'excellent').length,
      good: filteredResults.filter(r => r.status === 'good').length,
      needs_improvement: filteredResults.filter(r => r.status === 'needs_improvement').length,
      poor: filteredResults.filter(r => r.status === 'poor').length,
      average_score: filteredResults.length > 0
        ? Math.round(filteredResults.reduce((sum, r) => sum + r.score, 0) / filteredResults.length)
        : 0,
    };

    return NextResponse.json({
      success: true,
      results: filteredResults,
      stats,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error: any) {
    console.error('SEO analysis error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
