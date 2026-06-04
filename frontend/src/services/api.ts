import { createApi } from "@reduxjs/toolkit/query/react";
// import type { RootState } from "../store/index";
import type {
  AuthResponse,
  LoginRequest,
  SignupRequest,
  UserResponse,
  UsersResponse,
  NoDataResponse,
  UpdateProfileRequest,
  UpdatePasswordRequest,
} from "../types/user.types";
import { baseQueryWithReauth } from "../utils/fetchBaseQueryFn";
import type { GameRecordResponse } from "@/types/game.types";

/* =====================
   API
===================== */
export const api = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,

  // Auto refetch on reconnect and focus
  refetchOnReconnect: true,
  refetchOnFocus: false,

  // Cache lifetime
  keepUnusedDataFor: 300, // 5 minutes

  tagTypes: ["User", "Game", "Users"],

  endpoints: (builder) => ({
    /* ========= Auth ========= */

    login: builder.mutation<AuthResponse, LoginRequest>({
      query: (body) => ({
        url: "/auth/login",
        method: "POST",
        body,
      }),
    }),

    signup: builder.mutation<AuthResponse, SignupRequest>({
      query: (body) => ({
        url: "/auth/signup",
        method: "POST",
        body,
      }),
    }),

    logout: builder.mutation<void, void>({
      query: () => ({
        url: "/auth/logout",
        method: "POST",
      }),
      // Clear all cached data on logout
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        await queryFulfilled;
        dispatch(api.util.resetApiState());
      },
    }),

    forgotPassword: builder.mutation<
      { success: boolean; message: string },
      { email: string }
    >({
      query: (body) => ({ url: "/auth/forgot-password", method: "POST", body }),
    }),

    verifyOtp: builder.mutation<
      { success: boolean },
      { email: string; otp: string }
    >({
      query: (body) => ({ url: "/auth/verify-otp", method: "POST", body }),
    }),

    resetPassword: builder.mutation<
      { success: boolean },
      {
        email: string;
        otp: string;
        newPassword: string;
        confirmPassword: string;
      }
    >({
      query: (body) => ({ url: "/auth/reset-password", method: "POST", body }),
    }),

    /* ========= Users ========= */

    checkUsername: builder.query<{ available: boolean }, string>({
      query: (username) => `/auth/check-username?username=${username}`,
    }),

    // Get current logged in user
    // Used for session restore on app load
    getMe: builder.query<UserResponse, void>({
      query: () => "/users/me",
      providesTags: ["User"],
      // Cache for 5 minutes
      keepUnusedDataFor: 300,
    }),

    // Get user by id - for viewing profiles
    getUserById: builder.query<UserResponse, string>({
      query: (id) => `/users/${id}`,
      providesTags: (_, __, id) => [{ type: "User", id }],
      keepUnusedDataFor: 180, // 3 minutes
    }),

    // Get all users - for leaderboard
    getUsers: builder.query<UsersResponse, void>({
      query: () => "/users",
      providesTags: ["Users"],
      keepUnusedDataFor: 60, // 1 minute - leaderboard changes often
    }),

    updateProfile: builder.mutation<UserResponse, UpdateProfileRequest>({
      query: (body) => ({
        url: `/users/me/updateProfile`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["User"],
    }),

    updatePassword: builder.mutation<NoDataResponse, UpdatePasswordRequest>({
      query: (body) => ({
        url: `/users/me/updatePassword`,
        method: "PATCH",
        body,
      }),
    }),

    /* ========= GAMES ========= */
    getMatchHistory: builder.query<GameRecordResponse, number>({
      query: (page) => `/users/me/matchHistory?page=${page}&limit=10`,
    }),
  }),
});

export const {
  useLoginMutation,
  useSignupMutation,
  useLogoutMutation,
  useLazyCheckUsernameQuery,
  useGetMeQuery,
  useGetUserByIdQuery,
  useGetUsersQuery,
  useForgotPasswordMutation,
  useVerifyOtpMutation,
  useResetPasswordMutation,
  useUpdateProfileMutation,
  useUpdatePasswordMutation,
  useGetMatchHistoryQuery,
} = api;
