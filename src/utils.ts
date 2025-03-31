import crypto from 'crypto';
import fetch from 'node-fetch';
import { config } from 'dotenv';
config();

const MARVEL_PUBLIC_KEY = process.env.MARVEL_PUBLIC_KEY as string;
const MARVEL_PRIVATE_KEY = process.env.MARVEL_PRIVATE_KEY as string;
const MARVEL_API_BASE = process.env.MARVEL_API_BASE as string;

if (!MARVEL_PUBLIC_KEY) throw new Error('Missing MARVEL_PUBLIC_KEY env variable');
if (!MARVEL_PRIVATE_KEY) throw new Error('Missing MARVEL_PRIVATE_KEY env variable');
if (!MARVEL_API_BASE) throw new Error('Missing MARVEL_API_BASE env variable');

function createAuthParams(): { ts: string; apikey: string; hash: string } {
  const ts = Date.now().toString();
  const hash = crypto.createHash('md5').update(ts + MARVEL_PRIVATE_KEY + MARVEL_PUBLIC_KEY).digest('hex');
  return { ts, apikey: MARVEL_PUBLIC_KEY, hash };
}

export function serializeQueryParams(params: Record<string, any>): Record<string, string | number | undefined> {
  const result: Record<string, string | number | undefined> = {};
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) {
      result[key] = typeof value === 'boolean' ? String(value) : value;
    }
  }
  return result;
}

export async function httpRequest(endpoint: string, params: Record<string, string | number | undefined> = {}) {
  const url = new URL(`${MARVEL_API_BASE}${endpoint}`);

  const authParams = createAuthParams();
  url.searchParams.set('ts', authParams.ts);
  url.searchParams.set('apikey', authParams.apikey);
  url.searchParams.set('hash', authParams.hash);

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) {
      url.searchParams.set(key, String(value));
    }
  }

  const res = await fetch(url.toString());
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Marvel API error: ${res.status} - ${text}`);
  }

  return res.json();
}

/**
 * Generates an HTML page displaying Marvel comics with their cover images
 * 
 * @param comics Array of comic objects from the Marvel API
 * @param title Title for the HTML page
 * @returns HTML string
 */
export function generateComicsHtml(comics: any[], title: string): string {
  let html = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${escapeHtml(title)}</title>
      <style>
          body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              background-color: #f5f5f5;
              padding: 20px;
              margin: 0;
          }
          .header {
              background-color: #e23636;
              color: white;
              padding: 20px;
              margin-bottom: 20px;
              text-align: center;
              box-shadow: 0 2px 5px rgba(0,0,0,0.1);
          }
          h1 {
              margin: 0;
          }
          .subheader {
              text-align: center;
              color: #666;
              margin-bottom: 20px;
          }
          .comics-container {
              display: flex;
              flex-wrap: wrap;
              justify-content: center;
              gap: 20px;
              max-width: 1400px;
              margin: 0 auto;
          }
          .comic-card {
              background-color: white;
              border-radius: 8px;
              box-shadow: 0 4px 8px rgba(0,0,0,0.1);
              overflow: hidden;
              width: 300px;
              transition: transform 0.3s, box-shadow 0.3s;
          }
          .comic-card:hover {
              transform: translateY(-5px);
              box-shadow: 0 8px 16px rgba(0,0,0,0.2);
          }
          .comic-image-container {
              height: 450px;
              overflow: hidden;
              position: relative;
              background-color: #f0f0f0;
          }
          .comic-image {
              width: 100%;
              height: 100%;
              object-fit: cover;
              transition: transform 0.3s;
          }
          .comic-card:hover .comic-image {
              transform: scale(1.05);
          }
          .comic-info {
              padding: 15px;
          }
          .comic-title {
              font-weight: bold;
              margin-bottom: 5px;
              font-size: 1.1em;
          }
          .comic-issue {
              color: #666;
              font-size: 0.9em;
              margin-bottom: 8px;
          }
          .comic-description {
              font-size: 0.85em;
              color: #444;
              display: -webkit-box;
              -webkit-line-clamp: 3;
              -webkit-box-orient: vertical;
              overflow: hidden;
              margin-top: 8px;
          }
          .comic-date {
              font-size: 0.8em;
              color: #777;
              margin-top: 8px;
          }
          .footer {
              text-align: center;
              margin-top: 30px;
              padding: 20px;
              color: #666;
              font-size: 0.8em;
          }
          .empty-state {
              text-align: center;
              padding: 50px;
              color: #666;
          }
      </style>
  </head>
  <body>
      <div class="header">
          <h1>${escapeHtml(title)}</h1>
      </div>
      <div class="subheader">
          <p>Showing ${comics.length} comics</p>
      </div>
      <div class="comics-container">
  `;

  if (comics.length === 0) {
    html += `
      <div class="empty-state">
          <h2>No comics found</h2>
          <p>Try adjusting your search parameters</p>
      </div>
      `;
  } else {
    comics.forEach(comic => {
      const imgPath = comic.thumbnail ? `${comic.thumbnail.path}.${comic.thumbnail.extension}` : '';
      const title = comic.title || 'Unknown Title';
      const issueNumber = comic.issueNumber !== undefined ? `#${comic.issueNumber}` : 'N/A';

      // Format date if available
      let dateStr = '';
      if (comic.dates && comic.dates.length > 0) {
        const onSaleDate = comic.dates.find((d: any) => d.type === 'onsaleDate');
        if (onSaleDate && onSaleDate.date) {
          const date = new Date(onSaleDate.date);
          if (!isNaN(date.getTime())) {
            dateStr = date.toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            });
          }
        }
      }

      // Get short description if available
      const description = comic.description || '';

      html += `
          <div class="comic-card">
              <div class="comic-image-container">
                  <img class="comic-image" src="${imgPath}" alt="${escapeHtml(title)}" onerror="this.src='https://i.annihil.us/u/prod/marvel/i/mg/b/40/image_not_available.jpg';">
              </div>
              <div class="comic-info">
                  <div class="comic-title">${escapeHtml(title)}</div>
                  <div class="comic-issue">Issue ${issueNumber}</div>
                  ${dateStr ? `<div class="comic-date">Release Date: ${dateStr}</div>` : ''}
                  ${description ? `<div class="comic-description">${escapeHtml(description.substring(0, 150))}${description.length > 150 ? '...' : ''}</div>` : ''}
              </div>
          </div>
          `;
    });
  }

  html += `
      </div>
      <div class="footer">
          <p>Data provided by Marvel. © ${new Date().getFullYear()} MARVEL</p>
      </div>
  </body>
  </html>
  `;

  return html;
}

/**
* Helper function to escape HTML special characters
*/
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
