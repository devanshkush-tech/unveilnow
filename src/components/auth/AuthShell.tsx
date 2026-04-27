import { Link } from "react-router-dom";
import { ReactNode } from "react";

export const AuthShell = ({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}) => {
  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">
      {/* Form side */}
      <div className="flex flex-col p-6 md:p-10 lg:p-14">
        <Link to="/" className="flex items-center gap-2 w-fit">
          <div className="h-8 w-8 rounded-full bg-gradient-romance flex items-center justify-center">
            <span className="font-display text-primary-foreground text-lg leading-none pb-0.5">U</span>
          </div>
          <span className="font-display text-xl">Unveil</span>
        </Link>

        <div className="flex-1 flex items-center justify-center py-12">
          <div className="w-full max-w-sm animate-fade-up">
            <h1 className="font-display text-3xl md:text-4xl mb-2">{title}</h1>
            {subtitle && <p className="text-muted-foreground mb-8">{subtitle}</p>}
            {children}
          </div>
        </div>

        {footer && <div className="text-sm text-muted-foreground text-center">{footer}</div>}
      </div>

      {/* Visual side */}
      <div className="hidden lg:block relative bg-gradient-romance">
        <div aria-hidden className="absolute inset-0 bg-gradient-veil opacity-50" />
        <div className="relative h-full flex flex-col justify-end p-14">
          <blockquote className="font-display text-3xl xl:text-4xl text-primary-foreground leading-snug max-w-md">
            "I read three of his prompts and laughed out loud. We've been together a year now."
          </blockquote>
          <div className="mt-6 text-primary-foreground/70 text-sm">— Tara, Pune · Unveil member since 2024</div>
        </div>
      </div>
    </div>
  );
};
