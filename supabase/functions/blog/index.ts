// Public blog API: list published posts and fetch a single post by slug.
// No auth required. Uses the anon key (RLS allows public SELECT of published posts).
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;
const sb = createClient(SUPABASE_URL, ANON_KEY);

const json = (b: unknown, status = 200) =>
  new Response(JSON.stringify(b), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=60' },
  });

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });
  try {
    const url = new URL(req.url);
    const action = url.searchParams.get('action') ?? 'list';

    if (action === 'list') {
      const { data, error } = await sb
        .from('blog_posts')
        .select('id, slug, title, excerpt, cover_image_url, tags, author_name, published_at')
        .eq('status', 'published')
        .order('published_at', { ascending: false })
        .limit(100);
      if (error) return json({ error: error.message }, 500);
      return json({ posts: data ?? [] });
    }

    if (action === 'get') {
      const slug = url.searchParams.get('slug');
      if (!slug) return json({ error: 'slug required' }, 400);
      const { data, error } = await sb
        .from('blog_posts')
        .select('id, slug, title, excerpt, cover_image_url, content_html, tags, author_name, published_at, seo_title, seo_description')
        .eq('slug', slug)
        .eq('status', 'published')
        .maybeSingle();
      if (error) return json({ error: error.message }, 500);
      if (!data) return json({ error: 'not found' }, 404);
      return json({ post: data });
    }

    return json({ error: 'Unknown action' }, 400);
  } catch (e) {
    console.error('blog error', e);
    return json({ error: 'Internal error' }, 500);
  }
});
