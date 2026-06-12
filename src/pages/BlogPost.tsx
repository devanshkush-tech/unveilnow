import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ArrowLeft, Loader2 } from "lucide-react";

type Post = {
  id: string; slug: string; title: string; excerpt: string | null;
  cover_image_url: string | null; content_html: string; tags: string[];
  author_name: string | null; published_at: string | null;
  seo_title: string | null; seo_description: string | null;
};

const FN = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/blog`;

const setMeta = (name: string, content: string, attr: "name" | "property" = "name") => {
  let m = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement | null;
  if (!m) { m = document.createElement("meta"); m.setAttribute(attr, name); document.head.appendChild(m); }
  m.setAttribute("content", content);
};

const BlogPost = () => {
  const { slug } = useParams();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;
    (async () => {
      try {
        const r = await fetch(`${FN}?action=get&slug=${encodeURIComponent(slug)}`);
        if (r.status === 404) { setNotFound(true); return; }
        const d = await r.json();
        if (!d.post) { setNotFound(true); return; }
        const p: Post = d.post;
        setPost(p);

        const title = p.seo_title || `${p.title} | Unveil Now`;
        const desc = (p.seo_description || p.excerpt || "").slice(0, 160);
        document.title = title;
        setMeta("description", desc);

        // OpenGraph + Twitter
        setMeta("og:title", title, "property");
        setMeta("og:description", desc, "property");
        setMeta("og:type", "article", "property");
        setMeta("og:url", `/blog/${p.slug}`, "property");
        if (p.cover_image_url) setMeta("og:image", p.cover_image_url, "property");
        setMeta("twitter:card", p.cover_image_url ? "summary_large_image" : "summary");
        setMeta("twitter:title", title);
        setMeta("twitter:description", desc);
        if (p.cover_image_url) setMeta("twitter:image", p.cover_image_url);

        // Canonical
        let canon = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
        if (!canon) { canon = document.createElement("link"); canon.rel = "canonical"; document.head.appendChild(canon); }
        canon.href = `/blog/${p.slug}`;

        // JSON-LD
        const old = document.getElementById("blog-jsonld");
        if (old) old.remove();
        const ld = document.createElement("script");
        ld.type = "application/ld+json";
        ld.id = "blog-jsonld";
        ld.text = JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          headline: p.title,
          description: desc,
          image: p.cover_image_url || undefined,
          datePublished: p.published_at,
          author: p.author_name ? { "@type": "Person", name: p.author_name } : { "@type": "Organization", name: "Unveil Now" },
          publisher: { "@type": "Organization", name: "Unveil Now" },
          mainEntityOfPage: `/blog/${p.slug}`,
        });
        document.head.appendChild(ld);
      } finally { setLoading(false); }
    })();

    return () => { document.getElementById("blog-jsonld")?.remove(); };
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background"><Navbar />
        <div className="py-32 text-center"><Loader2 className="h-6 w-6 animate-spin inline text-muted-foreground" /></div>
      </div>
    );
  }
  if (notFound || !post) {
    return (
      <div className="min-h-screen bg-background"><Navbar />
        <div className="container py-24 text-center">
          <h1 className="font-display text-3xl mb-3">Post not found</h1>
          <Link to="/blog" className="text-primary hover:underline">← Back to blog</Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <article className="container max-w-3xl py-12 md:py-16">
          <Link to="/blog" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6">
            <ArrowLeft className="h-4 w-4" /> All posts
          </Link>

          {post.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {post.tags.map((t) => (
                <span key={t} className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">{t}</span>
              ))}
            </div>
          )}

          <h1 className="font-display text-4xl md:text-5xl leading-tight mb-4">{post.title}</h1>
          <div className="text-sm text-muted-foreground mb-8">
            {post.author_name && <span>{post.author_name} · </span>}
            {post.published_at && new Date(post.published_at).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}
          </div>

          {post.cover_image_url && (
            <img src={post.cover_image_url} alt={post.title} className="rounded-3xl w-full aspect-[16/9] object-cover mb-10" />
          )}

          <div
            className="prose prose-slate dark:prose-invert max-w-none prose-headings:font-display prose-a:text-primary prose-img:rounded-2xl"
            dangerouslySetInnerHTML={{ __html: post.content_html }}
          />
        </article>
      </main>
      <Footer />
    </div>
  );
};

export default BlogPost;
