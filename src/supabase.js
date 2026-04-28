import { createClient } from '@supabase/supabase-js';
import { VALID_SLUGS } from './chapters.js';

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  throw new Error(
    'Missing Supabase env vars. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local.'
  );
}

export const supabase = createClient(url, anonKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const PAGE = 8;

export async function fetchWallPage(slug, offset = 0) {
  const { data, error } = await supabase
    .from('submissions')
    .select('id, content, created_at, is_seed')
    .eq('chapter', slug)
    .order('created_at', { ascending: false })
    .range(offset, offset + PAGE - 1);
  if (error) throw error;
  return data || [];
}

export async function fetchEchoes(slug, excludeId, count = 3) {
  let query = supabase
    .from('submissions')
    .select('id, content')
    .eq('chapter', slug)
    .order('created_at', { ascending: false })
    .limit(count + 1);
  const { data, error } = await query;
  if (error) throw error;
  return (data || []).filter((row) => row.id !== excludeId).slice(0, count);
}

export async function insertSubmission(slug, content) {
  if (!VALID_SLUGS.includes(slug)) {
    throw new Error(`Invalid chapter slug: ${slug}`);
  }
  const trimmed = content.trim();
  if (!trimmed) throw new Error('Empty submission.');
  const { data, error } = await supabase
    .from('submissions')
    .insert({ chapter: slug, content: trimmed, is_seed: false })
    .select('id, content, created_at, is_seed')
    .single();
  if (error) throw error;
  return data;
}

export async function fetchSpeechClosing(limit = 500) {
  const { data, error } = await supabase
    .from('submissions')
    .select('id, content, created_at')
    .eq('chapter', 'speech')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data || [];
}

export const PAGE_SIZE = PAGE;
