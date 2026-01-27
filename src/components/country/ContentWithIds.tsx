"use client";

import { useEffect, useRef, useMemo } from "react";
import { optimizeHtmlContent } from "@/lib/optimize-html-images";
import { compressHtml } from "@/lib/compress-html";

interface ContentWithIdsProps {
  html: string;
}

export function ContentWithIds({ html }: ContentWithIdsProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  
  // Optimize and compress HTML content before rendering
  // Also convert H1 tags to H2 to avoid multiple H1s on page (SEO best practice)
  const optimizedHtml = useMemo(() => {
    const compressed = compressHtml(html);
    const optimized = optimizeHtmlContent(compressed);
    // Convert all H1 tags to H2 to maintain single H1 per page
    return optimized
      .replace(/<h1(\s|>)/gi, '<h2$1')
      .replace(/<\/h1>/gi, '</h2>');
  }, [html]);

  useEffect(() => {
    if (!contentRef.current) return;

    // Tüm H2 başlıklarını bul ve ID ekle
    const h2Elements = contentRef.current.querySelectorAll("h2");
    h2Elements.forEach((h2) => {
      const text = h2.textContent || "";
      const id = text
        .toLowerCase()
        .replace(/[^a-z0-9ğüşıöçĞÜŞİÖÇ\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .trim();
      
      if (id) {
        h2.id = id;
        h2.classList.add("scroll-mt-20");
      }
    });

    // Optimize images in content
    const images = contentRef.current.querySelectorAll("img");
    images.forEach((img) => {
      // Add loading lazy if not present
      if (!img.getAttribute("loading")) {
        img.setAttribute("loading", "lazy");
      }
      
      // Add decoding async for better performance
      if (!img.getAttribute("decoding")) {
        img.setAttribute("decoding", "async");
      }
      
      // Add responsive image styles
      if (!img.style.maxWidth) {
        img.style.maxWidth = "100%";
        img.style.height = "auto";
      }
    });

    // External linkler için SEO düzenlemesi
    const links = contentRef.current.querySelectorAll("a");
    links.forEach((link) => {
      const href = link.getAttribute("href") || "";
      const isExternal = href.startsWith("http") && !href.includes("kolayseyahat.net");
      
      if (isExternal) {
        link.setAttribute("target", "_blank");
        link.setAttribute("rel", "noopener noreferrer nofollow");
        
        // Anchor text yoksa, domain adını ekle
        if (!link.textContent?.trim()) {
          try {
            const url = new URL(href);
            link.textContent = url.hostname.replace("www.", "");
          } catch {
            link.textContent = "Dış Bağlantı";
          }
        }
      }
    });
  }, [optimizedHtml]);

  return (
    <div
      ref={contentRef}
      className="prose-content"
      dangerouslySetInnerHTML={{ __html: optimizedHtml }}
    />
  );
}
