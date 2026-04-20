"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAccessFlowBaseUrl = exports.getDevAuth = void 0;
// Default to development. Production builds will set this to true temporarily.
const IS_PRODUCTION = true;
const RAW_URL = IS_PRODUCTION ?
    'https://accessflow.accessibe.com'
    : 'https://test:acsb123@sdk-selenium--accessflow--test.acsb-test.com/';
// Compute values once at module load (build time effectively)
const DEV_AUTH = RAW_URL ? ((_a = RAW_URL.match(/\/\/([^@]+)@/)) === null || _a === void 0 ? void 0 : _a[1]) || '' : '';
const ACCESS_FLOW_BASE_URL = RAW_URL ? RAW_URL.replace(/\/\/.*@/, '//') : null;
// Export as functions for backwards compatibility
const getDevAuth = () => DEV_AUTH;
exports.getDevAuth = getDevAuth;
const getAccessFlowBaseUrl = () => ACCESS_FLOW_BASE_URL;
exports.getAccessFlowBaseUrl = getAccessFlowBaseUrl;
