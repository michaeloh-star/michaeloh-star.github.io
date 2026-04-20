"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runAudit = void 0;
const fs_1 = require("fs");
const path_1 = require("path");
async function ensureInit(driver, initializedFlag) {
    if (initializedFlag.value)
        return;
    //For the e2e tests, package will be in dist/src/assets
    const baseDir = __dirname.includes(`${path_1.sep}dist${path_1.sep}`) || __dirname.endsWith(`${path_1.sep}dist`) ?
        (0, path_1.join)(__dirname, '..', 'assets')
        : (0, path_1.join)(__dirname, '..', '..', 'dist', 'src', 'assets');
    const scriptPath = (0, path_1.join)(baseDir, 'auditor.js');
    const stylePath = (0, path_1.join)(baseDir, 'auditor.css');
    const script = (0, fs_1.readFileSync)(scriptPath, 'utf-8');
    const style = (0, fs_1.readFileSync)(stylePath, 'utf-8');
    await driver.addInitScript(script);
    await driver.addStyleTag(style);
    await driver.evaluate((code) => {
        if (!window.accessFlow) {
            const s = document.createElement('script');
            s.textContent = code;
            document.documentElement.appendChild(s);
        }
    }, script);
    await driver.evaluate((css) => {
        if (!document.getElementById('accessflow-auditor-style')) {
            const styleTag = document.createElement('style');
            styleTag.id = 'accessflow-auditor-style';
            styleTag.textContent = css;
            document.head.appendChild(styleTag);
        }
    }, style);
    initializedFlag.value = true;
}
async function runAudit(driver, initializedFlag) {
    await ensureInit(driver, initializedFlag);
    return driver.evaluate(() => { var _a; return (_a = window.accessFlow) === null || _a === void 0 ? void 0 : _a.getLoadAudits(); });
}
exports.runAudit = runAudit;
