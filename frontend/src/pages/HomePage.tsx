import React from "react";
import { LoginButton, LogoutButton } from "@/components/LoginButton";
import { useMsal } from "@azure/msal-react";

const HomePage: React.FC = () => {
    const { accounts } = useMsal();
    const user = accounts && accounts[0];

    // No redirect to /dashboard; stay on HomePage after login

    return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="text-center">
                <h1 className="text-3xl font-bold mb-4">Bienvenido a TwinAgent</h1>
                {!user ? (
                    <LoginButton />
                ) : (
                    <>
                        <p className="mb-4">¡Hola, {user?.name || user?.username || "usuario"}!</p>
                        <LogoutButton />
                    </>
                )}
            </div>
        </div>
    );
};

export default HomePage;
