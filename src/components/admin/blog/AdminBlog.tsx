import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { adminAuth } from "@/lib/adminAuth";
import { toast } from "sonner";
import { Loader2, Plus, Trash2, ExternalLink, ImagePlus, ArrowLeft } from "lucide-react";
import { RichTextEditor } from "./RichTextEditor";

type PostRow = {
  id: string; slug: string; title: string; excerpt: string | null; cover_image_url: string | null;
  status: "draft" | "published"; published_at: string | null; tags: string[]; author_name: string | null;
  updated_at: string;
};

type Post = PostRow & {
  content_html: string; seo_title: string | null; seo_description: string | null;
};

const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-");

const AdminBlog = () => {
  const [posts, setPosts] = useState<PostRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Post | null>(null);
  const [saving, setSaving] = useState(false);
  const coverInput = useRef<HTMLInputElement>(null);

  const load = async () => {
    setLoading(true);
    try {
      const r = await adminAuth.call<{ posts: PostRow[] }>("blog_list_all");
      setPosts(r.posts ?? []);
    } catch (e: any) { toast.error(e.message); }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const startNew = () => setEditing({
    id: "", slug: "", title: "", excerpt: "", cover_image_url: "", content_html: "",
    seo_title: "", seo_description: "", tags: [], author_name: "", status: "draft",
    published_at: null, updated_at: new Date().toISOString(),
  });

  const openEdit = async (id: string) => {
    try {
      const r = await adminAuth.call<{ post: Post }>("blog_get", { id });
      setEditing(r.post);
    } catch (e: any) { toast.error(e.message); }
  };

  const save = async () => {
    if (!editing) return;
    if (!editing.title) return toast.error("Title is required");
    const slug = editing.slug ? slugify(editing.slug) : slugify(editing.title);
    setSaving(true);
    try {
      const r = await adminAuth.call<{ post: Post }>("blog_upsert", { post: { ...editing, slug } });
      toast.success("Saved");
      setEditing(r.post);
      load();
    } catch (e: any) { toast.error(e.message); }
    setSaving(false);
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this post?")) return;
    try {
      await adminAuth.call("blog_delete", { id });
      toast.success("Deleted");
      if (editing?.id === id) setEditing(null);
      load();
    } catch (e: any) { toast.error(e.message); }
  };

  const uploadCover = async (file: File) => {
    if (file.size > 5 * 1024 * 1024) return toast.error("Image too large (max 5MB)");
    const buf = await file.arrayBuffer();
    const b64 = btoa(String.fromCharCode(...new Uint8Array(buf)));
    try {
      const res = await adminAuth.call<{ url: string }>("blog_upload_media", {
        filename: file.name, content_type: file.type, data_base64: b64,
      });
      setEditing((e) => e ? { ...e, cover_image_url: res.url } : e);
    } catch (e: any) { toast.error(e.message); }
  };

  if (editing) {
    return (
      <div className="space-y-5">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <Button variant="ghost" size="sm" onClick={() => setEditing(null)}>
            <ArrowLeft className="h-4 w-4" /> Back to posts
          </Button>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm">
              <Switch
                checked={editing.status === "published"}
                onCheckedChange={(v) => setEditing({ ...editing, status: v ? "published" : "draft" })}
              />
              {editing.status === "published" ? "Published" : "Draft"}
            </div>
            {editing.id && editing.status === "published" && (
              <a href={`/blog/${editing.slug}`} target="_blank" rel="noreferrer" className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
                <ExternalLink className="h-3.5 w-3.5" /> View
              </a>
            )}
            <Button onClick={save} disabled={saving} className="rounded-full">
              {saving && <Loader2 className="h-4 w-4 animate-spin" />} Save
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 space-y-4">
            <div>
              <Label>Title</Label>
              <Input
                value={editing.title}
                onChange={(e) => setEditing({ ...editing, title: e.target.value, slug: editing.slug || slugify(e.target.value) })}
                placeholder="Your headline (H1)"
                className="h-12 text-lg"
              />
            </div>
            <div>
              <Label>Excerpt (short summary shown on the blog list)</Label>
              <Textarea
                value={editing.excerpt ?? ""}
                onChange={(e) => setEditing({ ...editing, excerpt: e.target.value })}
                rows={2}
                placeholder="1–2 sentence summary"
              />
            </div>
            <div>
              <Label>Content</Label>
              <RichTextEditor
                value={editing.content_html}
                onChange={(html) => setEditing({ ...editing, content_html: html })}
              />
            </div>
          </div>

          <div className="space-y-5">
            <div className="rounded-2xl border border-border/60 p-4 space-y-3">
              <Label>Cover image</Label>
              {editing.cover_image_url ? (
                <div className="space-y-2">
                  <img src={editing.cover_image_url} alt="cover" className="rounded-xl w-full aspect-video object-cover" />
                  <Button variant="outline" size="sm" className="w-full" onClick={() => setEditing({ ...editing, cover_image_url: "" })}>
                    Remove
                  </Button>
                </div>
              ) : (
                <Button variant="outline" className="w-full" onClick={() => coverInput.current?.click()}>
                  <ImagePlus className="h-4 w-4" /> Upload cover
                </Button>
              )}
              <input
                ref={coverInput} type="file" accept="image/*" className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadCover(f); e.target.value = ""; }}
              />
            </div>

            <div className="rounded-2xl border border-border/60 p-4 space-y-3">
              <div>
                <Label>Slug</Label>
                <Input
                  value={editing.slug}
                  onChange={(e) => setEditing({ ...editing, slug: e.target.value })}
                  placeholder="my-post-url"
                />
                <p className="text-xs text-muted-foreground mt-1">/blog/{editing.slug || "..."}</p>
              </div>
              <div>
                <Label>Author</Label>
                <Input
                  value={editing.author_name ?? ""}
                  onChange={(e) => setEditing({ ...editing, author_name: e.target.value })}
                  placeholder="Author name"
                />
              </div>
              <div>
                <Label>Tags (comma separated)</Label>
                <Input
                  value={(editing.tags ?? []).join(", ")}
                  onChange={(e) => setEditing({ ...editing, tags: e.target.value.split(",").map((t) => t.trim()).filter(Boolean) })}
                  placeholder="dating, relationships"
                />
              </div>
            </div>

            <div className="rounded-2xl border border-border/60 p-4 space-y-3">
              <div className="text-sm font-medium">SEO</div>
              <div>
                <Label>SEO title</Label>
                <Input
                  value={editing.seo_title ?? ""}
                  onChange={(e) => setEditing({ ...editing, seo_title: e.target.value })}
                  placeholder="Defaults to title (≤60 chars)"
                  maxLength={70}
                />
              </div>
              <div>
                <Label>Meta description</Label>
                <Textarea
                  value={editing.seo_description ?? ""}
                  onChange={(e) => setEditing({ ...editing, seo_description: e.target.value })}
                  rows={3}
                  placeholder="≤160 chars"
                  maxLength={200}
                />
              </div>
            </div>

            {editing.id && (
              <Button variant="destructive" className="w-full rounded-full" onClick={() => remove(editing.id)}>
                <Trash2 className="h-4 w-4" /> Delete post
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl">Blog posts</h2>
        <Button onClick={startNew} className="rounded-full">
          <Plus className="h-4 w-4" /> New post
        </Button>
      </div>

      <div className="rounded-3xl bg-card border border-border/60 overflow-hidden">
        {loading ? (
          <div className="p-10 text-center"><Loader2 className="h-5 w-5 animate-spin inline text-muted-foreground" /></div>
        ) : posts.length === 0 ? (
          <div className="p-10 text-center text-muted-foreground">No posts yet — create your first one.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-secondary/60 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="text-left px-4 py-3">Title</th>
                <th className="text-left px-4 py-3">Slug</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-left px-4 py-3">Updated</th>
                <th className="text-right px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((p) => (
                <tr key={p.id} className="border-t border-border/40 hover:bg-secondary/30">
                  <td className="px-4 py-3">
                    <button onClick={() => openEdit(p.id)} className="font-medium hover:underline text-left">{p.title}</button>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">/{p.slug}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${p.status === "published" ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"}`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{new Date(p.updated_at).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-right">
                    <Button variant="ghost" size="sm" onClick={() => openEdit(p.id)}>Edit</Button>
                    <Button variant="ghost" size="sm" onClick={() => remove(p.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminBlog;
