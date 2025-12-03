"use client";

import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  useCallback,
} from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api"; // Import API client
import { User } from "@/lib/types";
import axios from "axios"; // Import axios for type checking if needed

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (token: string, refreshToken: string) => Promise<void>; // Ensure 'login' key exists
  logout: () => void;
  // Optional: Add a function to trigger profile refetch manually if needed
  // refetchUserProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Function to get tokens from storage
const getTokensFromStorage = (): {
  token: string | null;
  refreshToken: string | null;
} => {
  if (typeof window === "undefined") return { token: null, refreshToken: null };
  return {
    token: localStorage.getItem("authToken"),
    refreshToken: localStorage.getItem("refreshToken"),
  };
};

// Function to set tokens in storage
const setTokensInStorage = (
  token: string | null,
  refreshToken: string | null,
): void => {
  if (typeof window === "undefined") return;
  if (token) localStorage.setItem("authToken", token);
  else localStorage.removeItem("authToken");
  if (refreshToken) localStorage.setItem("refreshToken", refreshToken);
  else localStorage.removeItem("refreshToken");
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const queryClient = useQueryClient();
  const USER_PROFILE_QUERY_KEY = ["userProfile"]; // Define query key constant

  // --- Logout Function ---
  const logout = useCallback(() => {
    console.log("AuthProvider: Logging out");
    setUser(null);
    setTokensInStorage(null, null);
    apiClient.defaults.headers.common["Authorization"] = "";
    // Invalidate profile query AND clear query cache entirely for clean state
    queryClient.removeQueries({ queryKey: USER_PROFILE_QUERY_KEY });
    queryClient.clear();
    // Redirect to login page safely
    if (typeof window !== "undefined") {
      router.push("/login"); // Use push to allow back navigation if needed, replace if not
    }
  }, [router, queryClient]);

  // --- Refresh Token Logic ---
  const refreshTokenFunc = useCallback(async (): Promise<string | null> => {
    console.log("AuthProvider: Attempting token refresh...");
    const { refreshToken: currentRefreshToken } = getTokensFromStorage();
    if (!currentRefreshToken) {
      console.log("AuthProvider: No refresh token found.");
      return null;
    }

    try {
      // Use relative path, baseURL is set on apiClient
      const response = await apiClient.post<{ access: string }>(
        "/auth/login/refresh/",
        {
          refresh: currentRefreshToken,
        },
      );
      const newAccessToken = response.data.access;
      setTokensInStorage(newAccessToken, currentRefreshToken);
      apiClient.defaults.headers.common["Authorization"] =
        `Bearer ${newAccessToken}`;
      console.log("AuthProvider: Token refreshed successfully.");
      return newAccessToken;
    } catch (error) {
      console.error("AuthProvider: Failed to refresh token:", error);
      // If refresh fails (e.g., token expired/invalid), log the user out
      logout(); // Call logout on refresh failure
      return null;
    }
  }, [logout]); // Add logout as dependency

  // --- Fetch User Profile ---
  const fetchUserProfile = useCallback(
    async (retry = true) => {
      // Add retry flag
      console.log("AuthProvider: Fetching user profile...");
      setIsLoading(true); // Set loading true at the start of fetch attempt
      const { token } = getTokensFromStorage();

      if (token) {
        apiClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        try {
          // Try fetching from cache first is handled by react-query itself, no need for getQueryData here
          const userData = await queryClient.fetchQuery<User>({
            queryKey: USER_PROFILE_QUERY_KEY,
            queryFn: () =>
              apiClient.get<User>("/auth/profile/").then((res) => res.data), // Use the actual API function
            staleTime: 1000 * 60 * 5, // 5 minutes stale time
          });
          setUser(userData);
          console.log(
            "AuthProvider: User profile fetched successfully:",
            userData?.email,
          );
          setIsLoading(false); // Set loading false on success
        } catch (error: unknown) {
          console.error("AuthProvider: Failed to fetch user profile:", error);
          // Check if it's a 401 error, potentially indicating expired access token
          if (
            axios.isAxiosError(error) &&
            error.response?.status === 401 &&
            retry
          ) {
            console.log(
              "AuthProvider: Received 401, attempting token refresh...",
            );
            const newAccessToken = await refreshTokenFunc();
            if (newAccessToken) {
              // Retry fetching profile ONCE after successful refresh
              console.log(
                "AuthProvider: Refresh successful, retrying profile fetch...",
              );
              await fetchUserProfile(false); // Call fetch again, but prevent infinite retry loop
            } else {
              // Refresh failed, logout handled within refreshTokenFunc
              setIsLoading(false); // Stop loading as user is logged out
            }
          } else {
            // Other error or retry failed, logout
            console.log(
              "AuthProvider: Non-401 error or refresh failed, logging out.",
            );
            logout();
            setIsLoading(false); // Stop loading
          }
        }
        // No finally block needed here, loading state handled in try/catch branches
      } else {
        console.log("AuthProvider: No token found, user is logged out.");
        apiClient.defaults.headers.common["Authorization"] = "";
        setUser(null);
        setIsLoading(false); // Stop loading
      }
    },
    [queryClient, refreshTokenFunc, logout],
  ); // Add dependencies

  // --- Login Function ---
  const login = useCallback(
    async (token: string, refreshTokenVal: string) => {
      console.log("AuthProvider: Login function called.");
      setTokensInStorage(token, refreshTokenVal);
      apiClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      // Invalidate any stale profile data before fetching new one
      queryClient.removeQueries({ queryKey: USER_PROFILE_QUERY_KEY });
      await fetchUserProfile(); // Fetch profile immediately after setting tokens
      // Redirect should happen in the page component after login state is confirmed
    },
    [fetchUserProfile, queryClient],
  );

  // --- Initial Load Effect ---
  useEffect(() => {
    console.log("AuthProvider: Initializing - fetching profile...");
    fetchUserProfile();
  }, [fetchUserProfile]); // Run only once on mount essentially due to useCallback

  // --- Axios Interceptor for 401s ---
  // (Removed as explicit checks in fetchUserProfile are often more reliable with async nature)
  // You *can* still use an interceptor, but ensure it coordinates with the state updates
  // and doesn't conflict with the manual refresh logic in fetchUserProfile.

  // Context Value
  const value: AuthContextType = { user, isLoading, login, logout }; // Ensure key is 'login'

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// --- Custom Hook ---
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
