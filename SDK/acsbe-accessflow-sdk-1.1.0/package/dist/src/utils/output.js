"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cleanupOutputDirMarker = exports.getSavedOutputDir = exports.saveOutputDirPath = exports.getOutputDir = void 0;
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
/**
 * Gets the output directory for AccessFlow reports.
 * Respects Playwright's outputDir configuration if TestInfo is available,
 * otherwise falls back to 'test-results'.
 *
 * @param testInfo - Optional Playwright TestInfo object
 * @returns The output directory path
 */
function getOutputDir(testInfo) {
    var _a;
    // Try to get outputDir from Playwright's configuration via TestInfo
    if ((_a = testInfo === null || testInfo === void 0 ? void 0 : testInfo.project) === null || _a === void 0 ? void 0 : _a.outputDir) {
        return testInfo.project.outputDir;
    }
    // Fallback to default 'test-results' directory
    return path_1.default.resolve('test-results');
}
exports.getOutputDir = getOutputDir;
/**
 * Saves the output directory path to a file so it can be read later
 * during global teardown (where testInfo is not available).
 * Stores the marker file inside the output directory itself to ensure write permissions.
 *
 * @param outputDir - The output directory path to save
 */
function saveOutputDirPath(outputDir) {
    try {
        const markerFile = path_1.default.resolve(outputDir, '.accessflow-output-dir');
        // Just write the directory name as confirmation (file existence is what matters)
        (0, fs_1.writeFileSync)(markerFile, outputDir, 'utf-8');
    }
    catch (error) {
        // Silently fail - if we can't write to output dir, SDK won't work anyway
    }
}
exports.saveOutputDirPath = saveOutputDirPath;
/**
 * Reads the saved output directory path by checking common locations for the marker file.
 * Falls back to 'test-results' if not found.
 * This is used during global teardown when testInfo is not available.
 *
 * @param testInfo - Optional Playwright TestInfo object (additional fallback layer)
 * @returns The saved output directory path, or 'test-results' if not found
 */
function getSavedOutputDir(testInfo) {
    var _a;
    // First layer: Try to get from testInfo if provided
    if ((_a = testInfo === null || testInfo === void 0 ? void 0 : testInfo.project) === null || _a === void 0 ? void 0 : _a.outputDir) {
        return testInfo.project.outputDir;
    }
    // Second layer: Check for marker file in common directories
    const commonDirs = [path_1.default.resolve('test-results'), path_1.default.resolve('playwright-report'), path_1.default.resolve('test-output')];
    for (const dir of commonDirs) {
        const markerFile = path_1.default.resolve(dir, '.accessflow-output-dir');
        try {
            if ((0, fs_1.existsSync)(markerFile)) {
                const savedDir = (0, fs_1.readFileSync)(markerFile, 'utf-8').trim();
                return savedDir;
            }
        }
        catch (error) {
            // Continue checking other directories
        }
    }
    // Third layer: Default fallback
    return path_1.default.resolve('test-results');
}
exports.getSavedOutputDir = getSavedOutputDir;
/**
 * Cleans up the output directory marker file after teardown completes.
 *
 * @param outputDir - The output directory containing the marker file
 */
function cleanupOutputDirMarker(outputDir) {
    try {
        const markerFile = path_1.default.resolve(outputDir, '.accessflow-output-dir');
        if ((0, fs_1.existsSync)(markerFile)) {
            (0, fs_1.unlinkSync)(markerFile);
        }
    }
    catch (error) {
        // Silently fail - cleanup is not critical
    }
}
exports.cleanupOutputDirMarker = cleanupOutputDirMarker;
