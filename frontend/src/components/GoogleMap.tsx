import React, { useEffect, useRef, useState, useMemo } from "react";
import GoogleMapsLoader from "../utils/googleMapsLoader";

// Function to calculate distance between two points using Haversine formula
const calculateDistance = (point1: { lat: number; lng: number }, point2: { lat: number; lng: number }): number => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = ((point2.lat - point1.lat) * Math.PI) / 180;
    const dLng = ((point2.lng - point1.lng) * Math.PI) / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((point1.lat * Math.PI) / 180) * Math.cos((point2.lat * Math.PI) / 180) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

interface Location {
    lat: number;
    lng: number;
    address?: string;
}

interface GoogleMapProps {
    center: Location;
    zoom: number;
    startLocation?: Location;
    endLocation?: Location;
    onMapLoad?: (map: any) => void;
}

// Global types for Google Maps
declare global {
    interface Window {
        google: any;
        initMap: () => void;
    }
}

const MapComponent: React.FC<GoogleMapProps> = ({ center, zoom, startLocation, endLocation, onMapLoad }) => {
    const ref = useRef<HTMLDivElement>(null);
    const [map, setMap] = useState<any>(null);
    const [markers, setMarkers] = useState<any[]>([]);
    const [directionsRenderer, setDirectionsRenderer] = useState<any>(null);

    // Create a stable key for location changes - only update when actual coordinates change
    const locationKey = useMemo(() => {
        const centerStr = `${center.lat.toFixed(6)}-${center.lng.toFixed(6)}`;
        const startStr = startLocation ? `${startLocation.lat.toFixed(6)}-${startLocation.lng.toFixed(6)}` : "null";
        const endStr = endLocation ? `${endLocation.lat.toFixed(6)}-${endLocation.lng.toFixed(6)}` : "null";
        const key = `${centerStr}-${startStr}-${endStr}`;
        return key;
    }, [center.lat, center.lng, startLocation?.lat, startLocation?.lng, endLocation?.lat, endLocation?.lng]);

    // Keep track of the previous location key to avoid unnecessary updates
    const prevLocationKeyRef = useRef<string>("");

    useEffect(() => {
        if (ref.current && !map && window.google) {
            console.log("[DEBUG] Creating new Google Map with center:", center);
            const newMap = new window.google.maps.Map(ref.current, {
                center,
                zoom,
                mapTypeId: window.google.maps.MapTypeId.ROADMAP,
                gestureHandling: "greedy", // Allow all gestures
                zoomControl: true,
                mapTypeControl: true,
                scaleControl: true,
                streetViewControl: true,
                rotateControl: true,
                fullscreenControl: true,
                styles: [
                    {
                        featureType: "poi",
                        elementType: "labels",
                        stylers: [{ visibility: "off" }]
                    }
                ]
            });
            setMap(newMap);
            onMapLoad?.(newMap);
        }
    }, [ref, map, center, zoom, onMapLoad]);

    // Update map center when center prop changes
    useEffect(() => {
        if (map && center) {
            const currentCenter = map.getCenter();
            // Only update if the center has actually changed significantly
            if (!currentCenter || Math.abs(currentCenter.lat() - center.lat) > 0.0001 || Math.abs(currentCenter.lng() - center.lng) > 0.0001) {
                console.log("[DEBUG] Updating map center to:", center);
                map.setCenter(center);
            }
        }
    }, [map, center.lat, center.lng]);

    useEffect(() => {
        if (map && window.google && locationKey !== prevLocationKeyRef.current) {
            console.log("[DEBUG] Updating markers, locationKey changed:", locationKey);
            console.log("[DEBUG] startLocation:", startLocation);
            console.log("[DEBUG] endLocation:", endLocation);
            prevLocationKeyRef.current = locationKey;

            // Clear existing markers
            markers.forEach(marker => {
                marker.setMap(null);
            });

            // Clear existing directions
            if (directionsRenderer) {
                directionsRenderer.setMap(null);
            }

            const newMarkers: any[] = [];

            // Add user current location marker (blue dot)
            const currentLocationMarker = new window.google.maps.Marker({
                position: center,
                map,
                title: "Tu ubicación actual",
                icon: {
                    path: window.google.maps.SymbolPath.CIRCLE,
                    scale: 10,
                    fillColor: "#4285F4",
                    fillOpacity: 1,
                    strokeColor: "#ffffff",
                    strokeWeight: 3
                },
                zIndex: 1000
            });

            const currentLocationInfoWindow = new window.google.maps.InfoWindow({
                content: `
                    <div style="padding: 8px;">
                        <h3 style="font-weight: bold; color: #4285F4; margin: 0 0 4px 0;">📍 Tu ubicación actual</h3>
                        <p style="margin: 0; font-size: 14px;">Lat: ${center.lat.toFixed(6)}, Lng: ${center.lng.toFixed(6)}</p>
                    </div>
                `
            });

            currentLocationMarker.addListener("click", () => {
                currentLocationInfoWindow.open(map, currentLocationMarker);
            });

            newMarkers.push(currentLocationMarker);

            // Add start location marker (if different from current location)
            if (startLocation && (Math.abs(startLocation.lat - center.lat) > 0.0001 || Math.abs(startLocation.lng - center.lng) > 0.0001)) {
                const startMarker = new window.google.maps.Marker({
                    position: startLocation,
                    map,
                    title: startLocation.address || "Punto de partida",
                    icon: {
                        path: window.google.maps.SymbolPath.CIRCLE,
                        scale: 8,
                        fillColor: "#10B981",
                        fillOpacity: 1,
                        strokeColor: "#065F46",
                        strokeWeight: 2
                    }
                });

                const startInfoWindow = new window.google.maps.InfoWindow({
                    content: `
                        <div style="padding: 8px;">
                            <h3 style="font-weight: bold; color: #10B981; margin: 0 0 4px 0;">🚗 Punto de partida</h3>
                            <p style="margin: 0; font-size: 14px;">${startLocation.address || "Ubicación de recogida"}</p>
                        </div>
                    `
                });

                startMarker.addListener("click", () => {
                    startInfoWindow.open(map, startMarker);
                });

                newMarkers.push(startMarker);
            }

            // Add end location marker
            if (endLocation) {
                const endMarker = new window.google.maps.Marker({
                    position: endLocation,
                    map,
                    title: endLocation.address || "Destino",
                    icon: {
                        path: window.google.maps.SymbolPath.CIRCLE,
                        scale: 8,
                        fillColor: "#EF4444",
                        fillOpacity: 1,
                        strokeColor: "#991B1B",
                        strokeWeight: 2
                    }
                });

                const endInfoWindow = new window.google.maps.InfoWindow({
                    content: `
                        <div style="padding: 8px;">
                            <h3 style="font-weight: bold; color: #EF4444; margin: 0 0 4px 0;">🎯 Destino</h3>
                            <p style="margin: 0; font-size: 14px;">${endLocation.address || "Punto de destino"}</p>
                        </div>
                    `
                });

                endMarker.addListener("click", () => {
                    endInfoWindow.open(map, endMarker);
                });

                newMarkers.push(endMarker);

                // Draw route if we have both start and end locations
                if (startLocation) {
                    const directionsService = new window.google.maps.DirectionsService();
                    const newDirectionsRenderer = new window.google.maps.DirectionsRenderer({
                        suppressMarkers: true, // We're using custom markers
                        polylineOptions: {
                            strokeColor: "#3B82F6",
                            strokeWeight: 4,
                            strokeOpacity: 0.7
                        }
                    });

                    newDirectionsRenderer.setMap(map);
                    setDirectionsRenderer(newDirectionsRenderer);

                    directionsService.route(
                        {
                            origin: startLocation,
                            destination: endLocation,
                            travelMode: window.google.maps.TravelMode.DRIVING
                        },
                        (result: any, status: any) => {
                            if (status === window.google.maps.DirectionsStatus.OK && result) {
                                newDirectionsRenderer.setDirections(result);
                                console.log("[DEBUG] Route rendered successfully");
                            } else {
                                console.log("[DEBUG] Route failed:", status);
                                // For international routes or routes that require flights, show a message
                                if (status === window.google.maps.DirectionsStatus.ZERO_RESULTS) {
                                    console.log("[DEBUG] No driving route available - likely requires flights");

                                    // Create an info window to show the route limitation
                                    const infoWindow = new window.google.maps.InfoWindow({
                                        content: `
                                            <div style="padding: 10px; max-width: 300px;">
                                                <h3 style="color: #f59e0b; margin: 0 0 8px 0;">✈️ Ruta de Vuelo Requerida</h3>
                                                <p style="margin: 0; font-size: 14px;">
                                                    Esta ruta requiere vuelos. No se puede mostrar direcciones de manejo entre estos destinos.
                                                </p>
                                                <p style="margin: 8px 0 0 0; font-size: 12px; color: #666;">
                                                    Distancia aproximada: ${calculateDistance(startLocation, endLocation).toFixed(0)} km
                                                </p>
                                            </div>
                                        `,
                                        position: {
                                            lat: (startLocation.lat + endLocation.lat) / 2,
                                            lng: (startLocation.lng + endLocation.lng) / 2
                                        }
                                    });

                                    // Show the info window for 5 seconds
                                    infoWindow.open(map);
                                    setTimeout(() => {
                                        infoWindow.close();
                                    }, 5000);
                                }
                            }
                        }
                    );
                }
            }

            setMarkers(newMarkers);

            // Adjust bounds to show all markers when we have multiple locations
            if (newMarkers.length > 1) {
                const bounds = new window.google.maps.LatLngBounds();
                newMarkers.forEach(marker => {
                    const position = marker.getPosition();
                    if (position) {
                        bounds.extend(position);
                    }
                });
                map.fitBounds(bounds);
                console.log("[DEBUG] Fitted bounds to show all markers");
            }
        }
    }, [map, locationKey, directionsRenderer, markers]);

    return <div ref={ref} style={{ width: "100%", height: "100%" }} />;
};

const GoogleMap: React.FC<GoogleMapProps> = props => {
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);
    const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

    useEffect(() => {
        if (!GOOGLE_MAPS_API_KEY) {
            setHasError(true);
            setIsLoading(false);
            return;
        }

        const loadGoogleMaps = async () => {
            try {
                const loader = GoogleMapsLoader.getInstance({
                    apiKey: GOOGLE_MAPS_API_KEY,
                    libraries: ["geometry", "drawing", "places"]
                });

                await loader.load();
                setIsLoading(false);
            } catch (error) {
                console.error("[DEBUG] Failed to load Google Maps:", error);
                setHasError(true);
                setIsLoading(false);
            }
        };

        loadGoogleMaps();
    }, [GOOGLE_MAPS_API_KEY]);

    if (!GOOGLE_MAPS_API_KEY) {
        return (
            <div className="flex h-full w-full items-center justify-center">
                <div className="text-center">
                    <div className="mb-4 text-4xl">🔑</div>
                    <p className="text-red-600">API Key de Google Maps no configurada</p>
                    <p className="text-sm text-gray-500">Configure VITE_GOOGLE_MAPS_API_KEY en las variables de entorno</p>
                </div>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="flex h-full w-full items-center justify-center">
                <div className="text-center">
                    <div className="mb-4 text-4xl">🗺️</div>
                    <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
                    <p className="text-gray-600">Cargando mapa...</p>
                </div>
            </div>
        );
    }

    if (hasError) {
        return (
            <div className="flex h-full w-full items-center justify-center">
                <div className="text-center">
                    <div className="mb-4 text-4xl">❌</div>
                    <p className="text-red-600">Error al cargar el mapa</p>
                    <p className="text-sm text-gray-500">Verifique la configuración de Google Maps</p>
                </div>
            </div>
        );
    }

    return <MapComponent {...props} />;
};

export default GoogleMap;
