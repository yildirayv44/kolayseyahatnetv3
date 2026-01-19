import { NextRequest, NextResponse } from "next/server";
import { openai } from "@/lib/openai";
import { supabase } from "@/lib/supabase";
import { headers } from "next/headers";
import { cookies } from "next/headers";

const USAGE_COOKIE_NAME = "petition_usage";
const MAX_FREE_USAGE = 1;

const languageNames: Record<string, string> = {
  tr: "Türkçe",
  en: "English",
  de: "Deutsch (German)",
  fr: "Français (French)",
  es: "Español (Spanish)",
  it: "Italiano (Italian)",
  ru: "Русский (Russian)",
  nl: "Nederlands (Dutch)",
};

async function getClientIdentifier(): Promise<string> {
  const headersList = await headers();
  const forwardedFor = headersList.get("x-forwarded-for");
  const realIp = headersList.get("x-real-ip");
  const ip = forwardedFor?.split(",")[0] || realIp || "unknown";
  
  const cookieStore = await cookies();
  const usageCookie = cookieStore.get(USAGE_COOKIE_NAME);
  
  return usageCookie?.value || ip;
}

async function checkUsageLimit(clientId: string): Promise<{ allowed: boolean; isAuthenticated: boolean }> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (user) {
    return { allowed: true, isAuthenticated: true };
  }
  
  const { data: usage } = await supabase
    .from("petition_usage")
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
    .from("petition_usage")
    .select("id, count")
    .eq("client_id", clientId)
    .single();
  
  if (existing) {
    await supabase
      .from("petition_usage")
      .update({ count: existing.count + 1, updated_at: new Date().toISOString() })
      .eq("id", existing.id);
  } else {
    await supabase
      .from("petition_usage")
      .insert({ client_id: clientId, count: 1 });
  }
}

function formatDate(dateStr: string, locale: "tr" | "en"): string {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  if (locale === "tr") {
    return date.toLocaleDateString("tr-TR", { day: "2-digit", month: "long", year: "numeric" });
  }
  return date.toLocaleDateString("en-US", { day: "2-digit", month: "long", year: "numeric" });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const clientId = await getClientIdentifier();
    const { allowed, isAuthenticated } = await checkUsageLimit(clientId);
    
    if (!allowed) {
      return NextResponse.json({ error: "Usage limit exceeded", blocked: true }, { status: 403 });
    }
    
    const {
      fullName, birthDate, nationality, passportNumber, passportIssueDate, passportExpiryDate,
      address, city, phone, email, employmentStatus, companyName, jobTitle, workAddress,
      monthlyIncome, yearsEmployed, destinationCountryName, visaType, travelPurpose, customPurpose,
      startDate, endDate, previousVisits, accommodationType, accommodationName, accommodationAddress,
      travelingAlone, companions, tripFinancing, bankBalance, hasReturnTicket, additionalInfo,
      outputLanguage, locale
    } = body;

    const targetLanguage = languageNames[outputLanguage] || "English";
    const formattedStartDate = formatDate(startDate, locale);
    const formattedEndDate = formatDate(endDate, locale);
    const formattedBirthDate = formatDate(birthDate, locale);

    const employmentMap: Record<string, string> = {
      employed: locale === "tr" ? "Çalışan" : "Employed",
      selfEmployed: locale === "tr" ? "Serbest Meslek" : "Self-Employed",
      student: locale === "tr" ? "Öğrenci" : "Student",
      retired: locale === "tr" ? "Emekli" : "Retired",
      unemployed: locale === "tr" ? "Çalışmıyor" : "Unemployed",
    };
    const employmentText = employmentMap[employmentStatus] || employmentStatus;

    const purposeMap: Record<string, string> = {
      tourism: "Tourism / Vacation",
      business: "Business meeting",
      family: "Family/Friend visit",
      education: "Education",
      medical: "Medical treatment",
      conference: "Conference / Fair",
      other: customPurpose || "Other",
    };
    const purposeText = purposeMap[travelPurpose] || travelPurpose;

    const companionsText = !travelingAlone && companions?.length > 0
      ? companions.map((c: { fullName: string; relationship: string }) => `${c.fullName} (${c.relationship})`).join(", ")
      : "Traveling alone";

    const prompt = `Create a professional visa cover letter (personal statement / petition) for a ${destinationCountryName} visa application.

APPLICANT INFORMATION:
- Full Name: ${fullName}
- Date of Birth: ${formattedBirthDate}
- Nationality: ${nationality}
- Passport Number: ${passportNumber}
${passportIssueDate ? `- Passport Issue Date: ${formatDate(passportIssueDate, locale)}` : ""}
${passportExpiryDate ? `- Passport Expiry Date: ${formatDate(passportExpiryDate, locale)}` : ""}
- Address: ${address}, ${city}
${phone ? `- Phone: ${phone}` : ""}
${email ? `- Email: ${email}` : ""}

EMPLOYMENT STATUS:
- Status: ${employmentText}
${companyName ? `- Company/Institution: ${companyName}` : ""}
${jobTitle ? `- Position: ${jobTitle}` : ""}
${workAddress ? `- Work Address: ${workAddress}` : ""}
${monthlyIncome ? `- Monthly Income: ${monthlyIncome}` : ""}
${yearsEmployed ? `- Years Employed: ${yearsEmployed}` : ""}

TRAVEL DETAILS:
- Destination: ${destinationCountryName}
- Visa Type: ${visaType}
- Purpose: ${purposeText}
- Travel Dates: ${formattedStartDate} - ${formattedEndDate}
- Previous Visits: ${previousVisits === "never" ? "First visit" : previousVisits === "once" ? "Visited once before" : "Multiple previous visits"}
- Travel Companions: ${companionsText}

ACCOMMODATION:
- Type: ${accommodationType}
${accommodationName ? `- Name: ${accommodationName}` : ""}
${accommodationAddress ? `- Address: ${accommodationAddress}` : ""}

FINANCIAL INFORMATION:
- Trip Financed By: ${tripFinancing}
${bankBalance ? `- Bank Balance: ${bankBalance}` : ""}
- Return Ticket: ${hasReturnTicket ? "Reserved" : "Will be booked upon visa approval"}

${additionalInfo ? `ADDITIONAL INFORMATION:\n${additionalInfo}` : ""}

Please write a formal, professional cover letter addressed to the ${destinationCountryName} Embassy/Consulate. The letter should:
1. Start with proper date and address format
2. Introduce the applicant
3. Clearly state the purpose of travel
4. Explain employment/financial situation showing strong ties to home country
5. Mention accommodation and travel plans
6. Express intent to return after the visit
7. Thank the officer and request favorable consideration
8. End with proper closing and signature line

IMPORTANT: Write the entire letter in ${targetLanguage}. Return only the letter text, no additional explanations.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a professional visa consultant specializing in writing compelling cover letters for visa applications. You write formal, persuasive letters that highlight the applicant's strong ties to their home country and legitimate travel purposes. Write in ${targetLanguage}.`,
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 2500,
    });
    
    const letter = completion.choices[0].message.content || "";
    
    if (!isAuthenticated) {
      await recordUsage(clientId);
    }
    
    const response = NextResponse.json({ letter, success: true });
    
    if (!isAuthenticated) {
      response.cookies.set(USAGE_COOKIE_NAME, clientId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 365,
      });
    }
    
    return response;
  } catch (error) {
    console.error("Petition generation error:", error);
    return NextResponse.json({ error: "Failed to generate cover letter" }, { status: 500 });
  }
}
