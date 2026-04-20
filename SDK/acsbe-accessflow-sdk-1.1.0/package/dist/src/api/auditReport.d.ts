/**
 * Uploads the audit report JSON to the cloud using the provided API key for authorization.
 * @param apiKey - The authorization API key.
 * @param report - The audit report data to upload.
 * @returns A promise that resolves to true if the upload was successful, false otherwise.
 */
export declare function uploadAuditReport(apiKey: string, report: any): Promise<boolean>;
