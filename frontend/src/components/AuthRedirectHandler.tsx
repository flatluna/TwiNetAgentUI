import { useEffect, useState } from "react";
import { useMsal } from "@azure/msal-react";
import { useNavigate } from "react-router-dom";
import { twinApiService } from "@/services/twinApiService";

const AuthRedirectHandler = () => {
  const { instance, accounts } = useMsal();
  const navigate = useNavigate();
  const [status, setStatus] = useState("Procesando autenticación...");

  useEffect(() => {
        const handleAuthRedirect = async () => {
            try {
                const response = await instance.handleRedirectPromise();
                if (response) {
                    console.log('Login successful:', response);
                    
                    // Get the authenticated user
                    const msalUser = response.account;
                    
                    setStatus("Verificando perfil de Twin...");
                    
                    // Try to get or create Twin profile from user claims
                    const twinResult = await twinApiService.getOrCreateTwinFromClaims(msalUser);
                    
                    if (twinResult.success) {
                        console.log('✅ Twin profile ready:', twinResult.data);
                        setStatus("¡Perfil listo! Redirigiendo...");
                        
                        // Wait a moment to show the status, then navigate
                        setTimeout(() => {
                            navigate('/dashboard');
                        }, 1500);
                    } else {
                        console.error('❌ Failed to setup Twin profile:', twinResult.error);
                        setStatus("Error al configurar el perfil. Continuando...");
                        
                        // Still navigate to dashboard even if Twin creation fails
                        setTimeout(() => {
                            navigate('/dashboard');
                        }, 2000);
                    }
                } else {
                    // Check if user is already authenticated
                    const currentUser = accounts && accounts.length > 0 ? accounts[0] : null;
                    
                    if (currentUser) {
                        console.log('User already authenticated:', currentUser);
                        setStatus("Usuario ya autenticado. Verificando perfil...");
                        
                        // Try to get or create Twin profile for existing user
                        const twinResult = await twinApiService.getOrCreateTwinFromClaims(currentUser);
                        
                        if (twinResult.success) {
                            console.log('✅ Twin profile ready:', twinResult.data);
                        }
                    }
                    
                    // Always redirect to dashboard for authenticated users
                    navigate('/dashboard');
                }
            } catch (error) {
                console.error('Error handling redirect:', error);
                setStatus("Error de autenticación. Redirigiendo...");
                
                setTimeout(() => {
                    navigate('/');
                }, 2000);
            }
        };
    handleAuthRedirect();
  }, [instance, navigate, accounts]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">{status}</p>
      </div>
    </div>
  );
};

export default AuthRedirectHandler;
