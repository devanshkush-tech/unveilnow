import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

const Section = ({ n, title, children }: { n: number; title: string; children: React.ReactNode }) => (
  <section className="mt-10">
    <h2 className="font-display text-2xl md:text-3xl mb-4">
      {n}. {title}
    </h2>
    <div className="space-y-3 text-muted-foreground leading-relaxed">{children}</div>
  </section>
);

const Bullets = ({ items }: { items: string[] }) => (
  <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
    {items.map((it) => (
      <li key={it}>{it}</li>
    ))}
  </ul>
);

const Terms = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <main className="pt-28 md:pt-32 pb-20">
      <section className="container max-w-3xl text-center">
        <p className="text-sm uppercase tracking-[0.18em] text-accent-foreground/70 font-medium mb-4">Legal</p>
        <h1 className="font-display text-5xl md:text-6xl leading-tight">
          Terms & <em className="italic text-gradient">Conditions</em>
        </h1>
        <p className="mt-6 text-sm text-muted-foreground">Effective Date: 27 April 2026</p>
        <p className="text-sm text-muted-foreground">
          Website:{" "}
          <a href="https://unveilnow.in" className="text-primary hover:underline">
            https://unveilnow.in
          </a>
        </p>
      </section>

      <article className="container max-w-3xl mt-12 text-base">
        <p className="text-muted-foreground leading-relaxed">
          Welcome to Unveil Now. These Terms and Conditions (“Terms”) govern your access to and use of the Unveil Now
          website, platform, mobile experience, and related services (collectively, the “Platform”). By using our
          Platform, you agree to be bound by these Terms. If you do not agree, please do not use the Platform.
        </p>

        <Section n={1} title="About Unveil Now">
          <p>
            Unveil Now is a story-first dating and social connection platform designed to help users connect through
            personality, prompts, and meaningful interaction before appearance-based judgments.
          </p>
          <p>We reserve the right to modify, suspend, or discontinue any part of the Platform at any time.</p>
        </Section>

        <Section n={2} title="Eligibility">
          <p>To use Unveil Now, you must:</p>
          <Bullets
            items={[
              "Be at least 18 years of age",
              "Be legally permitted to use online dating/social platforms in your jurisdiction",
              "Provide accurate and truthful registration information",
              "Use the Platform for personal, lawful purposes only",
            ]}
          />
          <p>By creating an account, you confirm that you meet these requirements.</p>
        </Section>

        <Section n={3} title="Account Registration">
          <p>When creating an account, you agree to:</p>
          <Bullets
            items={[
              "Provide true, current, and complete information",
              "Maintain the security of your password and login credentials",
              "Be responsible for all activity under your account",
              "Notify us immediately of unauthorized access",
            ]}
          />
          <p>We may suspend or terminate accounts containing false, misleading, impersonated, or harmful information.</p>
        </Section>

        <Section n={4} title="User Conduct">
          <p>You agree not to:</p>
          <Bullets
            items={[
              "Harass, threaten, stalk, abuse, or intimidate others",
              "Share hateful, violent, discriminatory, or illegal content",
              "Use fake identities or impersonate another person",
              "Solicit money, scams, or fraudulent activity",
              "Share another user’s private information without consent",
              "Upload obscene, explicit, or exploitative content",
              "Use bots, scripts, scraping tools, or automated systems",
              "Interfere with Platform security or functionality",
            ]}
          />
          <p>Violation may result in suspension, permanent ban, or legal action.</p>
        </Section>

        <Section n={5} title="User Content">
          <p>You retain ownership of content you upload, including:</p>
          <Bullets
            items={[
              "Photos",
              "Voice notes",
              "Prompts and answers",
              "Bio / Story text",
              "Messages (subject to applicable law and moderation needs)",
            ]}
          />
          <p>
            By uploading content, you grant Unveil Now a non-exclusive license to host, display, store, and use such
            content for operating the Platform, improving services, safety moderation, and promotional use where
            consented.
          </p>
          <p>You are solely responsible for your content.</p>
        </Section>

        <Section n={6} title="Matches, Messages & Interactions">
          <p>Unveil Now does not guarantee:</p>
          <Bullets items={["Matches", "Replies", "Relationship outcomes", "Compatibility", "Behavior of other users"]} />
          <p>You are solely responsible for your interactions and decisions both online and offline.</p>
          <p>Always use caution when meeting anyone in person.</p>
        </Section>

        <Section n={7} title="Paid Plans & Subscriptions">
          <p>Unveil Now may offer paid memberships such as Starter, Premium, or Elite.</p>
          <p>By subscribing, you agree that:</p>
          <Bullets
            items={[
              "Prices may change with notice",
              "Subscription benefits are subject to plan terms",
              "Payments may be processed by third-party payment gateways",
              "Failure of payment may suspend premium access",
              "Some purchases may auto-renew if enabled (where applicable)",
            ]}
          />
          <h3 className="font-display text-xl mt-4 text-foreground">Refunds</h3>
          <p>Unless required by law, subscription payments are generally non-refundable after activation or use.</p>
          <p>Specific refund requests may be reviewed case-by-case.</p>
        </Section>

        <Section n={8} title="Verification & Badges">
          <p>
            Any verification badge or identity check indicates a completed internal process at the time of review. It is
            not a guarantee of future conduct, authenticity in all respects, or personal safety.
          </p>
        </Section>

        <Section n={9} title="Privacy">
          <p>
            Use of the Platform is also governed by our Privacy Policy. By using Unveil Now, you consent to collection
            and processing of data as described there.
          </p>
        </Section>

        <Section n={10} title="Intellectual Property">
          <p>
            All Platform branding, logos, design, software, text, and materials (excluding user content) are owned by or
            licensed to Unveil Now.
          </p>
          <p>
            You may not reproduce, copy, reverse engineer, or commercially exploit the Platform without written
            permission.
          </p>
        </Section>

        <Section n={11} title="Suspension / Termination">
          <p>We may suspend, restrict, or terminate your account at our discretion for:</p>
          <Bullets
            items={[
              "Violation of these Terms",
              "Fraud or suspicious activity",
              "Abuse reports",
              "Non-payment",
              "Legal or safety concerns",
            ]}
          />
          <p>You may also delete your account through settings, subject to retained legal/compliance data.</p>
        </Section>

        <Section n={12} title="Safety Disclaimer">
          <p>
            Unveil Now is an online platform. We do not conduct criminal background checks on all users unless
            explicitly stated. Use discretion when communicating or meeting others.
          </p>
          <p>We are not liable for user actions outside our reasonable control.</p>
        </Section>

        <Section n={13} title="Limitation of Liability">
          <p>To the maximum extent permitted by law, Unveil Now shall not be liable for:</p>
          <Bullets
            items={[
              "Indirect or consequential losses",
              "Emotional distress from user interactions",
              "Loss of data beyond reasonable control",
              "Service interruptions",
              "Actions of third-party users",
            ]}
          />
          <p>Total liability, if any, shall be limited to the amount paid by you in the previous 3 months.</p>
        </Section>

        <Section n={14} title="Third-Party Services">
          <p>
            The Platform may use third-party tools including hosting, analytics, payment processors, messaging, and
            verification services. Their separate terms may apply.
          </p>
        </Section>

        <Section n={15} title="Changes to Terms">
          <p>
            We may update these Terms at any time. Updated versions will be posted on the website with revised effective
            date. Continued use means acceptance of revised Terms.
          </p>
        </Section>

        <Section n={16} title="Governing Law">
          <p>
            These Terms shall be governed by the laws of India, without regard to conflict of law principles. Courts of
            competent jurisdiction in Pune, India shall have jurisdiction.
          </p>
        </Section>

        <Section n={17} title="Contact Us">
          <p>For support or legal queries:</p>
          <p>
            Website:{" "}
            <a href="https://unveilnow.in" className="text-primary hover:underline">
              https://unveilnow.in
            </a>
          </p>
        </Section>

        <Section n={18} title="Community Principle">
          <p>
            Unveil Now is built for respectful, genuine, and meaningful connections. Please treat others with honesty,
            dignity, and consent.
          </p>
        </Section>
      </article>
    </main>
    <Footer />
  </div>
);

export default Terms;
