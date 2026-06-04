import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../hooks/dispatch";
import FormInput from "../forms/FormInput";
import { useUsernameCheck } from "../../hooks/useUsernameCheck";
import {
  isApiError,
  isValidationError,
  isMessageError,
} from "../../types/api.types";
import { FaCircleCheck, FaCircleXmark } from "react-icons/fa6";
import { Button } from "../ui/button";
import {
  useUpdatePasswordMutation,
  useUpdateProfileMutation,
} from "@/services/api";
import { updateUser } from "@/store/auth/authSlice";
import { usePageTitle } from "@/hooks/usePageTitle";

interface ProfileFormData {
  fullName: string;
  username: string;
}

interface PasswordFormData {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export default function ProfileSettings() {
  usePageTitle("Settings");

  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const [updateProfile, { isLoading: isProfileUpdating }] =
    useUpdateProfileMutation();
  const [updatePassword, { isLoading: isPasswordUpdating }] =
    useUpdatePasswordMutation();

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    watch: watchProfile,
    setError: setProfileError,
    formState: { errors: profileErrors, isSubmitting: isProfileSubmitting },
  } = useForm<ProfileFormData>({
    defaultValues: {
      fullName: user?.fullName || "",
      username: user?.username || "",
    },
  });

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    setError: setPasswordError,
    formState: { errors: passwordErrors, isSubmitting: isPasswordSubmitting },
    watch,
    reset: resetPassword,
  } = useForm<PasswordFormData>();

  const watchedUsername = watchProfile("username");
  const { isAvailable, isChecking } = useUsernameCheck(
    watchedUsername,
    user?.username,
  );

  if (!user) return null;

  const onProfileSubmit = async (data: ProfileFormData) => {
    if (isAvailable === false) {
      setProfileError("username", { message: "Username is already taken" });
      return;
    }
    try {
      const updatedUser = await updateProfile(data).unwrap();
      dispatch(updateUser(updatedUser.data));

      toast.success(updatedUser.message);
    } catch (error) {
      if (!isApiError(error)) return;
      if (isValidationError(error.data)) {
        error.data.errors.forEach(({ field, message }) => {
          setProfileError(field as keyof ProfileFormData, { message });
        });
      } else if (isMessageError(error.data)) {
        const message = error.data.message;
        if (message.toLowerCase().includes("username")) {
          setProfileError("username", { message });
        } else if (message.toLowerCase().includes("name")) {
          setProfileError("fullName", { message });
        } else {
          toast.error(message);
        }
      }
    }
  };

  const onPasswordSubmit = async (data: PasswordFormData) => {
    try {
      const res = await updatePassword(data).unwrap();
      toast.success(res.message);
      resetPassword();
    } catch (error) {
      if (!isApiError(error)) return;
      if (isValidationError(error.data)) {
        error.data.errors.forEach(({ field, message }) => {
          setPasswordError(field as keyof PasswordFormData, { message });
        });
      } else if (isMessageError(error.data)) {
        const message = error.data.message;
        if (
          message.toLowerCase().includes("incorrect") ||
          message.toLowerCase().includes("current")
        ) {
          setPasswordError("oldPassword", { message });
        } else {
          toast.error(message);
        }
      }
    }
  };

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6 px-4 sm:px-6">
      {/* ── Profile Section ── */}
      <div className="glass-card p-6 sm:p-8">
        <h2 className="font-display mb-1 text-xl font-bold text-foreground sm:text-2xl">
          Profile Settings
        </h2>
        <p className="mb-6 text-sm text-muted-foreground">
          Update your display name and username
        </p>

        <form
          onSubmit={handleProfileSubmit(onProfileSubmit)}
          className="flex flex-col gap-4"
        >
          <FormInput
            id="fullName"
            label="Full Name"
            type="text"
            placeholder="Enter your full name"
            error={profileErrors.fullName?.message}
            {...registerProfile("fullName", {
              required: "Full name is required",
              minLength: { value: 2, message: "Must be at least 2 characters" },
            })}
          />

          <FormInput
            id="username"
            label="Username"
            type="text"
            placeholder="Enter your username"
            error={profileErrors.username?.message}
            suffix={
              isChecking ? (
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              ) : watchedUsername && watchedUsername !== user.username ? (
                watchedUsername.match(/^[a-zA-Z0-9_]+$/) !== null ? (
                  isAvailable ? (
                    <span className="flex items-center gap-0.5 text-xs text-(--success)">
                      <FaCircleCheck size={18} /> Available
                    </span>
                  ) : (
                    <span className="flex items-center gap-0.5 text-xs text-destructive">
                      <FaCircleXmark size={18} /> Taken
                    </span>
                  )
                ) : (
                  <span className="flex items-center gap-0.5 text-xs text-destructive">
                    <FaCircleXmark size={18} /> Invalid
                  </span>
                )
              ) : null
            }
            {...registerProfile("username", {
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

          {/* Email — read only */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-muted-foreground">
              Email
            </label>
            <input
              type="email"
              value={user.email}
              disabled
              className="w-full cursor-not-allowed rounded-lg px-4 py-2 text-sm text-muted-foreground opacity-60"
              style={{
                background: "var(--bg-elevated)",
                border: "1px solid var(--border-default)",
              }}
            />
            <p className="text-xs text-muted-foreground">
              Email cannot be changed
            </p>
          </div>

          <Button
            type="submit"
            disabled={
              isProfileSubmitting ||
              isProfileUpdating ||
              isChecking ||
              isAvailable === false
            }
            className="mt-2 h-11 w-full cursor-pointer bg-linear-to-br from-primary to-accent-foreground shadow-(--shadow-glass) transition-colors duration-150 ease-in hover:bg-linear-to-tl sm:w-auto sm:self-end sm:px-8"
          >
            {isProfileSubmitting || isProfileUpdating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Saving...
              </>
            ) : (
              "Save Profile"
            )}
          </Button>
        </form>
      </div>

      {/* ── Divider ── */}
      <div className="divider" />

      {/* ── Password Section ── */}
      <div className="glass-card p-6 sm:p-8">
        <h2 className="font-display mb-1 text-xl font-bold text-foreground sm:text-2xl">
          Change Password
        </h2>
        <p className="mb-6 text-sm text-muted-foreground">
          Make sure your new password is at least 8 characters
        </p>

        <form
          onSubmit={handlePasswordSubmit(onPasswordSubmit)}
          className="flex flex-col gap-4"
        >
          <FormInput
            id="oldPassword"
            label="Current Password"
            type="password"
            placeholder="Enter your current password"
            error={passwordErrors.oldPassword?.message}
            {...registerPassword("oldPassword", {
              required: "Current password is required",
            })}
          />

          <FormInput
            id="newPassword"
            label="New Password"
            type="password"
            placeholder="Enter your new password"
            error={passwordErrors.newPassword?.message}
            {...registerPassword("newPassword", {
              required: "New password is required",
              minLength: { value: 8, message: "Must be at least 8 characters" },
            })}
          />

          <FormInput
            id="confirmPassword"
            label="Confirm New Password"
            type="password"
            placeholder="Confirm your new password"
            error={passwordErrors.confirmPassword?.message}
            {...registerPassword("confirmPassword", {
              required: "Please confirm your password",
              validate: (val) =>
                val === watch("newPassword") || "Passwords do not match",
            })}
          />

          <Button
            type="submit"
            disabled={isPasswordSubmitting || isPasswordUpdating}
            className="mt-2 h-11 w-full cursor-pointer bg-linear-to-br from-primary to-accent-foreground shadow-(--shadow-glass) transition-colors duration-150 ease-in hover:bg-linear-to-tl sm:w-auto sm:self-end sm:px-8"
          >
            {isPasswordSubmitting || isPasswordUpdating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Updating...
              </>
            ) : (
              "Update Password"
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
