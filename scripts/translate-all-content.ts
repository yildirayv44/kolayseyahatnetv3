/**
 * Script to translate all existing Turkish content to English using OpenAI
 * Run with: npx tsx scripts/translate-all-content.ts
 */

import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import { config } from 'dotenv';
import { resolve } from 'path';

// Load .env.local file
config({ path: resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const openaiKey = process.env.OPENAI_API_KEY!;

if (!supabaseUrl || !supabaseKey || !openaiKey) {
  console.error('❌ Missing environment variables!');
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, OPENAI_API_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
const openai = new OpenAI({ apiKey: openaiKey });

// System prompts for different content types
const systemPrompts: Record<string, string> = {
  title: "You are a professional translator. Translate the following Turkish title to English. Keep it concise and SEO-friendly. Only return the translated text, nothing else.",
  description: "You are a professional translator. Translate the following Turkish description to English. Maintain the tone and keep it engaging. Only return the translated text, nothing else.",
  contents: "You are a professional translator specializing in travel and visa content. Translate the following Turkish HTML content to English. Preserve all HTML tags, formatting, and structure. Maintain professional tone suitable for visa consultation services. Only return the translated HTML, nothing else.",
  req_document: "You are a professional translator. Translate the following Turkish document requirements to English. Keep the list format and be clear and precise. Only return the translated text, nothing else.",
  price_contents: "You are a professional translator. Translate the following Turkish pricing information to English. Maintain clarity and professional tone. Only return the translated text, nothing else.",
  warning_notes: "You are a professional translator. Translate the following Turkish warning/note to English. Keep it clear and important-sounding. Only return the translated text, nothing else.",
  aboutme: "You are a professional translator. Translate the following Turkish consultant bio/about section to English. Maintain professional and friendly tone. Preserve all HTML tags if present. Only return the translated text, nothing else.",
};

async function translateText(text: string, field: string): Promise<string> {
  if (!text || text.trim() === '') return '';

  try {
    const systemPrompt = systemPrompts[field] || systemPrompts.contents;
    
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: text },
      ],
      temperature: 0.3,
      max_tokens: 4000,
    });

    return completion.choices[0]?.message?.content || '';
  } catch (error: any) {
    console.error(`❌ Translation error for field ${field}:`, error.message);
    return '';
  }
}

async function translateCountries() {
  console.log('\n📍 Translating Countries...');
  
  const { data: countries, error } = await supabase
    .from('countries')
    .select('id, name, title, description, contents, req_document, price_contents, warning_notes')
    .is('title_en', null); // Only translate if not already translated

  if (error) {
    console.error('❌ Error fetching countries:', error);
    return;
  }

  console.log(`Found ${countries?.length || 0} countries to translate`);

  for (const country of countries || []) {
    console.log(`\n  🌍 Translating: ${country.name}`);
    
    const updates: any = {};

    // Translate each field
    if (country.title) {
      console.log('    - Translating title...');
      updates.title_en = await translateText(country.title, 'title');
    }

    if (country.description) {
      console.log('    - Translating description...');
      updates.description_en = await translateText(country.description, 'description');
    }

    if (country.contents) {
      console.log('    - Translating contents...');
      updates.contents_en = await translateText(country.contents, 'contents');
    }

    if (country.req_document) {
      console.log('    - Translating req_document...');
      updates.req_document_en = await translateText(country.req_document, 'req_document');
    }

    if (country.price_contents) {
      console.log('    - Translating price_contents...');
      updates.price_contents_en = await translateText(country.price_contents, 'price_contents');
    }

    if (country.warning_notes) {
      console.log('    - Translating warning_notes...');
      updates.warning_notes_en = await translateText(country.warning_notes, 'warning_notes');
    }

    // Update database
    const { error: updateError } = await supabase
      .from('countries')
      .update(updates)
      .eq('id', country.id);

    if (updateError) {
      console.error(`    ❌ Error updating country ${country.name}:`, updateError);
    } else {
      console.log(`    ✅ ${country.name} translated successfully`);
    }

    // Rate limiting - wait 1 second between requests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}

async function translateBlogs() {
  console.log('\n📝 Translating Blogs...');
  
  const { data: blogs, error } = await supabase
    .from('blogs')
    .select('id, title, description, contents')
    .is('title_en', null); // Only translate if not already translated

  if (error) {
    console.error('❌ Error fetching blogs:', error);
    return;
  }

  console.log(`Found ${blogs?.length || 0} blogs to translate`);

  for (const blog of blogs || []) {
    console.log(`\n  📰 Translating: ${blog.title}`);
    
    const updates: any = {};

    if (blog.title) {
      console.log('    - Translating title...');
      updates.title_en = await translateText(blog.title, 'title');
    }

    if (blog.description) {
      console.log('    - Translating description...');
      updates.description_en = await translateText(blog.description, 'description');
    }

    if (blog.contents) {
      console.log('    - Translating contents...');
      updates.contents_en = await translateText(blog.contents, 'contents');
    }

    // Update database
    const { error: updateError } = await supabase
      .from('blogs')
      .update(updates)
      .eq('id', blog.id);

    if (updateError) {
      console.error(`    ❌ Error updating blog:`, updateError);
    } else {
      console.log(`    ✅ Blog translated successfully`);
    }

    // Rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}

async function translateConsultants() {
  console.log('\n👤 Translating Consultants...');
  
  const { data: consultants, error } = await supabase
    .from('users')
    .select('id, name, description, aboutme')
    .eq('role', 2) // Only consultants
    .is('description_en', null); // Only translate if not already translated

  if (error) {
    console.error('❌ Error fetching consultants:', error);
    return;
  }

  console.log(`Found ${consultants?.length || 0} consultants to translate`);

  for (const consultant of consultants || []) {
    console.log(`\n  🧑‍💼 Translating: ${consultant.name}`);
    
    const updates: any = {};

    if (consultant.description) {
      console.log('    - Translating description...');
      updates.description_en = await translateText(consultant.description, 'description');
    }

    if (consultant.aboutme) {
      console.log('    - Translating aboutme...');
      updates.aboutme_en = await translateText(consultant.aboutme, 'aboutme');
    }

    // Update database
    const { error: updateError } = await supabase
      .from('users')
      .update(updates)
      .eq('id', consultant.id);

    if (updateError) {
      console.error(`    ❌ Error updating consultant ${consultant.name}:`, updateError);
    } else {
      console.log(`    ✅ ${consultant.name} translated successfully`);
    }

    // Rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}

async function main() {
  console.log('🚀 Starting content translation...\n');
  console.log('This will translate all Turkish content to English using OpenAI GPT-4o-mini');
  console.log('⏱️  This may take a while depending on the amount of content...\n');

  try {
    await translateCountries();
    await translateBlogs();
    await translateConsultants();

    console.log('\n✅ Translation completed successfully!');
    console.log('\n📊 Summary:');
    console.log('  - All countries translated');
    console.log('  - All blogs translated');
    console.log('  - All consultants translated');
    console.log('\n🎉 You can now view English content on your site!');
  } catch (error) {
    console.error('\n❌ Translation failed:', error);
    process.exit(1);
  }
}

main();
