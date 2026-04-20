"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ensureDirExists = void 0;
const fs_1 = require("fs");
function ensureDirExists(dir) {
    if (!(0, fs_1.existsSync)(dir)) {
        (0, fs_1.mkdirSync)(dir, { recursive: true });
    }
}
exports.ensureDirExists = ensureDirExists;
