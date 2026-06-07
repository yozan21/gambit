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

export default function TermsOfService() {
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
              Terms of Service
            </h1>
            <p className="text-sm text-muted-foreground">
              Last updated: June 2026
            </p>
          </div>

          <div className="divider" />

          <div className="flex flex-col gap-8">
            <Section title="1. Acceptance of Terms">
              By accessing or using Gambit ("the App") at{" "}
              <a
                href="https://gambit-ruddy.vercel.app"
                className="underline underline-offset-4 hover:text-foreground"
                style={{ color: "var(--gold)" }}
              >
                https://gambit-ruddy.vercel.app
              </a>
              , you agree to be bound by these Terms of Service. If you do not
              agree, please do not use the App.
            </Section>

            <Section title="2. Description of Service">
              Gambit is an online multiplayer chess platform that allows users
              to play chess against other players in real time, play against
              computer opponents (bots), and play private games with friends via
              invite codes. The service is provided free of charge.
            </Section>

            <Section title="3. User Accounts">
              <ul className="flex list-disc flex-col gap-2 pl-5">
                <li>You must create an account to access game features.</li>
                <li>
                  You are responsible for maintaining the confidentiality of
                  your credentials.
                </li>
                <li>
                  You must provide accurate information during registration.
                </li>
                <li>
                  You may not create accounts for others without their
                  permission.
                </li>
                <li>
                  We reserve the right to suspend or terminate accounts that
                  violate these terms.
                </li>
              </ul>
            </Section>

            <Section title="4. Acceptable Use">
              You agree not to:
              <ul className="mt-2 flex list-disc flex-col gap-2 pl-5">
                <li>
                  Use cheating software, bots, or any automation to gain unfair
                  advantage.
                </li>
                <li>Harass, abuse, or harm other users.</li>
                <li>
                  Attempt to exploit or reverse-engineer any part of the App.
                </li>
                <li>Use the App for any unlawful purpose.</li>
                <li>Interfere with the normal operation of the service.</li>
              </ul>
            </Section>

            <Section title="5. Intellectual Property">
              All content, design, and code within Gambit is the intellectual
              property of Gambit and its developers. You may not copy,
              reproduce, or distribute any part of the App without prior written
              permission.
            </Section>

            <Section title="6. Disclaimer of Warranties">
              Gambit is provided "as is" without warranties of any kind. We do
              not guarantee uninterrupted or error-free service. The App may be
              unavailable during maintenance or due to factors beyond our
              control.
            </Section>

            <Section title="7. Limitation of Liability">
              To the maximum extent permitted by law, Gambit and its developers
              shall not be liable for any indirect, incidental, or consequential
              damages arising from your use of the App.
            </Section>

            <Section title="8. Changes to Terms">
              We reserve the right to modify these terms at any time. Continued
              use of the App after changes constitutes acceptance of the new
              terms. We will update the "Last updated" date accordingly.
            </Section>

            <Section title="9. Contact">
              For questions about these terms, contact us at:{" "}
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
