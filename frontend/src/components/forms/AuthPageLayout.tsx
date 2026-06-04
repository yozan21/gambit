import { motion } from "framer-motion";
import { Link } from "react-router";
import { ChevronLeft } from "lucide-react";
import FloatingPieces from "../home/FloatingPieces";
import NavLogo from "../NavLogo";

interface AuthPageLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
  footerText?: string;
  footerLinkText?: string;
  footerLinkTo?: string;
  footer?: React.ReactNode;
}

export default function AuthPageLayout({
  children,
  title,
  subtitle,
  footerText,
  footerLinkText,
  footerLinkTo,
  footer,
}: AuthPageLayoutProps) {
  return (
    <div className="relative flex min-h-screen justify-center overflow-hidden px-6 py-8 sm:items-center sm:py-12">
      {/* Background gradient */}
      <div className="pointer-events-none absolute inset-0">
        <motion.div
          className="absolute top-1/4 -left-48 h-96 w-96 rounded-full opacity-20 blur-3xl"
          style={{
            background:
              "radial-gradient(circle, rgba(201, 168, 76, 0.4) 0%, transparent 70%)",
          }}
          animate={{
            x: [0, 100, 0],
            y: [0, 50, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <FloatingPieces />

        <motion.div
          className="absolute -right-48 bottom-1/4 h-96 w-96 rounded-full opacity-20 blur-3xl"
          style={{
            background:
              "radial-gradient(circle, rgba(201, 168, 76, 0.3) 0%, transparent 70%)",
          }}
          animate={{
            x: [0, -100, 0],
            y: [0, -50, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Back to home */}
        <Link
          to="/"
          className="group absolute -left-5 inline-flex items-center text-xs text-muted-foreground transition-colors hover:text-primary sm:-left-40 sm:gap-2 sm:text-sm"
        >
          <ChevronLeft className="h-4 w-4 transition-transform duration-100 ease-in group-hover:-translate-x-1" />
          Back to home
        </Link>

        <div className="mb-2 flex items-center justify-center">
          {/* Logo */}
          <NavLogo size="sm" />
        </div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mb-2 flex flex-col items-center justify-center"
        >
          <h2 className="font-display mb-2 text-2xl font-bold text-foreground">
            {title}
          </h2>
          <p className="text-muted-foreground">{subtitle}</p>
        </motion.div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className=""
        >
          {children}
        </motion.div>

        {/* Footer */}
        {footer ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-6"
          >
            {footer}
          </motion.div>
        ) : (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-6 text-center text-sm text-muted-foreground"
          >
            {footerText}{" "}
            {footerLinkText && footerLinkTo && (
              <Link
                to={footerLinkTo}
                className="font-medium text-primary transition-colors hover:text-accent-foreground"
              >
                {footerLinkText}
              </Link>
            )}
          </motion.p>
        )}
      </motion.div>
    </div>
  );
}
