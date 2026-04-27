import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthShell } from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Mail, Phone } from "lucide-react";

const Signup = () => {
  const navigate = useNavigate();
  const [method, setMethod] = useState<"email" | "phone">("email");
  const [accepted, setAccepted] = useState(false);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!accepted) {
      toast.error("Please accept the community guidelines.");
      return;
    }
    toast.success("Welcome to Unveil. Let's set up your profile.");
    navigate("/onboarding");
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
      <div className="flex p-1 rounded-full bg-secondary mb-6 text-sm">
        {(["email", "phone"] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMethod(m)}
            className={`flex-1 py-2 rounded-full transition-all ${
              method === m ? "bg-background shadow-soft text-foreground" : "text-muted-foreground"
            }`}
          >
            {m === "email" ? "Email" : "Phone"}
          </button>
        ))}
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">First name</Label>
          <Input id="name" placeholder="What should we call you?" required className="h-11 rounded-xl" />
        </div>
        {method === "email" ? (
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input id="email" type="email" placeholder="you@email.com" required className="h-11 rounded-xl pl-10" />
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input id="phone" type="tel" placeholder="+91 98765 43210" required className="h-11 rounded-xl pl-10" />
            </div>
            <p className="text-xs text-muted-foreground">We'll send a 6-digit code to verify.</p>
          </div>
        )}

        <div className="flex items-start gap-3 pt-2">
          <Checkbox id="terms" checked={accepted} onCheckedChange={(v) => setAccepted(!!v)} className="mt-0.5" />
          <label htmlFor="terms" className="text-xs text-muted-foreground leading-relaxed">
            I agree to Unveil's{" "}
            <a href="#" className="text-foreground underline underline-offset-2">community guidelines</a> and{" "}
            <a href="#" className="text-foreground underline underline-offset-2">privacy policy</a>.
          </label>
        </div>

        <Button type="submit" variant="hero" className="w-full h-12 rounded-full" size="lg">
          Continue
        </Button>

        <div className="relative py-2">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
          <div className="relative flex justify-center"><span className="bg-background px-3 text-xs text-muted-foreground uppercase tracking-widest">or</span></div>
        </div>

        <Button type="button" variant="soft" className="w-full h-12 rounded-full" size="lg">
          Continue with Google
        </Button>
      </form>
    </AuthShell>
  );
};

export default Signup;
