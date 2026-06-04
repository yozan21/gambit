export const LoginBodySchema = {
  type: "object",
  required: ["identifier", "password"],
  properties: {
    identifier: {
      type: "string",
      minLength: 3,
      errorMessage: {
        minLength: "Please provide valid username or email",
      },
    },
    password: {
      type: "string",
      minLength: 1,
      errorMessage: {
        minLength: "Password is required.",
      },
    },
  },
  additionalProperties: false,
  errorMessage: {
    required: {
      identifier: "Username or Email is required",
      password: "Password is required.",
    },
    additionalProperties: "You cannot send extra fields.",
  },
} as const;

export const SignupBodySchema = {
  type: "object",
  required: ["fullName", "username", "email", "password", "confirmPassword"],
  properties: {
    fullName: {
      type: "string",
      minLength: 3,
      maxLength: 50,
      pattern: "^[a-zA-Z\\s]+$",
      errorMessage: {
        minLength: "Full name must be at least 3 characters.",
        maxLength: "Full name must not exceed 50 characters.",
        pattern: "Full name must only contain letters and spaces.",
      },
    },
    username: {
      type: "string",
      minLength: 3,
      maxLength: 20,
      pattern: "^[a-zA-Z0-9_]+$",
      errorMessage: {
        minLength: "Username must be at least 3 characters.",
        maxLength: "Username must not exceed 20 characters.",
        pattern: "Username must only contain letters, numbers, or underscores.",
      },
    },
    email: {
      type: "string",
      format: "email",
      errorMessage: {
        format: "Please provide a valid email address.",
      },
    },
    password: {
      type: "string",
      minLength: 8,
      maxLength: 64,
      errorMessage: {
        minLength: "Password must be at least 8 characters.",
        maxLength: "Password must not exceed 64 characters.",
      },
    },
    confirmPassword: {
      type: "string",
      minLength: 8,
      maxLength: 64,
      errorMessage: {
        minLength: "Password must be at least 8 characters.",
        maxLength: "Password must not exceed 64 characters.",
      },
    },
  },
  additionalProperties: false,
  errorMessage: {
    required: {
      fullName: "Full name is required.",
      username: "Username is required.",
      email: "Email is required.",
      password: "Password is required.",
    },
    additionalProperties: "You cannot send extra fields.",
  },
} as const;

export const ForgotPasswordBodySchema = {
  type: "object",
  required: ["email"],
  properties: {
    email: {
      type: "string",
      format: "email",
      errorMessage: {
        format: "Please provide a valid email address.",
      },
    },
  },
  additionalProperties: false,
  errorMessage: {
    required: {
      email: "Email is required.",
    },
    additionalProperties: "You cannot send extra fields.",
  },
} as const;

export const VerifyOtpBodySchema = {
  type: "object",
  required: ["email", "otp"],
  properties: {
    email: {
      type: "string",
      format: "email",
      errorMessage: {
        format: "Please provide a valid email address.",
      },
    },
    otp: {
      type: "string",
      minLength: 6,
      maxLength: 6,
      pattern: "^[0-9]{6}$",
      errorMessage: {
        minLength: "OTP must be 6 digits.",
        maxLength: "OTP must be 6 digits.",
        pattern: "OTP must contain only numbers.",
      },
    },
  },
  additionalProperties: false,
  errorMessage: {
    required: {
      email: "Email is required.",
      otp: "OTP is required.",
    },
    additionalProperties: "You cannot send extra fields.",
  },
} as const;

export const ResetPasswordBodySchema = {
  type: "object",
  required: ["email", "otp", "newPassword", "confirmPassword"],
  properties: {
    email: {
      type: "string",
      format: "email",
      errorMessage: {
        format: "Please provide a valid email address.",
      },
    },
    otp: {
      type: "string",
      minLength: 6,
      maxLength: 6,
      pattern: "^[0-9]{6}$",
      errorMessage: {
        minLength: "OTP must be 6 digits.",
        maxLength: "OTP must be 6 digits.",
        pattern: "OTP must contain only numbers.",
      },
    },
    newPassword: {
      type: "string",
      minLength: 8,
      maxLength: 64,
      errorMessage: {
        minLength: "Password must be at least 8 characters.",
        maxLength: "Password must not exceed 64 characters.",
      },
    },
    confirmPassword: {
      type: "string",
      minLength: 8,
      maxLength: 64,
      errorMessage: {
        minLength: "Password must be at least 8 characters.",
        maxLength: "Password must not exceed 64 characters.",
      },
    },
  },
  additionalProperties: false,
  errorMessage: {
    required: {
      email: "Email is required.",
      otp: "OTP is required.",
      password: "Password is required.",
      confirmPassword: "Password is required.",
    },
    additionalProperties: "You cannot send extra fields.",
  },
} as const;

export const AuthResponseSchema = {
  type: "object",
  required: ["success", "data", "message"],
  properties: {
    success: {
      type: "boolean",
      const: true,
    },
    message: {
      type: "string",
    },
    data: {
      type: "object",
      required: ["user"],
      properties: {
        user: {
          $ref: "user#",
        },
      },
    },
  },
} as const;

// src/modules/user/user.schema.ts
export const UpdateProfileBodySchema = {
  type: "object",
  properties: {
    fullName: {
      type: "string",
      minLength: 3,
      maxLength: 50,
      pattern: "^[a-zA-Z\\s]+$",
      errorMessage: {
        minLength: "Full name must be at least 3 characters.",
        maxLength: "Full name must not exceed 50 characters.",
        pattern: "Full name must only contain letters and spaces.",
      },
    },
    username: {
      type: "string",
      minLength: 3,
      maxLength: 20,
      pattern: "^[a-zA-Z0-9_]+$",
      errorMessage: {
        minLength: "Username must be at least 3 characters.",
        maxLength: "Username must not exceed 20 characters.",
        pattern: "Username must only contain letters, numbers, or underscores.",
      },
    },
  },
  additionalProperties: false,
  minProperties: 1,
  errorMessage: {
    additionalProperties: "You cannot send extra fields.",
    minProperties: "At least one field must be provided.",
  },
} as const;

export const UpdatePasswordBodySchema = {
  type: "object",
  required: ["oldPassword", "newPassword", "confirmPassword"],
  properties: {
    oldPassword: {
      type: "string",
      minLength: 1,
      errorMessage: {
        minLength: "Old password is required.",
      },
    },
    newPassword: {
      type: "string",
      minLength: 8,
      maxLength: 64,
      errorMessage: {
        minLength: "New password must be at least 8 characters.",
        maxLength: "New password must not exceed 64 characters.",
      },
    },
    confirmPassword: {
      type: "string",
      minLength: 8,
      maxLength: 64,
      errorMessage: {
        minLength: "New password must be at least 8 characters.",
        maxLength: "New password must not exceed 64 characters.",
      },
    },
  },
  additionalProperties: false,
  errorMessage: {
    required: {
      currentPassword: "Old password is required.",
      newPassword: "New password is required.",
      confirmPassword: "Confirm password is required.",
    },
    additionalProperties: "You cannot send extra fields.",
  },
} as const;

export const UserResponseSchema = {
  type: "object",
  required: ["success", "data", "message"],
  properties: {
    success: { type: "boolean", const: true },
    message: { type: "string" },
    data: {
      type: "object",
      required: ["user"],
      properties: {
        user: {
          $ref: "user#",
        },
      },
    },
  },
};
