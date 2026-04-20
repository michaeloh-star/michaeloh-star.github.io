"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.recordCommand = void 0;
const commander_1 = require("commander");
const fs_1 = require("fs");
const path_1 = require("path");
exports.recordCommand = new commander_1.Command('record')
    .description('Record an audit result for later aggregation (for parallel test runners)')
    .requiredOption('--id <runId>', 'Unique identifier for this test run')
    .option('--data <json>', 'Audit data as JSON string')
    .option('--file <path>', 'Path to file containing audit data')
    .requiredOption('--url <url>', 'URL of the audited page')
    .option('--output <dir>', 'Output directory for state files', 'test-results')
    .action(async (options) => {
    try {
        let auditData;
        // Support both --data and --file to handle large data
        if (options.file) {
            const fileContent = (0, fs_1.readFileSync)(options.file, 'utf-8');
            auditData = JSON.parse(fileContent);
        }
        else if (options.data) {
            auditData = JSON.parse(options.data);
        }
        else {
            console.error('[aflow-core] Error: No data provided. Use --data or --file');
            process.exit(1);
        }
        const outputDir = (0, path_1.resolve)(options.output);
        // Ensure output directory exists
        if (!(0, fs_1.existsSync)(outputDir)) {
            (0, fs_1.mkdirSync)(outputDir, { recursive: true });
        }
        // Create a JSONL file for this run
        const stateFile = (0, path_1.join)(outputDir, `aflow-state-${options.id}.jsonl`);
        // Append the audit record
        const record = {
            audit: auditData,
            timestamp: new Date().toISOString(),
            url: options.url,
        };
        (0, fs_1.appendFileSync)(stateFile, `${JSON.stringify(record)}\n`);
        console.log(`[aflow-core] Audit recorded for run ${options.id}`);
        console.log(`[aflow-core] State file: ${stateFile}`);
        process.exit(0);
    }
    catch (error) {
        console.error('[aflow-core] Error recording audit:', error);
        process.exit(2);
    }
});
