import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ShieldCheck, Loader2 } from "lucide-react";
import { adminAuth } from "@/lib/adminAuth";

const AdminLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    (async () => {
      const me = await adminAuth.verify();
      if (me) navigate("/admindashboard", { replace: true });
      setChecking(false);
    })();
  }, [navigate]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await adminAuth.login(email.trim(), password);
      toast.success("Welcome back, admin.");
      navigate("/admindashboard", { replace: true });
    } catch (err: any) {
      toast.error(err?.message ?? "Login failed");
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-soft">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-soft p-6">
      <div className="w-full max-w-md rounded-3xl bg-card border border-border/60 shadow-card p-8 animate-fade-up">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-12 w-12 rounded-2xl bg-gradient-romance flex items-center justify-center">
            <ShieldCheck className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-display text-2xl leading-tight">Admin Console</h1>
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Unveil · Restricted</p>
          </div>
        </div>
        <p className="text-sm text-muted-foreground mb-6">
          This area is for Unveil staff only. Member accounts cannot sign in here.
        </p>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Admin email</Label>
            <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="h-11 rounded-xl" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <PasswordInput id="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="h-11 rounded-xl" />
          </div>
          <Button type="submit" variant="hero" size="lg" className="w-full h-12 rounded-full" disabled={loading}>
            {loading ? "Signing in…" : "Sign in to admin"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
