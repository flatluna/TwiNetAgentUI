// Azure AD B2C MSAL configuration for TwinAgent
export const msalConfig = {
  auth: {
    clientId: "072a9d7a-1587-47cb-98bc-491b33294d7a", // <-- Client ID real
    authority: "https://twinetai.b2clogin.com/twinetai.onmicrosoft.com/b2c_1_signupsignin", // <-- User flow
    knownAuthorities: ["twinetai.b2clogin.com"],
    redirectUri: "http://localhost:5173/auth-redirect"
  }
};
