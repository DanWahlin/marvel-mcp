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
