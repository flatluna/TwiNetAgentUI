import React, { useState, useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import UserMenu from "@/components/ui/user-menu";
import ThemeToggle from "@/components/ui/theme-toggle";
import TwinProfileModal from "@/components/ui/twin-profile-modal";
import { useUser } from "@/context/UserContext";
import { 
    Users, 
    Mic, 
    BarChart3, 
    Settings, 
    Menu, 
    X, 
    UserPlus,
    Eye,
    BookOpen,
    MessageCircle,
    User,
    Home,
    Car,
    Dog
} from "lucide-react";
import { LoginButton, LogoutButton } from "@/components/LoginButton";
import { useMsal } from "@azure/msal-react";
import { twinApiService, type TwinProfileResponse } from "@/services/twinApiService";
import logoPng from "@/assets/logo.png";
import LandingPage from "@/pages/LandingPage";

const MainLayout: React.FC = () => {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [showTokenDetails, setShowTokenDetails] = useState(false);
    const [twinProfile, setTwinProfile] = useState<TwinProfileResponse | null>(null);
    const [loadingTwin, setLoadingTwin] = useState(false);
    const [twinLoadAttempted, setTwinLoadAttempted] = useState(false); // New flag to prevent infinite loops
    const [showProfileModal, setShowProfileModal] = useState(false); // New state for profile modal
    const [isMobile, setIsMobile] = useState(false); // Track mobile state
    const [authLoading, setAuthLoading] = useState(true); // Track auth state loading
    const navigate = useNavigate();
    const location = useLocation();
    const { logout } = useUser();
    const { accounts, inProgress } = useMsal();
    // Always get latest MSAL user state
    const msalUser = accounts && accounts.length > 0 ? accounts[0] : null;

    // Track authentication loading state
    useEffect(() => {
        // Wait for MSAL to finish loading
        if (inProgress === 'none') {
            setAuthLoading(false);
        }
    }, [inProgress]);

    // Handle window resize and mobile detection
    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth < 768; // md breakpoint
            setIsMobile(mobile);
            
            // Auto-collapse sidebar on mobile
            if (mobile && sidebarOpen) {
                setSidebarOpen(false);
            }
        };

        handleResize(); // Initial check
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [sidebarOpen]);

    // Reset Twin load state when user changes
    useEffect(() => {
        if (msalUser) {
            setTwinLoadAttempted(false);
            setTwinProfile(null);
        }
    }, [msalUser?.localAccountId]); // Reset when user account changes

    // Load Twin profile when user is authenticated
    useEffect(() => {
        const loadTwinProfile = async () => {
            if (msalUser && !twinProfile && !loadingTwin && !twinLoadAttempted) {
                setLoadingTwin(true);
                setTwinLoadAttempted(true); // Set flag to prevent retry loops
                try {
                    // Extract email from claims to use as twin name
                    const claims = msalUser.idTokenClaims as any;
                    
                    // Use localAccountId as the twin identifier
                    const twinId = msalUser.localAccountId;
                    
                    console.log('🔍 Available claims for debugging:', claims);
                    console.log('🆔 Using localAccountId as twinId:', twinId);
                    
                    if (!twinId || twinId.trim() === '') {
                        console.error('❌ No localAccountId found in user');
                        setLoadingTwin(false);
                        return;
                    }
                    
                    console.log('🔍 Loading Twin profile for twinId:', twinId);
                    
                    // Use smart lookup that automatically determines if it's UUID or name
                    const result = await twinApiService.getTwinByIdentifier(twinId);
                    if (result.success && result.data) {
                        console.log('✅ Twin profile loaded:', result.data);
                        setTwinProfile(result.data);
                    } else {
                        console.log('ℹ️ Twin profile not found or error:', result.error);
                        // Try to create Twin from claims if it doesn't exist
                        console.log('🚀 Attempting to create Twin from user claims...');
                        const createResult = await twinApiService.getOrCreateTwinFromClaims(msalUser);
                        if (createResult.success && createResult.data) {
                            console.log('✅ Twin created/loaded successfully:', createResult.data);
                            setTwinProfile(createResult.data);
                        } else {
                            console.error('❌ Failed to create/load Twin:', createResult.error);
                        }
                    }
                } catch (error) {
                    console.error('❌ Error loading Twin profile:', error);
                } finally {
                    setLoadingTwin(false);
                }
            }
        };

        loadTwinProfile();
    }, [msalUser]); // Simplified dependencies - only depend on msalUser changes

    // Manual refresh Twin profile
    const refreshTwinProfile = async () => {
        if (msalUser && !loadingTwin) {
            setTwinProfile(null); // Clear current profile to trigger reload
        }
    };

    const handleLogout = () => {
        logout();
        // Could navigate to login page
        // navigate("/login");
    };

    const handleProfile = async () => {
        if (!msalUser) return;
        
        const twinId = msalUser.localAccountId;
        console.log('🔍 Loading Twin profile for modal with twinId:', twinId);
        
        setShowProfileModal(true);
        setLoadingTwin(true);
        
        try {
            // Use smart lookup that automatically determines if it's UUID or name
            const result = await twinApiService.getTwinByIdentifier(twinId);
            if (result.success && result.data) {
                console.log('✅ Twin profile loaded for modal:', result.data);
                setTwinProfile(result.data);
            } else {
                console.error('❌ Twin profile not found for modal:', result.error);
                setTwinProfile(null); // Clear any existing profile to show error message
            }
        } catch (error) {
            console.error('❌ Error loading Twin profile for modal:', error);
            setTwinProfile(null);
        } finally {
            setLoadingTwin(false);
        }
    };

    const menuItems = [
        {
            id: "dashboard",
            label: "Dashboard",
            icon: BarChart3,
            path: "/",
            description: "Vista general del sistema"
        },
        {
            id: "mi-twin",
            label: "Mi Twin Personal",
            icon: User,
            path: "/mi-twin",
            description: "Mi Twin digital personal",
            submenu: [
                {
                    id: "biblioteca-digital",
                    label: "Mi Biblioteca Digital",
                    icon: BookOpen,
                    path: "/twin-biografia"
                },
                {
                    id: "twin-agent",
                    label: "Chat con Mi Twin",
                    icon: MessageCircle,
                    path: "/twin-agent"
                },
                {
                    id: "chat-voice",
                    label: "Chat por Voz",
                    icon: Mic,
                    path: "/chat-voice"
                }
            ]
        },
        {
            id: "mi-familia",
            label: "Mi Familia",
            icon: Users,
            path: "/mi-familia",
            description: "Familia y seres queridos",
            submenu: [
                {
                    id: "crear-twin-familiar",
                    label: "Crear Twin de Familiar",
                    icon: UserPlus,
                    path: "/crear-twin"
                },
                {
                    id: "ver-mi-familia",
                    label: "Ver Mi Familia",
                    icon: Eye,
                    path: "/mis-twins"
                }
            ]
        },
        {
            id: "mi-patrimonio",
            label: "Mi Patrimonio",
            icon: Home,
            path: "/mi-patrimonio",
            description: "Casa, auto, mascotas, etc.",
            submenu: [
                {
                    id: "twin-casa",
                    label: "Twin del Hogar",
                    icon: Home,
                    path: "/twin-casa"
                },
                {
                    id: "twin-vehiculo",
                    label: "Twin del Vehículo",
                    icon: Car,
                    path: "/twin-vehiculo"
                },
                {
                    id: "twin-mascotas",
                    label: "Twins de Mascotas",
                    icon: Dog,
                    path: "/twin-mascotas"
                },
                {
                    id: "crear-twin-patrimonio",
                    label: "Crear Twin de Patrimonio",
                    icon: UserPlus,
                    path: "/crear-twin-objeto"
                }
            ]
        },
        {
            id: "configuracion",
            label: "Configuración",
            icon: Settings,
            path: "/configuracion",
            description: "Ajustes del sistema"
        }
    ];

    const isActivePath = (path: string) => {
        if (path === "/") {
            return location.pathname === "/";
        }
        return location.pathname.startsWith(path);
    };

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    // Función para obtener colores de iconos basados en el ID del item
    const getIconColor = (itemId: string) => {
        const colors = {
            "dashboard": "text-blue-400 hover:text-blue-300",
            "mi-twin": "text-green-400 hover:text-green-300",
            "mi-familia": "text-purple-400 hover:text-purple-300",
            "mi-patrimonio": "text-orange-400 hover:text-orange-300",
            "configuracion": "text-gray-400 hover:text-gray-300"
        };
        return colors[itemId as keyof typeof colors] || "text-gray-400 hover:text-gray-300";
    };

    // Función para obtener colores de iconos del submenu
    const getSubmenuIconColor = (itemId: string) => {
        const colors = {
            // Mi Twin Personal
            "biblioteca-digital": "text-emerald-400 hover:text-emerald-300",
            "twin-agent": "text-green-300 hover:text-green-200",
            "chat-voice": "text-teal-400 hover:text-teal-300",
            
            // Mi Familia
            "crear-twin-familiar": "text-purple-300 hover:text-purple-200",
            "ver-mi-familia": "text-violet-400 hover:text-violet-300",
            
            // Mi Patrimonio
            "twin-casa": "text-orange-300 hover:text-orange-200",
            "twin-vehiculo": "text-amber-400 hover:text-amber-300",
            "twin-mascotas": "text-yellow-400 hover:text-yellow-300",
            "crear-twin-patrimonio": "text-red-400 hover:text-red-300"
        };
        return colors[itemId as keyof typeof colors] || "text-gray-300 hover:text-gray-200";
    };

    return (
        <div className="flex min-h-screen">
            {/* Si está cargando la autenticación, mostrar un spinner */}
            {authLoading ? (
                <div className="flex items-center justify-center w-full min-h-screen">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">Cargando...</p>
                    </div>
                </div>
            ) : 
            /* Si no hay usuario autenticado Y estamos en la página raíz, mostrar landing page */
            (!msalUser && location.pathname === '/') ? (
                <LandingPage />
            ) : (
                <>
                    {/* Mobile Backdrop */}
                    {sidebarOpen && (
                        <div 
                            className="fixed inset-0 z-20 bg-black bg-opacity-50 md:hidden"
                            onClick={() => setSidebarOpen(false)}
                        />
                    )}
                    
                    {/* Sidebar */}
                    <aside className={`
                        bg-gray-900 text-white flex-shrink-0 transition-all duration-300 z-30
                        ${sidebarOpen ? "w-64" : "w-16"}
                        ${isMobile ? "fixed h-full" : "relative"}
                        ${isMobile && !sidebarOpen ? "-translate-x-full" : "translate-x-0"}
                    `}>
                        <div className="flex flex-col px-2 py-3 border-b border-gray-800 h-16 md:h-20 justify-center">
                            <div className="flex items-center justify-between">
                                <span className={`font-bold text-base md:text-lg transition-all duration-300 ${sidebarOpen ? "block" : "hidden"}`}>
                                    TwinAgent
                                </span>
                                <button onClick={toggleSidebar} className="text-gray-400 hover:text-white p-1">
                                    {sidebarOpen ? <X size={isMobile ? 20 : 24} /> : <Menu size={isMobile ? 20 : 24} />}
                                </button>
                            </div>
                            {sidebarOpen && (
                                <div className="mt-2 text-xs text-gray-300">
                                    <span className="font-semibold">Twin User ID:</span>
                                    <br />
                                    <span className="break-all">{msalUser?.username || "No autenticado"}</span>
                                </div>
                            )}
                        </div>
                        <nav className="mt-2 md:mt-4 flex flex-col gap-1 px-1">
                            {menuItems.map(item => (
                                <div key={item.id}>
                                    <Button
                                        variant={isActivePath(item.path) ? "default" : "ghost"}
                                        className={`w-full flex items-center justify-start px-2 py-2 mb-1 transition-all duration-300 text-sm md:text-base
                                            ${sidebarOpen ? "" : "justify-center"}
                                            ${isMobile && sidebarOpen ? "py-3" : ""}
                                        `}
                                        onClick={() => {
                                            navigate(item.path);
                                            if (isMobile) setSidebarOpen(false);
                                        }}
                                        title={item.label}
                                    >
                                        <item.icon 
                                            className={`mr-2 ${getIconColor(item.id)}`} 
                                            size={sidebarOpen ? (isMobile ? 20 : 18) : (isMobile ? 24 : 22)} 
                                        />
                                        {sidebarOpen && <span className="truncate">{item.label}</span>}
                                    </Button>
                                    {item.submenu && sidebarOpen && (
                                        <div className="ml-4 md:ml-6">
                                            {item.submenu.map(sub => (
                                                <Button
                                                    key={sub.id}
                                                    variant={isActivePath(sub.path) ? "default" : "ghost"}
                                                    className={`w-full flex items-center justify-start px-3 md:px-4 py-2 mb-1 text-sm
                                                        ${isMobile ? "py-3" : ""}
                                                    `}
                                                    onClick={() => {
                                                        navigate(sub.path);
                                                        if (isMobile) setSidebarOpen(false);
                                                    }}
                                                    title={sub.label}
                                                >
                                                    <sub.icon 
                                                        className={`mr-2 ${getSubmenuIconColor(sub.id)}`} 
                                                        size={isMobile ? 18 : 16} 
                                                    />
                                                    <span className="truncate">{sub.label}</span>
                                                </Button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </nav>
                    </aside>

                    {/* Main content area */}
                    <div className={`flex flex-col flex-1 transition-all duration-300 ${isMobile && sidebarOpen ? "blur-sm" : ""}`}>
                        {/* Header/top bar */}
                        <header className="bg-white border-b border-gray-200 px-3 md:px-6 py-2 md:py-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 md:gap-4">
                                    {/* Logo */}
                                    <div className="flex items-center gap-2 md:gap-3">
                                        <img 
                                            src={logoPng} 
                                            alt="TwinAgent Logo" 
                                            className="h-8 w-8 md:h-10 md:w-10"
                                        />
                                        <span className="text-lg md:text-xl font-bold text-gray-800 hidden sm:block">TwinAgent</span>
                                    </div>
                                    <div className="hidden md:block">
                                        <ThemeToggle />
                                    </div>
                                    {msalUser && (
                                        <div className="hidden lg:flex items-center gap-2">
                                            <button
                                                onClick={() => setShowTokenDetails(!showTokenDetails)}
                                                className="text-xs md:text-sm text-blue-600 hover:text-blue-800 underline"
                                            >
                                                {showTokenDetails ? 'Ocultar Details' : 'Mostrar Details'}
                                            </button>
                                            {twinProfile && (
                                                <button 
                                                    onClick={refreshTwinProfile}
                                                    disabled={loadingTwin}
                                                    className="text-xs text-gray-500 hover:text-gray-700 underline disabled:opacity-50"
                                                >
                                                    🔄 Refresh Twin
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                                <div className="flex items-center gap-1 md:gap-2">
                                    {msalUser ? (
                                        <>
                                            <UserMenu 
                                                userName={((msalUser?.idTokenClaims as any)?.given_name && (msalUser?.idTokenClaims as any)?.family_name) ? `${(msalUser?.idTokenClaims as any)?.given_name} ${(msalUser?.idTokenClaims as any)?.family_name}` : (msalUser.name || msalUser.username || "Usuario")}
                                                onLogout={handleLogout}
                                                onProfile={handleProfile}
                                            />
                                            <Button 
                                                variant="outline" 
                                                onClick={handleProfile}
                                                size={isMobile ? "sm" : "default"}
                                                className="hidden sm:flex"
                                            >
                                                Perfil
                                            </Button>
                                            <LogoutButton />
                                        </>
                                    ) : (
                                        <LoginButton />
                                    )}
                                </div>
                            </div>
                    
                    {/* Token Details Panel */}
                    {showTokenDetails && msalUser && (
                        <div className="mt-4 p-3 md:p-4 bg-gray-50 border border-gray-200 rounded-lg">
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-3 gap-2">
                                <h3 className="font-semibold text-gray-800 text-sm md:text-base">Datos del Usuario y Twin:</h3>
                                {twinProfile && (
                                    <span className="text-xs md:text-sm bg-green-100 text-green-800 px-2 py-1 rounded self-start">
                                        ✅ Twin Profile Activo
                                    </span>
                                )}
                            </div>
                            
                            {/* Twin Profile Information */}
                            {twinProfile && (
                                <div className="mb-4 p-2 md:p-3 bg-blue-50 border border-blue-200 rounded">
                                    <h4 className="font-semibold text-blue-800 mb-2 text-sm md:text-base">Información del Twin:</h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 text-xs md:text-sm">
                                        <div>
                                            <strong className="text-blue-700">Twin Name:</strong>
                                            <p className="text-blue-600 break-words">{twinProfile.twinName}</p>
                                        </div>
                                        <div>
                                            <strong className="text-blue-700">Nombre Completo:</strong>
                                            <p className="text-blue-600 break-words">{twinProfile.firstName} {twinProfile.lastName}</p>
                                        </div>
                                        <div className="sm:col-span-2 lg:col-span-1">
                                            <strong className="text-blue-700">Email:</strong>
                                            <p className="text-blue-600 break-all text-xs">{twinProfile.email}</p>
                                        </div>
                                        <div>
                                            <strong className="text-blue-700">País:</strong>
                                            <p className="text-blue-600">{twinProfile.birthCountry || twinProfile.countryId}</p>
                                        </div>
                                        <div>
                                            <strong className="text-blue-700">Creado:</strong>
                                            <p className="text-blue-600">{new Date(twinProfile.createdAt).toLocaleDateString()}</p>
                                        </div>
                                        <div className="sm:col-span-2 lg:col-span-1">
                                            <strong className="text-blue-700">ID:</strong>
                                            <p className="text-blue-600 break-all text-xs">{twinProfile.id}</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 text-xs md:text-sm">
                                <div>
                                    <strong className="text-gray-700">Username:</strong>
                                    <p className="text-gray-600 break-all">{msalUser.username || 'N/A'}</p>
                                </div>
                                <div>
                                    <strong className="text-gray-700">Name:</strong>
                                    <p className="text-gray-600 break-words">{msalUser.name || 'N/A'}</p>
                                </div>
                                <div className="sm:col-span-2 lg:col-span-1">
                                    <strong className="text-gray-700">Local Account ID:</strong>
                                    <p className="text-gray-600 break-all text-xs">{msalUser.localAccountId || 'N/A'}</p>
                                </div>
                                <div className="sm:col-span-2 lg:col-span-1">
                                    <strong className="text-gray-700">Home Account ID:</strong>
                                    <p className="text-gray-600 break-all text-xs">{msalUser.homeAccountId || 'N/A'}</p>
                                </div>
                                <div>
                                    <strong className="text-gray-700">Environment:</strong>
                                    <p className="text-gray-600">{msalUser.environment || 'N/A'}</p>
                                </div>
                                <div className="sm:col-span-2 lg:col-span-1">
                                    <strong className="text-gray-700">Tenant ID:</strong>
                                    <p className="text-gray-600 break-all text-xs">{msalUser.tenantId || 'N/A'}</p>
                                </div>
                            </div>
                            
                            {/* ID Token Claims */}
                            {msalUser.idTokenClaims && (
                                <>
                                    <div className="mt-4">
                                        <h4 className="font-semibold text-gray-800 mb-2 text-sm md:text-base">Claims Principales:</h4>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 text-xs md:text-sm">
                                            {(msalUser.idTokenClaims as any).given_name && (
                                                <div>
                                                    <strong className="text-gray-700">Nombre:</strong>
                                                    <p className="text-gray-600 break-words">{String((msalUser.idTokenClaims as any).given_name)}</p>
                                                </div>
                                            )}
                                            {(msalUser.idTokenClaims as any).family_name && (
                                                <div>
                                                    <strong className="text-gray-700">Apellido:</strong>
                                                    <p className="text-gray-600 break-words">{String((msalUser.idTokenClaims as any).family_name)}</p>
                                                </div>
                                            )}
                                            {((msalUser.idTokenClaims as any).email || (msalUser.idTokenClaims as any).emails?.[0]) && (
                                                <div className="sm:col-span-2 lg:col-span-1">
                                                    <strong className="text-gray-700">Email:</strong>
                                                    <p className="text-gray-600 break-all text-xs">{String((msalUser.idTokenClaims as any).email || (msalUser.idTokenClaims as any).emails?.[0])}</p>
                                                </div>
                                            )}
                                            {(msalUser.idTokenClaims as any).oid && (
                                                <div className="sm:col-span-2 lg:col-span-1">
                                                    <strong className="text-gray-700">Object ID:</strong>
                                                    <p className="text-gray-600 break-all text-xs">{String((msalUser.idTokenClaims as any).oid)}</p>
                                                </div>
                                            )}
                                            {(msalUser.idTokenClaims as any).sub && (
                                                <div className="sm:col-span-2 lg:col-span-1">
                                                    <strong className="text-gray-700">Subject ID:</strong>
                                                    <p className="text-gray-600 break-all text-xs">{String((msalUser.idTokenClaims as any).sub)}</p>
                                                </div>
                                            )}
                                            {(msalUser.idTokenClaims as any).tfp && (
                                                <div>
                                                    <strong className="text-gray-700">User Flow:</strong>
                                                    <p className="text-gray-600 break-words">{String((msalUser.idTokenClaims as any).tfp)}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="mt-4">
                                        <h4 className="font-semibold text-gray-800 mb-2 text-sm md:text-base">Todos los Claims (JSON):</h4>
                                        <div className="bg-white p-2 md:p-3 rounded border max-h-48 md:max-h-64 overflow-y-auto">
                                            <pre className="text-xs text-gray-700 whitespace-pre-wrap break-all">
                                                {JSON.stringify(msalUser.idTokenClaims, null, 2)}
                                            </pre>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </header>

                <main className="flex-grow bg-gray-50 p-3 md:p-6">
                    <Outlet /> {/* Renders the child routes */}
                </main>

                <footer className="bg-gray-100 border-t border-gray-200 px-3 md:px-6 py-2 text-right text-xs text-gray-500">
                    <span className="hidden sm:inline">TwinAgent &copy; 2025</span>
                    <span className="sm:hidden">&copy; 2025 TwinAgent</span>
                </footer>
            </div>
            
            {/* Twin Profile Modal */}
            <TwinProfileModal
                isOpen={showProfileModal}
                onClose={() => setShowProfileModal(false)}
                profile={twinProfile}
                loading={loadingTwin}
            />
                </>
            )}
        </div>
    );
};

export default MainLayout;
