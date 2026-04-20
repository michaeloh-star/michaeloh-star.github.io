import { expect, test } from '@playwright/test';
import AccessFlowSDK from '@acsbe/accessflow-sdk';

AccessFlowSDK.init({ apiKey: 'flow-1rq5UHuYYBMs6aeYk2A000rTbfhJt0E1ns' });

const pagesToAudit = ['/index.html', '/about.html', '/products.html'];

for (const route of pagesToAudit) {
  test(`runs accessFlow audit for ${route}`, async ({ page }) => {
    const sdk = new AccessFlowSDK(page);

    await page.goto(route, { waitUntil: 'domcontentloaded' });

    const audits = await sdk.audit();
    const report = await sdk.generateReport(audits);

    expect(report).toBeTruthy();
    expect(report.numberOfIssuesFound).toBeTruthy();
  });
}
