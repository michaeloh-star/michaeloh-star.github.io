"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EngineClient = void 0;
const child_process_1 = require("child_process");
const fs_1 = require("fs");
const os_1 = require("os");
const path_1 = require("path");
/**
 * Client for interacting with the aflow-core CLI engine.
 * This allows the SDK to use the CLI as a sidecar for cross-language compatibility.
 */
class EngineClient {
    constructor(cliPath) {
        // Default to the bundled CLI if no path is provided
        this.cliPath = cliPath || 'aflow-core';
    }
    /**
     * Extract assets to a directory using the CLI.
     */
    extractAssets(outputDir) {
        (0, child_process_1.execSync)(`${this.cliPath} assets --output "${outputDir}"`, {
            encoding: 'utf-8',
            stdio: 'inherit',
        });
    }
    /**
     * Finalize and aggregate all recorded audits.
     */
    finalize(runId, outputDir = 'test-results', apiKey, context) {
        let cmd = `${this.cliPath} finalize --id "${runId}" --output "${outputDir}"`;
        if (apiKey) {
            cmd += ` --api-key "${apiKey}"`;
        }
        if (context) {
            cmd += ` --context '${JSON.stringify(context)}'`;
        }
        (0, child_process_1.execSync)(cmd, {
            encoding: 'utf-8',
            stdio: 'inherit',
        });
    }
    /**
     * Process audit data using the CLI and return the summary.
     * Handles large data by writing to a temporary file.
     */
    process(audits, url) {
        // Write audits to a temporary file to avoid command-line length limits
        const tempFile = (0, path_1.join)((0, fs_1.mkdtempSync)((0, path_1.join)((0, os_1.tmpdir)(), 'aflow-')), 'audits.json');
        try {
            (0, fs_1.writeFileSync)(tempFile, JSON.stringify(audits));
            const result = (0, child_process_1.execSync)(`${this.cliPath} process --file "${tempFile}" --url "${url}"`, {
                encoding: 'utf-8',
                maxBuffer: 10 * 1024 * 1024, // 10MB buffer
            });
            return JSON.parse(result);
        }
        finally {
            // Clean up temp file
            if ((0, fs_1.existsSync)(tempFile)) {
                (0, fs_1.unlinkSync)(tempFile);
            }
        }
    }
    /**
     * Record an audit result for later aggregation.
     */
    record(runId, audits, url, outputDir = 'test-results') {
        // Write audits to a temporary file
        const tempFile = (0, path_1.join)((0, fs_1.mkdtempSync)((0, path_1.join)((0, os_1.tmpdir)(), 'aflow-')), 'audits.json');
        try {
            (0, fs_1.writeFileSync)(tempFile, JSON.stringify(audits));
            (0, child_process_1.execSync)(`${this.cliPath} record --id "${runId}" --file "${tempFile}" --url "${url}" --output "${outputDir}"`, {
                encoding: 'utf-8',
                stdio: 'inherit',
            });
        }
        finally {
            // Clean up temp file
            if ((0, fs_1.existsSync)(tempFile)) {
                (0, fs_1.unlinkSync)(tempFile);
            }
        }
    }
    /**
     * Verify an API key using the CLI.
     */
    verifyKey(apiKey) {
        try {
            (0, child_process_1.execSync)(`${this.cliPath} verify --key "${apiKey}"`, {
                encoding: 'utf-8',
                stdio: 'pipe',
            });
            return true;
        }
        catch (error) {
            return false;
        }
    }
}
exports.EngineClient = EngineClient;
