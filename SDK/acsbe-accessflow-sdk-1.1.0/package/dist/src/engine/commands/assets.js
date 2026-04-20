"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assetsCommand = void 0;
const commander_1 = require("commander");
const fs_1 = require("fs");
const path_1 = require("path");
exports.assetsCommand = new commander_1.Command('assets')
    .description('Extract auditor.js and auditor.css assets to a specified directory')
    .requiredOption('--output <path>', 'Directory to extract assets to')
    .action(async (options) => {
    try {
        const outputDir = (0, path_1.resolve)(options.output);
        // Create output directory if it doesn't exist
        if (!(0, fs_1.existsSync)(outputDir)) {
            (0, fs_1.mkdirSync)(outputDir, { recursive: true });
        }
        // Determine the base directory for assets
        const baseDir = __dirname.includes(`${path_1.sep}dist${path_1.sep}`) || __dirname.endsWith(`${path_1.sep}dist`) ?
            (0, path_1.join)(__dirname, '..', '..', 'assets')
            : (0, path_1.join)(__dirname, '..', '..', '..', 'dist', 'src', 'assets');
        const scriptPath = (0, path_1.join)(baseDir, 'auditor.js');
        const stylePath = (0, path_1.join)(baseDir, 'auditor.css');
        // Check if assets exist
        if (!(0, fs_1.existsSync)(scriptPath)) {
            console.error(`[aflow-core] Error: auditor.js not found at ${scriptPath}`);
            process.exit(1);
        }
        if (!(0, fs_1.existsSync)(stylePath)) {
            console.error(`[aflow-core] Error: auditor.css not found at ${stylePath}`);
            process.exit(1);
        }
        // Copy assets to output directory
        (0, fs_1.copyFileSync)(scriptPath, (0, path_1.join)(outputDir, 'auditor.js'));
        (0, fs_1.copyFileSync)(stylePath, (0, path_1.join)(outputDir, 'auditor.css'));
        console.log(`[aflow-core] Assets extracted to ${outputDir}`);
        console.log(`[aflow-core] - auditor.js`);
        console.log(`[aflow-core] - auditor.css`);
        process.exit(0);
    }
    catch (error) {
        console.error('[aflow-core] Error extracting assets:', error);
        process.exit(2);
    }
});
