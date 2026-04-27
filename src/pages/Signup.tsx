import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthShell } from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Mail } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";

const Signup = () => {
  const navigate = useNavigate();
  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accepted) {
      toast.error("Please accept the community guidelines.");
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
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
      toast.success("Welcome to Unveil. Let's set up your profile.");
      navigate("/onboarding");
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
