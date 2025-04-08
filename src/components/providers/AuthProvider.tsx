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
import { apiClient } from "@/lib/api"; // Your configured axios instance
import { User } from "@/lib/types"; // Your User type

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (token: string, refreshToken: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Function to get tokens from storage (implement based on your storage choice)
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

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const queryClient = useQueryClient() || new QueryClient(); // Ensure QueryClient is available

  // Fetch user profile based on token
  const fetchUserProfile = useCallback(async () => {
    setIsLoading(true);
    const { token } = getTokensFromStorage();
    if (token) {
      apiClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      try {
        const userQueryKey = ["userProfile"];
        let userData = queryClient.getQueryData<User>(userQueryKey);
        if (!userData) {
          const response = await apiClient.get<User>("/auth/profile/");
          userData = response.data;
          queryClient.setQueryData(userQueryKey, userData);
        }
        setUser(userData);
      } catch (error) {
        console.error("Failed to fetch user profile:", error);
        await handleAuthError();
      } finally {
        setIsLoading(false);
      }
    } else {
      apiClient.defaults.headers.common["Authorization"] = "";
      setUser(null);
      setIsLoading(false);
    }
  }, [queryClient]);

  const refreshToken = useCallback(async (): Promise<string | null> => {
    const { refreshToken: currentRefreshToken } = getTokensFromStorage();
    if (!currentRefreshToken) return null;

    try {
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
      console.log("Token refreshed successfully");
      return newAccessToken;
    } catch (error) {
      console.error("Failed to refresh token:", error);
      return null;
    }
  }, []);

  const handleAuthError = useCallback(async () => {
    const newAccessToken = await refreshToken();
    if (!newAccessToken) {
      logout();
    }
  }, [refreshToken]);

  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

  useEffect(() => {
    const interceptor = apiClient.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          console.log("Intercepted 401, attempting token refresh...");
          const newAccessToken = await refreshToken();
          if (newAccessToken) {
            originalRequest.headers["Authorization"] =
              `Bearer ${newAccessToken}`;
            return apiClient(originalRequest);
          } else {
            logout();
          }
        }
        return Promise.reject(error);
      },
    );

    return () => {
      apiClient.interceptors.response.eject(interceptor);
    };
  }, [refreshToken]);

  const login = async (token: string, refreshTokenVal: string) => {
    setTokensInStorage(token, refreshTokenVal);
    apiClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    await fetchUserProfile();
  };

  const logout = useCallback(() => {
    setUser(null);
    setTokensInStorage(null, null);
    apiClient.defaults.headers.common["Authorization"] = "";
    queryClient.clear();
    router.push("/login");
  }, [router, queryClient]);

  const value = { user, isLoading, login, logout };

  return (
    <QueryClientProvider client={queryClient}>
      <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    </QueryClientProvider>
  );
}

// Custom hook to use the Auth Context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
