import { NextRequest, NextResponse } from "next/server";
import { openai } from "@/lib/openai";
import { supabase } from "@/lib/supabase";
import { headers } from "next/headers";
import { cookies } from "next/headers";

const USAGE_COOKIE_NAME = "invitation_usage";
const MAX_FREE_USAGE = 1;

interface Guest {
  fullName: string;
  passportNumber?: string;
}

interface InvitationRequest {
  hostName: string;
  hostAddress: string;
  hostCity: string;
  hostPostalCode?: string;
  hostCountryId: number;
  hostCountryName: string;
  hostEmail?: string;
  hostPhone?: string;
  guests: Guest[];
  destinationCountry: number;
  destinationCountryName: string;
  visitPurpose: string;
  customPurpose?: string;
  startDate: string;
  endDate: string;
  coverAccommodation: boolean;
  coverTransportation: boolean;
  coverMeals: boolean;
  coverAllExpenses: boolean;
  relationship: string;
  customRelationship?: string;
  outputLanguage: string;
  locale: "tr" | "en";
}

const languageNames: Record<string, string> = {
  tr: "Türkçe",
  en: "English",
  de: "Deutsch (German)",
  fr: "Français (French)",
  es: "Español (Spanish)",
  it: "Italiano (Italian)",
  ru: "Русский (Russian)",
  ar: "العربية (Arabic)",
  zh: "中文 (Chinese)",
  ja: "日本語 (Japanese)",
  pt: "Português (Portuguese)",
  nl: "Nederlands (Dutch)",
};

async function getClientIdentifier(request: NextRequest): Promise<string> {
  const headersList = await headers();
  const forwardedFor = headersList.get("x-forwarded-for");
  const realIp = headersList.get("x-real-ip");
  const ip = forwardedFor?.split(",")[0] || realIp || "unknown";
  
  const cookieStore = await cookies();
  const usageCookie = cookieStore.get(USAGE_COOKIE_NAME);
  
  return usageCookie?.value || ip;
}

async function checkUsageLimit(clientId: string): Promise<{ allowed: boolean; isAuthenticated: boolean }> {
  // Check if user is authenticated
  const { data: { user } } = await supabase.auth.getUser();
  
  if (user) {
    // Authenticated users have unlimited access
    return { allowed: true, isAuthenticated: true };
  }
  
  // Check usage in database for non-authenticated users
  const { data: usage } = await supabase
    .from("invitation_usage")
    .select("count")
    .eq("client_id", clientId)
    .single();
  
  if (!usage) {
    return { allowed: true, isAuthenticated: false };
  }
  
  return { allowed: usage.count < MAX_FREE_USAGE, isAuthenticated: false };
}

async function recordUsage(clientId: string): Promise<void> {
  const { data: existing } = await supabase
    .from("invitation_usage")
    .select("id, count")
    .eq("client_id", clientId)
    .single();
  
  if (existing) {
    await supabase
      .from("invitation_usage")
      .update({ count: existing.count + 1, updated_at: new Date().toISOString() })
      .eq("id", existing.id);
  } else {
    await supabase
      .from("invitation_usage")
      .insert({ client_id: clientId, count: 1 });
  }
}

function formatDate(dateStr: string, locale: "tr" | "en"): string {
  const date = new Date(dateStr);
  if (locale === "tr") {
    return date.toLocaleDateString("tr-TR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  }
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function getVisitPurposeText(purpose: string, customPurpose: string | undefined, locale: "tr" | "en"): string {
  const purposes: Record<string, { tr: string; en: string }> = {
    tourism: { tr: "turizm ve tatil", en: "tourism and holiday" },
    family_visit: { tr: "aile ziyareti", en: "family visit" },
    friend_visit: { tr: "arkadaş ziyareti", en: "friend visit" },
    business: { tr: "iş görüşmesi", en: "business meeting" },
    conference: { tr: "konferans ve seminer katılımı", en: "conference and seminar attendance" },
    medical: { tr: "sağlık ve tedavi", en: "medical treatment" },
    education: { tr: "eğitim ve kurs", en: "education and training" },
    other: { tr: customPurpose || "diğer", en: customPurpose || "other" },
  };
  
  return purposes[purpose]?.[locale] || purposes.tourism[locale];
}

function getRelationshipText(relationship: string, customRelationship: string | undefined, locale: "tr" | "en"): string {
  const relationships: Record<string, { tr: string; en: string }> = {
    friend: { tr: "arkadaşım", en: "my friend" },
    family: { tr: "aile üyem", en: "my family member" },
    relative: { tr: "akrabam", en: "my relative" },
    business_partner: { tr: "iş ortağım", en: "my business partner" },
    colleague: { tr: "iş arkadaşım", en: "my colleague" },
    other: { tr: customRelationship || "tanıdığım", en: customRelationship || "my acquaintance" },
  };
  
  return relationships[relationship]?.[locale] || relationships.friend[locale];
}

export async function POST(request: NextRequest) {
  try {
    const body: InvitationRequest = await request.json();
    const clientId = await getClientIdentifier(request);
    
    // Check usage limit
    const { allowed, isAuthenticated } = await checkUsageLimit(clientId);
    
    if (!allowed) {
      return NextResponse.json(
        { error: "Usage limit exceeded", blocked: true },
        { status: 403 }
      );
    }
    
    const {
      hostName,
      hostAddress,
      hostCity,
      hostPostalCode,
      hostCountryName,
      hostEmail,
      hostPhone,
      guests,
      destinationCountryName,
      visitPurpose,
      customPurpose,
      startDate,
      endDate,
      coverAccommodation,
      coverTransportation,
      coverMeals,
      coverAllExpenses,
      relationship,
      customRelationship,
      outputLanguage,
      locale,
    } = body;
    
    // Build guest names list
    const guestNames = guests.map((g) => g.fullName).join(", ");
    const guestDetails = guests
      .map((g) => {
        if (g.passportNumber) {
          return `${g.fullName} (${locale === "tr" ? "Pasaport No" : "Passport No"}: ${g.passportNumber})`;
        }
        return g.fullName;
      })
      .join("\n");
    
    // Build expenses list
    const expenses: string[] = [];
    if (coverAllExpenses) {
      expenses.push(locale === "tr" ? "tüm seyahat masrafları" : "all travel expenses");
    } else {
      if (coverAccommodation) {
        expenses.push(locale === "tr" ? "konaklama" : "accommodation");
      }
      if (coverTransportation) {
        expenses.push(locale === "tr" ? "ulaşım" : "transportation");
      }
      if (coverMeals) {
        expenses.push(locale === "tr" ? "yemek" : "meals");
      }
    }
    
    const expensesText = expenses.length > 0 
      ? expenses.join(", ") 
      : (locale === "tr" ? "konaklama" : "accommodation");
    
    const fullAddress = [hostAddress, hostCity, hostPostalCode, hostCountryName]
      .filter(Boolean)
      .join(", ");
    
    const purposeText = getVisitPurposeText(visitPurpose, customPurpose, locale);
    const relationshipText = getRelationshipText(relationship, customRelationship, locale);
    
    const formattedStartDate = formatDate(startDate, locale);
    const formattedEndDate = formatDate(endDate, locale);
    
    // Build prompt for OpenAI - use outputLanguage for the letter
    const targetLanguage = languageNames[outputLanguage] || "English";
    
    const prompt = `Create a professional invitation letter for a ${destinationCountryName} visa application based on the following information.

Host Information:
- Full Name: ${hostName}
- Address: ${fullAddress}
${hostEmail ? `- Email: ${hostEmail}` : ""}
${hostPhone ? `- Phone: ${hostPhone}` : ""}

Guest(s):
${guestDetails}

Visit Details:
- Purpose: ${purposeText}
- Date Range: ${formattedStartDate} - ${formattedEndDate}
- Relationship: ${relationshipText}

Financial Responsibility:
Expenses to be covered: ${expensesText}

Please write a formal and professional invitation letter addressed to the ${destinationCountryName} consulate/embassy. The letter should include:
1. Official header and date
2. Address to the appropriate authority
3. Host's self-introduction
4. Guest's information and relationship
5. Purpose and dates of visit
6. Accommodation address
7. Financial responsibility statement
8. Closing and signature area

IMPORTANT: Write the entire letter in ${targetLanguage}. Return only the letter text, no additional explanations.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a professional visa consultant. You write formal and professional invitation letters. These letters will be used for visa applications, so you must use formal language and format. You MUST write the letter in ${targetLanguage}.`,
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });
    
    const letter = completion.choices[0].message.content || "";
    
    // Record usage for non-authenticated users
    if (!isAuthenticated) {
      await recordUsage(clientId);
    }
    
    // Set cookie for tracking
    const response = NextResponse.json({ letter, success: true });
    
    if (!isAuthenticated) {
      response.cookies.set(USAGE_COOKIE_NAME, clientId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 365, // 1 year
      });
    }
    
    return response;
  } catch (error) {
    console.error("Invitation generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate invitation letter" },
      { status: 500 }
    );
  }
}
