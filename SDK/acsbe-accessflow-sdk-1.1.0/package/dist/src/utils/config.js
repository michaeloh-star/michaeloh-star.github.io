"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadAccessFlowConfig = void 0;
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
/**
 * Searches upward from the current working directory to find accessflow.config.json
 * Stops at the filesystem root or when a project root (package.json) is found without a config
 * @returns Full path to the config file if found, null otherwise
 */
function findAccessFlowConfig() {
    let currentDir = path_1.default.resolve(process.cwd());
    const root = path_1.default.parse(currentDir).root;
    // First, check the current directory
    while (currentDir !== root) {
        const configPath = path_1.default.join(currentDir, 'accessflow.config.json');
        if ((0, fs_1.existsSync)(configPath)) {
            return configPath;
        }
        // Check if this directory has a package.json (project root indicator)
        const packageJsonPath = path_1.default.join(currentDir, 'package.json');
        const hasPackageJson = (0, fs_1.existsSync)(packageJsonPath);
        // If we've reached a project root without finding config, stop searching
        // This prevents searching beyond the project boundary
        if (hasPackageJson) {
            return null;
        }
        // Move up one directory
        const parentDir = path_1.default.dirname(currentDir);
        // Safety check: ensure we're actually moving up
        if (parentDir === currentDir) {
            break;
        }
        currentDir = parentDir;
    }
    // Reached filesystem root without finding config
    return null;
}
/**
 * Loads and validates the accessflow.config.json file if it exists
 * Searches upward from the current working directory to find the config file
 * @returns Parsed and validated config object, or null if file doesn't exist or is invalid
 */
function loadAccessFlowConfig() {
    const configPath = findAccessFlowConfig();
    if (!configPath) {
        return null;
    }
    try {
        const configContent = (0, fs_1.readFileSync)(configPath, 'utf-8');
        const config = JSON.parse(configContent);
        return validateConfig(config);
    }
    catch (error) {
        console.warn('[AccessFlowSDK] Failed to parse accessflow.config.json:', error);
        return null;
    }
}
exports.loadAccessFlowConfig = loadAccessFlowConfig;
/**
 * Validates the configuration object and sanitizes threshold values
 * @param config Raw config object from JSON
 * @returns Validated config object
 */
function validateConfig(config) {
    const validatedConfig = {};
    // Validate localCheck boolean
    if (typeof config.localCheck === 'boolean') {
        validatedConfig.localCheck = config.localCheck;
    }
    if (config.issuesFoundThreshold && typeof config.issuesFoundThreshold === 'object') {
        const threshold = {};
        const severityFields = ['extreme', 'high', 'medium', 'low'];
        for (const field of severityFields) {
            const value = config.issuesFoundThreshold[field];
            if (typeof value === 'number' && !isNaN(value) && value >= 0) {
                threshold[field] = Math.floor(value); // Ensure integer values
            }
        }
        // Only add threshold if at least one valid field exists
        if (Object.keys(threshold).length > 0) {
            validatedConfig.issuesFoundThreshold = threshold;
        }
    }
    return validatedConfig;
}
