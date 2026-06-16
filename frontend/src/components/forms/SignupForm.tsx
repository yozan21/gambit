import { useState } from "react";
import { useNavigate, Link } from "react-router";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { CircleCheck, Loader2, X, ArrowLeft } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import {
  useSignupMutation,
  useCheckEmailMutation,
  useLoginMutation,
} from "../../services/api";
import { useAppDispatch } from "../../hooks/dispatch";
import { loginSuccess } from "../../store/auth/authSlice";
import {
  isApiError,
  isValidationError,
  isMessageError,
} from "../../types/api.types";
import { useUsernameCheck } from "../../hooks/useUsernameCheck";
import AuthPageLayout from "./AuthPageLayout";
import FormInput from "./FormInput";
import { Button } from "../ui/button";
import { usePageTitle } from "@/hooks/usePageTitle";

type AuthStep = "initial" | "signup" | "login";

interface EmailForm {
  email: string;
}
interface SignupFormData {
  fullName: string;
  username: string;
  password: string;
  confirmPassword: string;
}
interface LoginFormData {
  password: string;
}

export default function Signup() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [login, { isLoading: isLogginIn }] = useLoginMutation();
  const [signup, { isLoading: isSigningUp }] = useSignupMutation();
  const [checkEmail, { isLoading: isCheckingEmail }] = useCheckEmailMutation();

  const [step, setStep] = useState<AuthStep>("initial");
  const [email, setEmail] = useState("");

  usePageTitle("Sign Up");

  // ── Step 1: Email form ──
  const emailForm = useForm<EmailForm>();

  const onEmailSubmit = async ({ email }: EmailForm) => {
    try {
      const { exists } = await checkEmail({ email }).unwrap();
      setEmail(email);
      setStep(exists ? "login" : "signup");
    } catch {
      emailForm.setError("email", {
        message: "Something went wrong. Try again.",
      });
    }
  };

  // ── Step 2a: Signup form ──
  const signupForm = useForm<SignupFormData>();
  const password = signupForm.watch("password", "");
  const watchedUsername = signupForm.watch("username", "");
  const { isAvailable, isChecking } = useUsernameCheck(watchedUsername);

  const onSignupSubmit = async (data: SignupFormData) => {
    if (isAvailable === false) {
      signupForm.setError("username", { message: "Username is already taken" });
      return;
    }
    try {
      const result = await signup({ email, ...data }).unwrap();
      dispatch(
        loginSuccess({ user: result.data.user, token: result.data.token }),
      );
      toast.success("Account created successfully!");
      navigate("/");
    } catch (error) {
      if (!isApiError(error)) return;
      if (isValidationError(error.data)) {
        error.data.errors.forEach(({ field, message }) => {
          signupForm.setError(field as keyof SignupFormData, { message });
        });
      } else if (isMessageError(error.data)) {
        signupForm.setError("root", { message: error.data.message });
      }
    }
  };

  // ── Step 2b: Login form (email exists) ──
  const loginForm = useForm<LoginFormData>();

  const onLoginSubmit = async ({ password }: LoginFormData) => {
    try {
      // reuse login mutation
      const result = await login({ identifier: email, password }).unwrap();
      dispatch(
        loginSuccess({ user: result.data.user, token: result.data.token }),
      );
      toast.success("Welcome back!");
      navigate("/");
    } catch {
      loginForm.setError("root", { message: "Invalid password" });
    }
  };

  const stepTitles: Record<AuthStep, { title: string; subtitle: string }> = {
    initial: {
      title: "Welcome to Gambit",
      subtitle: "Sign in or create an account",
    },
    signup: { title: "Create Account", subtitle: email },
    login: { title: "Welcome back", subtitle: email },
  };

  return (
    <AuthPageLayout
      title={stepTitles[step].title}
      subtitle={stepTitles[step].subtitle}
      footer={
        <>
          <p className="text-center text-sm text-muted-foreground">
            By continuing you agree with our&nbsp;
            <Link
              to="/terms"
              className="text-primary hover:underline hover:underline-offset-2"
            >
              Terms
            </Link>{" "}
            and{" "}
            <Link
              to="/privacy-policy"
              className="text-primary hover:underline hover:underline-offset-2"
            >
              Privacy Policy
            </Link>
          </p>
          <p className="mt-3 text-center text-sm text-muted-foreground">
            Already have an account?&nbsp;
            <Link
              to="/login"
              className="font-medium text-primary transition-colors hover:text-accent-foreground"
            >
              Sign In
            </Link>
          </p>
        </>
      }
    >
      <AnimatePresence mode="wait">
        {/* ── Step 1: Initial ── */}
        {step === "initial" && (
          <motion.div
            key="initial"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
            className="flex flex-col gap-4"
          >
            {/* Google Button */}
            <a
              href={`${import.meta.env.VITE_API_URL}/api/v1/auth/google`}
              className="flex w-full items-center justify-center gap-3 rounded-lg px-4 py-3 text-sm font-semibold transition-all"
              style={{
                background: "var(--bg-elevated)",
                border: "1px solid var(--border-default)",
                color: "var(--text-primary)",
              }}
            >
              <svg
                viewBox="0 0 24 24"
                className="h-4 w-4"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Continue with Google
            </a>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="divider flex-1" />
              <span className="text-xs text-muted-foreground">or</span>
              <div className="divider flex-1" />
            </div>

            {/* Email form */}
            <form
              onSubmit={emailForm.handleSubmit(onEmailSubmit)}
              className="flex flex-col gap-4"
            >
              <FormInput
                id="email"
                label="Email"
                type="email"
                placeholder="you@example.com"
                error={emailForm.formState.errors.email?.message}
                {...emailForm.register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Invalid email address",
                  },
                })}
              />
              <Button
                type="submit"
                disabled={isCheckingEmail}
                className="h-12 w-full cursor-pointer bg-linear-to-br from-primary to-accent-foreground transition-colors duration-150 ease-in hover:bg-linear-to-tl"
              >
                {isCheckingEmail ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Checking...
                  </>
                ) : (
                  "Continue with Email"
                )}
              </Button>
            </form>
          </motion.div>
        )}

        {/* ── Step 2a: Signup ── */}
        {step === "signup" && (
          <motion.div
            key="signup"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
            className="flex flex-col gap-4"
          >
            <button
              onClick={() => setStep("initial")}
              className="flex w-fit items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </button>

            <form
              onSubmit={signupForm.handleSubmit(onSignupSubmit)}
              className="flex flex-col gap-4"
            >
              {signupForm.formState.errors.root && (
                <p className="rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-2 text-sm text-destructive">
                  {signupForm.formState.errors.root.message}
                </p>
              )}

              <FormInput
                id="fullName"
                label="Full Name"
                type="text"
                placeholder="John Doe"
                error={signupForm.formState.errors.fullName?.message}
                {...signupForm.register("fullName", {
                  required: "Full name is required",
                  minLength: {
                    value: 2,
                    message: "Must be at least 2 characters",
                  },
                })}
              />

              <FormInput
                id="username"
                label="Username"
                type="text"
                placeholder="chessmaster123"
                error={signupForm.formState.errors.username?.message}
                suffix={
                  watchedUsername?.length >= 3 ? (
                    isChecking ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
                    ) : isAvailable ? (
                      <span
                        className="flex items-center gap-0.5 text-xs"
                        style={{ color: "var(--success)" }}
                      >
                        <CircleCheck size={18} /> Available
                      </span>
                    ) : (
                      <span className="flex items-center gap-0.5 text-xs text-destructive">
                        <X size={18} /> Taken
                      </span>
                    )
                  ) : null
                }
                {...signupForm.register("username", {
                  required: "Username is required",
                  minLength: {
                    value: 3,
                    message: "Must be at least 3 characters",
                  },
                  pattern: {
                    value: /^[a-zA-Z0-9_]+$/,
                    message: "Only letters, numbers and underscores",
                  },
                  validate: () =>
                    isAvailable !== false || "Username is already taken",
                })}
              />

              <FormInput
                id="password"
                label="Password"
                type="password"
                placeholder="Min 8 characters"
                error={signupForm.formState.errors.password?.message}
                {...signupForm.register("password", {
                  required: "Password is required",
                  minLength: {
                    value: 8,
                    message: "Must be at least 8 characters",
                  },
                })}
              />

              <FormInput
                id="confirmPassword"
                label="Confirm Password"
                type="password"
                placeholder="Re-enter password"
                error={signupForm.formState.errors.confirmPassword?.message}
                {...signupForm.register("confirmPassword", {
                  required: "Please confirm your password",
                  validate: (value) =>
                    value === password || "Passwords do not match",
                })}
              />

              <Button
                type="submit"
                disabled={isSigningUp || isChecking || isAvailable === false}
                className="mt-2 h-12 w-full cursor-pointer bg-linear-to-br from-primary to-accent-foreground transition-colors duration-150 ease-in hover:bg-linear-to-tl"
              >
                {isSigningUp ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Creating
                    account...
                  </>
                ) : (
                  "Create Account"
                )}
              </Button>
            </form>
          </motion.div>
        )}

        {/* ── Step 2b: Login (email exists) ── */}
        {step === "login" && (
          <motion.div
            key="login"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
            className="flex flex-col gap-4"
          >
            <button
              onClick={() => setStep("initial")}
              className="flex w-fit items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </button>

            <form
              onSubmit={loginForm.handleSubmit(onLoginSubmit)}
              className="flex flex-col gap-4"
            >
              {loginForm.formState.errors.root && (
                <p className="rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-2 text-sm text-destructive">
                  {loginForm.formState.errors.root.message}
                </p>
              )}

              <FormInput
                id="password"
                label="Password"
                type="password"
                placeholder="Your password"
                error={loginForm.formState.errors.password?.message}
                {...loginForm.register("password", {
                  required: "Password is required",
                })}
              />

              <Link
                to="/forgot-password"
                className="w-fit text-sm text-primary transition-all hover:underline hover:underline-offset-2"
              >
                Forgot password?
              </Link>

              <Button
                type="submit"
                disabled={isLogginIn}
                className="mt-2 h-12 w-full cursor-pointer bg-linear-to-br from-primary to-accent-foreground transition-colors duration-150 ease-in hover:bg-linear-to-tl"
              >
                {isLogginIn ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Creating
                    account...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </AuthPageLayout>
  );
}
