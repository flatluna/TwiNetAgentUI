import { useState, useMemo, useEffect, useCallback } from "react";
import { MessageSquare, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TwinManagementPage } from "@/components/twin-management";
import TwinVoiceChat from "@/components/voice/TwinVoiceChat";
import GoogleMapsLoader from "@/utils/googleMapsLoader";
import { getGeocoder } from "@/utils/googleGeocoder";

// Simplified App Modes - Only Voice and Twins
type AppMode = "voice" | "twins";

// Google Maps API Key - you should store this in environment variables
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "";

function App() {
    const [currentMode, setCurrentMode] = useState<AppMode>("voice"); // START WITH VOICE
    const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [userAddress, setUserAddress] = useState<string | null>(null);
    const [isGoogleMapsLoaded, setIsGoogleMapsLoaded] = useState(false);

    const handleTwinMentioned = (twinEmail: string) => {
        console.log('Twin mentioned in voice chat:', twinEmail);
    };

    // Initialize Google Maps API
    useEffect(() => {
        const initGoogleMaps = async () => {
            try {
                console.log("[DEBUG] Loading Google Maps API...");
                const loader = GoogleMapsLoader.getInstance({
                    apiKey: GOOGLE_MAPS_API_KEY,
                    libraries: ["geometry", "drawing", "places"]
                });
                
                await loader.load();
                console.log("[DEBUG] Google Maps API loaded successfully");
                
                // Initialize geocoder
                const geocoder = getGeocoder();
                geocoder.initialize();
                
                setIsGoogleMapsLoaded(true);
            } catch (error) {
                console.error("[DEBUG] Failed to load Google Maps API:", error);
            }
        };

        initGoogleMaps();
    }, []);

    // Function to get user location and convert to address
    const getUserLocationAndSend = useCallback(async () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                async position => {
                    const { latitude, longitude } = position.coords;
                    console.log("[DEBUG] Got user location:", { latitude, longitude });
                    setUserLocation({ lat: latitude, lng: longitude });
                    
                    // Try to get address from coordinates using Google Geocoding
                    if (isGoogleMapsLoaded) {
                        try {
                            const geocoder = getGeocoder();
                            const geocodeResult = await geocoder.getAddressFromCoordinates({ 
                                lat: latitude, 
                                lng: longitude 
                            });
                            
                            if (geocodeResult) {
                                const address = geocodeResult.formatted_address;
                                console.log("[DEBUG] Got address from geocoding:", address);
                                setUserAddress(address);
                                
                                // Create message with both coordinates and address
                                const locationMessage = `Mi ubicación actual es: ${address} (Coordenadas: ${latitude}, ${longitude})`;
                                console.log("[DEBUG] Location message with address:", locationMessage);
                            } else {
                                console.log("[DEBUG] Geocoding failed, using coordinates only");
                                const locationMessage = `Mi ubicación actual es: Latitud ${latitude}, Longitud ${longitude}`;
                                console.log("[DEBUG] Location message (coordinates only):", locationMessage);
                            }
                        } catch (error) {
                            console.error("[DEBUG] Error during geocoding:", error);
                            // Fallback to coordinates only
                            const locationMessage = `Mi ubicación actual es: Latitud ${latitude}, Longitud ${longitude}`;
                            console.log("[DEBUG] Location message (fallback):", locationMessage);
                        }
                    } else {
                        console.log("[DEBUG] Google Maps not loaded yet, using coordinates only");
                        const locationMessage = `Mi ubicación actual es: Latitud ${latitude}, Longitud ${longitude}`;
                        console.log("[DEBUG] Location message (no maps):", locationMessage);
                    }
                },
                error => {
                    console.error("Error getting location:", error);
                }
            );
        } else {
            console.error("Geolocation is not supported by this browser.");
        }
    }, [isGoogleMapsLoaded]);

    // Get user location on app start - only after Google Maps is loaded
    useEffect(() => {
        if (isGoogleMapsLoaded) {
            console.log("[DEBUG] Google Maps loaded, getting user location...");
            getUserLocationAndSend();
        }
    }, [isGoogleMapsLoaded, getUserLocationAndSend]);

    // CRITICAL: Create persistent TwinVoiceChat instance to prevent remounting
    const persistentVoiceChat = useMemo(() => (
        <TwinVoiceChat 
            onTwinMentioned={handleTwinMentioned}
            userLocation={userLocation}
            userAddress={userAddress}
            onLocationRequest={getUserLocationAndSend}
        />
    ), [userLocation, userAddress, getUserLocationAndSend]);

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Navigation Bar - Simplified: Only Voice and Twins */}
            <div className="w-16 bg-gray-800 flex flex-col items-center py-4 space-y-4">
                <Button
                    variant={currentMode === "voice" ? "default" : "ghost"}
                    size="sm"
                    className={`w-12 h-12 p-0 ${currentMode === "voice" ? "bg-blue-600 hover:bg-blue-700" : "text-gray-400 hover:text-white hover:bg-gray-700"}`}
                    onClick={() => setCurrentMode("voice")}
                    title="Voice Chat"
                >
                    <MessageSquare className="w-5 h-5" />
                </Button>
                
                <Button
                    variant={currentMode === "twins" ? "default" : "ghost"}
                    size="sm"
                    className={`w-12 h-12 p-0 ${currentMode === "twins" ? "bg-blue-600 hover:bg-blue-700" : "text-gray-400 hover:text-white hover:bg-gray-700"}`}
                    onClick={() => setCurrentMode("twins")}
                    title="Twin Management"
                >
                    <Users className="w-5 h-5" />
                </Button>
            </div>

            {/* Main Content Area */}
            <div className="flex-1">
                {/* CRITICAL: Always render TwinVoiceChat, just show/hide to prevent remounting */}
                <div className={`h-full ${currentMode === "voice" ? "block" : "hidden"}`}>
                    {persistentVoiceChat}
                </div>
                
                {currentMode === "twins" && (
                    <div className="h-full p-6">
                        <TwinManagementPage />
                    </div>
                )}
            </div>
        </div>
    );
}

export default App;
