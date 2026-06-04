// hooks/useUsernameCheck.ts
import { useState, useEffect } from "react";
import { useLazyCheckUsernameQuery } from "../services/api";

export function useUsernameCheck(username: string, currentUsername?: string) {
  const [debouncedUsername, setDebouncedUsername] = useState(username);
  const [checkUsername, { data, isFetching }] = useLazyCheckUsernameQuery();

  // Debounce — wait 500ms after user stops typing
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedUsername(username);
    }, 500);
    return () => clearTimeout(timer);
  }, [username]);

  // Trigger check when debounced value changes
  useEffect(() => {
    if (
      debouncedUsername.length >= 3 &&
      debouncedUsername !== currentUsername // skip if unchanged
    ) {
      checkUsername(debouncedUsername);
    }
  }, [checkUsername, debouncedUsername, currentUsername]);

  return {
    isAvailable: data?.available,
    isChecking: isFetching,
  };
}
