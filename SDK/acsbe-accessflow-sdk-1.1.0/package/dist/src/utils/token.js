"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyApiKey = exports.getApiKey = exports.setApiKey = void 0;
const auth_1 = require("../api/auth");
let apiKey;
let verifyPromise = null;
function setApiKey(key, resetPromise = true) {
    apiKey = key;
    if (resetPromise) {
        verifyPromise = null;
    }
}
exports.setApiKey = setApiKey;
function getApiKey() {
    if (apiKey)
        return apiKey;
    const envApiKey = process.env.ACCESSFLOW_SDK_API_KEY;
    if (envApiKey) {
        setApiKey(envApiKey, false);
        return envApiKey;
    }
    throw new Error('AccessFlowSDK: API key is missing. Please set ACCESSFLOW_SDK_API_KEY in your environment or call AccessFlowSDK.init({ apiKey }) before using the SDK.');
}
exports.getApiKey = getApiKey;
async function verifyApiKey() {
    if (verifyPromise)
        return verifyPromise;
    const key = getApiKey();
    verifyPromise = (0, auth_1.verifyApiKey)(key)
        .then((valid) => {
        if (!valid) {
            throw new Error('AccessFlowSDK: invalid API key.');
        }
    })
        .catch((error) => {
        throw new Error(`AccessFlowSDK: API key verification failed. ${error.message}`);
    });
    return verifyPromise;
}
exports.verifyApiKey = verifyApiKey;
