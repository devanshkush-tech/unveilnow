import { Link } from "react-router-dom";
import { Instagram } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="border-t border-border/60 bg-gradient-soft">
      <div className="container py-14">
        <div className="grid md:grid-cols-4 gap-10">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-gradient-romance flex items-center justify-center">
                <span className="font-display text-primary-foreground text-lg leading-none pb-0.5">U</span>
              </div>
              <span className="font-display text-xl tracking-tight">UNVEIL NOW</span>
            </div>
            <p className="text-sm text-muted-foreground max-w-xs italic">
              Feel the connection first, then images.
            </p>
            <div className="flex gap-3 pt-2">
              <a href="https://instagram.com/unveilnow" target="_blank" rel="noopener noreferrer" aria-label="Instagram"
                className="h-9 w-9 rounded-full bg-secondary flex items-center justify-center hover:bg-accent/30 transition-colors">
                <Instagram className="h-4 w-4" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-display text-base mb-4">Product</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><a href="/#how" className="hover:text-foreground">How It Works</a></li>
              <li><Link to="/pricing" className="hover:text-foreground">Plans</Link></li>
              <li><a href="/#stories" className="hover:text-foreground">What Users Say</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-display text-base mb-4">Company</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><Link to="/trust" className="hover:text-foreground">About</Link></li>
              <li><Link to="/contact" className="hover:text-foreground">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-display text-base mb-4">Legal</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><Link to="/privacy" className="hover:text-foreground">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-foreground">Terms</Link></li>
              <li><Link to="/refund-policy" className="hover:text-foreground">Refund Policy</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-border/60 flex flex-col md:flex-row justify-between gap-3 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} Unveil Now. Built for genuine intentions.</p>
          <p className="italic font-display">"Feel the connection first, then images."</p>
        </div>
      </div>
    </footer>
  );
};
