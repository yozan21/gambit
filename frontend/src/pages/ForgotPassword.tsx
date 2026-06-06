// pages/ForgotPassword.tsx
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import {
  useForgotPasswordMutation,
  useVerifyOtpMutation,
  useResetPasswordMutation,
} from "../services/api";
import { isApiError, isMessageError } from "../types/api.types";
import AuthPageLayout from "../components/forms/AuthPageLayout";
import FormInput from "../components/forms/FormInput";
import { Button } from "../components/ui/button";
import { usePageTitle } from "@/hooks/usePageTitle";

type Step = "email" | "otp" | "reset";

export default function ForgotPassword() {
  usePageTitle("Forgot Password");

  const navigate = useNavigate();
  const [retryAfter, setRetryAfter] = useState(0);
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");

  const [forgotPassword] = useForgotPasswordMutation();
  const [verifyOtp] = useVerifyOtpMutation();
  const [resetPassword] = useResetPasswordMutation();

  /* ── Step 1 — Email ── */
  const {
    register: registerEmail,
    handleSubmit: handleEmailSubmit,
    setError: setEmailError,
    formState: { errors: emailErrors, isSubmitting: isEmailSubmitting },
  } = useForm<{ email: string }>();

  const onEmailSubmit = async (data: { email: string }) => {
    try {
      await forgotPassword(data).unwrap();
      setEmail(data.email);
      toast.success("OTP sent to your email");
      setStep("otp");
    } catch (error) {
      if (isApiError(error) && isMessageError(error.data)) {
        setEmailError("email", { message: error.data.message });
      }
    }
  };

  /* ── Step 2 — OTP ── */
  // Start countdown after OTP is sent (call this when step becomes "otp")
  useEffect(() => {
    if (step === "otp") setRetryAfter(120);
  }, [step]);

  useEffect(() => {
    if (retryAfter <= 0) return;
    const timer = setTimeout(() => setRetryAfter((prev) => prev - 1), 1000);
    return () => clearTimeout(timer);
  }, [retryAfter]);
  const {
    register: registerOtp,
    handleSubmit: handleOtpSubmit,
    setError: setOtpError,
    formState: { errors: otpErrors, isSubmitting: isOtpSubmitting },
  } = useForm<{ otp: string }>();

  const handleResend = async () => {
    try {
      await forgotPassword({ email }).unwrap(); // your API call
      setRetryAfter(60);
    } catch (err: any) {
      const seconds = err?.data?.retryAfter;
      if (seconds) setRetryAfter(seconds);
    }
  };

  const onOtpSubmit = async (data: { otp: string }) => {
    try {
      await verifyOtp({ email, otp: data.otp }).unwrap();
      setOtp(data.otp);
      setStep("reset");
    } catch (error) {
      if (isApiError(error) && isMessageError(error.data)) {
        setOtpError("otp", { message: error.data.message });
      }
    }
  };

  /* ── Step 3 — New Password ── */
  const {
    register: registerReset,
    handleSubmit: handleResetSubmit,
    watch,
    formState: { errors: resetErrors, isSubmitting: isResetSubmitting },
  } = useForm<{ newPassword: string; confirmPassword: string }>();

  const onResetSubmit = async (data: {
    newPassword: string;
    confirmPassword: string;
  }) => {
    try {
      await resetPassword({
        email,
        otp,
        newPassword: data.newPassword,
        confirmPassword: data.confirmPassword,
      }).unwrap();
      toast.success("Password reset successfully!");
      navigate("/login");
    } catch (error) {
      if (isApiError(error) && isMessageError(error.data)) {
        toast.error(error.data.message);
      }
    }
  };

  return (
    <AuthPageLayout
      title={
        step === "email"
          ? "Forgot Password"
          : step === "otp"
            ? "Enter OTP"
            : "Reset Password"
      }
      subtitle={
        step === "email"
          ? "Enter your email to receive an OTP"
          : step === "otp"
            ? `We sent a code to ${email}`
            : "Enter your new password"
      }
    >
      {/* Step 1 — Email */}
      {step === "email" && (
        <form
          onSubmit={handleEmailSubmit(onEmailSubmit)}
          className="flex flex-col gap-4"
        >
          <FormInput
            id="email"
            label="Email"
            type="email"
            placeholder="you@example.com"
            error={emailErrors.email?.message}
            {...registerEmail("email", {
              required: "Email is required",
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: "Invalid email address",
              },
            })}
          />
          <Button
            type="submit"
            disabled={isEmailSubmitting}
            className="mt-2 h-12 w-full"
          >
            {isEmailSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Sending...
              </>
            ) : (
              "Send OTP"
            )}
          </Button>
        </form>
      )}

      {/* Step 2 — OTP */}
      {step === "otp" && (
        <form
          onSubmit={handleOtpSubmit(onOtpSubmit)}
          className="flex flex-col gap-4"
        >
          <FormInput
            id="otp"
            label="OTP Code"
            type="text"
            placeholder="Enter 6-digit code"
            error={otpErrors.otp?.message}
            {...registerOtp("otp", {
              required: "OTP is required",
              minLength: { value: 6, message: "OTP must be 6 digits" },
              maxLength: { value: 6, message: "OTP must be 6 digits" },
              pattern: { value: /^[0-9]+$/, message: "OTP must be numeric" },
            })}
          />
          <Button
            type="submit"
            disabled={isOtpSubmitting}
            className="mt-2 h-12 w-full"
          >
            {isOtpSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Verifying...
              </>
            ) : (
              "Verify OTP"
            )}
          </Button>
          <button
            type="button"
            onClick={() => setStep("email")}
            className="text-sm text-muted-foreground hover:underline"
          >
            ← Back
          </button>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              Didn't get the code?{" "}
              <button
                type="button"
                onClick={handleResend}
                disabled={retryAfter > 0}
                className="text-primary underline-offset-4 hover:underline disabled:cursor-not-allowed disabled:opacity-50"
              >
                Resend
              </button>
            </span>

            {retryAfter > 0 && (
              <span
                className="font-mono text-xs tabular-nums"
                style={{ color: "var(--gold)" }}
              >
                0:{String(retryAfter).padStart(2, "0")}
              </span>
            )}
          </div>
        </form>
      )}

      {/* Step 3 — New Password */}
      {step === "reset" && (
        <form
          onSubmit={handleResetSubmit(onResetSubmit)}
          className="flex flex-col gap-4"
        >
          <FormInput
            id="newPassword"
            label="New Password"
            type="password"
            placeholder="Min 8 characters"
            error={resetErrors.newPassword?.message}
            {...registerReset("newPassword", {
              required: "Password is required",
              minLength: { value: 8, message: "Must be at least 8 characters" },
            })}
          />
          <FormInput
            id="confirmPassword"
            label="Confirm Password"
            type="password"
            placeholder="Re-enter password"
            error={resetErrors.confirmPassword?.message}
            {...registerReset("confirmPassword", {
              required: "Please confirm your password",
              validate: (val) =>
                val === watch("newPassword") || "Passwords do not match",
            })}
          />
          <Button
            type="submit"
            disabled={isResetSubmitting}
            className="mt-2 h-12 w-full"
          >
            {isResetSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Resetting...
              </>
            ) : (
              "Reset Password"
            )}
          </Button>
        </form>
      )}
    </AuthPageLayout>
  );
}
