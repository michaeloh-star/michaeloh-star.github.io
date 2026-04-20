import { type TestInfo } from 'playwright/test';
/**
 * Gets the output directory for AccessFlow reports.
 * Respects Playwright's outputDir configuration if TestInfo is available,
 * otherwise falls back to 'test-results'.
 *
 * @param testInfo - Optional Playwright TestInfo object
 * @returns The output directory path
 */
export declare function getOutputDir(testInfo?: TestInfo): string;
/**
 * Saves the output directory path to a file so it can be read later
 * during global teardown (where testInfo is not available).
 * Stores the marker file inside the output directory itself to ensure write permissions.
 *
 * @param outputDir - The output directory path to save
 */
export declare function saveOutputDirPath(outputDir: string): void;
/**
 * Reads the saved output directory path by checking common locations for the marker file.
 * Falls back to 'test-results' if not found.
 * This is used during global teardown when testInfo is not available.
 *
 * @param testInfo - Optional Playwright TestInfo object (additional fallback layer)
 * @returns The saved output directory path, or 'test-results' if not found
 */
export declare function getSavedOutputDir(testInfo?: TestInfo): string;
/**
 * Cleans up the output directory marker file after teardown completes.
 *
 * @param outputDir - The output directory containing the marker file
 */
export declare function cleanupOutputDirMarker(outputDir: string): void;
