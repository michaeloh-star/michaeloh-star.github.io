export type CiInfo = {
    branchId?: string;
    branchName: string;
    buildNumber: string;
    buildUrl: string;
    ciName: string;
    commitDate: string;
    commitHash: string;
    commitMessage: string;
    defaultBranch: string;
    repoName: string;
    repoUrl: string;
    user: string;
};
export declare function detectCiInfo(): CiInfo | null;
