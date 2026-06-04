import { useNavigate, Link } from "react-router";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { CircleCheck, Loader2, X } from "lucide-react";
import { useSignupMutation } from "../../services/api";
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
// import { connectSocket } from "../../services/socket";
import { Button } from "../ui/button";
import { usePageTitle } from "@/hooks/usePageTitle";

interface SignupFormData {
  email: string;
  fullName: string;
  username: string;
  password: string;
  confirmPassword: string;
}

export default function Signup() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [signup, { isLoading }] = useSignupMutation();

  const {
    register,
    handleSubmit,
    watch,
    setError,
    formState: { errors },
  } = useForm<SignupFormData>();

  const password = watch("password", "");
  const watchedUsername = watch("username", "");

  const { isAvailable, isChecking } = useUsernameCheck(watchedUsername);

  const onSubmit = async (data: SignupFormData) => {
    // Block submit if username is taken
    if (isAvailable === false) {
      setError("username", { message: "Username is already taken" });
      return;
    }

    try {
      const result = await signup(data).unwrap();
      dispatch(
        loginSuccess({ user: result.data.user, token: result.data.token }),
      );
      toast.success("Account created successfully!");
      navigate("/");
    } catch (error) {
      if (!isApiError(error)) return;

      if (isValidationError(error.data)) {
        error.data.errors.forEach(({ field, message }) => {
          setError(field as keyof SignupFormData, { message });
        });
      } else if (isMessageError(error.data)) {
        const message = error.data.message;

        // Map to specific fields where possible
        if (message.toLowerCase().includes("email")) {
          setError("email", { message });
        } else if (message.toLowerCase().includes("username")) {
          setError("username", { message });
        } else {
          setError("root", { message });
        }
      }
    }
  };

  usePageTitle("Signup");

  return (
    <AuthPageLayout
      title="Create Account"
      subtitle="Join the chess masters today"
      footerText=""
      footerLinkText=""
      footerLinkTo="/login"
      footer={
        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-medium transition-colors"
            style={{ color: "var(--gold)" }}
          >
            Sign in
          </Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        {/* Root error */}
        {errors.root && (
          <p className="rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-2 text-sm text-destructive">
            {errors.root.message}
          </p>
        )}

        <FormInput
          id="email"
          label="Email"
          type="email"
          placeholder="you@example.com"
          error={errors.email?.message}
          {...register("email", {
            required: "Email is required",
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: "Invalid email address",
            },
          })}
        />

        <FormInput
          id="fullName"
          label="Full Name"
          type="text"
          placeholder="John Doe"
          error={errors.fullName?.message}
          {...register("fullName", {
            required: "Full name is required",
            minLength: { value: 2, message: "Must be at least 2 characters" },
          })}
        />

        <FormInput
          id="username"
          label="Username"
          type="text"
          placeholder="chessmaster123"
          error={errors.username?.message}
          suffix={
            watchedUsername?.length >= 3 ? (
              isChecking ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
              ) : isAvailable ? (
                <span className="flex items-center justify-center gap-0.5 text-xs text-(--success)">
                  <CircleCheck size={18} />
                  Available
                </span>
              ) : (
                <span className="flex items-center justify-center gap-0.5 text-xs text-destructive">
                  <X size={18} /> Taken
                </span>
              )
            ) : null
          }
          {...register("username", {
            required: "Username is required",
            minLength: { value: 3, message: "Must be at least 3 characters" },
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
          error={errors.password?.message}
          {...register("password", {
            required: "Password is required",
            minLength: { value: 8, message: "Must be at least 8 characters" },
          })}
        />

        <FormInput
          id="confirmPassword"
          label="Confirm Password"
          type="password"
          placeholder="Re-enter password"
          error={errors.confirmPassword?.message}
          {...register("confirmPassword", {
            required: "Please confirm your password",
            validate: (value) => value === password || "Passwords do not match",
          })}
        />

        <Button
          type="submit"
          disabled={isLoading || isChecking || isAvailable === false}
          className="mt-2 h-12 w-full cursor-pointer bg-linear-to-br from-primary to-accent-foreground shadow-(--shadow-glass) transition-colors duration-150 ease-in hover:bg-linear-to-tl"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Creating account...
            </>
          ) : (
            "Create Account"
          )}
        </Button>
      </form>
    </AuthPageLayout>
  );
}
