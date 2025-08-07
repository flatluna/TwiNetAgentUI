import { createRoot } from "react-dom/client";
import { I18nextProvider } from "react-i18next";
import i18next from "./i18n/config";
import App from "./App.tsx";
import "./index.css";
import { MsalProvider } from "@azure/msal-react";
import msalInstance, { initializeMsal } from "./msalInstance";

const renderApp = () => {
    createRoot(document.getElementById("root")!).render(
        <MsalProvider instance={msalInstance}>
            <I18nextProvider i18n={i18next}>
                <App />
            </I18nextProvider>
        </MsalProvider>
    );
};

initializeMsal().then(renderApp);
