import { useState } from "react";
import { Link } from "react-router-dom";
import { AuthShell } from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Mail, MailCheck, ArrowLeft, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sentTo, setSentTo] = useState<string | null>(null);

  const sendReset = async (target: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(target, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) throw error;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error("Please enter your email.");
      return;
    }
    setLoading(true);
    try {
      await sendReset(email.trim());
      setSentTo(email.trim());
    } catch (err: any) {
      // Don't reveal whether the email exists — show generic success-style message anyway
      console.warn("[forgot-password] reset error", err);
      setSentTo(email.trim());
    } finally {
      setLoading(false);
    }
  };

  const onResend = async () => {
    if (!sentTo) return;
    setLoading(true);
    try {
      await sendReset(sentTo);
      toast.success("Reset email re-sent.");
    } catch (err: any) {
      toast.error(err.message ?? "Couldn't resend. Try again.");
    } finally {
      setLoading(false);
    }
  };

  if (sentTo) {
    return (
      <AuthShell title="Check your inbox." subtitle="We've sent a reset link if an account exists.">
        <div className="rounded-3xl border border-border/60 bg-card shadow-card p-8 text-center animate-fade-up">
          <div className="mx-auto h-16 w-16 rounded-full bg-gradient-romance flex items-center justify-center mb-5">
            <MailCheck className="h-7 w-7 text-primary-foreground" />
          </div>
          <h2 className="font-display text-2xl mb-2">Reset link sent 💌</h2>
          <p className="text-sm text-muted-foreground mb-1">If an account exists for</p>
          <p className="font-medium mb-5 break-all">{sentTo}</p>
          <p className="text-xs text-muted-foreground mb-6 leading-relaxed">
            you'll receive a password reset email shortly. The link expires in 15 minutes.
          </p>

          <div className="space-y-2.5">
            <Button onClick={onResend} disabled={loading} variant="soft" className="w-full h-11 rounded-full">
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              {loading ? "Resending…" : "Resend reset email"}
            </Button>
            <Button asChild variant="ghost" className="w-full h-11 rounded-full">
              <Link to="/login"><ArrowLeft className="h-4 w-4" /> Back to sign in</Link>
            </Button>
          </div>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Forgot password?"
      subtitle="Enter your email and we'll send you a reset link."
      footer={
        <>
          Remembered it?{" "}
          <Link to="/login" className="font-medium text-foreground hover:underline">Sign in</Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com"
              required
              className="h-11 rounded-xl pl-10"
            />
          </div>
        </div>

        <Button type="submit" variant="hero" className="w-full h-12 rounded-full" size="lg" disabled={loading}>
          {loading ? "Sending…" : "Send reset link"}
        </Button>
      </form>
    </AuthShell>
  );
};

export default ForgotPassword;
