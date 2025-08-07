import React from "react";
import { Navigate } from "react-router-dom";
import { useMsal } from "@azure/msal-react";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { accounts } = useMsal();
  const user = accounts && accounts[0];

  if (!user) {
    // Si no está autenticado, redirige a la página principal (donde está el login)
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
