import { Link } from "react-router-dom";
import { Instagram, Twitter } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="border-t border-border/60 bg-gradient-soft">
      <div className="container py-16">
        <div className="grid md:grid-cols-4 gap-10">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-gradient-romance flex items-center justify-center">
                <span className="font-display text-primary-foreground text-lg leading-none pb-0.5">U</span>
              </div>
              <span className="font-display text-xl">Unveil</span>
            </div>
            <p className="text-sm text-muted-foreground max-w-xs">
              Looks later. Vibes first. Meaningful dating for people who value connection over appearances.
            </p>
            <div className="flex gap-3 pt-2">
              <a
                href="https://instagram.com/unveilnow"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="h-9 w-9 rounded-full bg-secondary flex items-center justify-center hover:bg-accent/30 transition-colors"
              >
                <Instagram className="h-4 w-4" />
              </a>
              <a
                href="https://twitter.com/unveilnow"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Twitter"
                className="h-9 w-9 rounded-full bg-secondary flex items-center justify-center hover:bg-accent/30 transition-colors"
              >
                <Twitter className="h-4 w-4" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-display text-base mb-4">Product</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><a href="/#how" className="hover:text-foreground">How it works</a></li>
              <li><Link to="/pricing" className="hover:text-foreground">Pricing</Link></li>
              <li><Link to="/trust" className="hover:text-foreground">Trust & Safety</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-display text-base mb-4">Company</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><Link to="/trust" className="hover:text-foreground">About</Link></li>
              <li><Link to="/contact" className="hover:text-foreground">Contact Us</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-display text-base mb-4">Legal</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><Link to="/terms" className="hover:text-foreground">Terms & Conditions</Link></li>
              <li><Link to="/privacy" className="hover:text-foreground">Privacy Policy</Link></li>
              <li><Link to="/refund-policy" className="hover:text-foreground">Refund & Cancellation Policy</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-14 pt-6 border-t border-border/60 flex flex-col md:flex-row justify-between gap-3 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} Unveil. Built for genuine intentions.</p>
          <p className="italic font-display">"Connection before attraction."</p>
        </div>
      </div>
    </footer>
  );
};
