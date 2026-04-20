"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyCommand = void 0;
const commander_1 = require("commander");
const auth_1 = require("../../api/auth");
exports.verifyCommand = new commander_1.Command('verify')
    .description('Verify the AccessFlow API key')
    .requiredOption('--key <apiKey>', 'The API key to verify')
    .action(async (options) => {
    try {
        const isValid = await (0, auth_1.verifyApiKey)(options.key);
        if (isValid) {
            console.log('[aflow-core] API key verified successfully');
            process.exit(0);
        }
        else {
            console.error('[aflow-core] API key verification failed');
            process.exit(1);
        }
    }
    catch (error) {
        console.error('[aflow-core] Error during verification:', error);
        process.exit(2);
    }
});
