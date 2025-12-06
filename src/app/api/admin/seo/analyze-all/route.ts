import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

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

function calculateSEOScore(item: any, type: string): SEOScore {
  let score = 0;
  const issues: string[] = [];
  const suggestions: string[] = [];

  // Title analysis
  const title = item.title || item.name || '';
  const meta_title = item.meta_title || title;
  const meta_title_length = meta_title.length;
  const has_meta_title = meta_title_length > 0;

  if (meta_title_length === 0) {
    issues.push('Meta title eksik');
    suggestions.push('Meta title ekleyin (50-60 karakter)');
  } else if (meta_title_length < 30) {
    score += 5;
    issues.push('Meta title çok kısa');
    suggestions.push(`Meta title uzunluğunu artırın (şu an: ${meta_title_length}, ideal: 50-60)`);
  } else if (meta_title_length >= 30 && meta_title_length <= 60) {
    score += 25;
  } else if (meta_title_length > 60 && meta_title_length <= 70) {
    score += 20;
    issues.push('Meta title biraz uzun');
    suggestions.push(`Meta title kısaltın (şu an: ${meta_title_length}, ideal: 50-60)`);
  } else {
    score += 10;
    issues.push('Meta title çok uzun');
    suggestions.push(`Meta title kısaltın (şu an: ${meta_title_length}, ideal: 50-60)`);
  }

  // Description analysis
  const description = item.description || item.meta_description || '';
  const meta_description_length = description.length;
  const has_meta_description = meta_description_length > 0;

  if (meta_description_length === 0) {
    issues.push('Meta description eksik');
    suggestions.push('Meta description ekleyin (150-160 karakter)');
  } else if (meta_description_length < 100) {
    score += 5;
    issues.push('Meta description çok kısa');
    suggestions.push(`Meta description uzunluğunu artırın (şu an: ${meta_description_length}, ideal: 150-160)`);
  } else if (meta_description_length >= 100 && meta_description_length <= 160) {
    score += 25;
  } else if (meta_description_length > 160 && meta_description_length <= 180) {
    score += 20;
    issues.push('Meta description biraz uzun');
    suggestions.push(`Meta description kısaltın (şu an: ${meta_description_length}, ideal: 150-160)`);
  } else {
    score += 10;
    issues.push('Meta description çok uzun');
    suggestions.push(`Meta description kısaltın (şu an: ${meta_description_length}, ideal: 150-160)`);
  }

  // Content analysis
  const content = item.contents || item.content || '';
  const has_content = content.length > 0;
  const { word_count, has_headings, has_images } = analyzeContent(content);

  if (word_count === 0) {
    issues.push('İçerik eksik');
    suggestions.push('İçerik ekleyin (minimum 300 kelime)');
  } else if (word_count < 300) {
    score += 5;
    issues.push('İçerik çok kısa');
    suggestions.push(`İçerik uzunluğunu artırın (şu an: ${word_count}, ideal: 1000+)`);
  } else if (word_count >= 300 && word_count < 600) {
    score += 15;
    issues.push('İçerik kısa');
    suggestions.push(`Daha detaylı içerik ekleyin (şu an: ${word_count}, ideal: 1000+)`);
  } else if (word_count >= 600 && word_count < 1000) {
    score += 25;
    suggestions.push(`İçerik iyi, daha da geliştirilebilir (şu an: ${word_count}, ideal: 1000+)`);
  } else {
    score += 30;
  }

  // Heading structure
  if (word_count > 0) {
    if (!has_headings) {
      score += 5;
      issues.push('Başlık yapısı eksik');
      suggestions.push('H2 ve H3 başlıkları ekleyin');
    } else {
      score += 10;
    }
  }

  // Images
  if (word_count > 0) {
    if (!has_images) {
      score += 5;
      issues.push('Görsel eksik');
      suggestions.push('İçeriğe görseller ekleyin');
    } else {
      score += 10;
    }
  }

  // Determine status
  let status: 'excellent' | 'good' | 'needs_improvement' | 'poor';
  if (score >= 80) status = 'excellent';
  else if (score >= 60) status = 'good';
  else if (score >= 40) status = 'needs_improvement';
  else status = 'poor';

  // Generate URL
  let url = '';
  if (type === 'blog') {
    // Use slug if available, otherwise use ID
    url = item.slug ? `/blog/${item.slug}` : `/blog/${item.id}`;
  } else if (type === 'country') {
    const slug = item.slug || item.name?.toLowerCase().replace(/\s+/g, '-');
    url = `/${slug}`;
  } else if (type === 'page') {
    url = `/${item.slug}`;
  }

  return {
    id: item.id,
    type: type as any,
    title: title,
    slug: item.slug,
    url,
    score,
    issues,
    suggestions,
    meta_title_length,
    meta_description_length,
    content_word_count: word_count,
    has_meta_title,
    has_meta_description,
    has_content,
    status,
  };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'all', 'blog', 'country', 'page'
    const status = searchParams.get('status'); // 'excellent', 'good', 'needs_improvement', 'poor'
    const sort = searchParams.get('sort') || 'score_desc'; // 'score_asc', 'score_desc', 'title_asc', 'title_desc'

    const results: SEOScore[] = [];

    // Fetch blogs
    if (!type || type === 'all' || type === 'blog') {
      const { data: blogs, error: blogsError } = await supabase
        .from('blogs')
        .select('id, title, slug, meta_title, description, contents, status');
        // Removed status filter to show all blogs

      if (blogsError) {
        console.error('Blogs fetch error:', blogsError);
      }

      if (blogs && blogs.length > 0) {
        blogs.forEach(blog => {
          results.push(calculateSEOScore(blog, 'blog'));
        });
      }
    }

    // Fetch countries
    if (!type || type === 'all' || type === 'country') {
      const { data: countries, error: countriesError } = await supabase
        .from('countries')
        .select('id, name, slug, title, meta_title, description, contents, status');
        // Removed status filter to show all countries

      if (countriesError) {
        console.error('Countries fetch error:', countriesError);
      }

      if (countries && countries.length > 0) {
        countries.forEach(country => {
          results.push(calculateSEOScore(country, 'country'));
        });
      }
    }

    // Fetch custom pages
    if (!type || type === 'all' || type === 'page') {
      const { data: pages, error: pagesError } = await supabase
        .from('custom_pages')
        .select('id, slug, title, meta_description, content, is_published');
        // Removed is_published filter to show all pages

      if (pagesError) {
        console.error('Pages fetch error:', pagesError);
      }

      if (pages && pages.length > 0) {
        pages.forEach(page => {
          results.push(calculateSEOScore(page, 'page'));
        });
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
    });
  } catch (error: any) {
    console.error('SEO analysis error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
