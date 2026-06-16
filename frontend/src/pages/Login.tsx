import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import AuthPageLayout from "../components/forms/AuthPageLayout";
import FormInput from "../components/forms/FormInput";
import { Button } from "../components/ui/button";
import { useLoginMutation } from "../services/api";
import { useAppDispatch } from "../hooks/dispatch";
import { loginSuccess } from "../store/auth/authSlice";
import { usePageTitle } from "@/hooks/usePageTitle";
// import { connectSocket } from "../services/socket";

interface LoginFormData {
  identifier: string;
  password: string;
}

export default function Login() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [login, { isLoading }] = useLoginMutation();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<LoginFormData>();

  const onSubmit = async (data: LoginFormData) => {
    try {
      const result = await login({
        identifier: data.identifier,
        password: data.password,
      }).unwrap();
      dispatch(
        loginSuccess({ user: result.data.user, token: result.data.token }),
      );
      toast.success("Welcome back");
      navigate("/");
    } catch {
      setError("root", { message: "Invalid email or password" });
    }
  };

  usePageTitle("Login");

  return (
    <AuthPageLayout
      title="Sign In"
      subtitle="Continue your game"
      footerText="Need an account?"
      footerLinkText="Create one"
      footerLinkTo="/signup"
    >
      {/* Google OAuth Button */}
      <a
        href={`${import.meta.env.VITE_API_URL}/api/v1/auth/google`}
        className="flex w-full items-center justify-center gap-3 rounded-sm px-4 py-3 text-sm font-semibold transition-all"
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
      <div className="flex items-center gap-3 py-3">
        <div className="divider flex-1" />
        <span className="text-xs text-muted-foreground">or</span>
        <div className="divider flex-1" />
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        {errors.root && (
          <p className="rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-2 text-sm text-destructive">
            {errors.root.message}
          </p>
        )}
        <FormInput
          id="identifier"
          label="Email or Username"
          type="text"
          placeholder="Your email or username"
          error={errors.identifier?.message}
          {...register("identifier", {
            required: "Username or email is required",
          })}
        />
        <FormInput
          id="password"
          label="Password"
          type="password"
          placeholder="Your password"
          error={errors.password?.message}
          {...register("password", {
            required: "Password is required",
          })}
        />
        <Link
          to="/forgot-password"
          className="w-fit cursor-pointer text-sm text-primary transition-all duration-100 ease-in-out hover:text-accent-foreground hover:underline hover:underline-offset-2"
        >
          Forgot password?
        </Link>
        <Button
          type="submit"
          disabled={isLoading}
          className="mt-2 h-12 w-full cursor-pointer bg-linear-to-br from-primary to-accent-foreground shadow-(--shadow-glass) transition-colors duration-150 ease-in hover:bg-linear-to-tl"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Signing in...
            </>
          ) : (
            "Sign In"
          )}
        </Button>
      </form>
    </AuthPageLayout>
  );
}
