/**
 * Export Utilities for AI Tools
 * Export results in various formats
 */

export function exportToJSON(data: any, filename: string) {
  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  downloadBlob(blob, `${filename}.json`);
}

export function exportToCSV(data: any[], filename: string) {
  if (!data || data.length === 0) {
    alert('No data to export');
    return;
  }

  // Get headers from first object
  const headers = Object.keys(data[0]);
  
  // Create CSV content
  let csv = headers.join(',') + '\n';
  
  data.forEach(row => {
    const values = headers.map(header => {
      const value = row[header];
      // Handle values with commas or quotes
      if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    });
    csv += values.join(',') + '\n';
  });

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  downloadBlob(blob, `${filename}.csv`);
}

export function exportToMarkdown(data: any, filename: string) {
  let markdown = '';

  if (typeof data === 'object' && !Array.isArray(data)) {
    // Convert object to markdown
    markdown = objectToMarkdown(data);
  } else if (Array.isArray(data)) {
    // Convert array to markdown table
    markdown = arrayToMarkdownTable(data);
  } else {
    markdown = String(data);
  }

  const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8;' });
  downloadBlob(blob, `${filename}.md`);
}

export function exportToText(text: string, filename: string) {
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8;' });
  downloadBlob(blob, `${filename}.txt`);
}

export function exportToHTML(html: string, filename: string, title?: string) {
  const fullHTML = `<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title || filename}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      max-width: 800px;
      margin: 40px auto;
      padding: 20px;
      line-height: 1.6;
      color: #333;
    }
    h1, h2, h3 { color: #2563eb; }
    pre { background: #f3f4f6; padding: 15px; border-radius: 8px; overflow-x: auto; }
    code { background: #f3f4f6; padding: 2px 6px; border-radius: 4px; }
    table { border-collapse: collapse; width: 100%; margin: 20px 0; }
    th, td { border: 1px solid #e5e7eb; padding: 12px; text-align: left; }
    th { background: #f9fafb; font-weight: 600; }
  </style>
</head>
<body>
  ${html}
</body>
</html>`;

  const blob = new Blob([fullHTML], { type: 'text/html;charset=utf-8;' });
  downloadBlob(blob, `${filename}.html`);
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function objectToMarkdown(obj: any, level: number = 1): string {
  let markdown = '';
  
  for (const [key, value] of Object.entries(obj)) {
    const heading = '#'.repeat(level);
    markdown += `${heading} ${formatKey(key)}\n\n`;
    
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      markdown += objectToMarkdown(value, level + 1);
    } else if (Array.isArray(value)) {
      value.forEach(item => {
        if (typeof item === 'object') {
          markdown += objectToMarkdown(item, level + 1);
        } else {
          markdown += `- ${item}\n`;
        }
      });
      markdown += '\n';
    } else {
      markdown += `${value}\n\n`;
    }
  }
  
  return markdown;
}

function arrayToMarkdownTable(arr: any[]): string {
  if (arr.length === 0) return '';
  
  const headers = Object.keys(arr[0]);
  let markdown = '| ' + headers.map(formatKey).join(' | ') + ' |\n';
  markdown += '| ' + headers.map(() => '---').join(' | ') + ' |\n';
  
  arr.forEach(row => {
    const values = headers.map(header => {
      const value = row[header];
      return typeof value === 'object' ? JSON.stringify(value) : String(value);
    });
    markdown += '| ' + values.join(' | ') + ' |\n';
  });
  
  return markdown;
}

function formatKey(key: string): string {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .trim();
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Copy to clipboard failed:', error);
    return false;
  }
}

/**
 * Generate filename with timestamp
 */
export function generateFilename(prefix: string): string {
  const date = new Date();
  const timestamp = date.toISOString().replace(/[:.]/g, '-').slice(0, -5);
  return `${prefix}_${timestamp}`;
}
