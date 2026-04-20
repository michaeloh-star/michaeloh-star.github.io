# AccessFlow SDK

Professional accessibility testing SDK for web applications. Automatically detect WCAG 2.1 accessibility issues in your tests.

[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)

## Supported Languages

| Language                  | Package                  |
| ------------------------- | ------------------------ |
| **JavaScript/TypeScript** | @acsbe/accessflow-sdk    |
| **Python**                | accessflow-sdk           |
| **Java**                  | com.acsbe:accessflow-sdk |

## Features

- **Multi-language support** - JavaScript, Python, and Java
- **WCAG 2.1 compliance** checking (A, AA, AAA)
- **Playwright and Selenium** - Use with Playwright or Selenium WebDriver
- **Detailed reports** - Issue descriptions, severity levels, and selectors
- **CI/CD ready** - Automatic report uploads to AccessFlow Dashboard
- **Configurable thresholds** - Fail builds on accessibility violations
- **Parallel execution** - Supports parallel test runners
- **Cross-platform** - Windows, macOS, Linux

## Prerequisites

You will receive the following from the AccessFlow team:

| Item                         | Description                                              |
| ---------------------------- | -------------------------------------------------------- |
| **Registry Install Token**   | A base64-encoded service account key for package installation |
| **SDK API Key**              | Your project API key for runtime authentication          |

> **Important:** The **Registry Install Token** is used to download/install the SDK package. The **SDK API Key** is used at runtime when running accessibility audits. These are two separate credentials.

> **Note for npm users:** npm's `.npmrc` `_password` field is automatically base64-decoded before being sent. This means the token stored in `_password` must be **double base64-encoded** (i.e., `base64(base64(json_key))`). The AccessFlow team will provide the correct token for each package manager. See the [JavaScript/TypeScript documentation](./node/README.md) for details.

---

## Quick Start

### JavaScript/TypeScript

**1. Configure registry authentication**

Create a `.npmrc` file in your project root with the following four lines (copy the block as-is, then replace the placeholders):

```ini
@acsbe:registry=https://NPM_REGISTRY_URL/
//NPM_REGISTRY_URL/:username=_json_key_base64
//NPM_REGISTRY_URL/:_password=NPM_INSTALL_TOKEN
//NPM_REGISTRY_URL/:always-auth=true
```

> Replace `NPM_REGISTRY_URL` and `NPM_INSTALL_TOKEN` with the values provided by the AccessFlow team. Use the registry URL **without** `https://` (e.g. `us-east1-npm.pkg.dev/PROJECT/REPO`). The `//` on the auth lines is part of the key format, not a comment. The npm token is double base64-encoded — see the [JavaScript/TypeScript documentation](./node/README.md) for details.

**2. Install the SDK**

```bash
npm install -D @acsbe/accessflow-sdk
```

**3. Use in your tests**

With **Playwright** (install Playwright if you haven't already):

```bash
npm install -D @playwright/test
```

```typescript
import { test } from '@playwright/test';
import AccessFlowSDK from '@acsbe/accessflow-sdk';

// Set ACCESSFLOW_SDK_API_KEY in your environment
// SDK automatically uses it - no initialization needed

test('accessibility check', async ({ page }) => {
  const sdk = new AccessFlowSDK(page);
  await page.goto('https://example.com');

  const audits = await sdk.audit();
  // Audit data is automatically recorded; the final report is generated and uploaded in CI.
});
```

With **Selenium**:

```bash
npm install -D selenium-webdriver
```

```typescript
import { Builder } from 'selenium-webdriver';
import { AccessFlowSDK, SeleniumDriver } from '@acsbe/accessflow-sdk';

// Set ACCESSFLOW_SDK_API_KEY in your environment

const driver = await new Builder().forBrowser('chrome').build();
await driver.get('https://example.com');

const sdk = new AccessFlowSDK(new SeleniumDriver(driver));
const audits = await sdk.audit();
// Audit data is automatically recorded; the final report is generated and uploaded in CI.
// To inspect issue counts here, call sdk.generateReport(audits) — see "Optional: Inspecting results" below.
await driver.quit();
```

When using Playwright with `TestInfo`, report artifacts can be attached to the test run. The final report is produced from audit data collected by `audit()` — you do not need to call any other method for the dashboard report.

[**Full JavaScript/TypeScript Documentation →**](./node/README.md)

---

### Python

**1. Install the SDK**

```bash
pip install accessflow-sdk --index-url https://_json_key_base64:REGISTRY_INSTALL_TOKEN@PYTHON_REGISTRY_URL/simple/
```

> Replace `PYTHON_REGISTRY_URL` and `REGISTRY_INSTALL_TOKEN` with the values provided by the AccessFlow team.

**2. Use in your tests**

With **Playwright** (install Playwright and the browser if you haven't already):

```bash
pip install playwright
playwright install chromium
```

```python
from playwright.sync_api import Page
from accessflow_sdk import AccessFlowSDK

# Set ACCESSFLOW_SDK_API_KEY in your environment
# SDK automatically uses it - no api_key parameter needed

def test_accessibility(page: Page):
    sdk = AccessFlowSDK(page)
    page.goto('https://example.com')

    audits = sdk.audit()
    # Audit data is automatically recorded; the final report is generated and uploaded in CI.
```

With **Selenium**:

```bash
pip install "selenium>=4.35"
```

```python
from selenium import webdriver
from accessflow_sdk import AccessFlowSDK, SeleniumDriver

# Set ACCESSFLOW_SDK_API_KEY in your environment

driver = webdriver.Chrome()
driver.get('https://example.com')

sdk = AccessFlowSDK(SeleniumDriver(driver))
audits = sdk.audit()
# Audit data is automatically recorded; the final report is generated and uploaded in CI.
# To inspect issue counts here, call sdk.generate_report(audits) — see "Optional: Inspecting results" above.
driver.quit()
```

[**Full Python Documentation →**](./python/README.md)

---

### Java

**1. Add the Maven repository to your `pom.xml`**

```xml
<repositories>
  <repository>
    <id>accessflow-registry</id>
    <url>https://MAVEN_REGISTRY_URL</url>
  </repository>
</repositories>

<dependency>
    <groupId>com.acsbe</groupId>
    <artifactId>accessflow-sdk</artifactId>
    <version>1.1.0</version>
    <scope>test</scope>
</dependency>
```

**2. Configure authentication in `~/.m2/settings.xml`**

```xml
<settings>
  <servers>
    <server>
      <id>accessflow-registry</id>
      <username>_json_key_base64</username>
      <password>REGISTRY_INSTALL_TOKEN</password>
    </server>
  </servers>
</settings>
```

> Replace `MAVEN_REGISTRY_URL` and `REGISTRY_INSTALL_TOKEN` with the values provided by the AccessFlow team.

**3. Use in your tests**

With **Playwright** (add the Playwright dependency to your project — see [Java documentation](./java/README.md#installation)):

```java
import com.acsbe.accessflow.AccessFlowSDK;
import com.microsoft.playwright.*;

// Set ACCESSFLOW_SDK_API_KEY in your environment
// SDK automatically uses it - no apiKey parameter needed

@Test
public void testAccessibility() {
    Page page = browser.newPage();
    AccessFlowSDK sdk = new AccessFlowSDK(page);

    page.navigate("https://example.com");

    Map<String, Object> audits = sdk.audit();
    // Audit data is automatically recorded; the final report is generated and uploaded in CI.
}
```

With **Selenium** (add `org.seleniumhq.selenium:selenium-java` to your `pom.xml` — see [Java documentation](./java/README.md#installation)):

```java
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;
import com.acsbe.accessflow.AccessFlowSDK;
import com.acsbe.accessflow.SeleniumDriver;

// Set ACCESSFLOW_SDK_API_KEY in your environment

WebDriver driver = new ChromeDriver();
driver.get("https://example.com");

AccessFlowSDK sdk = new AccessFlowSDK(new SeleniumDriver(driver));
Map<String, Object> audits = sdk.audit();
// Audit data is automatically recorded; the final report is generated and uploaded in CI.
// To inspect issue counts here, call sdk.generateReport(audits) — see "Optional: Inspecting results" above.
driver.quit();
```

> **Test framework support:** JUnit 5 and TestNG 7.6+ receive automatic report finalization via built-in listeners — no extra code needed. JUnit 4 requires a manual `AccessFlowTeardown.finalizeReports()` call in `@AfterClass`. See the [full Java docs](./java/README.md#framework-integration) for details.

[**Full Java Documentation →**](./java/README.md)

---

## How It Works

1. **Run your tests** - SDK audits pages as you test
2. **Collect results** - Audit data is recorded for each page
3. **Upload reports** - In CI/CD, reports automatically upload to AccessFlow Dashboard
4. **Review issues** - View detailed accessibility reports in your dashboard

## Optional: Inspecting results in the current test

You can use `generateReport(audits)` to get a structured summary of the **current** test’s audit data. This is optional — the dashboard report does not depend on it. Use it when you want to assert on or log issue counts inside the same test.

**JavaScript/TypeScript (Playwright):**

```typescript
const audits = await sdk.audit();
const report = await sdk.generateReport(audits);

// Assert or use the data in this test
expect(report.numberOfIssuesFound.extreme).toBe(0);
expect(report.numberOfIssuesFound.high).toBeLessThanOrEqual(5);
console.log('Issues by severity:', report.numberOfIssuesFound);
// report.ruleViolations gives per-rule details
```

**Python:**

```python
audits = sdk.audit()
report = sdk.generate_report(audits)

assert report["numberOfIssuesFound"].get("extreme", 0) == 0
print("Issues by severity:", report["numberOfIssuesFound"])
```

**Java:**

```java
Map<String, Object> audits = sdk.audit();
Map<String, Object> report = sdk.generateReport(audits);

Map<String, Object> counts = (Map<String, Object>) report.get("numberOfIssuesFound");
System.out.println("Issues by severity: " + counts);
// Use counts.get("extreme"), counts.get("high"), etc. for assertions
```

## CI/CD Requirements

### Ubuntu Version Compatibility

**Important:** If using GitHub Actions or other CI/CD with Ubuntu runners, use **Ubuntu 22.04** instead of `ubuntu-latest`:

```yaml
runs-on: ubuntu-22.04  # ✅ Recommended
# runs-on: ubuntu-latest  # ❌ Currently maps to Ubuntu 24.04 which has Playwright compatibility issues
```

Ubuntu 24.04 has a breaking change (`libasound2` → `libasound2t64`) that causes Playwright browser installation to fail. This will be resolved in future Playwright releases, but for now, stick with Ubuntu 22.04 for stability.

## SDK API Key Configuration

The SDK API Key authenticates your audit requests at runtime. This is separate from the Registry Install Token used during package installation.

### Option 1: Environment Variable (Recommended)

Set `ACCESSFLOW_SDK_API_KEY` in your environment. The SDK reads it automatically — no code changes needed.

**Local development:**

```bash
# .env file (use with dotenv)
ACCESSFLOW_SDK_API_KEY=your-api-key-here

# Or export in your shell
export ACCESSFLOW_SDK_API_KEY=your-api-key-here
```

**CI/CD (store as a secret):**

| Platform         | Where to set it                                          |
| ---------------- | -------------------------------------------------------- |
| GitHub Actions   | Repository Settings → Secrets → `ACCESSFLOW_SDK_API_KEY` |
| CircleCI         | Project Settings → Environment Variables                 |
| GitLab CI        | Project Settings → CI/CD → Variables                     |
| Jenkins          | Credentials → Secret Text                                |
| Azure Pipelines  | Pipeline Variables (secret)                              |
| Bitbucket        | Repository Settings → Pipeline Variables                 |

### Option 2: Programmatic Initialization

When you need to set the API key in code:

```typescript
// JavaScript/TypeScript - Initialize once before tests
import AccessFlowSDK from '@acsbe/accessflow-sdk';
AccessFlowSDK.init({ apiKey: process.env.ACCESSFLOW_SDK_API_KEY! });
```

```python
# Python - Pass to constructor
sdk = AccessFlowSDK(page, api_key='your-api-key')
```

```java
// Java - Pass to constructor
AccessFlowSDK sdk = new AccessFlowSDK(page, "your-api-key");
```

## Configuration

Configure thresholds to fail builds on accessibility issues. Create `accessflow.config.json` in your project root:

```json
{
  "issuesFoundThreshold": {
    "extreme": 0,
    "high": 5,
    "medium": 10,
    "low": 20
  },
  "localCheck": false
}
```

- **issuesFoundThreshold**: Maximum allowed issues per severity. If exceeded, the run fails (in CI, or locally when `localCheck` is true).
- **localCheck**: When `true`, thresholds are enforced in local development too; when `false` (default), thresholds apply only in CI.

## Final report and localCheck

- **Final report:** After all tests finish, the SDK aggregates recorded audits into one report, uploads it to the AccessFlow Dashboard in CI, and checks it against the configured thresholds. You do not need to call any extra method for this — teardown/listeners handle it. The report is a JSON object with:
  - **pages** — per-URL breakdown; each page has `numberOfIssuesFound` (severity counts) and `ruleViolations` (rule id → description, severity, selectors, `selectorData` with HTML/suggestionLabel/suggestionType, WCAG level/link, etc.).
  - **totalNumberOfIssuesFound** — aggregated severity counts across all pages.
  - **ciInfo** (in CI) — environment metadata.

  Example shape (abbreviated):

```json
{
  "pages": {
    "https://example.com/1": {
      "numberOfIssuesFound": { "extreme": 0, "high": 1, "medium": 1, "low": 0 },
      "ruleViolations": {
        "IMG_MISSING_ALT": {
          "description": "Images must have alternate text",
          "name": "Images must have alternate text",
          "severity": "high",
          "selectors": ["img.hero"],
          "selectorData": [{ "selector": "img.hero", "HTML": "<img src=\"/banner.png\">", "suggestionLabel": "Add alt text", "suggestionType": "addAttribute" }],
          "WCAGLevel": "A",
          "WCAGLink": "https://www.w3.org/TR/WCAG21/#text-alternatives"
        },
        "HEADING_ORDER": {
          "description": "Headings must be in order",
          "name": "Heading order",
          "severity": "medium",
          "selectors": ["h3:first-of-type"],
          "selectorData": [{ "selector": "h3:first-of-type", "HTML": "<h3>Section</h3>", "suggestionLabel": "Use h2 before h3", "suggestionType": "changeTag" }],
          "WCAGLevel": "A",
          "WCAGLink": "https://www.w3.org/TR/WCAG21/#info-and-relationships"
        }
      }
    },
    "https://example.com/2": {
      "numberOfIssuesFound": { "extreme": 0, "high": 1, "medium": 1, "low": 0 },
      "ruleViolations": {
        "LINK_EMPTY": {
          "description": "Links must have discernible text",
          "name": "Links must have discernible text",
          "severity": "high",
          "selectors": ["a.nav-link", "a[href='#']"],
          "selectorData": [
            { "selector": "a.nav-link", "HTML": "<a class=\"nav-link\" href=\"/about\"></a>", "suggestionLabel": "Add link text", "suggestionType": "addContent" },
            { "selector": "a[href='#']", "HTML": "<a href=\"#\"> </a>", "suggestionLabel": "Add link text", "suggestionType": "addContent" }
          ],
          "WCAGLevel": "A",
          "WCAGLink": "https://www.w3.org/TR/WCAG21/#link-purpose-in-context"
        },
        "CONTRAST_MINIMUM": {
          "description": "Text must meet minimum contrast ratio",
          "name": "Contrast (Minimum)",
          "severity": "medium",
          "selectors": [".muted"],
          "selectorData": [{ "selector": ".muted", "HTML": "<span class=\"muted\">Disclaimer</span>", "suggestionLabel": "Increase contrast", "suggestionType": "changeStyle" }],
          "WCAGLevel": "AA",
          "WCAGLink": "https://www.w3.org/TR/WCAG21/#contrast-minimum"
        }
      }
    }
  },
  "totalNumberOfIssuesFound": { "extreme": 0, "high": 2, "medium": 2, "low": 0 }
}
```

- **localCheck:** To fail local runs when thresholds are exceeded, set `"localCheck": true` in `accessflow.config.json`. Example for local development:

```json
{
  "issuesFoundThreshold": { "extreme": 0, "high": 5, "medium": 10, "low": 20 },
  "localCheck": true
}
```

With `localCheck: true`, running tests locally will exit with an error and print issue counts if the aggregated report exceeds the limits.

## Documentation

### Language-Specific Guides

- [JavaScript/TypeScript Documentation](./node/README.md)
- [Python Documentation](./python/README.md)
- [Java Documentation](./java/README.md)

## License

[ISC License](./LICENSE)

