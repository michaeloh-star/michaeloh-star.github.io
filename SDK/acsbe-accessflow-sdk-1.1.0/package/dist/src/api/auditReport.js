"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadAuditReport = void 0;
const util_1 = require("util");
const zlib_1 = require("zlib");
const base_1 = require("./base");
const gzipAsync = (0, util_1.promisify)(zlib_1.gzip);
const UPLOAD_REPORT_ENDPOINT = 'upload-sdk-report';
/**
 * Uploads the audit report JSON to the cloud using the provided API key for authorization.
 * @param apiKey - The authorization API key.
 * @param report - The audit report data to upload.
 * @returns A promise that resolves to true if the upload was successful, false otherwise.
 */
async function uploadAuditReport(apiKey, report) {
    try {
        const apiUrl = (0, base_1.generateAflwApiUrl)(UPLOAD_REPORT_ENDPOINT, apiKey);
        // Skip upload if URL is not available (SDK running in local-only mode)
        if (apiUrl === null) {
            console.log('[AccessFlowSDK] Cloud URL not available - skipping cloud upload.');
            return false;
        }
        const { headers, url } = apiUrl;
        headers['Content-Encoding'] = 'gzip';
        headers['Content-Type'] = 'application/json';
        const payload = Buffer.from(JSON.stringify({ report }));
        const body = await gzipAsync(payload);
        console.log('[AccessFlowSDK] Uploading report...');
        const res = await fetch(url, {
            body,
            headers,
            method: 'POST',
        });
        if (!res.ok) {
            console.error(`[AccessFlowSDK] Report upload failed with status ${res.status}`, await res.text());
            return false;
        }
        return true;
    }
    catch (err) {
        console.error('[AccessFlowSDK] Report upload request failed', err);
        return false;
    }
}
exports.uploadAuditReport = uploadAuditReport;
