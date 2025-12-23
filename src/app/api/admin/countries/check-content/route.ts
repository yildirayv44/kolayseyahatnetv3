import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET() {
  try {
    // Fetch all countries with content
    const { data: countries, error } = await supabaseAdmin
      .from('countries')
      .select('id, name, contents, description')
      .order('name');

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const issues: Array<{
      id: number;
      name: string;
      issue: string;
      preview: string;
    }> = [];

    for (const country of countries || []) {
      const content = country.contents || '';
      
      // Check for markdown code block markers at start
      if (content.trim().startsWith('```html') || content.trim().startsWith('```')) {
        issues.push({
          id: country.id,
          name: country.name,
          issue: 'Starts with markdown code block (```html or ```)',
          preview: content.substring(0, 100),
        });
      }
      
      // Check for markdown code block markers at end
      if (content.trim().endsWith('```')) {
        const existingIssue = issues.find(i => i.id === country.id);
        if (existingIssue) {
          existingIssue.issue += ' and ends with ```';
        } else {
          issues.push({
            id: country.id,
            name: country.name,
            issue: 'Ends with markdown code block (```)',
            preview: content.substring(Math.max(0, content.length - 100)),
          });
        }
      }

      // Check for raw HTML doctype or html tags at very start (not as part of content)
      if (content.trim().toLowerCase().startsWith('<!doctype') || 
          content.trim().toLowerCase().startsWith('<html')) {
        issues.push({
          id: country.id,
          name: country.name,
          issue: 'Starts with HTML doctype or <html> tag',
          preview: content.substring(0, 100),
        });
      }

      // Check for </html> at the end
      if (content.trim().toLowerCase().endsWith('</html>')) {
        const existingIssue = issues.find(i => i.id === country.id);
        if (existingIssue) {
          existingIssue.issue += ' and ends with </html>';
        } else {
          issues.push({
            id: country.id,
            name: country.name,
            issue: 'Ends with </html> tag',
            preview: content.substring(Math.max(0, content.length - 100)),
          });
        }
      }

      // Check for "```html" anywhere in content (AI artifact)
      if (content.includes('```html') || content.includes('```\n')) {
        const existingIssue = issues.find(i => i.id === country.id);
        if (!existingIssue) {
          issues.push({
            id: country.id,
            name: country.name,
            issue: 'Contains markdown code block markers',
            preview: content.substring(0, 100),
          });
        }
      }
    }

    return NextResponse.json({
      totalCountries: countries?.length || 0,
      issuesFound: issues.length,
      issues,
    });
  } catch (error) {
    console.error('Error checking country content:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
