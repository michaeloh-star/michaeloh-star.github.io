"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyApiKey = void 0;
const base_1 = require("./base");
const VERIFY_API_KEY_ENDPOINT = 'verify-sdk-api-key';
async function verifyApiKey(apiKey) {
    const apiUrl = (0, base_1.generateAflwApiUrl)(VERIFY_API_KEY_ENDPOINT, apiKey);
    // Skip verification if URL is not available (SDK running in local-only mode)
    if (apiUrl === null) {
        const sdkEnv = process.env.SDK_ENV;
        console.log(`[AccessFlowSDK] You are running in dev mode (SDK_ENV=${sdkEnv || 'not set'}) - skipping API key verification. SDK will run in local-only mode.`);
        return true; // Return true to allow SDK to continue without cloud features
    }
    const { headers, url } = apiUrl;
    console.log(`[AccessFlowSDK] Calling verify-sdk-api-key endpoint at ${url}`);
    try {
        const res = await fetch(url, {
            headers,
            method: 'POST',
        });
        if (!res.ok) {
            const errorText = await res.text();
            console.error(`[AccessFlowSDK] API key verification failed with status ${res.status}: ${errorText}`);
            return false;
        }
        console.log('[AccessFlowSDK] API key verification endpoint responded successfully');
        return true;
    }
    catch (err) {
        console.error('[AccessFlowSDK] API key verification request failed', err);
        return false;
    }
}
exports.verifyApiKey = verifyApiKey;
