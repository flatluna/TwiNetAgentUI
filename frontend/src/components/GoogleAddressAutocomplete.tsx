import React, { useEffect, useRef, useState } from 'react';
import GoogleMapsLoader from '@/utils/googleMapsLoader';

// Declare global types for Google Maps
declare global {
    interface Window {
        google: any;
    }
}

interface GoogleAddressAutocompleteProps {
    value: string;
    onChange: (value: string) => void;
    onPlaceSelected: (placeData: {
        direccion: string;
        ciudad: string;
        estado: string;
        codigoPostal: string;
        pais: string;
        latitud?: number;
        longitud?: number;
    }) => void;
    placeholder?: string;
    className?: string;
}

const GoogleAddressAutocomplete: React.FC<GoogleAddressAutocompleteProps> = ({
    value,
    onChange,
    onPlaceSelected,
    placeholder = "Ingresa tu dirección",
    className = ""
}) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const autocompleteRef = useRef<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const initializeAutocomplete = async () => {
            try {
                const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
                if (!apiKey) {
                    console.warn('Google Maps API key not found');
                    setIsLoading(false);
                    return;
                }

                // Load Google Maps API
                const loader = GoogleMapsLoader.getInstance({
                    apiKey,
                    libraries: ['places']
                });
                
                await loader.load();

                if (inputRef.current && window.google && window.google.maps && window.google.maps.places) {
                    // Initialize autocomplete
                    autocompleteRef.current = new window.google.maps.places.Autocomplete(
                        inputRef.current,
                        {
                            types: ['address'],
                            componentRestrictions: { country: ['us', 'mx', 'ca'] }, // USA, Mexico, Canada
                            fields: [
                                'address_components',
                                'formatted_address',
                                'geometry.location',
                                'name'
                            ]
                        }
                    );

                    // Add place changed listener
                    autocompleteRef.current.addListener('place_changed', () => {
                        const place = autocompleteRef.current?.getPlace();
                        
                        if (place && place.address_components) {
                            console.log('🏠 Google Place selected:', place);
                            
                            // Parse address components
                            const addressComponents = place.address_components;
                            let streetNumber = '';
                            let streetName = '';
                            let ciudad = '';
                            let estado = '';
                            let codigoPostal = '';
                            let pais = '';

                            addressComponents.forEach((component: any) => {
                                const types = component.types;
                                
                                if (types.includes('street_number')) {
                                    streetNumber = component.long_name;
                                }
                                if (types.includes('route')) {
                                    streetName = component.long_name;
                                }
                                if (types.includes('locality')) {
                                    ciudad = component.long_name;
                                }
                                if (types.includes('administrative_area_level_1')) {
                                    estado = component.short_name; // TX, CA, etc.
                                }
                                if (types.includes('postal_code')) {
                                    codigoPostal = component.long_name;
                                }
                                if (types.includes('country')) {
                                    pais = component.long_name;
                                }
                            });

                            const fullAddress = `${streetNumber} ${streetName}`.trim();
                            const location = place.geometry?.location;

                            const placeData = {
                                direccion: fullAddress || place.formatted_address || '',
                                ciudad,
                                estado,
                                codigoPostal,
                                pais,
                                latitud: location?.lat(),
                                longitud: location?.lng()
                            };

                            console.log('📍 Parsed address data:', placeData);
                            
                            // Update the input value
                            onChange(fullAddress || place.formatted_address || '');
                            
                            // Notify parent component
                            onPlaceSelected(placeData);
                        }
                    });

                    setIsLoading(false);
                } else {
                    console.error('Google Maps Places API not available');
                    setIsLoading(false);
                }
            } catch (error) {
                console.error('Error initializing Google Autocomplete:', error);
                setIsLoading(false);
            }
        };

        initializeAutocomplete();

        // Cleanup
        return () => {
            if (autocompleteRef.current) {
                window.google?.maps?.event?.clearInstanceListeners(autocompleteRef.current);
            }
        };
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange(e.target.value);
    };

    return (
        <div className="relative">
            <input
                ref={inputRef}
                type="text"
                value={value}
                onChange={handleInputChange}
                placeholder={isLoading ? "Cargando Google Places..." : placeholder}
                disabled={isLoading}
                className={`w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    isLoading ? 'bg-gray-100 cursor-not-allowed' : ''
                } ${className}`}
            />
            {isLoading && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                </div>
            )}
        </div>
    );
};

export default GoogleAddressAutocomplete;
