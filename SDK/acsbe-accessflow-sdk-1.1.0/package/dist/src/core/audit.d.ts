import { type IAudits, type IBrowserDriver } from '../types';
export declare function runAudit(driver: IBrowserDriver, initializedFlag: {
    value: boolean;
}): Promise<IAudits | undefined>;
