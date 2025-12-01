"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Heart, Globe2, FileText, User, ArrowRight } from "lucide-react";
import { useFavorites } from "@/hooks/useFavorites";
import { FavoriteButton } from "@/components/shared/FavoriteButton";
import { Breadcrumb } from "@/components/shared/Breadcrumb";

export default function FavoritesPage() {
  const { getFavoriteIds, isLoaded } = useFavorites();
  const [countries, setCountries] = useState<any[]>([]);
  const [blogs, setBlogs] = useState<any[]>([]);
  const [consultants, setConsultants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoaded) return;

    const fetchFavorites = async () => {
      try {
        const countryIds = getFavoriteIds("country");
        const blogIds = getFavoriteIds("blog");
        const consultantIds = getFavoriteIds("consultant");

        console.log("Favorite IDs:", { countryIds, blogIds, consultantIds });

        // Fetch countries
        if (countryIds.length > 0) {
          const res = await fetch(`/api/favorites/countries?ids=${countryIds.join(",")}`);
          if (res.ok) {
            const data = await res.json();
            console.log("Countries data:", data);
            setCountries(data);
          }
        }

        // Fetch blogs
        if (blogIds.length > 0) {
          const res = await fetch(`/api/favorites/blogs?ids=${blogIds.join(",")}`);
          if (res.ok) {
            const data = await res.json();
            setBlogs(data);
          }
        }

        // Fetch consultants
        if (consultantIds.length > 0) {
          const res = await fetch(`/api/favorites/consultants?ids=${consultantIds.join(",")}`);
          if (res.ok) {
            const data = await res.json();
            setConsultants(data);
          }
        }
      } catch (error) {
        console.error("Failed to fetch favorites:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, [isLoaded, getFavoriteIds]);

  const totalFavorites = countries.length + blogs.length + consultants.length;

  if (!isLoaded || loading) {
    return (
      <div className="space-y-6">
        <Breadcrumb items={[{ label: "Favorilerim" }]} />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            <p className="mt-4 text-sm text-slate-600">Yükleniyor...</p>
          </div>
        </div>
      </div>
    );
  }

  if (totalFavorites === 0) {
    return (
      <div className="space-y-6">
        <Breadcrumb items={[{ label: "Favorilerim" }]} />
        
        <div className="card text-center py-20">
          <Heart className="mx-auto h-16 w-16 text-slate-300" />
          <h2 className="mt-4 text-xl font-semibold text-slate-900">
            Henüz favori eklemediniz
          </h2>
          <p className="mt-2 text-slate-600">
            Beğendiğiniz ülkeleri, blogları ve danışmanları favorilerinize ekleyin
          </p>
          <Link
            href="/"
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-semibold text-white transition-colors hover:bg-primary/90"
          >
            Ana Sayfaya Dön
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <Breadcrumb items={[{ label: "Favorilerim" }]} />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Favorilerim</h1>
          <p className="mt-2 text-slate-600">
            {totalFavorites} favori öğe
          </p>
        </div>
        <Heart className="h-8 w-8 fill-red-500 text-red-500" />
      </div>

      {/* Countries */}
      {countries.length > 0 && (
        <section className="space-y-4">
          <h2 className="flex items-center gap-2 text-xl font-semibold text-slate-900">
            <Globe2 className="h-5 w-5 text-primary" />
            Ülkeler ({countries.length})
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {countries.map((country: any) => (
              <div key={country.id} className="card relative">
                <div className="absolute right-3 top-3 z-10">
                  <FavoriteButton id={country.id} type="country" size="sm" />
                </div>
                <Link href={`/tr/${country.slug}`} className="block">
                  <h3 className="pr-10 font-semibold text-slate-900 hover:text-primary">
                    {country.title || `${country.name} Vizesi`}
                  </h3>
                  <p className="mt-2 line-clamp-2 text-sm text-slate-600">
                    {country.description}
                  </p>
                </Link>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Blogs */}
      {blogs.length > 0 && (
        <section className="space-y-4">
          <h2 className="flex items-center gap-2 text-xl font-semibold text-slate-900">
            <FileText className="h-5 w-5 text-primary" />
            Blog Yazıları ({blogs.length})
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {blogs.map((blog: any) => (
              <div key={blog.id} className="card relative">
                <div className="absolute right-3 top-3 z-10">
                  <FavoriteButton id={blog.id} type="blog" size="sm" />
                </div>
                <Link href={`/blog/${blog.slug}`} className="block">
                  <h3 className="pr-10 font-semibold text-slate-900 hover:text-primary">
                    {blog.title}
                  </h3>
                  <p className="mt-2 line-clamp-2 text-sm text-slate-600">
                    {blog.description}
                  </p>
                </Link>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Consultants */}
      {consultants.length > 0 && (
        <section className="space-y-4">
          <h2 className="flex items-center gap-2 text-xl font-semibold text-slate-900">
            <User className="h-5 w-5 text-primary" />
            Danışmanlar ({consultants.length})
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {consultants.map((consultant: any) => (
              <div key={consultant.id} className="card relative">
                <div className="absolute right-3 top-3 z-10">
                  <FavoriteButton id={consultant.id} type="consultant" size="sm" />
                </div>
                <Link href={`/danisman/${consultant.slug}`} className="block">
                  <h3 className="pr-10 font-semibold text-slate-900 hover:text-primary">
                    {consultant.name}
                  </h3>
                  <p className="mt-2 line-clamp-2 text-sm text-slate-600">
                    {consultant.description || "Vize Danışmanı"}
                  </p>
                </Link>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
