import { useEffect, useMemo, useState } from "react";
import { Loader2, Sparkles, RotateCcw, Save } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { adminAuth } from "@/lib/adminAuth";
import {
  DEFAULT_CHEMISTRY_WEIGHTS,
  computeChemistry,
  chemistryLabel,
  type ChemistryWeights,
  type Msg,
} from "@/lib/chemistry";

const KEY = "chemistry_weights";

// Synthetic preview thread — balanced 25/25 chat
const buildPreview = (perA: number, perB: number, avgLen = 70): Msg[] => {
  const out: Msg[] = [];
  const base = "Loved that — tell me more about your weekend plans, sounds fun";
  const text = base.slice(0, Math.max(20, avgLen));
  const max = Math.max(perA, perB);
  for (let i = 0; i < max; i++) {
    if (i < perA) out.push({ id: `a${i}`, sender_id: "A", body: text, created_at: "" });
    if (i < perB) out.push({ id: `b${i}`, sender_id: "B", body: text, created_at: "" });
  }
  return out;
};

const AdminChemistry = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [weights, setWeights] = useState<ChemistryWeights>(DEFAULT_CHEMISTRY_WEIGHTS);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);

  // preview controls
  const [previewA, setPreviewA] = useState(25);
  const [previewB, setPreviewB] = useState(25);
  const [previewLen, setPreviewLen] = useState(70);

  useEffect(() => {
    (async () => {
      try {
        const res = await adminAuth.call<{ value: Partial<ChemistryWeights> | null; updated_at: string | null }>(
          "get_setting",
          { key: KEY },
        );
        if (res?.value) setWeights({ ...DEFAULT_CHEMISTRY_WEIGHTS, ...res.value });
        setUpdatedAt(res?.updated_at ?? null);
      } catch (e: any) {
        toast.error(e.message);
      }
      setLoading(false);
    })();
  }, []);

  const sumWeights = useMemo(
    () => weights.volume + weights.balance + weights.turnTaking + weights.depth,
    [weights],
  );

  const previewScore = useMemo(() => {
    const msgs = buildPreview(previewA, previewB, previewLen);
    return computeChemistry(msgs, "A", "B", weights);
  }, [weights, previewA, previewB, previewLen]);

  const update = (patch: Partial<ChemistryWeights>) =>
    setWeights((w) => ({ ...w, ...patch }));

  const normalize = () => {
    const s = sumWeights || 1;
    setWeights((w) => ({
      ...w,
      volume: +(w.volume / s).toFixed(3),
      balance: +(w.balance / s).toFixed(3),
      turnTaking: +(w.turnTaking / s).toFixed(3),
      depth: +(w.depth / s).toFixed(3),
    }));
  };

  const reset = () => setWeights(DEFAULT_CHEMISTRY_WEIGHTS);

  const save = async () => {
    if (Math.abs(sumWeights - 1) > 0.02) {
      toast.error("Weights must sum to 1.0 (currently " + sumWeights.toFixed(2) + "). Use Normalize.");
      return;
    }
    setSaving(true);
    try {
      await adminAuth.call("set_setting", { key: KEY, value: weights });
      toast.success("Chemistry weights saved.");
      setUpdatedAt(new Date().toISOString());
    } catch (e: any) {
      toast.error(e.message);
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const sliders: { key: keyof ChemistryWeights; label: string; hint: string }[] = [
    { key: "volume", label: "Volume", hint: "Reward for both sides actually sending messages." },
    { key: "balance", label: "Balance", hint: "Penalty when one side dominates the chat." },
    { key: "turnTaking", label: "Turn-taking", hint: "Reward for back-and-forth instead of monologues." },
    { key: "depth", label: "Depth", hint: "Reward for non-trivial message length." },
  ];

  return (
    <div className="space-y-6">
      <div className="rounded-3xl bg-card border border-border/60 shadow-soft p-5 md:p-6 space-y-5">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <h2 className="font-display text-xl flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" /> Chemistry meter tuning
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Live-tune the formula that powers the chemistry bar in chats. Changes apply to all users immediately.
            </p>
            {updatedAt && (
              <p className="text-xs text-muted-foreground mt-1">
                Last saved {new Date(updatedAt).toLocaleString()}
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="rounded-full" onClick={reset}>
              <RotateCcw className="h-4 w-4" /> Reset
            </Button>
            <Button variant="hero" size="sm" className="rounded-full" onClick={save} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          <div className="space-y-2">
            <Label className="text-sm">Per-user message target</Label>
            <Input
              type="number"
              min={1}
              max={200}
              value={weights.perUserTarget}
              onChange={(e) => update({ perUserTarget: Math.max(1, parseInt(e.target.value || "1", 10)) })}
              className="rounded-xl"
            />
            <p className="text-xs text-muted-foreground">
              How many messages each side must send for volume to saturate (current: {weights.perUserTarget} each = {weights.perUserTarget * 2} total).
            </p>
          </div>
          <div className="space-y-2">
            <Label className="text-sm">Curve (1 = linear, &gt;1 = harder, &lt;1 = easier)</Label>
            <Input
              type="number"
              step="0.05"
              min={0.3}
              max={3}
              value={weights.curve}
              onChange={(e) => update({ curve: Math.max(0.3, Math.min(3, parseFloat(e.target.value || "1"))) })}
              className="rounded-xl"
            />
            <p className="text-xs text-muted-foreground">Power applied at the end. Higher = slower growth at the top.</p>
          </div>
        </div>

        <div className="space-y-5">
          {sliders.map((s) => (
            <div key={s.key}>
              <div className="flex items-center justify-between mb-1.5">
                <Label className="text-sm">{s.label}</Label>
                <span className="text-sm font-medium tabular-nums">
                  {Math.round((weights[s.key] as number) * 100)}%
                </span>
              </div>
              <Slider
                value={[(weights[s.key] as number) * 100]}
                min={0}
                max={100}
                step={1}
                onValueChange={(v) => update({ [s.key]: v[0] / 100 } as Partial<ChemistryWeights>)}
              />
              <p className="text-xs text-muted-foreground mt-1">{s.hint}</p>
            </div>
          ))}

          <div
            className={`flex items-center justify-between rounded-xl border px-4 py-3 text-sm ${
              Math.abs(sumWeights - 1) > 0.02
                ? "border-destructive/50 bg-destructive/10 text-destructive"
                : "border-border/60 bg-secondary/40 text-muted-foreground"
            }`}
          >
            <span>Weights total: {(sumWeights * 100).toFixed(0)}% (must equal 100%)</span>
            <Button variant="ghost" size="sm" className="rounded-full" onClick={normalize}>
              Normalize
            </Button>
          </div>
        </div>
      </div>

      {/* Live preview */}
      <div className="rounded-3xl bg-card border border-border/60 shadow-soft p-5 md:p-6 space-y-5">
        <div>
          <h3 className="font-display text-lg">Live preview</h3>
          <p className="text-sm text-muted-foreground">Simulate a conversation to see what users would see.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <Label className="text-sm">User A messages: {previewA}</Label>
            <Slider value={[previewA]} min={0} max={50} step={1} onValueChange={(v) => setPreviewA(v[0])} className="mt-2" />
          </div>
          <div>
            <Label className="text-sm">User B messages: {previewB}</Label>
            <Slider value={[previewB]} min={0} max={50} step={1} onValueChange={(v) => setPreviewB(v[0])} className="mt-2" />
          </div>
          <div>
            <Label className="text-sm">Avg message length: {previewLen}</Label>
            <Slider value={[previewLen]} min={5} max={120} step={1} onValueChange={(v) => setPreviewLen(v[0])} className="mt-2" />
          </div>
        </div>

        <div className="rounded-2xl bg-gradient-soft p-5 border border-border/60">
          <div className="flex items-center justify-between mb-2 text-sm">
            <span className="text-muted-foreground">Chemistry</span>
            <span className="font-semibold">{previewScore}% · {chemistryLabel(previewScore)}</span>
          </div>
          <div className="h-3 rounded-full bg-secondary overflow-hidden">
            <div
              className="h-full bg-gradient-romance transition-all duration-500"
              style={{ width: `${previewScore}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            Reveal unlocks at 60%. Currently {previewScore >= 60 ? "✅ unlocked" : "🔒 locked"} for this preview.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminChemistry;
