import { Link, useNavigate } from "react-router-dom";
import { AuthShell } from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const Login = () => {
  const navigate = useNavigate();

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Welcome back.");
    navigate("/dashboard");
  };

  return (
    <AuthShell
      title="Welcome back."
      subtitle="Pick up where your story left off."
      footer={
        <>
          New to Unveil?{" "}
          <Link to="/signup" className="font-medium text-foreground hover:underline">Create an account</Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email or phone</Label>
          <Input id="email" required className="h-11 rounded-xl" placeholder="you@email.com" />
        </div>
        <div className="space-y-2">
          <div className="flex justify-between">
            <Label htmlFor="password">Password</Label>
            <a href="#" className="text-xs text-muted-foreground hover:text-foreground">Forgot?</a>
          </div>
          <Input id="password" type="password" required className="h-11 rounded-xl" placeholder="••••••••" />
        </div>
        <Button type="submit" variant="hero" className="w-full h-12 rounded-full" size="lg">
          Sign in
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

export default Login;
