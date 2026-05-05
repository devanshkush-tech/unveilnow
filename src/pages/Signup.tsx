import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthShell } from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Mail, MailCheck, ArrowLeft, RefreshCw, ExternalLink, Phone } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { trackMetaEvent } from "@/lib/metaCapi";

const PHONE_REGEX = /^\+[1-9]\d{7,14}$/; // E.164: + followed by country code and digits

const Signup = () => {
  const navigate = useNavigate();
  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("+91");
  const [password, setPassword] = useState("");
  const [sentTo, setSentTo] = useState<string | null>(null);

  // Auto-advance the moment Supabase confirms the email — works whether the
  // confirmation link opens this tab or another tab on the same browser
  // (BroadcastChannel/localStorage events propagate the new session here).
  useEffect(() => {
    if (!sentTo) return;
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user && (event === "SIGNED_IN" || event === "TOKEN_REFRESHED" || event === "USER_UPDATED")) {
        toast.success("Email verified — let's set up your profile.");
        navigate("/onboarding", { replace: true });
      }
    });
    // Also poll once a few seconds in case the listener missed the cross-tab event.
    const interval = setInterval(async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session?.user) {
        clearInterval(interval);
        navigate("/onboarding", { replace: true });
      }
    }, 3000);
    return () => {
      sub.subscription.unsubscribe();
      clearInterval(interval);
    };
  }, [sentTo, navigate]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accepted) {
      toast.error("Please accept the community guidelines.");
      return;
    }
    const trimmedPhone = phone.trim().replace(/\s+/g, "");
    const trimmedEmail = email.trim();

    // Capture lead BEFORE auth.signUp so we record every attempt — even invalid phone, weak password,
    // already-registered emails, or users who never click the verification link.
    void fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/capture-lead`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: trimmedEmail || undefined,
        phone: trimmedPhone || undefined,
        first_name: firstName || undefined,
        source: "signup_form",
      }),
    }).catch(() => {});

    if (!PHONE_REGEX.test(trimmedPhone)) {
      toast.error("Enter a valid phone number with country code (e.g. +911234567890).");
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: trimmedEmail,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/onboarding`,
          data: { first_name: firstName, phone: trimmedPhone },
        },
      });
      if (error) {
        // Record the failure on the lead so admins can see why signup didn't complete.
        void fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/capture-lead`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: trimmedEmail, phone: trimmedPhone, last_error: error.message }),
        }).catch(() => {});
        toast.error(error.message);
        return;
      }
      // Persist phone on the profile (handle_new_user trigger creates the row).
      if (data.user?.id) {
        await supabase.from("profiles").update({ phone: trimmedPhone }).eq("id", data.user.id);
      }
      // Mark lead as having a real auth user attached.
      void fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/capture-lead`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: trimmedEmail,
          phone: trimmedPhone,
          auth_user_id: data.user?.id,
          signup_completed: !!data.session,
          email_verified: !!data.session,
        }),
      }).catch(() => {});
      // Fire CompleteRegistration on successful signup (fire-and-forget; never blocks UX)
      void trackMetaEvent("CompleteRegistration", {
        event_id: `signup_${data.user?.id ?? trimmedEmail}`,
        email: trimmedEmail,
        custom_data: { content_name: "Signup", status: "submitted" },
      });
      // If session is returned, email confirmation is disabled — go straight to onboarding
      if (data.session) {
        toast.success("Welcome to Unveil. Let's set up your profile.");
        navigate("/onboarding");
        return;
      }
      setSentTo(trimmedEmail);
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
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} onBlur={() => captureLead({ email, phone, first_name: firstName })} placeholder="you@email.com" required className="h-11 rounded-xl pl-10" />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone number <span className="text-destructive">*</span></Label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="phone"
              type="tel"
              inputMode="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              onBlur={() => captureLead({ email, phone, first_name: firstName })}
              placeholder="+91 9876543210"
              required
              pattern="^\+[1-9]\d{7,14}$"
              title="Include country code, e.g. +911234567890"
              className="h-11 rounded-xl pl-10"
            />
          </div>
          <p className="text-[11px] text-muted-foreground">Required. Include your country code (e.g. +91 for India).</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <PasswordInput id="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 8 characters" required minLength={8} className="h-11 rounded-xl" />
        </div>

        <div className="flex items-start gap-3 pt-2">
          <Checkbox id="terms" checked={accepted} onCheckedChange={(v) => setAccepted(!!v)} className="mt-0.5" />
          <label htmlFor="terms" className="text-xs text-muted-foreground leading-relaxed">
            I agree to Unveil's{" "}
            <Link to="/terms" className="text-foreground underline underline-offset-2">community guidelines</Link> and{" "}
            <Link to="/privacy" className="text-foreground underline underline-offset-2">privacy policy</Link>.
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
