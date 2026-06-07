import { useNavigate } from "react-router";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import Navbar from "@/components/ui/NavBar";

const Section = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <div className="flex flex-col gap-3">
    <h2
      className="font-display text-lg font-semibold"
      style={{ color: "var(--gold)" }}
    >
      {title}
    </h2>
    <div className="text-sm leading-relaxed text-muted-foreground">
      {children}
    </div>
  </div>
);

export default function PrivacyPolicy() {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen pt-20">
      <Navbar />

      <div className="mx-auto max-w-3xl px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col gap-8"
        >
          {/* Header */}
          <div className="flex flex-col gap-2">
            <button
              onClick={() => navigate(-1)}
              className="mb-4 flex w-fit items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>
            <h1 className="font-display text-4xl font-bold text-foreground">
              Privacy Policy
            </h1>
            <p className="text-sm text-muted-foreground">
              Last updated: June 2026
            </p>
          </div>

          <div className="divider" />

          <div className="flex flex-col gap-8">
            <Section title="1. Information We Collect">
              When you use Gambit, we collect:
              <ul className="mt-2 flex list-disc flex-col gap-2 pl-5">
                <li>
                  <strong className="text-foreground">
                    Account information
                  </strong>{" "}
                  — username, email address, and password (hashed).
                </li>
                <li>
                  <strong className="text-foreground">Game data</strong> — match
                  history, ELO rating, and game statistics.
                </li>
                <li>
                  <strong className="text-foreground">Usage data</strong> —
                  pages visited, features used, and session duration.
                </li>
                <li>
                  <strong className="text-foreground">Technical data</strong> —
                  IP address, browser type, and device information.
                </li>
              </ul>
            </Section>

            <Section title="2. How We Use Your Information">
              We use your information to:
              <ul className="mt-2 flex list-disc flex-col gap-2 pl-5">
                <li>Provide and maintain the Gambit service.</li>
                <li>Authenticate your account and secure your sessions.</li>
                <li>Calculate and display ELO ratings and match history.</li>
                <li>Send password reset OTPs and account-related emails.</li>
                <li>Improve the App based on usage patterns.</li>
              </ul>
            </Section>

            <Section title="3. Cookies">
              Gambit uses HTTP-only cookies to manage authentication sessions
              (access token and refresh token). These cookies are essential for
              the App to function and cannot be opted out of while using the
              service. We do not use tracking or advertising cookies.
            </Section>

            <Section title="4. Data Sharing">
              We do not sell, trade, or rent your personal information to third
              parties. We may share data with:
              <ul className="mt-2 flex list-disc flex-col gap-2 pl-5">
                <li>
                  <strong className="text-foreground">Brevo</strong> — for
                  sending transactional emails (OTP, notifications).
                </li>
                <li>
                  <strong className="text-foreground">Render</strong> — our
                  backend hosting provider.
                </li>
                <li>
                  <strong className="text-foreground">Vercel</strong> — our
                  frontend hosting provider.
                </li>
              </ul>
              These providers are bound by their own privacy policies and data
              processing agreements.
            </Section>

            <Section title="5. Data Retention">
              We retain your account data for as long as your account is active.
              Game records and match history are retained indefinitely to
              maintain accurate ELO ratings. You may request deletion of your
              account and associated data by contacting us.
            </Section>

            <Section title="6. Security">
              We implement industry-standard security measures including:
              <ul className="mt-2 flex list-disc flex-col gap-2 pl-5">
                <li>Passwords hashed using bcrypt.</li>
                <li>Authentication via HTTP-only cookies over HTTPS.</li>
                <li>
                  JWT-based session management with short-lived access tokens.
                </li>
              </ul>
              However, no method of transmission over the internet is 100%
              secure. We cannot guarantee absolute security.
            </Section>

            <Section title="7. Your Rights">
              You have the right to:
              <ul className="mt-2 flex list-disc flex-col gap-2 pl-5">
                <li>Access the personal data we hold about you.</li>
                <li>Request correction of inaccurate data.</li>
                <li>Request deletion of your account and data.</li>
                <li>Withdraw consent at any time by deleting your account.</li>
              </ul>
            </Section>

            <Section title="8. Children's Privacy">
              Gambit is not directed at children under 13. We do not knowingly
              collect personal information from children under 13. If you
              believe a child has provided us with personal information, please
              contact us immediately.
            </Section>

            <Section title="9. Changes to This Policy">
              We may update this Privacy Policy from time to time. We will
              notify users of significant changes by updating the "Last updated"
              date. Continued use of the App constitutes acceptance of the
              revised policy.
            </Section>

            <Section title="10. Contact">
              For privacy-related questions or data requests, contact us at:{" "}
              <a
                href="mailto:support@gambit-ruddy.vercel.app"
                className="underline underline-offset-4 hover:text-foreground"
                style={{ color: "var(--gold)" }}
              >
                support@gambit-ruddy.vercel.app
              </a>
            </Section>
          </div>

          <div className="divider" />

          <p className="text-center text-xs text-muted-foreground">
            © {new Date().getUTCFullYear()} Gambit. All rights reserved.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
