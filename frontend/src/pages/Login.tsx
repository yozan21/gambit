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
            value: "test1",
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
            value: "test1234",
          })}
        />
        <Link
          to="/forgot-password"
          className="w-fit cursor-pointer text-sm text-primary transition-all duration-100 ease-in-out hover:text-accent-foreground hover:underline"
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
