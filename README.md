# AccessibilityApp accessFlow Setup

This project uses Playwright plus the accessFlow SDK to run accessibility checks for:

- `index.html`
- `about.html`
- `products.html`

## Prerequisites

- Node.js 20+
- npm

## Install

```bash
npm install
npm run install:browsers
```

The SDK is installed from the local tarball:

- `SDK/acsbe-accessflow-sdk-1.1.0.tgz`

## Run tests locally

```bash
npm run test:accessibility
```

## Configuration

`accessflow.config.json` has `localCheck: true`, so thresholds are enforced locally and in CI.

Current thresholds:

- extreme: 0
- high: 50
- medium: 100
- low: 200

Adjust these as your quality gate tightens.

## CI

GitHub Actions workflow:

- `.github/workflows/accessflow-playwright.yml`

Workflow uses:

- `ubuntu-22.04` (recommended for Playwright compatibility)
- Node 20
- Playwright Chromium

## Security note

The API key is currently hardcoded in `tests/accessflow.spec.ts` per your request.
This is not recommended for long-term usage because the key is stored in repository history.
Rotate this key after validation and move to GitHub Secrets when ready.
