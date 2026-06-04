import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { AuthState, AuthUser } from "../../types/auth.types";

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  isRestored: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    sessionRestored: (
      state,
      action: PayloadAction<{ user: AuthUser; token: string }>,
    ) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.isLoading = false;
      state.isRestored = true;
    },
    sessionNotFound: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      state.isRestored = true;
    },
    loginSuccess: (
      state,
      action: PayloadAction<{ user: AuthUser; token: string }>,
    ) => {
      state.user = action.payload.user;
      state.isAuthenticated = true;
      state.isLoading = false;
      state.isRestored = true;
    },
    signupSuccess: (
      state,
      action: PayloadAction<{ user: AuthUser; token: string }>,
    ) => {
      state.user = action.payload.user;
      state.isAuthenticated = true;
      state.isLoading = false;
      state.isRestored = true;
    },
    loggedOut: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      state.isRestored = true;
    },
    updateUser: (state, action: PayloadAction<{ user: AuthUser }>) => {
      state.user = action.payload.user;
    },
  },
});

export const {
  sessionRestored,
  sessionNotFound,
  loginSuccess,
  signupSuccess,
  loggedOut,
  updateUser,
} = authSlice.actions;

export default authSlice.reducer;
