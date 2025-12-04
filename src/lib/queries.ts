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

  // Her ülke için taxonomy'den slug çek
  const countriesWithSlugs = await Promise.all(
    countries.map(async (country) => {
      const { data: taxonomy } = await supabase
        .from("taxonomies")
        .select("slug")
        .eq("model_id", country.id)
        .eq("type", "Country\\CountryController@detail")
        .maybeSingle();

      // Öncelik sırası: taxonomy slug > mapping > fallback
      const slug = taxonomy?.slug || COUNTRY_ID_TO_SLUG[country.id] || `country-${country.id}`;

      return {
        ...country,
        slug,
      };
    })
  );

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
  console.log("🌍 getCountryBySlug - Slug:", slug);
  
  // 1. Önce type filtresi ile dene
  let { data: tax, error: taxError } = await supabase
    .from("taxonomies")
    .select("model_id, slug")
    .eq("slug", slug)
    .eq("type", "Country\\CountryController@detail")
    .maybeSingle();
  
  console.log("🌍 getCountryBySlug - Taxonomy result:", tax);

  // 2. Kayıt bulunamazsa type kontrolü YAPARAK tekrar dene (menu ve blog type'larını hariç tut)
  if (!tax && !taxError) {
    const fallback = await supabase
      .from("taxonomies")
      .select("model_id, slug, type")
      .eq("slug", slug)
      .not("type", "ilike", "%menuDetail%")
      .not("type", "ilike", "%blog%")
      .maybeSingle();

    tax = fallback.data ?? null;
    taxError = fallback.error ?? null;
  }

  if (taxError) {
    console.error("getCountryBySlug taxonomy error", taxError.message ?? taxError);
  }

  let countryId: number | null = tax?.model_id ?? null;

  // 3. Hâlâ countryId yoksa, sabit fallback haritasını kullan
  if (!countryId && COUNTRY_SLUG_FALLBACK[slug]) {
    countryId = COUNTRY_SLUG_FALLBACK[slug];
  }

  if (!countryId) {
    return null;
  }

  const { data: country, error: countryError } = await supabase
    .from("countries")
    .select("*")
    .eq("id", countryId)
    .eq("status", 1)
    .maybeSingle();

  if (countryError) {
    console.error("getCountryBySlug country error", countryError.message ?? countryError);
  }

  if (!country) {
    return null;
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

  const { data, error } = await supabase
    .from("country_menus")
    .select("*")
    .in("id", ids)
    .eq("status", 1)
    .order("sorted", { ascending: true });

  if (error) {
    console.error("getCountryMenus error", error);
    return [];
  }

  return data || [];
}

export async function getCountryMenuBySlug(slug: string) {
  console.log("🔍 getCountryMenuBySlug - Original slug:", slug);
  
  // Slug'ı normalize et (Türkçe karakterleri düzelt)
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

  console.log("🔍 getCountryMenuBySlug - Normalized slug:", normalizedSlug);

  // Debug: Tüm Amerika menuDetail slug'larını listele
  const { data: allMenuDetailSlugs } = await supabase
    .from("taxonomies")
    .select("model_id, slug, type")
    .eq("type", "Country\\CountryController@menuDetail")
    .ilike("slug", "amerika%")
    .limit(20);
  
  console.log("🔍 getCountryMenuBySlug - All Amerika menuDetail slugs:", 
    allMenuDetailSlugs?.map(s => s.slug));

  // DOĞRU YÖNTEM: Taxonomies'den model_id bul, sonra country_menus'den çek
  let { data: tax, error: taxError } = await supabase
    .from("taxonomies")
    .select("model_id, slug, type")
    .eq("slug", normalizedSlug)
    .eq("type", "Country\\CountryController@menuDetail")
    .maybeSingle();

  console.log("🔍 getCountryMenuBySlug - Taxonomy result:", tax);

  // Bulunamazsa orijinal slug ile dene
  if (!tax && !taxError) {
    console.log("🔍 getCountryMenuBySlug - Trying original slug...");
    const result = await supabase
      .from("taxonomies")
      .select("model_id, slug, type")
      .eq("slug", slug)
      .eq("type", "Country\\CountryController@menuDetail")
      .maybeSingle();
    
    tax = result.data;
    taxError = result.error;
    console.log("🔍 getCountryMenuBySlug - Original result:", tax);
  }

  // Bulunamazsa LIKE ile ara (kısmi eşleşme)
  if (!tax && !taxError) {
    console.log("🔍 getCountryMenuBySlug - Trying LIKE search...");
    
    // Slug'dan anahtar kelimeleri çıkar: "amerika-f2m2-ogrenci-aile-vizesi" -> ["f2", "m2", "ogrenci", "aile"]
    const keywords = normalizedSlug
      .split('-')
      .filter(word => word.length > 2 && word !== 'amerika' && word !== 'vizesi' && word !== 'vize');
    
    console.log("🔍 getCountryMenuBySlug - Keywords:", keywords);
    
    // Tüm Amerika menuDetail'leri çek
    const { data: allMenus } = await supabase
      .from("taxonomies")
      .select("model_id, slug, type")
      .eq("type", "Country\\CountryController@menuDetail")
      .ilike("slug", "amerika%")
      .limit(50);
    
    console.log("🔍 getCountryMenuBySlug - All Amerika menus:", allMenus?.length);
    
    // Fuzzy matching: En çok keyword eşleşen slug'ı bul
    const scored = allMenus?.map(menu => {
      const matchCount = keywords.filter(kw => menu.slug.includes(kw)).length;
      return { menu, score: matchCount };
    }).filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score);
    
    console.log("🔍 getCountryMenuBySlug - Top matches:", 
      scored?.slice(0, 3).map(s => ({ slug: s.menu.slug, score: s.score })));
    
    // En yüksek skorlu sonucu kullan
    if (scored && scored.length > 0) {
      tax = scored[0].menu;
      console.log("✅ getCountryMenuBySlug - Using best match:", tax.slug, "score:", scored[0].score);
    }
  }

  if (taxError) {
    console.error("getCountryMenuBySlug taxonomy error", taxError);
  }

  const menuId = tax?.model_id;
  if (!menuId) {
    console.log("❌ getCountryMenuBySlug - No menu found");
    return null;
  }

  console.log("✅ getCountryMenuBySlug - Found menu ID:", menuId);

  // Menu'yu getir
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

  return data || [];
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

  return true;
}
