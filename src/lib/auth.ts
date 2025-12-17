// This file might contain helper functions if not using a library like NextAuth.js
// or if AuthProvider doesn't handle everything.

// Example: Function to check if token is expired (requires jwt-decode library)
// import { jwtDecode } from 'jwt-decode';

// export const isTokenExpired = (token: string | null): boolean => {
//   if (!token) return true;
//   try {
//     const decoded: { exp: number } = jwtDecode(token);
//     const currentTime = Date.now() / 1000; // Convert ms to seconds
//     return decoded.exp < currentTime;
//   } catch (error) {
//     console.error("Error decoding token:", error);
//     return true; // Treat decoding error as expired
//   }
// };

// Cookie name must match middleware
const AUTH_COOKIE_NAME = "authToken";

// Cookie helper functions
const setCookie = (name: string, value: string, days: number = 7): void => {
  if (typeof window === "undefined") return;
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${name}=${value}; expires=${expires.toUTCString()}; path=/${secure}; SameSite=Lax`;
};

const deleteCookie = (name: string): void => {
  if (typeof window === "undefined") return;
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
};

// Functions to manage token storage (already included conceptually in AuthProvider)
export const getToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("authToken");
};

export const getRefreshToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("refreshToken");
};

export const setTokens = (
  token: string | null,
  refreshToken: string | null,
): void => {
  if (typeof window === "undefined") return;
  if (token) {
    localStorage.setItem("authToken", token);
    setCookie(AUTH_COOKIE_NAME, token, 7); // Sync to cookie for middleware
  } else {
    localStorage.removeItem("authToken");
    deleteCookie(AUTH_COOKIE_NAME);
  }
  if (refreshToken) localStorage.setItem("refreshToken", refreshToken);
  else localStorage.removeItem("refreshToken");
};

export const clearTokens = (): void => {
  if (typeof window === "undefined") return;
  localStorage.removeItem("authToken");
  localStorage.removeItem("refreshToken");
  deleteCookie(AUTH_COOKIE_NAME); // Clear cookie when logging out
};

// Check if user has specific role (assuming user object is available)
import { User } from "./types"; // Import User type
export const hasRole = (
  user: User | null,
  roles: string | string[],
): boolean => {
  if (!user) return false;
  const userRole = user.role; // Get user's role
  const requiredRoles = Array.isArray(roles) ? roles : [roles];
  return requiredRoles.includes(userRole) || user.is_staff; // Also allow Django staff for simplicity? Adjust as needed.
};
