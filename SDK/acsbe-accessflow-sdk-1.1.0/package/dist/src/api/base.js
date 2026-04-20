"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateAflwApiUrl = void 0;
const sdk_config_1 = require("../../sdk.config");
/**
 * Validates that a URL uses HTTPS protocol.
 * This is a security measure to prevent API key transmission over insecure connections.
 *
 * @param urlString The URL to validate
 * @throws Error if the URL does not use HTTPS
 */
function enforceHttps(urlString) {
    const url = new URL(urlString);
    if (url.protocol !== 'https:') {
        throw new Error(`AccessFlowSDK: Security error - API calls must use HTTPS. ` +
            `Received URL with protocol: ${url.protocol}. ` +
            `This prevents API key transmission over insecure connections.`);
    }
}
const generateAflwApiUrl = (endpoint, apiKey) => {
    const baseUrl = (0, sdk_config_1.getAccessFlowBaseUrl)();
    // Return null if base URL is not available (SDK running in local-only mode)
    if (baseUrl === null) {
        return null;
    }
    const isDev = process.env.SDK_ENV !== 'production';
    const basicAuth = Buffer.from((0, sdk_config_1.getDevAuth)()).toString('base64');
    const url = new URL(`${baseUrl}/api/v6/sdk/${endpoint}`);
    url.username = '';
    url.password = '';
    const finalUrl = url.toString();
    // Enforce HTTPS for all API calls to protect API key in transit
    // Skip HTTPS enforcement only in development mode with explicit opt-in
    if (!isDev || process.env.ACCESSFLOW_ALLOW_INSECURE !== 'true') {
        enforceHttps(finalUrl);
    }
    const headers = {};
    if (isDev)
        headers.Authorization = `Basic ${basicAuth}`;
    headers['x-api-key'] = apiKey;
    return { headers, url: finalUrl };
};
exports.generateAflwApiUrl = generateAflwApiUrl;
