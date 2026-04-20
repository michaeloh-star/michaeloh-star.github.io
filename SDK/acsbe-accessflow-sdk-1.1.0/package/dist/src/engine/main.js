#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const assets_1 = require("./commands/assets");
const finalize_1 = require("./commands/finalize");
const process_1 = require("./commands/process");
const record_1 = require("./commands/record");
const verify_1 = require("./commands/verify");
const program = new commander_1.Command();
program
    .name('aflow-core')
    .description('AccessFlow Core Engine - Framework-agnostic accessibility audit processor')
    .version('1.0.0');
// Add all commands
program.addCommand(verify_1.verifyCommand);
program.addCommand(assets_1.assetsCommand);
program.addCommand(process_1.processCommand);
program.addCommand(record_1.recordCommand);
program.addCommand(finalize_1.finalizeCommand);
// Parse arguments
program.parse(process.argv);
