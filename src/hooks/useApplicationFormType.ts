"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

type FormType = "internal" | "standalone";

let cachedFormType: FormType | null = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export function useApplicationFormType() {
  const [formType, setFormType] = useState<FormType>(cachedFormType || "internal");

  useEffect(() => {
    const now = Date.now();
    if (cachedFormType && now - cacheTimestamp < CACHE_DURATION) {
      setFormType(cachedFormType);
      return;
    }

    const loadFormType = async () => {
      try {
        const { data, error } = await supabase
          .from("settings")
          .select("val")
          .eq("name", "application_form_type")
          .maybeSingle();

        if (error) {
          console.error("Form type load error:", error);
          return;
        }

        if (data && (data.val === "internal" || data.val === "standalone")) {
          cachedFormType = data.val;
          cacheTimestamp = Date.now();
          setFormType(data.val);
        }
      } catch (error) {
        console.error("Form type load error:", error);
      }
    };

    loadFormType();
  }, []);

  return formType;
}

/**
 * Returns the application form URL and target based on the form type setting.
 * @param formType - "internal" or "standalone"
 * @param queryParams - Optional query parameters (country_id, country_name, package_id, package_name)
 */
export function getApplicationFormLink(
  formType: FormType,
  queryParams?: Record<string, string | number>
): { href: string; target: string } {
  const params = queryParams
    ? "?" + new URLSearchParams(
        Object.entries(queryParams).reduce((acc, [key, val]) => {
          if (val !== undefined && val !== null && val !== "") {
            acc[key] = String(val);
          }
          return acc;
        }, {} as Record<string, string>)
      ).toString()
    : "";

  if (formType === "standalone") {
    return {
      href: `/vize-basvuru-formu-std${params}`,
      target: "_blank",
    };
  }

  return {
    href: `/vize-basvuru-formu${params}`,
    target: "_self",
  };
}
