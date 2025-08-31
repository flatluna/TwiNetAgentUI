import { useState, useCallback } from 'react';
import { parse } from 'exifr';

export interface PhotoMetadata {
    // Fecha y hora
    dateTimeOriginal?: Date;
    dateTime?: Date;
    
    // Ubicación GPS
    latitude?: number;
    longitude?: number;
    gpsLocation?: string;
    
    // Información de la cámara
    make?: string;          // Marca de la cámara
    model?: string;         // Modelo de la cámara
    software?: string;      // Software usado
    
    // Configuración de la foto
    focalLength?: number;   // Distancia focal
    aperture?: number;      // Apertura (f-stop)
    iso?: number;          // ISO
    exposureTime?: string; // Tiempo de exposición
    
    // Otras propiedades útiles
    orientation?: number;   // Orientación
    flash?: boolean;       // Si se usó flash
    whiteBalance?: string; // Balance de blancos
    
    // Dimensiones
    imageWidth?: number;
    imageHeight?: number;
    
    // Información adicional
    artist?: string;       // Artista/Fotógrafo
    copyright?: string;    // Copyright
    description?: string;  // Descripción
    userComment?: string;  // Comentario del usuario
}

export interface UsePhotoMetadataResult {
    extractMetadata: (file: File) => Promise<PhotoMetadata>;
    isExtracting: boolean;
    error: string | null;
    formatLocation: (lat: number, lng: number) => Promise<string>;
}

export const usePhotoMetadata = (): UsePhotoMetadataResult => {
    const [isExtracting, setIsExtracting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const extractMetadata = useCallback(async (file: File): Promise<PhotoMetadata> => {
        setIsExtracting(true);
        setError(null);

        try {
            console.log('🔍 Extracting EXIF metadata from:', file.name);
            
            // Extraer todos los datos EXIF disponibles
            const exifData = await parse(file, {
                // Incluir diferentes tipos de metadata
                tiff: true,
                exif: true,
                gps: true,
                interop: true,
                ifd1: true,
                iptc: true,
                xmp: true,
                icc: true,
                jfif: true,
                ihdr: true
            });

            console.log('📸 Raw EXIF data:', exifData);

            // Procesar y mapear los datos
            const metadata: PhotoMetadata = {};

            // Fecha y hora
            if (exifData.DateTimeOriginal) {
                metadata.dateTimeOriginal = new Date(exifData.DateTimeOriginal);
            } else if (exifData.DateTime) {
                metadata.dateTime = new Date(exifData.DateTime);
            } else if (exifData.CreateDate) {
                metadata.dateTimeOriginal = new Date(exifData.CreateDate);
            }

            // Información GPS
            if (exifData.latitude && exifData.longitude) {
                metadata.latitude = exifData.latitude;
                metadata.longitude = exifData.longitude;
                console.log('📍 GPS coordinates found:', { lat: metadata.latitude, lng: metadata.longitude });
            }

            // Información de la cámara
            if (exifData.Make) metadata.make = exifData.Make;
            if (exifData.Model) metadata.model = exifData.Model;
            if (exifData.Software) metadata.software = exifData.Software;

            // Configuración de la foto
            if (exifData.FocalLength) metadata.focalLength = exifData.FocalLength;
            if (exifData.FNumber) metadata.aperture = exifData.FNumber;
            if (exifData.ISO) metadata.iso = exifData.ISO;
            if (exifData.ExposureTime) {
                // Convertir el tiempo de exposición a una fracción legible
                if (exifData.ExposureTime < 1) {
                    metadata.exposureTime = `1/${Math.round(1 / exifData.ExposureTime)}`;
                } else {
                    metadata.exposureTime = `${exifData.ExposureTime}s`;
                }
            }

            // Otras propiedades
            if (exifData.Orientation) metadata.orientation = exifData.Orientation;
            if (exifData.Flash !== undefined) metadata.flash = exifData.Flash > 0;
            if (exifData.WhiteBalance) metadata.whiteBalance = exifData.WhiteBalance;

            // Dimensiones
            if (exifData.ExifImageWidth) metadata.imageWidth = exifData.ExifImageWidth;
            if (exifData.ExifImageHeight) metadata.imageHeight = exifData.ExifImageHeight;
            if (!metadata.imageWidth && exifData.ImageWidth) metadata.imageWidth = exifData.ImageWidth;
            if (!metadata.imageHeight && exifData.ImageHeight) metadata.imageHeight = exifData.ImageHeight;

            // Información adicional
            if (exifData.Artist) metadata.artist = exifData.Artist;
            if (exifData.Copyright) metadata.copyright = exifData.Copyright;
            if (exifData.ImageDescription) metadata.description = exifData.ImageDescription;
            if (exifData.UserComment) metadata.userComment = exifData.UserComment;

            console.log('✅ Processed metadata:', metadata);
            return metadata;

        } catch (err) {
            console.error('❌ Error extracting EXIF metadata:', err);
            setError('Error al extraer metadata de la imagen');
            return {};
        } finally {
            setIsExtracting(false);
        }
    }, []);

    const formatLocation = useCallback(async (lat: number, lng: number): Promise<string> => {
        try {
            // Usar la API de geocodificación inversa para obtener la dirección
            // Nota: En una implementación real, querrías usar Google Maps API o similar
            // Por ahora, devolvemos las coordenadas formateadas
            const latStr = lat >= 0 ? `${lat.toFixed(6)}°N` : `${Math.abs(lat).toFixed(6)}°S`;
            const lngStr = lng >= 0 ? `${lng.toFixed(6)}°E` : `${Math.abs(lng).toFixed(6)}°W`;
            
            console.log('🌍 Attempting to get location for coordinates:', { lat, lng });
            
            // Intentar obtener la ubicación usando una API gratuita
            try {
                const response = await fetch(
                    `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=es`
                );
                
                if (response.ok) {
                    const locationData = await response.json();
                    console.log('🌍 Location data from API:', locationData);
                    
                    // Construir una dirección legible
                    const parts = [];
                    if (locationData.city || locationData.locality) {
                        parts.push(locationData.city || locationData.locality);
                    }
                    if (locationData.principalSubdivision) {
                        parts.push(locationData.principalSubdivision);
                    }
                    if (locationData.countryName) {
                        parts.push(locationData.countryName);
                    }
                    
                    if (parts.length > 0) {
                        return parts.join(', ');
                    }
                }
            } catch (geoError) {
                console.warn('⚠️ Geocoding API failed, using coordinates:', geoError);
            }
            
            // Fallback a coordenadas formateadas
            return `${latStr}, ${lngStr}`;
            
        } catch (err) {
            console.error('❌ Error formatting location:', err);
            return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
        }
    }, []);

    return {
        extractMetadata,
        isExtracting,
        error,
        formatLocation
    };
};

export default usePhotoMetadata;
