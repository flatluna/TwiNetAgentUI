import { useMsal } from "@azure/msal-react";

export const LoginButton = () => {
  const { instance } = useMsal();
  return (
    <button
      className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
      onClick={() => instance.loginRedirect({
        scopes: ["openid", "profile", "email", "offline_access"],
        redirectUri: "http://localhost:5173/auth-redirect"
      })}
    >
      Login
    </button>
  );
};

export const LogoutButton = () => {
  const { instance } = useMsal();
  return (
    <button
      className="px-4 py-2 rounded bg-gray-600 text-white hover:bg-gray-700"
      onClick={() => instance.logoutRedirect({ postLogoutRedirectUri: "http://localhost:5173/" })}
    >
      Logout
    </button>
  );
};
