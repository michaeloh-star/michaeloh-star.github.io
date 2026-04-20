"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.detectCiInfo = void 0;
/**
 * Normalizes a date string to ISO 8601 format.
 * Handles various date formats from different CI systems.
 * @param dateString - Date string in any format
 * @returns ISO 8601 formatted date string, or current date if invalid
 */
function normalizeToISOString(dateString) {
    if (!dateString) {
        return new Date().toISOString();
    }
    // If already in ISO format, return as-is
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/.test(dateString)) {
        return dateString.endsWith('Z') ? dateString : `${dateString}Z`;
    }
    // Try to parse and convert to ISO
    try {
        const date = new Date(dateString);
        if (!isNaN(date.getTime())) {
            return date.toISOString();
        }
    }
    catch {
        // Fall through to default
    }
    // If all else fails, return current date
    return new Date().toISOString();
}
function detectCiInfo() {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    const env = process.env;
    // Jenkins
    if (env.JENKINS_URL) {
        // Jenkins does not expose user/event/pr info in standard envs
        return {
            branchId: env.CHANGE_ID ? `pr-${env.CHANGE_ID}` : env.BRANCH_NAME,
            branchName: env.BRANCH_NAME || 'unknown',
            buildNumber: env.BUILD_NUMBER || 'unknown',
            buildUrl: env.BUILD_URL || 'unknown',
            ciName: 'Jenkins',
            commitDate: normalizeToISOString(env.GIT_COMMITTER_DATE),
            commitHash: env.GIT_COMMIT || 'unknown',
            commitMessage: env.GIT_COMMIT_MESSAGE || 'unknown',
            defaultBranch: env.DEFAULT_BRANCH || 'unknown',
            repoName: env.GIT_URL ? ((_a = env.GIT_URL.split('/').pop()) === null || _a === void 0 ? void 0 : _a.replace('.git', '')) || 'unknown' : 'unknown',
            repoUrl: env.GIT_URL || 'unknown',
            user: 'unknown',
        };
    }
    // GitHub Actions
    if (env.GITHUB_ACTIONS) {
        // Try to determine PR number from GITHUB_REF or GITHUB_HEAD_REF
        let branch = env.GITHUB_REF_NAME;
        let branchId = undefined;
        let eventType = env.GITHUB_EVENT_NAME;
        if (eventType === 'pull_request' || eventType === 'pull_request_target') {
            // GITHUB_REF format: refs/pull/123/merge
            const ref = env.GITHUB_REF || '';
            const match = ref.match(/refs\/pull\/(\d+)\/merge/);
            if (match) {
                branchId = `pr-${match[1]}`;
            }
            // For PRs, prefer GITHUB_HEAD_REF as the branch
            if (env.GITHUB_HEAD_REF) {
                branch = env.GITHUB_HEAD_REF;
            }
        }
        else {
            // For regular branches, use the full ref as branch ID
            branchId = env.GITHUB_REF || undefined;
        }
        // Note: GitHub Actions doesn't expose commit message as standard environment variables
        // To get commit message and commit date, you would need to read from GITHUB_EVENT_PATH file
        let commitMessage = undefined;
        let commitDate = undefined;
        if (env.GITHUB_EVENT_PATH) {
            try {
                const fs = require('fs');
                const eventPayload = JSON.parse(fs.readFileSync(env.GITHUB_EVENT_PATH, 'utf8'));
                commitMessage = ((_b = eventPayload.head_commit) === null || _b === void 0 ? void 0 : _b.message) || ((_d = (_c = eventPayload.commits) === null || _c === void 0 ? void 0 : _c[0]) === null || _d === void 0 ? void 0 : _d.message);
                commitDate = ((_e = eventPayload.head_commit) === null || _e === void 0 ? void 0 : _e.timestamp) || ((_g = (_f = eventPayload.commits) === null || _f === void 0 ? void 0 : _f[0]) === null || _g === void 0 ? void 0 : _g.timestamp);
            }
            catch (error) {
                // Ignore errors reading event file
                commitMessage = undefined;
                commitDate = undefined;
            }
        }
        // Fallback to git command if event path didn't work, returned 'unknown', or is a merge commit
        // This is especially important for merge commits where the message is "Merge branch 'x' into 'y'"
        if (!commitMessage || commitMessage === 'unknown' || commitMessage.startsWith('Merge ')) {
            if (env.GITHUB_SHA) {
                try {
                    const { execSync } = require('child_process');
                    // For merge commits, try to get the first non-merge commit message
                    // This gets the most recent commit that's not a merge commit
                    let gitMessage = execSync(`git log --no-merges -1 --pretty=%B ${env.GITHUB_SHA}`, {
                        encoding: 'utf8',
                        timeout: 5000,
                    }).trim();
                    // If still empty (all commits are merges), get the actual commit message (even if it's a merge)
                    if (!gitMessage) {
                        gitMessage = execSync(`git log -1 --pretty=%B ${env.GITHUB_SHA}`, {
                            encoding: 'utf8',
                            timeout: 5000,
                        }).trim();
                    }
                    if (gitMessage) {
                        commitMessage = gitMessage;
                    }
                    // Also try to get commit date from git if not already set
                    if (!commitDate) {
                        try {
                            const gitDate = execSync(`git log -1 --pretty=%ci ${env.GITHUB_SHA}`, {
                                encoding: 'utf8',
                                timeout: 5000,
                            }).trim();
                            if (gitDate) {
                                commitDate = gitDate;
                            }
                        }
                        catch {
                            // Ignore errors getting commit date
                        }
                    }
                }
                catch (error) {
                    // Ignore errors if git is not available or command fails
                }
            }
        }
        return {
            branchId,
            branchName: branch || 'unknown',
            buildNumber: env.GITHUB_RUN_NUMBER || 'unknown',
            buildUrl: `${env.GITHUB_SERVER_URL || 'https://github.com'}/${env.GITHUB_REPOSITORY || 'unknown'}/actions/runs/${env.GITHUB_RUN_ID || 'unknown'}`,
            ciName: 'GitHub Actions',
            commitDate: normalizeToISOString(commitDate),
            commitHash: env.GITHUB_SHA || 'unknown',
            commitMessage: commitMessage || 'unknown',
            defaultBranch: env.GITHUB_DEFAULT_BRANCH || 'unknown',
            repoName: ((_h = env.GITHUB_REPOSITORY) === null || _h === void 0 ? void 0 : _h.split('/')[1]) || 'unknown',
            repoUrl: env.GITHUB_REPOSITORY ? `${env.GITHUB_SERVER_URL || 'https://github.com'}/${env.GITHUB_REPOSITORY}` : 'unknown',
            user: env.GITHUB_ACTOR || 'unknown',
        };
    }
    // GitLab CI
    if (env.GITLAB_CI) {
        // Merge Request details available in MR pipelines
        return {
            branchId: env.CI_MERGE_REQUEST_IID ? `mr-${env.CI_MERGE_REQUEST_IID}` : env.CI_COMMIT_REF_SLUG,
            branchName: env.CI_COMMIT_REF_NAME || 'unknown',
            buildNumber: env.CI_PIPELINE_ID || 'unknown',
            buildUrl: env.CI_PIPELINE_URL || 'unknown',
            ciName: 'GitLab CI',
            commitDate: normalizeToISOString(env.CI_COMMIT_TIMESTAMP),
            commitHash: env.CI_COMMIT_SHA || 'unknown',
            commitMessage: env.CI_COMMIT_MESSAGE || 'unknown',
            defaultBranch: env.CI_DEFAULT_BRANCH || 'unknown',
            repoName: env.CI_PROJECT_NAME || 'unknown',
            repoUrl: env.CI_PROJECT_URL || 'unknown',
            user: env.GITLAB_USER_NAME || 'unknown',
        };
    }
    // CircleCI
    if (env.CIRCLECI) {
        // CircleCI doesn't provide commit message as environment variable
        // We need to extract it using git command from the commit SHA
        let commitMessage = undefined;
        if (env.CIRCLE_SHA1) {
            try {
                const { execSync } = require('child_process');
                commitMessage = execSync(`git log -1 --pretty=%B ${env.CIRCLE_SHA1}`, {
                    encoding: 'utf8',
                    timeout: 5000,
                }).trim();
            }
            catch (error) {
                // Ignore errors if git is not available or command fails
                commitMessage = undefined;
            }
        }
        return {
            branchId: env.CIRCLE_PR_NUMBER ? `pr-${env.CIRCLE_PR_NUMBER}` : env.CIRCLE_BRANCH,
            branchName: env.CIRCLE_BRANCH || 'unknown',
            buildNumber: env.CIRCLE_BUILD_NUM || 'unknown',
            buildUrl: env.CIRCLE_BUILD_URL || 'unknown',
            ciName: 'CircleCI',
            commitDate: normalizeToISOString(env.CIRCLE_BUILD_TIMESTAMP),
            commitHash: env.CIRCLE_SHA1 || 'unknown',
            commitMessage: commitMessage || 'unknown',
            defaultBranch: env.CIRCLE_DEFAULT_BRANCH || 'unknown',
            repoName: env.CIRCLE_PROJECT_REPONAME || 'unknown',
            repoUrl: env.CIRCLE_REPOSITORY_URL || 'unknown',
            user: env.CIRCLE_USERNAME || 'unknown',
        };
    }
    // Azure Pipelines
    if (env.TF_BUILD) {
        return {
            branchId: env.SYSTEM_PULLREQUEST_PULLREQUESTID ? `pr-${env.SYSTEM_PULLREQUEST_PULLREQUESTID}` : env.BUILD_SOURCEBRANCH,
            branchName: env.BUILD_SOURCEBRANCH || 'unknown',
            buildNumber: env.BUILD_BUILDNUMBER || 'unknown',
            buildUrl: env.BUILD_REPOSITORY_URI ?
                `${env.BUILD_REPOSITORY_URI}/_build/results?buildId=${env.BUILD_BUILDNUMBER}`
                : 'unknown',
            ciName: 'Azure Pipelines',
            commitDate: normalizeToISOString(env.BUILD_SOURCEVERSIONDATE),
            commitHash: env.BUILD_SOURCEVERSION || 'unknown',
            commitMessage: env.BUILD_SOURCEVERSIONMESSAGE || 'unknown',
            defaultBranch: env.BUILD_DEFINITION_NAME || 'unknown',
            repoName: env.BUILD_REPOSITORY_NAME || 'unknown',
            repoUrl: env.BUILD_REPOSITORY_URI || 'unknown',
            user: env.BUILD_REQUESTEDFOR || 'unknown',
        };
    }
    // Bitbucket Pipelines
    if (env.BITBUCKET_BUILD_NUMBER) {
        return {
            branchId: env.BITBUCKET_PR_ID ? `pr-${env.BITBUCKET_PR_ID}` : env.BITBUCKET_BRANCH,
            branchName: env.BITBUCKET_BRANCH || 'unknown',
            buildNumber: env.BITBUCKET_BUILD_NUMBER || 'unknown',
            buildUrl: env.BITBUCKET_REPO_FULL_NAME ?
                `https://bitbucket.org/${env.BITBUCKET_REPO_FULL_NAME}/pipelines/results/${env.BITBUCKET_BUILD_NUMBER}`
                : 'unknown',
            ciName: 'Bitbucket Pipelines',
            commitDate: normalizeToISOString(undefined),
            commitHash: env.BITBUCKET_COMMIT || 'unknown',
            commitMessage: 'unknown',
            defaultBranch: env.BITBUCKET_DEFAULT_BRANCH || 'unknown',
            repoName: env.BITBUCKET_REPO_SLUG || 'unknown',
            repoUrl: env.BITBUCKET_REPO_FULL_NAME ? `https://bitbucket.org/${env.BITBUCKET_REPO_FULL_NAME}` : 'unknown',
            user: env.BITBUCKET_COMMIT_AUTHOR || 'unknown',
        };
    }
    // Atlassian Bamboo
    if (env['bamboo.buildNumber']) {
        const repoIndices = Object.keys(env)
            .map((k) => k.match(/^bamboo\.planRepository\.(\d+)\.branchName$/))
            .filter(Boolean)
            .map((match) => Number(match[1]))
            .sort((a, b) => a - b);
        const repoIndex = repoIndices.length > 0 ? repoIndices[0] : undefined;
        return {
            branchId: repoIndex ?
                env[`bamboo.planRepository.${repoIndex}.branchName`] || env[`bamboo.planRepository.${repoIndex}.branch`]
                : undefined,
            branchName: repoIndex ?
                env[`bamboo.planRepository.${repoIndex}.branchName`] ||
                    env[`bamboo.planRepository.${repoIndex}.branch`] ||
                    'unknown'
                : 'unknown',
            buildNumber: env['bamboo.buildNumber'] || 'unknown',
            buildUrl: env['bamboo.buildResultsUrl'] || env['bamboo.resultsUrl'] || 'unknown',
            ciName: 'Bamboo',
            commitDate: normalizeToISOString(repoIndex ? env[`bamboo.planRepository.${repoIndex}.revisionDate`] : undefined),
            commitHash: repoIndex ? env[`bamboo.planRepository.${repoIndex}.revision`] || 'unknown' : 'unknown',
            commitMessage: repoIndex ? env[`bamboo.planRepository.${repoIndex}.revisionComment`] || 'unknown' : 'unknown',
            defaultBranch: repoIndex ? env[`bamboo.planRepository.${repoIndex}.defaultBranch`] || 'unknown' : 'unknown',
            repoName: repoIndex ? env[`bamboo.planRepository.${repoIndex}.name`] || 'unknown' : 'unknown',
            repoUrl: repoIndex ? env[`bamboo.planRepository.${repoIndex}.repositoryUrl`] || 'unknown' : 'unknown',
            user: env['bamboo.ManualBuildTriggerReason.userName'] || 'unknown',
        };
    }
    return null;
}
exports.detectCiInfo = detectCiInfo;
