import { useForm } from "react-hook-form";
import { useNavigate, useSearchParams } from "react-router";
import { CircleCheck, Loader2, X } from "lucide-react";
import { toast } from "sonner";

import { usePageTitle } from "@/hooks/usePageTitle";
import { useAppDispatch } from "@/hooks/dispatch";
import { useSignupCompleteMutation } from "@/services/api";
import { loginSuccess } from "@/store/auth/authSlice";
import AuthPageLayout from "./AuthPageLayout";
import FormInput from "./FormInput";
import { Button } from "../ui/button";
import { useUsernameCheck } from "@/hooks/useUsernameCheck";
import {
  isApiError,
  isMessageError,
  isValidationError,
} from "@/types/api.types";
// import { connectSocket } from "../services/socket";

interface AddUsernameFormData {
  fullName: string;
  username: string;
}

export default function CompleteSignup() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [signupComplete, { isLoading }] = useSignupCompleteMutation();
  const token = searchParams.get("token");
  const {
    register,
    handleSubmit,
    setError,
    watch,
    formState: { errors },
  } = useForm<AddUsernameFormData>({
    defaultValues: {
      username: searchParams.get("username") ?? "",
      fullName: searchParams.get("fullname") ?? "",
    },
  });

  const watchedUsername = watch("username", "");
  const { isAvailable, isChecking } = useUsernameCheck(watchedUsername);

  const onSubmit = async (data: AddUsernameFormData) => {
    if (!token) return;
    if (isAvailable === false) {
      setError("username", { message: "Username is already taken" });
      return;
    }
    try {
      const result = await signupComplete({
        username: data.username,
        fullName: data.fullName,
        token,
      }).unwrap();
      dispatch(
        loginSuccess({ user: result.data.user, token: result.data.token }),
      );
      toast.success(`Gambit welcomes ${result.data.user.username}!`);
      navigate("/");
    } catch (error) {
      if (!isApiError(error))
        return setError("root", {
          message: "Something went wrong. Please try again.",
        });
      if (isValidationError(error.data)) {
        error.data.errors.forEach(({ field, message }) => {
          setError(field as keyof AddUsernameFormData, { message });
        });
      } else if (isMessageError(error.data)) {
        const message = error?.data?.message ?? "";
        if (message.includes("expired") || message.includes("Invalid token")) {
          toast.error("Session expired. Please sign in with Google again.");
          navigate("/signup");
          return;
        }
      }
    }
  };

  usePageTitle("Create Username");

  return (
    <AuthPageLayout title="Create Username" subtitle="Create a unique username">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        {errors.root && (
          <p className="rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-2 text-sm text-destructive">
            {errors.root.message}
          </p>
        )}
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
          {...register("username", {
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

        <Button
          type="submit"
          disabled={isLoading || isChecking || isAvailable === false}
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
