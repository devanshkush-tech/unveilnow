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

const SubSection = ({ label, title, children }: { label: string; title: string; children: React.ReactNode }) => (
  <div className="mt-4">
    <h3 className="font-display text-xl text-foreground">
      {label}. {title}
    </h3>
    <div className="mt-2 space-y-3">{children}</div>
  </div>
);

const Bullets = ({ items }: { items: string[] }) => (
  <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
    {items.map((it) => (
      <li key={it}>{it}</li>
    ))}
  </ul>
);

const Privacy = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <main className="pt-28 md:pt-32 pb-20">
      <section className="container max-w-3xl text-center">
        <p className="text-sm uppercase tracking-[0.18em] text-accent-foreground/70 font-medium mb-4">Legal</p>
        <h1 className="font-display text-5xl md:text-6xl leading-tight">
          Privacy <em className="italic text-gradient">Policy</em>
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
          Unveil Now (“Unveil Now”, “we”, “our”, “us”) values your privacy and is committed to protecting your personal
          information. This Privacy Policy explains how we collect, use, store, share, and protect your information when
          you use our website, platform, mobile application, and related services (collectively, the “Platform”).
        </p>
        <p className="text-muted-foreground leading-relaxed mt-3">
          By using Unveil Now, you agree to this Privacy Policy.
        </p>

        <Section n={1} title="Information We Collect">
          <p>We may collect the following categories of information:</p>

          <SubSection label="A" title="Information You Provide Directly">
            <p>When you create or use an account, you may provide:</p>
            <Bullets
              items={[
                "Name or display name",
                "Email address",
                "Mobile number (if applicable)",
                "Gender and preferences",
                "Age / date of birth",
                "City / location",
                "Photos",
                "Bio / Story text",
                "Prompt answers",
                "Voice introductions",
                "Subscription/payment details (processed securely via third-party gateways)",
                "Support requests or messages to us",
              ]}
            />
          </SubSection>

          <SubSection label="B" title="Information Collected Automatically">
            <p>When you use the Platform, we may collect:</p>
            <Bullets
              items={[
                "IP address",
                "Device type",
                "Browser/app version",
                "Operating system",
                "Login timestamps",
                "Usage behavior",
                "Clickstream/activity data",
                "Referral source / UTM parameters",
                "Cookies and similar technologies",
              ]}
            />
          </SubSection>

          <SubSection label="C" title="Information From Third Parties">
            <p>We may receive information from:</p>
            <Bullets
              items={[
                "Payment processors",
                "Analytics providers",
                "Social login providers",
                "Verification partners",
                "Marketing platforms",
              ]}
            />
          </SubSection>
        </Section>

        <Section n={2} title="How We Use Your Information">
          <p>We use your information to:</p>
          <Bullets
            items={[
              "Create and manage your account",
              "Match you with relevant users",
              "Enable chats, reveals, prompts, and profile features",
              "Verify authenticity and reduce fraud",
              "Process subscriptions and payments",
              "Improve safety and moderation",
              "Personalize user experience",
              "Analyze performance and growth metrics",
              "Respond to support requests",
              "Send service-related notifications",
              "Comply with legal obligations",
            ]}
          />
        </Section>

        <Section n={3} title="Profile Visibility & User Interactions">
          <p>Certain information may be visible to other users based on Platform features, including:</p>
          <Bullets
            items={[
              "Display name",
              "Age range",
              "City",
              "Prompt answers",
              "Story / bio",
              "Voice intro",
              "Photos (only when revealed/unlocked according to feature rules)",
            ]}
          />
          <p>You control some profile visibility settings inside the Platform.</p>
        </Section>

        <Section n={4} title="Payments">
          <p>
            Payments may be processed by third-party payment gateways such as Razorpay, Stripe, or other providers. We
            do not store full card details on our servers.
          </p>
          <p>Please review the privacy policies of payment providers separately.</p>
        </Section>

        <Section n={5} title="Sharing of Information">
          <p>We do not sell your personal information.</p>
          <p>We may share information with:</p>
          <Bullets
            items={[
              "Service providers (hosting, analytics, email, payments)",
              "Moderation / fraud prevention vendors",
              "Legal authorities when required by law",
              "Corporate successors in merger/acquisition events",
            ]}
          />
          <p>We may also share anonymized or aggregated data for analytics or business insights.</p>
        </Section>

        <Section n={6} title="Data Storage & Security">
          <p>
            We use reasonable technical and organizational safeguards to protect your data. However, no internet
            platform is 100% secure.
          </p>
          <p>We encourage you to:</p>
          <Bullets
            items={["Use strong passwords", "Protect your login credentials", "Report suspicious activity immediately"]}
          />
        </Section>

        <Section n={7} title="Retention of Data">
          <p>We retain personal information only as long as reasonably necessary for:</p>
          <Bullets
            items={[
              "Providing services",
              "Legal compliance",
              "Fraud prevention",
              "Dispute resolution",
              "Internal analytics",
            ]}
          />
          <p>
            Deleted accounts may have certain records retained for legal, safety, or backup purposes for a limited time.
          </p>
        </Section>

        <Section n={8} title="Cookies & Tracking">
          <p>We may use cookies and similar technologies to:</p>
          <Bullets
            items={[
              "Keep you logged in",
              "Remember preferences",
              "Improve performance",
              "Measure marketing campaigns",
              "Analyze traffic",
            ]}
          />
          <p>You may manage cookies through browser settings.</p>
        </Section>

        <Section n={9} title="Your Rights & Choices">
          <p>Depending on applicable law, you may request to:</p>
          <Bullets
            items={[
              "Access your personal data",
              "Correct inaccurate data",
              "Delete your account/data",
              "Withdraw certain consents",
              "Opt out of marketing communications",
            ]}
          />
          <p>To make a request, contact us at the email below.</p>
        </Section>

        <Section n={10} title="Account Deletion">
          <p>You may request account deletion through your settings or by contacting support.</p>
          <p>Deletion requests may require identity verification and may take reasonable processing time.</p>
        </Section>

        <Section n={11} title="Children’s Privacy">
          <p>
            Unveil Now is intended only for users aged 18 years and above. We do not knowingly collect data from minors.
          </p>
          <p>If we become aware of underage use, we may remove the account.</p>
        </Section>

        <Section n={12} title="International Data Processing">
          <p>
            Your information may be stored or processed in countries different from your residence through trusted
            service providers, subject to applicable safeguards.
          </p>
        </Section>

        <Section n={13} title="Safety & Communications Disclaimer">
          <p>
            Messages, interactions, and meetings with other users are your personal decisions. Please use caution and
            common sense when communicating or meeting offline.
          </p>
          <p>We do not guarantee the conduct of any user.</p>
        </Section>

        <Section n={14} title="Changes to This Privacy Policy">
          <p>We may update this Privacy Policy from time to time. Updated versions will be posted with a revised effective date.</p>
          <p>Continued use of the Platform after changes constitutes acceptance.</p>
        </Section>

        <Section n={15} title="Contact Us">
          <p>For privacy concerns, support, or data requests:</p>
          <p>
            Website:{" "}
            <a href="https://unveilnow.in" className="text-primary hover:underline">
              https://unveilnow.in
            </a>
          </p>
        </Section>

        <Section n={16} title="Community Commitment">
          <p>
            Unveil Now is built to encourage respectful, authentic, and meaningful connections. We ask all users to
            treat each other with dignity, honesty, and consent.
          </p>
        </Section>
      </article>
    </main>
    <Footer />
  </div>
);

export default Privacy;
