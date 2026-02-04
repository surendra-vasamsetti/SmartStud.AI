/**
 * Centralized API configuration
 * This ensures we use the correct backend URL across all environments
 * and prevents "Local Network" permission issues in production.
 */

const getApiUrl = () => {
    // 1. Check for environment variable (set in Vercel/local .env)
    const envUrl = import.meta.env.VITE_API_URL;
    if (envUrl) return envUrl;

    // 2. Build-time/Runtime fallback
    // If we are in production but the variable is somehow missing, 
    // we should NOT default to localhost as it triggers permission prompts.
    if (import.meta.env.PROD) {
        console.warn("VITE_API_URL is missing in production! API calls will likely fail.");
        return ""; // Or your production backend URL direct string if you prefer
    }

    // 3. Local development fallback
    return "http://localhost:5000";
};

export const API_URL = getApiUrl();
