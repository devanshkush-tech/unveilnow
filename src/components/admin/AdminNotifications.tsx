import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Send } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

type Campaign = {
  id: string;
  title: string;
  body: string;
  type: string;
  audience: Record<string, unknown>;
  sent_count: number;
  email_status: string | null;
  created_at: string;
};

const AdminNotifications = () => {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [type, setType] = useState("announcement");
  const [ctaText, setCtaText] = useState("");
  const [ctaLink, setCtaLink] = useState("");
  const [sendInApp, setSendInApp] = useState(true);
  const [sendEmail, setSendEmail] = useState(false);
  const [audienceType, setAudienceType] = useState<"all" | "plan" | "city" | "gender" | "user">("all");
  const [audienceValue, setAudienceValue] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [history, setHistory] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  const loadHistory = async () => {
    setLoading(true);
    const { data } = await supabase.from("notification_campaigns").select("*").order("created_at", { ascending: false }).limit(50);
    setHistory((data ?? []) as Campaign[]);
    setLoading(false);
  };
  useEffect(() => { loadHistory(); }, []);

  const send = async () => {
    if (!title.trim() || !body.trim()) { toast.error("Title and message are required."); return; }
    setSubmitting(true);
    try {
      // Resolve audience to user_ids
      let q = supabase.from("profiles").select("id");
      if (audienceType === "plan" && audienceValue) q = q.eq("selected_plan", audienceValue);
      else if (audienceType === "city" && audienceValue) q = q.ilike("city", `%${audienceValue}%`);
      else if (audienceType === "gender" && audienceValue) q = q.eq("gender", audienceValue);
      else if (audienceType === "user" && audienceValue) q = q.eq("id", audienceValue);
      const { data: rows, error } = await q;
      if (error) throw error;
      const userIds = (rows ?? []).map((r: { id: string }) => r.id);
      if (userIds.length === 0) { toast.error("No users matched the audience."); setSubmitting(false); return; }

      const audience = { type: audienceType, value: audienceValue || null, count: userIds.length };
      const { data: { user } } = await supabase.auth.getUser();

      // Insert campaign
      const { data: campaign, error: cErr } = await supabase
        .from("notification_campaigns")
        .insert({
          title, body, type,
          cta_text: ctaText || null, cta_link: ctaLink || null,
          audience, send_in_app: sendInApp, send_email: sendEmail,
          sent_count: userIds.length, sent_by: user?.id ?? null,
          email_status: sendEmail ? "queued" : null,
        }).select("id").single();
      if (cErr) throw cErr;

      if (sendInApp) {
        // Bulk-insert in batches
        const rowsToInsert = userIds.map((uid) => ({
          user_id: uid, type, title, body,
          cta_text: ctaText || null, cta_link: ctaLink || null,
          data: { campaign_id: campaign?.id },
        }));
        for (let i = 0; i < rowsToInsert.length; i += 500) {
          await supabase.from("notifications").insert(rowsToInsert.slice(i, i + 500));
        }
      }

      toast.success(`Sent to ${userIds.length} user${userIds.length === 1 ? "" : "s"}.`);
      setTitle(""); setBody(""); setCtaText(""); setCtaLink(""); setAudienceValue("");
      loadHistory();
    } catch (e: any) {
      toast.error(e.message ?? "Failed to send.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-border/60 bg-card p-6 space-y-4">
        <h2 className="font-display text-xl">Send Notification</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Title</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="A new feature is here" maxLength={120} />
          </div>
          <div className="space-y-2">
            <Label>Type</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="announcement">Announcement</SelectItem>
                <SelectItem value="plan_expiring">Plan expiring soon</SelectItem>
                <SelectItem value="profile_approved">Profile approved</SelectItem>
                <SelectItem value="payment_success">Payment success</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="space-y-2">
          <Label>Message</Label>
          <Textarea value={body} onChange={(e) => setBody(e.target.value)} rows={4} maxLength={500} placeholder="Share details with your audience…" />
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>CTA text (optional)</Label>
            <Input value={ctaText} onChange={(e) => setCtaText(e.target.value)} placeholder="Open dashboard" maxLength={40} />
          </div>
          <div className="space-y-2">
            <Label>CTA link (optional)</Label>
            <Input value={ctaLink} onChange={(e) => setCtaLink(e.target.value)} placeholder="/dashboard" maxLength={200} />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Audience</Label>
            <Select value={audienceType} onValueChange={(v) => { setAudienceType(v as any); setAudienceValue(""); }}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All users</SelectItem>
                <SelectItem value="plan">By plan</SelectItem>
                <SelectItem value="city">By city</SelectItem>
                <SelectItem value="gender">By gender</SelectItem>
                <SelectItem value="user">Single user (id)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {audienceType !== "all" && (
            <div className="space-y-2">
              <Label>{audienceType === "plan" ? "Plan id (starter/premium/elite)" : audienceType === "gender" ? "Gender" : audienceType === "city" ? "City contains" : "User UUID"}</Label>
              <Input value={audienceValue} onChange={(e) => setAudienceValue(e.target.value)} />
            </div>
          )}
        </div>

        <div className="flex items-center gap-6">
          <label className="flex items-center gap-2 text-sm">
            <Switch checked={sendInApp} onCheckedChange={setSendInApp} /> Send in-app
          </label>
          <label className="flex items-center gap-2 text-sm">
            <Switch checked={sendEmail} onCheckedChange={setSendEmail} /> Send email (when configured)
          </label>
        </div>

        <div>
          <Button onClick={send} disabled={submitting} className="rounded-full">
            {submitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Sending…</> : <><Send className="h-4 w-4" /> Send notification</>}
          </Button>
        </div>
      </section>

      <section className="rounded-2xl border border-border/60 bg-card p-6 space-y-3">
        <h2 className="font-display text-xl">History</h2>
        {loading ? <div className="text-sm text-muted-foreground">Loading…</div>
          : history.length === 0 ? <div className="text-sm text-muted-foreground">No campaigns sent yet.</div>
          : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs text-muted-foreground">
                <tr><th className="py-2 pr-3">Title</th><th className="py-2 pr-3">Audience</th><th className="py-2 pr-3">Sent</th><th className="py-2 pr-3">Email</th><th className="py-2 pr-3">When</th></tr>
              </thead>
              <tbody>
                {history.map((c) => (
                  <tr key={c.id} className="border-t border-border/40">
                    <td className="py-2 pr-3 font-medium">{c.title}</td>
                    <td className="py-2 pr-3 text-xs text-muted-foreground">{(c.audience as any)?.type ?? "all"}{(c.audience as any)?.value ? ` · ${(c.audience as any).value}` : ""}</td>
                    <td className="py-2 pr-3">{c.sent_count}</td>
                    <td className="py-2 pr-3 text-xs">{c.email_status ?? "—"}</td>
                    <td className="py-2 pr-3 text-xs text-muted-foreground">{formatDistanceToNow(new Date(c.created_at), { addSuffix: true })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};

export default AdminNotifications;
