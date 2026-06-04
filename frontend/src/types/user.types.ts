import type { AuthUser } from "./auth.types";

export interface AuthResponse {
  success: true;
  message: string;
  data: {
    user: AuthUser;
    token: string;
  };
}

export interface UserResponse {
  success: true;
  message: string;
  data: {
    user: AuthUser;
  };
}

export interface UsersResponse {
  success: true;
  message: string;
  data: {
    users: AuthUser[];
  };
}

export interface NoDataResponse {
  success: true;
  message: string;
  data?: object;
}

export interface LoginRequest {
  identifier: string;
  password: string;
}

export interface SignupRequest {
  email: string;
  fullName: string;
  username: string;
  password: string;
  confirmPassword: string;
}

export interface UpdateProfileRequest {
  username?: string;
  fullName?: string;
}

export interface UpdatePasswordRequest {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}
