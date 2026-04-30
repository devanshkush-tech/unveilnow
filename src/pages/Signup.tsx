import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthShell } from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Mail, MailCheck, ArrowLeft, RefreshCw, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { trackMetaEvent } from "@/lib/metaCapi";

const Signup = () => {
  const navigate = useNavigate();
  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [sentTo, setSentTo] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accepted) {
      toast.error("Please accept the community guidelines.");
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/onboarding`,
          data: { first_name: firstName },
        },
      });
      if (error) {
        toast.error(error.message);
        return;
      }
      // Fire CompleteRegistration on successful signup (server hashes the email)
      trackMetaEvent("CompleteRegistration", {
        event_id: `signup_${data.user?.id ?? email}`,
        email,
        custom_data: { content_name: "Signup", status: "submitted" },
      });
      // If session is returned, email confirmation is disabled — go straight to onboarding
      if (data.session) {
        toast.success("Welcome to Unveil. Let's set up your profile.");
        navigate("/onboarding");
        return;
      }
      setSentTo(email);
    } finally {
      setLoading(false);
    }
  };

  const onGoogle = async () => {
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: `${window.location.origin}/onboarding`,
    });
    if (result.error) toast.error("Could not sign in with Google.");
  };

  const onResend = async () => {
    if (!sentTo) return;
    setResending(true);
    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: sentTo,
        options: { emailRedirectTo: `${window.location.origin}/onboarding` },
      });
      if (error) toast.error(error.message);
      else toast.success("Verification email re-sent.");
    } finally {
      setResending(false);
    }
  };

  // ----- Verification success state -----
  if (sentTo) {
    const domain = sentTo.split("@")[1] ?? "";
    const gmailUrl = domain.toLowerCase().includes("gmail")
      ? "https://mail.google.com"
      : `https://${domain}`;

    return (
      <AuthShell
        title="Almost there."
        subtitle="One quick step to keep Unveil real and safe."
      >
        <div className="animate-fade-up">
          <div className="rounded-3xl border border-border/60 bg-card shadow-card p-8 text-center">
            <div className="mx-auto h-16 w-16 rounded-full bg-gradient-romance flex items-center justify-center mb-5 animate-float">
              <MailCheck className="h-7 w-7 text-primary-foreground" />
            </div>
            <h2 className="font-display text-2xl mb-2">Account created 💌</h2>
            <p className="text-sm text-muted-foreground mb-1">
              We sent a verification link to
            </p>
            <p className="font-medium mb-5 break-all">{sentTo}</p>
            <p className="text-xs text-muted-foreground mb-6 leading-relaxed">
              Please verify your email to continue. <br />
              <span className="italic">Read me before you judge me.</span>
            </p>

            <div className="space-y-2.5">
              <Button asChild variant="hero" className="w-full h-12 rounded-full" size="lg">
                <a href={gmailUrl} target="_blank" rel="noreferrer">
                  <ExternalLink className="h-4 w-4" /> Open inbox
                </a>
              </Button>
              <Button
                onClick={onResend}
                disabled={resending}
                variant="soft"
                className="w-full h-11 rounded-full"
              >
                <RefreshCw className={`h-4 w-4 ${resending ? "animate-spin" : ""}`} />
                {resending ? "Resending…" : "Resend verification email"}
              </Button>
              <Button
                onClick={() => setSentTo(null)}
                variant="ghost"
                className="w-full h-11 rounded-full"
              >
                <ArrowLeft className="h-4 w-4" /> Change email
              </Button>
            </div>
          </div>

          <p className="text-center text-xs text-muted-foreground mt-6">
            Already verified?{" "}
            <Link to="/login" className="text-foreground underline underline-offset-2">
              Sign in
            </Link>
          </p>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Start your story."
      subtitle="Built for genuine intentions. Takes about 3 minutes."
      footer={
        <>
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-foreground hover:underline">Sign in</Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">First name</Label>
          <Input id="name" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="What should we call you?" required className="h-11 rounded-xl" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" required className="h-11 rounded-xl pl-10" />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 8 characters" required minLength={8} className="h-11 rounded-xl" />
        </div>

        <div className="flex items-start gap-3 pt-2">
          <Checkbox id="terms" checked={accepted} onCheckedChange={(v) => setAccepted(!!v)} className="mt-0.5" />
          <label htmlFor="terms" className="text-xs text-muted-foreground leading-relaxed">
            I agree to Unveil's{" "}
            <a href="#" className="text-foreground underline underline-offset-2">community guidelines</a> and{" "}
            <a href="#" className="text-foreground underline underline-offset-2">privacy policy</a>.
          </label>
        </div>

        <Button type="submit" variant="hero" className="w-full h-12 rounded-full" size="lg" disabled={loading}>
          {loading ? "Creating account…" : "Continue"}
        </Button>

        <div className="relative py-2">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
          <div className="relative flex justify-center"><span className="bg-background px-3 text-xs text-muted-foreground uppercase tracking-widest">or</span></div>
        </div>

        <Button type="button" onClick={onGoogle} variant="soft" className="w-full h-12 rounded-full" size="lg">
          Continue with Google
        </Button>
      </form>
    </AuthShell>
  );
};

export default Signup;
