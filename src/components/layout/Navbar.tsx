import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { useAuth } from "@/hooks/useAuth";


const Logo = ({ className = "" }: { className?: string }) => (
  <Link to="/" className={`flex items-center gap-2 ${className}`}>
    <div className="relative h-8 w-8 rounded-full bg-gradient-romance shadow-soft flex items-center justify-center">
      <span className="font-display text-primary-foreground text-lg leading-none pb-0.5">U</span>
    </div>
    <span className="font-display text-xl font-medium tracking-tight">UNVEIL NOW</span>
  </Link>
);

const navLinks = [
  { label: "How It Works", href: "/#how" },
  { label: "Why Unveil", href: "/#why" },
  { label: "What Users Say", href: "/#stories" },
  { label: "Plans", href: "/pricing" },
  { label: "FAQ", href: "/#faq" },
];

export const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { pathname } = useLocation();
  const { user } = useAuth();


  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${
        scrolled ? "glass shadow-soft" : "bg-transparent"
      }`}
    >
      <div className="container flex items-center justify-between h-16 md:h-20">
        <Logo />
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {l.label}
            </a>
          ))}
        </nav>
        <div className="hidden md:flex items-center gap-3">
          {user && <NotificationBell />}

          {!user && (
            <Button variant="ghost" size="sm" asChild>
              <Link to="/login">Sign in</Link>
            </Button>
          )}
          {user ? (
            <Button variant="hero" size="sm" className="rounded-full" asChild>
              <Link to="/dashboard">Dashboard</Link>
            </Button>
          ) : (
            <Button variant="hero" size="sm" className="rounded-full" asChild>
              <Link to="/signup">Create My Profile</Link>
            </Button>
          )}
        </div>
        <button
          className="md:hidden p-2 -mr-2 text-foreground"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
      {open && (
        <div className="md:hidden glass border-t border-border/40 animate-fade-in">
          <div className="container py-6 flex flex-col gap-4">
            {user && (
              <div className="flex items-center justify-end">
                <NotificationBell />
              </div>
            )}

            {navLinks.map((l) => (
              <a key={l.href} href={l.href} className="text-base text-foreground py-2">
                {l.label}
              </a>
            ))}
            <div className="flex gap-3 pt-2">
              {user ? (
                <Button variant="hero" className="flex-1 rounded-full" asChild>
                  <Link to="/dashboard">Open dashboard</Link>
                </Button>
              ) : (
                <>
                  <Button variant="soft" className="flex-1" asChild>
                    <Link to="/login">Sign in</Link>
                  </Button>
                  <Button variant="hero" className="flex-1 rounded-full" asChild>
                    <Link to="/signup">Get started</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};



