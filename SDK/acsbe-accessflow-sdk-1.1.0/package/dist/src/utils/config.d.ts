export type IssuesFoundThreshold = {
    extreme?: number;
    high?: number;
    low?: number;
    medium?: number;
};
export type AccessFlowConfig = {
    issuesFoundThreshold?: IssuesFoundThreshold;
    localCheck?: boolean;
};
/**
 * Loads and validates the accessflow.config.json file if it exists
 * Searches upward from the current working directory to find the config file
 * @returns Parsed and validated config object, or null if file doesn't exist or is invalid
 */
export declare function loadAccessFlowConfig(): AccessFlowConfig | null;
