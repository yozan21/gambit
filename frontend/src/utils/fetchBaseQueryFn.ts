import { fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query";
import { disconnectSocket } from "../services/socket";

const baseQuery = fetchBaseQuery({
  baseUrl: `${import.meta.env.VITE_API_URL || "http://localhost:3000"}/api/v1`,
  credentials: "include",
});

export const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);

  if (result.error?.status === 401) {
    // if (url.includes("/users/me")) return result;

    const refreshResult = await baseQuery(
      { url: "/auth/refresh", method: "POST" },
      api,
      extraOptions,
    );

    if (refreshResult.data) {
      result = await baseQuery(args, api, extraOptions);
    } else {
      api.dispatch({ type: "auth/logout" });
      disconnectSocket();
    }
  }

  if (result.error?.status === 403) {
    const state = (api.getState() as any).auth;
    if (state.isRestored && state.isAuthenticated) {
      api.dispatch({ type: "auth/logout" });
      disconnectSocket();
    } else {
      api.dispatch({ type: "auth/logout" });
    }
  }

  return result;
};
