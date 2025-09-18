// Google Maps API loader utility
// Ensures the Google Maps API is loaded only once

declare global {
    interface Window {
        google: any;
        initGoogleMaps: () => void;
    }
}

interface GoogleMapsLoaderOptions {
    apiKey: string;
    libraries?: string[];
    version?: string;
}

class GoogleMapsLoader {
    private static instance: GoogleMapsLoader | null = null;
    private isLoaded = false;
    private isLoading = false;
    private loadPromise: Promise<void> | null = null;
    private apiKey: string;
    private libraries: string[];
    private version: string;

    private constructor(options: GoogleMapsLoaderOptions) {
        this.apiKey = options.apiKey;
        this.libraries = options.libraries || ["geometry", "drawing", "places"];
        this.version = options.version || "3.57";
    }

    static getInstance(options: GoogleMapsLoaderOptions): GoogleMapsLoader {
        if (!GoogleMapsLoader.instance) {
            GoogleMapsLoader.instance = new GoogleMapsLoader(options);
        }
        return GoogleMapsLoader.instance;
    }

    async load(): Promise<void> {
        // If already loaded, return immediately
        if (this.isLoaded && window.google && window.google.maps) {
            console.log("[DEBUG] Google Maps API already loaded");
            return Promise.resolve();
        }

        // If currently loading, return the existing promise
        if (this.isLoading && this.loadPromise) {
            console.log("[DEBUG] Google Maps API is already loading, waiting...");
            return this.loadPromise;
        }

        // Check if there's already a script tag
        const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
        if (existingScript) {
            console.log("[DEBUG] Google Maps script already exists, waiting for load...");
            return new Promise(resolve => {
                const checkLoad = () => {
                    if (window.google && window.google.maps) {
                        console.log("[DEBUG] Google Maps loaded from existing script");
                        this.isLoaded = true;
                        this.isLoading = false;
                        resolve();
                    } else {
                        setTimeout(checkLoad, 100);
                    }
                };
                checkLoad();
            });
        }

        // Create new load promise
        this.isLoading = true;
        this.loadPromise = new Promise((resolve, reject) => {
            console.log("[DEBUG] Loading Google Maps API script...");
            console.log(`[DEBUG] API Key: ${this.apiKey.substring(0, 10)}...`);
            console.log(`[DEBUG] Libraries: ${this.libraries.join(",")}`);

            const script = document.createElement("script");
            script.src = `https://maps.googleapis.com/maps/api/js?key=${this.apiKey}&libraries=${this.libraries.join(",")}&v=${this.version}`;
            script.async = true;
            script.defer = true;

            script.onload = () => {
                console.log("[DEBUG] Google Maps API script loaded successfully");
                
                // Additional check for API errors
                if (window.google && window.google.maps) {
                    console.log("[DEBUG] Google Maps object available");
                    this.isLoaded = true;
                    this.isLoading = false;
                    resolve();
                } else {
                    console.error("[DEBUG] Google Maps object not available after script load");
                    this.isLoading = false;
                    reject(new Error("Google Maps object not available after script load"));
                }
            };

            script.onerror = error => {
                console.error("[DEBUG] Failed to load Google Maps API script:", error);
                console.error("[DEBUG] This usually means:");
                console.error("  1. Invalid API Key");
                console.error("  2. API Key not enabled for this domain");
                console.error("  3. Places API not enabled for this project");
                console.error("  4. Billing not set up for Google Cloud project");
                this.isLoading = false;
                reject(new Error(`Failed to load Google Maps API: ${error}`));
            };

            document.head.appendChild(script);
        });

        return this.loadPromise;
    }

    isMapLoaded(): boolean {
        return this.isLoaded && window.google && window.google.maps;
    }
}

export default GoogleMapsLoader;
