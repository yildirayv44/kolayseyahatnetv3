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
  }, [html]);

  return (
    <div
      ref={contentRef}
      className="prose-content"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
