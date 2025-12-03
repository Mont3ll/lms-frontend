// This hook is now part of components/providers/AuthProvider.tsx
// You can export it from there or keep a separate file exporting from the context:

// Assuming AuthContext is exported from AuthProvider.tsx
// import { AuthContext } from '@/components/providers/AuthProvider';
// import { AuthContextType } from '@/components/providers/AuthProvider'; // Import type if needed

// export const useAuth = (): AuthContextType => {
//   const context = useContext(AuthContext);
//   if (context === undefined) {
//     throw new Error("useAuth must be used within an AuthProvider");
//   }
//   return context;
// };

// OR directly export from the provider file itself. Let's assume it's exported from provider.
