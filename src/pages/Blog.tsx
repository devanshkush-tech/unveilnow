import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Loader2 } from "lucide-react";

type PostListItem = {
  id: string; slug: string; title: string; excerpt: string | null;
  cover_image_url: string | null; tags: string[]; author_name: string | null;
  published_at: string | null;
};

const FN = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/blog`;

const Blog = () => {
  const [posts, setPosts] = useState<PostListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = "Blog | Unveil Now — Dating Stories, Tips & Real Talk";
    const desc = "Real stories, dating advice, and relationship insights from Unveil Now — India's story-first dating platform.";
    let m = document.querySelector('meta[name="description"]');
    if (!m) { m = document.createElement("meta"); (m as HTMLMetaElement).name = "description"; document.head.appendChild(m); }
    m.setAttribute("content", desc);

    let canon = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canon) { canon = document.createElement("link"); canon.rel = "canonical"; document.head.appendChild(canon); }
    canon.href = "/blog";

    (async () => {
      try {
        const r = await fetch(`${FN}?action=list`);
        const d = await r.json();
        setPosts(d.posts ?? []);
      } finally { setLoading(false); }
    })();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <section className="container py-16 md:py-20">
          <header className="max-w-3xl mb-12">
            <p className="text-xs uppercase tracking-[0.2em] text-primary mb-3">Unveil Journal</p>
            <h1 className="font-display text-4xl md:text-5xl leading-tight mb-4">Stories, advice & real talk on modern dating</h1>
            <p className="text-muted-foreground text-lg">Honest perspectives on connection, chemistry, and finding someone who actually gets you.</p>
          </header>

          {loading ? (
            <div className="py-20 text-center"><Loader2 className="h-6 w-6 animate-spin inline text-muted-foreground" /></div>
          ) : posts.length === 0 ? (
            <div className="py-20 text-center text-muted-foreground">No posts yet — check back soon.</div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((p) => (
                <Link
                  key={p.id}
                  to={`/blog/${p.slug}`}
                  className="group rounded-3xl overflow-hidden bg-card border border-border/60 shadow-soft hover:shadow-elegant transition-all duration-300 hover:-translate-y-0.5"
                >
                  {p.cover_image_url ? (
                    <div className="aspect-[16/10] overflow-hidden bg-secondary">
                      <img src={p.cover_image_url} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                    </div>
                  ) : (
                    <div className="aspect-[16/10] bg-gradient-romance" />
                  )}
                  <div className="p-5">
                    {p.tags?.length > 0 && (
                      <div className="flex gap-2 mb-3">
                        {p.tags.slice(0, 2).map((t) => (
                          <span key={t} className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">{t}</span>
                        ))}
                      </div>
                    )}
                    <h2 className="font-display text-xl leading-snug mb-2 group-hover:text-primary transition-colors">{p.title}</h2>
                    {p.excerpt && <p className="text-sm text-muted-foreground line-clamp-3">{p.excerpt}</p>}
                    <div className="mt-4 text-xs text-muted-foreground">
                      {p.author_name && <span>{p.author_name} · </span>}
                      {p.published_at && new Date(p.published_at).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Blog;
