// This file is no longer needed for MSAL provider. Use msalInstance from msalInstance.ts and wrap your app with MsalProvider only once in index.tsx.

// If you need to provide additional context, do it here, but do NOT wrap with MsalProvider or create a new PublicClientApplication instance.

export const AuthProvider = ({ children }: { children: React.ReactNode }) => (
  <>{children}</>
);
