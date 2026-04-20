"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.processCommand = void 0;
const commander_1 = require("commander");
const fs_1 = require("fs");
const summarizer_1 = require("../lib/summarizer");
exports.processCommand = new commander_1.Command('process')
    .description('Process raw audit data and generate a summary report')
    .option('--data <json>', 'Raw audit data as JSON string')
    .option('--file <path>', 'Path to file containing raw audit data')
    .option('--url <url>', 'URL of the audited page')
    .action(async (options) => {
    try {
        let audits;
        // Support both --data and --file to handle large data
        if (options.file) {
            const fileContent = (0, fs_1.readFileSync)(options.file, 'utf-8');
            audits = JSON.parse(fileContent);
        }
        else if (options.data) {
            audits = JSON.parse(options.data);
        }
        else {
            // Try reading from stdin
            const stdinData = readFromStdin();
            if (stdinData) {
                audits = JSON.parse(stdinData);
            }
            else {
                console.error('[aflow-core] Error: No data provided. Use --data, --file, or pipe data to stdin');
                process.exit(1);
            }
        }
        // Summarize the audits
        const { orderedSeverityCounts, ruleSummaries } = (0, summarizer_1.summarizeAudits)(audits);
        // Build the report
        const report = {
            numberOfIssuesFound: orderedSeverityCounts,
            ruleViolations: ruleSummaries,
            ...(options.url && { url: options.url }),
        };
        // Output the report as JSON
        console.log(JSON.stringify(report, null, 2));
        process.exit(0);
    }
    catch (error) {
        console.error('[aflow-core] Error processing audit data:', error);
        process.exit(2);
    }
});
/**
 * Read data from stdin if available (synchronous).
 */
function readFromStdin() {
    try {
        // Check if stdin has data
        const stdin = process.stdin;
        if (stdin.isTTY) {
            return null; // No piped data
        }
        // Read from stdin synchronously
        const fs = require('fs');
        return fs.readFileSync(0, 'utf-8');
    }
    catch {
        return null;
    }
}
