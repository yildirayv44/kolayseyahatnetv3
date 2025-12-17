import { supabase } from "./supabase";

export async function getCountries() {
  const { data: countries, error } = await supabase
    .from("countries")
    .select("*")
    .eq("status", 1)
    .order("sorted", { ascending: true });

  if (error) {
    console.error("getCountries error", error);
    return [];
  }

  if (!countries) return [];

  // Import COUNTRY_ID_TO_SLUG from helpers
  const { COUNTRY_ID_TO_SLUG } = await import("./helpers");

  // Tüm ülke ID'lerini topla
  const countryIds = countries.map(c => c.id);

  // Tek sorguda tüm taxonomy'leri çek
  const { data: taxonomies } = await supabase
    .from("taxonomies")
    .select("model_id, slug")
    .in("model_id", countryIds)
    .eq("type", "Country\\CountryController@detail");

  // Tek sorguda tüm ülkelerin en düşük fiyatlı paketlerini çek (currency_id dahil)
  const { data: products } = await supabase
    .from("products")
    .select("country_id, price, currency_id")
    .in("country_id", countryIds)
    .eq("status", 1)
    .order("price", { ascending: true });

  // Ülke kodlarını topla
  const countryCodes = countries
    .map(c => c.country_code)
    .filter((code): code is string => !!code);

  // Vize gerekliliklerini çek (available_methods dahil)
  const { data: visaRequirements } = await supabase
    .from("visa_requirements")
    .select("country_code, visa_status, available_methods")
    .in("country_code", countryCodes);

  // Taxonomy map'i oluştur
  const taxonomyMap = new Map<number, string>();
  taxonomies?.forEach(tax => {
    taxonomyMap.set(tax.model_id, tax.slug);
  });

  // Her ülke için en düşük fiyatlı paketi bul (products zaten price'a göre sıralı)
  const priceMap = new Map<number, { price: number; currency_id: number }>();
  products?.forEach(product => {
    if (!priceMap.has(product.country_id)) {
      priceMap.set(product.country_id, {
        price: parseFloat(product.price),
        currency_id: product.currency_id || 1
      });
    }
  });

  // Vize gereklilikleri map'i oluştur
  const visaMap = new Map<string, { visa_status: string; available_methods: string[] | null }>();
  visaRequirements?.forEach(req => {
    visaMap.set(req.country_code, {
      visa_status: req.visa_status,
      available_methods: req.available_methods
    });
  });

  // Ülkelere slug'ları ve fiyatları ekle
  const countriesWithSlugs = countries.map(country => {
    // Öncelik sırası: taxonomy slug > mapping > fallback
    const slug = taxonomyMap.get(country.id) || COUNTRY_ID_TO_SLUG[country.id] || `country-${country.id}`;
    
    // Fiyat: products tablosundan en düşük fiyat ve para birimi
    const productData = priceMap.get(country.id);

    // Vize durumu: visa_requirements tablosundan
    const visaData = country.country_code ? visaMap.get(country.country_code) : null;
    const visaStatus = visaData?.visa_status || null;
    const availableMethods = visaData?.available_methods || [];
    
    // Vize durumu etiketlerini belirle (birden fazla yöntem olabilir)
    const visaLabels: string[] = [];
    let isVisaFree = false;
    
    // available_methods varsa onları kullan, yoksa visa_status'a bak
    const methodsToCheck = availableMethods.length > 0 ? availableMethods : (visaStatus ? [visaStatus] : []);
    
    methodsToCheck.forEach(method => {
      const m = method.toLowerCase();
      if (m === "visa_free" || m === "visa-free") {
        if (!visaLabels.includes("Vizesiz")) visaLabels.push("Vizesiz");
        isVisaFree = true;
      } else if (m === "visa_on_arrival" || m === "visa-on-arrival") {
        if (!visaLabels.includes("Varışta Vize")) visaLabels.push("Varışta Vize");
        isVisaFree = true;
      } else if (m.includes("eta") || m.includes("esta") || m.includes("evisa") || m === "e-visa") {
        if (!visaLabels.includes("E-vize")) visaLabels.push("E-vize");
      } else if (m === "embassy" || m === "visa-required" || m === "visa_required") {
        if (!visaLabels.includes("Vize Gerekli")) visaLabels.push("Vize Gerekli");
      }
    });
    
    // Eğer hiç etiket yoksa varsayılan olarak "Vize Gerekli" ekle
    if (visaLabels.length === 0 && visaStatus) {
      visaLabels.push("Vize Gerekli");
    }
    
    return {
      ...country,
      slug,
      // Fiyatı products tablosundan al, yoksa null
      price: productData?.price ?? null,
      currency_id: productData?.currency_id ?? 1,
      // Vize durumu
      visa_status: visaStatus,
      visa_labels: visaLabels,
      visa_label: visaLabels.join(" / ") || null,
      visa_required: !isVisaFree,
      available_methods: availableMethods,
      // original_price ve discount_percentage artık kullanılmıyor
      original_price: null,
      discount_percentage: null,
    };
  });

  return countriesWithSlugs;
}

export async function getCountryById(id: number) {
  const { data, error } = await supabase
    .from("countries")
    .select("*")
    .eq("id", id)
    .eq("status", 1)
    .maybeSingle();

  if (error) {
    console.error("getCountryById error", error);
    return null;
  }

  return data;
}

const COUNTRY_SLUG_FALLBACK: Record<string, number> = {
  amerika: 4,
  ingiltere: 6,
  yunanistan: 7,
  benin: 8,
  bahreyn: 10,
  rusya: 12,
  dubai: 14,
  fransa: 15,
  vietnam: 16,
  kenya: 17,
  uganda: 18,
  zambiya: 19,
  "guney-kore": 20,
  bhutan: 21,
  togo: 22,
  umman: 23,
  tanzanya: 24,
  "tayland-vizesi": 25,
  "kanada-vizesi": 26,
  kuveyt: 3,
};

export async function getCountryBySlug(slug: string) {
  // ⚡ OPTIMIZATION: Run all lookups in parallel to reduce latency
  const [countrySlugResult, directCountryResult, taxonomyResult] = await Promise.all([
    // Try country_slugs (multi-locale)
    supabase
      .from("country_slugs")
      .select("country_id")
      .eq("slug", slug)
      .eq("locale", "tr")
      .maybeSingle(),
    // Try direct slug match
    supabase
      .from("countries")
      .select("*")
      .eq("slug", slug)
      .eq("status", 1)
      .maybeSingle(),
    // Try taxonomies
    supabase
      .from("taxonomies")
      .select("model_id")
      .eq("slug", slug)
      .eq("type", "Country\\CountryController@detail")
      .maybeSingle(),
  ]);

  let country = null;

  // Priority 1: Direct slug match (fastest)
  if (directCountryResult.data) {
    country = directCountryResult.data;
  }
  // Priority 2: country_slugs lookup
  else if (countrySlugResult.data) {
    const { data: foundCountry } = await supabase
      .from("countries")
      .select("*")
      .eq("id", countrySlugResult.data.country_id)
      .eq("status", 1)
      .maybeSingle();
    if (foundCountry) country = foundCountry;
  }
  // Priority 3: taxonomies lookup
  else if (taxonomyResult.data) {
    const { data: foundCountry } = await supabase
      .from("countries")
      .select("*")
      .eq("id", taxonomyResult.data.model_id)
      .eq("status", 1)
      .maybeSingle();
    if (foundCountry) country = foundCountry;
  }

  if (!country) return null;

  // Get visa requirements (only if country found)
  if (country.country_code) {
    const { data: visaReqs } = await supabase
      .from("visa_requirements")
      .select("visa_status, allowed_stay, conditions, notes, application_method, available_methods")
      .eq("country_code", country.country_code)
      .limit(1);

    if (visaReqs && visaReqs.length > 0) {
      (country as any).visa_requirement = visaReqs;
    }
  }

  return country;
}

export async function getCountryMenus(countryId: number) {
  const { data: relations, error: relError } = await supabase
    .from("country_to_menus")
    .select("country_menu_id")
    .eq("country_id", countryId);

  if (relError || !relations?.length) return [];

  const ids = relations.map((r: { country_menu_id: number }) => r.country_menu_id);

  const { data: menus, error } = await supabase
    .from("country_menus")
    .select("*")
    .in("id", ids)
    .eq("status", 1)
    .order("sorted", { ascending: true });

  if (error) {
    console.error("getCountryMenus error", error);
    return [];
  }

  if (!menus) return [];

  // Get taxonomy slugs for each menu
  const menusWithSlugs = await Promise.all(
    menus.map(async (menu) => {
      const { data: taxonomy } = await supabase
        .from("taxonomies")
        .select("slug")
        .eq("model_id", menu.id)
        .eq("type", "Country\\CountryController@menuDetail")
        .maybeSingle();

      return {
        ...menu,
        taxonomy_slug: taxonomy?.slug || null,
      };
    })
  );

  return menusWithSlugs;
}

export async function getCountryMenuBySlug(slug: string) {
  // ⚡ OPTIMIZATION: Normalize slug (Turkish characters)
  const normalizedSlug = slug
    .toLowerCase()
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/Ğ/g, 'g')
    .replace(/Ü/g, 'u')
    .replace(/Ş/g, 's')
    .replace(/İ/g, 'i')
    .replace(/Ö/g, 'o')
    .replace(/Ç/g, 'c');

  // Get taxonomy by slug
  let { data: tax } = await supabase
    .from("taxonomies")
    .select("model_id, slug, type")
    .eq("slug", normalizedSlug)
    .eq("type", "Country\\CountryController@menuDetail")
    .maybeSingle();

  // Fallback: Try original slug
  if (!tax) {
    const result = await supabase
      .from("taxonomies")
      .select("model_id, slug, type")
      .eq("slug", slug)
      .eq("type", "Country\\CountryController@menuDetail")
      .maybeSingle();
    
    tax = result.data;
  }

  // Not found
  if (!tax) {
    return null;
  }

  const menuId = tax.model_id;

  // Get menu data
  const { data: menu, error: menuError } = await supabase
    .from("country_menus")
    .select("*")
    .eq("id", menuId)
    .eq("status", 1)
    .maybeSingle();

  if (menuError) {
    console.error("getCountryMenuBySlug menu error", menuError);
    return null;
  }

  console.log("✅ getCountryMenuBySlug - Menu found:", menu?.name);
  return menu;
}

export async function getCountryProducts(countryId: number) {
  const { data } = await supabase
    .from("products")
    .select("*")
    .eq("country_id", countryId)
    .eq("status", 1)
    .order("price", { ascending: true });

  return data || [];
}

export async function getCountryQuestions(countryId: number) {
  const { data: relations, error: relError } = await supabase
    .from("question_to_countries")
    .select("question_id")
    .eq("country_id", countryId);

  if (relError || !relations?.length) return [];

  const ids = relations.map((r: { question_id: number }) => r.question_id);

  const { data, error } = await supabase
    .from("questions")
    .select("*")
    .in("id", ids)
    .eq("status", 1);

  if (error) {
    console.error("getCountryQuestions error", error);
    return [];
  }

  if (!data || data.length === 0) return [];

  // Fetch answers for each question (answers are stored in questions table with parent_id)
  const questionsWithAnswers = await Promise.all(
    data.map(async (question) => {
      const { data: answers } = await supabase
        .from("questions")
        .select("id, title, contents")
        .eq("parent_id", question.id)
        .eq("status", 1);
      
      return {
        ...question,
        answers: answers || []
      };
    })
  );

  return questionsWithAnswers;
}

export async function getCountryBlogs(countryId: number) {
  const { data: relations, error: relError } = await supabase
    .from("country_to_blogs")
    .select("blog_id")
    .eq("country_id", countryId);

  if (relError || !relations?.length) return [];

  const ids = relations.map((r: { blog_id: number }) => r.blog_id);

  const { data: blogs, error } = await supabase
    .from("blogs")
    .select("*")
    .in("id", ids)
    .eq("status", 1)
    .limit(5);

  if (error) {
    console.error("getCountryBlogs error", error);
    return [];
  }

  if (!blogs) return [];

  // Her blog için taxonomy slug'ını al
  const blogsWithSlugs = await Promise.all(
    blogs.map(async (blog) => {
      // Önce Blog\\BlogController@detail dene
      let { data: taxonomy } = await supabase
        .from("taxonomies")
        .select("slug")
        .eq("model_id", blog.id)
        .eq("type", "Blog\\BlogController@detail")
        .maybeSingle();

      // Bulamazsa Country\\CountryController@blogDetail dene
      if (!taxonomy) {
        const result = await supabase
          .from("taxonomies")
          .select("slug")
          .eq("model_id", blog.id)
          .eq("type", "Country\\CountryController@blogDetail")
          .maybeSingle();
        taxonomy = result.data;
      }

      return {
        ...blog,
        taxonomy_slug: taxonomy?.slug || null,
      };
    })
  );

  return blogsWithSlugs;
}

export async function getBlogs(options?: { home?: number; limit?: number }) {
  let query = supabase
    .from("blogs")
    .select("*")
    .eq("status", 1)
    .order("created_at", { ascending: false });

  if (options?.home !== undefined) {
    query = query.eq("home", options.home);
  }
  if (options?.limit) {
    query = query.limit(options.limit);
  }

  const { data: blogs, error } = await query;

  if (error) {
    console.error("getBlogs error", error);
    return [];
  }

  if (!blogs) return [];

  // Tüm blog ID'lerini topla
  const blogIds = blogs.map(b => b.id);

  // Tek sorguda tüm taxonomy'leri çek
  const { data: taxonomies } = await supabase
    .from("taxonomies")
    .select("model_id, slug, type")
    .in("model_id", blogIds)
    .in("type", ["Blog\\BlogController@detail", "Country\\CountryController@blogDetail"]);

  // Taxonomy map'i oluştur (öncelik Blog\\BlogController@detail)
  const taxonomyMap = new Map<number, string>();
  taxonomies?.forEach(tax => {
    if (!taxonomyMap.has(tax.model_id) || tax.type === "Blog\\BlogController@detail") {
      taxonomyMap.set(tax.model_id, tax.slug);
    }
  });

  // Blog'lara slug'ları ekle
  const blogsWithSlugs = blogs.map(blog => ({
    ...blog,
    taxonomy_slug: taxonomyMap.get(blog.id) || null,
  }));

  return blogsWithSlugs;
}

export async function getBlogBySlug(slug: string) {
  console.log("📝 getBlogBySlug - Original slug:", slug);
  
  // Try with blog/ prefix first, then without
  const slugsToTry = slug.startsWith('blog/') 
    ? [slug, slug.replace('blog/', '')] 
    : [slug, `blog/${slug}`];

  console.log("📝 getBlogBySlug - Trying slugs:", slugsToTry);

  let taxonomy = null;
  
  for (const trySlug of slugsToTry) {
    const { data, error } = await supabase
      .from("taxonomies")
      .select("model_id, slug, type")
      .eq("slug", trySlug)
      .or("type.eq.Blog\\BlogController@detail,type.eq.Country\\CountryController@blogDetail")
      .maybeSingle();
    
    console.log(`📝 getBlogBySlug - Tried "${trySlug}":`, data ? "Found" : "Not found");
    
    if (!error && data) {
      taxonomy = data;
      break;
    }
  }

  if (!taxonomy) {
    return null;
  }

  const { data: blog, error: blogError } = await supabase
    .from("blogs")
    .select("*")
    .eq("id", taxonomy.model_id)
    .eq("status", 1)
    .maybeSingle();

  if (blogError) {
    return null;
  }

  return blog;
}

export async function getConsultantBySlug(slug: string) {
  const { data: taxonomy, error: taxError } = await supabase
    .from("taxonomies")
    .select("model_id")
    .eq("slug", slug)
    .eq("type", "Profile\\ProfileController@index")
    .maybeSingle();

  if (taxError || !taxonomy) {
    return null;
  }

  const { data: consultant, error: consultantError } = await supabase
    .from("users")
    .select("*")
    .eq("id", taxonomy.model_id)
    .eq("is_web", 1)
    .is("deleted_at", null)
    .maybeSingle();

  if (consultantError) {
    return null;
  }

  return consultant;
}

export async function getConsultantComments(consultantId: number) {
  // Get top-level comments (no parent)
  // user_id = yorum yapan kullanıcı
  // comment_user_id = danışman ID
  const { data: comments, error } = await supabase
    .from("user_comments")
    .select("id, star, contents, created_at, user_id, likes_count, parent_id")
    .eq("comment_user_id", consultantId) // Danışman ID ile filtrele
    .eq("status", 1)
    .is("parent_id", null)
    .order("created_at", { ascending: false });
  
  if (error) {
    console.error("getConsultantComments error", error);
    return [];
  }

  if (!comments || comments.length === 0) {
    return [];
  }

  // Get replies for each comment
  const { data: allReplies } = await supabase
    .from("user_comments")
    .select("id, star, contents, created_at, user_id, likes_count, parent_id")
    .eq("comment_user_id", consultantId) // Danışman ID ile filtrele
    .eq("status", 1)
    .not("parent_id", "is", null)
    .order("created_at", { ascending: true });

  // Build comment tree
  const commentsWithUsers = await Promise.all(
    comments.map(async (comment: any) => {
      let userName = "Anonim";
      
      // user_id = yorum yapan kullanıcı
      if (comment.user_id) {
        const { data: user } = await supabase
          .from("users")
          .select("name")
          .eq("id", comment.user_id)
          .maybeSingle();
        
        if (user?.name) {
          userName = user.name;
        }
      }

      // Get replies for this comment
      const replies = allReplies?.filter((r: any) => r.parent_id === comment.id) || [];
      const repliesWithUsers = await Promise.all(
        replies.map(async (reply: any) => {
          let replyUserName = "Anonim";
          
          if (reply.user_id) {
            const { data: user } = await supabase
              .from("users")
              .select("name")
              .eq("id", reply.user_id)
              .maybeSingle();
            
            if (user?.name) {
              replyUserName = user.name;
            }
          }

          return {
            id: reply.id,
            rating: 0,
            comment: reply.contents,
            created_at: reply.created_at,
            name: replyUserName,
            likes_count: reply.likes_count || 0,
          };
        })
      );

      return {
        id: comment.id,
        rating: comment.star,
        comment: comment.contents,
        created_at: comment.created_at,
        name: userName,
        likes_count: comment.likes_count || 0,
        replies: repliesWithUsers,
      };
    })
  );

  return commentsWithUsers;
}

// Blog Comments
export async function getBlogComments(blogId: number) {
  // Get top-level comments
  const { data: comments, error } = await supabase
    .from("blog_comments")
    .select("id, name, comment, created_at, likes_count, parent_id, user_id")
    .eq("blog_id", blogId)
    .eq("status", 1)
    .is("parent_id", null)
    .order("created_at", { ascending: false });

  if (error || !comments) return [];

  // Get all replies
  const { data: allReplies } = await supabase
    .from("blog_comments")
    .select("id, name, comment, created_at, likes_count, parent_id, user_id")
    .eq("blog_id", blogId)
    .eq("status", 1)
    .not("parent_id", "is", null)
    .order("created_at", { ascending: true });

  // Build comment tree
  return comments.map((comment: any) => {
    const replies = allReplies?.filter((r: any) => r.parent_id === comment.id) || [];
    return {
      id: comment.id,
      name: comment.name,
      rating: 0,
      comment: comment.comment,
      created_at: comment.created_at,
      likes_count: comment.likes_count || 0,
      replies: replies.map((r: any) => ({
        id: r.id,
        name: r.name,
        rating: 0,
        comment: r.comment,
        created_at: r.created_at,
        likes_count: r.likes_count || 0,
      })),
    };
  });
}

// Country Comments
export async function getCountryComments(countryId: number) {
  // Get top-level comments
  const { data: comments, error } = await supabase
    .from("country_comments")
    .select("id, name, comment, rating, created_at, likes_count, parent_id, user_id")
    .eq("country_id", countryId)
    .eq("status", 1)
    .is("parent_id", null)
    .order("created_at", { ascending: false });

  if (error || !comments) return [];

  // Get all replies
  const { data: allReplies } = await supabase
    .from("country_comments")
    .select("id, name, comment, created_at, likes_count, parent_id, user_id")
    .eq("country_id", countryId)
    .eq("status", 1)
    .not("parent_id", "is", null)
    .order("created_at", { ascending: true });

  // Build comment tree
  return comments.map((comment: any) => {
    const replies = allReplies?.filter((r: any) => r.parent_id === comment.id) || [];
    return {
      id: comment.id,
      name: comment.name,
      rating: comment.rating || 0,
      comment: comment.comment,
      created_at: comment.created_at,
      likes_count: comment.likes_count || 0,
      replies: replies.map((r: any) => ({
        id: r.id,
        name: r.name,
        rating: 0,
        comment: r.comment,
        created_at: r.created_at,
        likes_count: r.likes_count || 0,
      })),
    };
  });
}

export async function submitConsultantComment(commentData: {
  user_id: number;
  name: string;
  email: string;
  comment: string;
  rating: number;
}) {
  const { data, error } = await supabase
    .from("user_comments")
    .insert({
      ...commentData,
      status: 0, // Pending approval
      created_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    console.error("submitConsultantComment error", error);
    return { success: false, error: error.message };
  }

  return { success: true, data };
}

export async function getConsultants() {
  const { data: consultants, error } = await supabase
    .from("users")
    .select("*")
    .eq("is_web", 1)
    .is("deleted_at", null);

  if (error) {
    console.error("getConsultants error:", error.message || error);
    return [];
  }

  if (!consultants) return [];

  // Her consultant için taxonomy slug'ını al
  const consultantsWithSlugs = await Promise.all(
    consultants.map(async (consultant) => {
      const { data: taxonomy } = await supabase
        .from("taxonomies")
        .select("slug")
        .eq("model_id", consultant.id)
        .eq("type", "Profile\\ProfileController@index")
        .maybeSingle();

      return {
        ...consultant,
        taxonomy_slug: taxonomy?.slug || null,
      };
    })
  );

  return consultantsWithSlugs;
}

export async function submitApplication(formData: any) {
  const { error } = await supabase
    .from("applications")
    .insert({ ...formData, status: "new" });

  if (error) {
    console.error("submitApplication error", error);
    return false;
  }

  // Send email notification (non-blocking)
  try {
    await fetch('/api/send-application-notification', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    }).catch(err => console.error('Email notification failed:', err));
  } catch (err) {
    // Don't fail the application if email fails
    console.error('Email notification error:', err);
  }

  return true;
}

/**
 * ⚡ OPTIMIZED: Get all country page data in parallel
 * Reduces database round-trips from ~10 to ~3
 */
export async function getCountryPageData(countryId: number) {
  // Run all queries in parallel
  const [
    productsResult,
    menuRelationsResult,
    questionRelationsResult,
    blogRelationsResult,
    commentsResult,
  ] = await Promise.all([
    // Products
    supabase
      .from("products")
      .select("*")
      .eq("country_id", countryId)
      .eq("status", 1)
      .order("price", { ascending: true }),
    // Menu relations
    supabase
      .from("country_to_menus")
      .select("country_menu_id")
      .eq("country_id", countryId),
    // Question relations
    supabase
      .from("question_to_countries")
      .select("question_id")
      .eq("country_id", countryId),
    // Blog relations
    supabase
      .from("country_to_blogs")
      .select("blog_id")
      .eq("country_id", countryId),
    // Comments
    supabase
      .from("comments")
      .select("*")
      .eq("country_id", countryId)
      .eq("status", 1)
      .order("created_at", { ascending: false })
      .limit(10),
  ]);

  const products = productsResult.data || [];
  const comments = commentsResult.data || [];

  // Second batch: Get actual data from relations (in parallel)
  const menuIds = menuRelationsResult.data?.map((r: any) => r.country_menu_id) || [];
  const questionIds = questionRelationsResult.data?.map((r: any) => r.question_id) || [];
  const blogIds = blogRelationsResult.data?.map((r: any) => r.blog_id) || [];

  const [menusResult, questionsResult, blogsResult] = await Promise.all([
    // Menus
    menuIds.length > 0
      ? supabase
          .from("country_menus")
          .select("*")
          .in("id", menuIds)
          .eq("status", 1)
          .order("sorted", { ascending: true })
      : Promise.resolve({ data: [] }),
    // Questions
    questionIds.length > 0
      ? supabase
          .from("questions")
          .select("*")
          .in("id", questionIds)
          .eq("status", 1)
      : Promise.resolve({ data: [] }),
    // Blogs
    blogIds.length > 0
      ? supabase
          .from("blogs")
          .select("*")
          .in("id", blogIds)
          .eq("status", 1)
          .limit(5)
      : Promise.resolve({ data: [] }),
  ]);

  const menus = menusResult.data || [];
  const questions = questionsResult.data || [];
  const blogs = blogsResult.data || [];

  // Third batch: Get answers for questions and taxonomy slugs for menus (in parallel)
  const [answersResults, taxonomyResults] = await Promise.all([
    // Get all answers for all questions in one query
    questions.length > 0
      ? supabase
          .from("questions")
          .select("id, title, contents, parent_id")
          .in("parent_id", questions.map((q: any) => q.id))
          .eq("status", 1)
      : Promise.resolve({ data: [] }),
    // Get all taxonomy slugs for menus in one query
    menus.length > 0
      ? supabase
          .from("taxonomies")
          .select("model_id, slug")
          .in("model_id", menus.map((m: any) => m.id))
          .eq("type", "Country\\CountryController@menuDetail")
      : Promise.resolve({ data: [] }),
  ]);

  const allAnswers = answersResults.data || [];
  const menuTaxonomies = taxonomyResults.data || [];

  // Map answers to questions
  const questionsWithAnswers = questions.map((q: any) => ({
    ...q,
    answers: allAnswers.filter((a: any) => a.parent_id === q.id),
  }));

  // Map taxonomy slugs to menus
  const menusWithSlugs = menus.map((menu: any) => {
    const taxonomy = menuTaxonomies.find((t: any) => t.model_id === menu.id);
    return {
      ...menu,
      taxonomy_slug: taxonomy?.slug || null,
    };
  });

  // Get blog taxonomy slugs
  let blogsWithSlugs = blogs;
  if (blogs.length > 0) {
    const { data: blogTaxonomies } = await supabase
      .from("taxonomies")
      .select("model_id, slug")
      .in("model_id", blogs.map((b: any) => b.id))
      .eq("type", "Blog\\BlogController@detail");

    blogsWithSlugs = blogs.map((blog: any) => {
      const taxonomy = blogTaxonomies?.find((t: any) => t.model_id === blog.id);
      return {
        ...blog,
        taxonomy_slug: taxonomy?.slug || null,
      };
    });
  }

  return {
    products,
    menus: menusWithSlugs,
    questions: questionsWithAnswers,
    blogs: blogsWithSlugs,
    comments,
  };
}
