"use client";

import { useEffect, useRef } from "react";

interface ContentWithIdsProps {
  html: string;
}

export function ContentWithIds({ html }: ContentWithIdsProps) {
  const contentRef = useRef<HTMLDivElement>(null);

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
  }, [html]);

  return (
    <div
      ref={contentRef}
      className="prose-content"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
