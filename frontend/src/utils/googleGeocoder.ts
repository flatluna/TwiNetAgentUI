// Google Maps Geocoding utility
// Converts coordinates to human-readable addresses

interface GeocodeResult {
    address: string;
    formatted_address: string;
    components: {
        street_number?: string;
        route?: string;
        locality?: string;
        administrative_area_level_1?: string;
        country?: string;
        postal_code?: string;
    };
}

interface Coordinates {
    lat: number;
    lng: number;
}

class GoogleGeocoder {
    private geocoder: any = null;

    constructor() {
        if (window.google && window.google.maps) {
            this.geocoder = new window.google.maps.Geocoder();
        }
    }

    /**
     * Initialize the geocoder (call after Google Maps API is loaded)
     */
    initialize(): void {
        if (window.google && window.google.maps && !this.geocoder) {
            this.geocoder = new window.google.maps.Geocoder();
            console.log('[GEOCODER] Google Maps Geocoder initialized');
        }
    }

    /**
     * Convert coordinates to address using reverse geocoding
     */
    async getAddressFromCoordinates(coordinates: Coordinates): Promise<GeocodeResult | null> {
        if (!this.geocoder) {
            console.error('[GEOCODER] Geocoder not initialized. Make sure Google Maps API is loaded.');
            return null;
        }

        try {
            console.log(`[GEOCODER] 🌍 Converting coordinates to address: ${coordinates.lat}, ${coordinates.lng}`);
            
            const latLng = new window.google.maps.LatLng(coordinates.lat, coordinates.lng);
            
            return new Promise((resolve, reject) => {
                console.log('[GEOCODER] 🔄 Calling geocoder.geocode...');
                this.geocoder.geocode({ location: latLng }, (results: any[], status: string) => {
                    console.log(`[GEOCODER] 📍 Geocoding result - Status: ${status}, Results count: ${results?.length || 0}`);
                    
                    if (status === 'OK' && results && results.length > 0) {
                        const result = results[0];
                        console.log('[GEOCODER] ✅ Geocoding successful:', result.formatted_address);
                        console.log('[GEOCODER] 📋 Full result object:', result);
                        
                        // Extract address components
                        const components: any = {};
                        if (result.address_components) {
                            result.address_components.forEach((component: any) => {
                                const types = component.types;
                                if (types.includes('street_number')) {
                                    components.street_number = component.long_name;
                                } else if (types.includes('route')) {
                                    components.route = component.long_name;
                                } else if (types.includes('locality')) {
                                    components.locality = component.long_name;
                                } else if (types.includes('administrative_area_level_1')) {
                                    components.administrative_area_level_1 = component.long_name;
                                } else if (types.includes('country')) {
                                    components.country = component.long_name;
                                } else if (types.includes('postal_code')) {
                                    components.postal_code = component.long_name;
                                }
                            });
                        }

                        const geocodeResult: GeocodeResult = {
                            address: result.formatted_address,
                            formatted_address: result.formatted_address,
                            components
                        };

                        console.log('[GEOCODER] 🎯 Final geocode result:', geocodeResult);
                        resolve(geocodeResult);
                    } else {
                        console.error(`[GEOCODER] ❌ Geocoding failed - Status: ${status}`);
                        if (status === 'ZERO_RESULTS') {
                            console.error('[GEOCODER] No results found for the given coordinates');
                        } else if (status === 'OVER_QUERY_LIMIT') {
                            console.error('[GEOCODER] Query limit exceeded for Google Maps API');
                        } else if (status === 'REQUEST_DENIED') {
                            console.error('[GEOCODER] Request denied - check API key and permissions');
                        } else if (status === 'INVALID_REQUEST') {
                            console.error('[GEOCODER] Invalid request - check coordinates format');
                        } else if (status === 'UNKNOWN_ERROR') {
                            console.error('[GEOCODER] Unknown error - server issue, try again');
                        }
                        reject(new Error(`Geocoding failed: ${status}`));
                    }
                });
            });
        } catch (error) {
            console.error('[GEOCODER] ❌ Error during geocoding:', error);
            return null;
        }
    }

    /**
     * Convert address to coordinates (forward geocoding)
     */
    async getCoordinatesFromAddress(address: string): Promise<Coordinates | null> {
        if (!this.geocoder) {
            console.error('[GEOCODER] Geocoder not initialized. Make sure Google Maps API is loaded.');
            return null;
        }

        try {
            console.log(`[GEOCODER] Converting address to coordinates: ${address}`);
            
            return new Promise((resolve, reject) => {
                this.geocoder.geocode({ address }, (results: any[], status: string) => {
                    if (status === 'OK' && results && results.length > 0) {
                        const location = results[0].geometry.location;
                        const coordinates: Coordinates = {
                            lat: location.lat(),
                            lng: location.lng()
                        };
                        console.log('[GEOCODER] Address geocoding successful:', coordinates);
                        resolve(coordinates);
                    } else {
                        console.error('[GEOCODER] Address geocoding failed:', status);
                        reject(new Error(`Address geocoding failed: ${status}`));
                    }
                });
            });
        } catch (error) {
            console.error('[GEOCODER] Error during address geocoding:', error);
            return null;
        }
    }
}

// Export a singleton instance
let geocoderInstance: GoogleGeocoder | null = null;

export const getGeocoder = (): GoogleGeocoder => {
    if (!geocoderInstance) {
        geocoderInstance = new GoogleGeocoder();
    }
    return geocoderInstance;
};

export default GoogleGeocoder;
export type { GeocodeResult, Coordinates };
