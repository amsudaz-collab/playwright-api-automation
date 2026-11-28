const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const jsonPath = path.join(root, 'e2e-report', 'results.json');
const markdownPath = path.join(root, 'reports', 'e2e-report.md');
const htmlPath = path.join(root, 'reports', 'e2e-summary.html');
const stripAnsi = (value) => String(value).replace(/\u001B\[[0-?]*[ -/]*[@-~]/g, '');

if (!fs.existsSync(jsonPath)) {
  throw new Error(`Playwright JSON results not found: ${jsonPath}. Run npm run test:e2e first.`);
}

const report = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
const testCases = [];
const telemetryEntries = [];

function visitSuites(suites, ancestors = []) {
  for (const suite of suites || []) {
    const parents = suite.title ? [...ancestors, suite.title] : ancestors;
    for (const spec of suite.specs || []) {
      for (const test of spec.tests || []) {
        const result = test.results?.[test.results.length - 1] || {};
        const telemetryAttachment = (result.attachments || []).find(
          (attachment) => attachment.name === 'e2e-telemetry.json',
        );
        let telemetry = {};
        if (telemetryAttachment?.body) {
          try {
            telemetry = JSON.parse(Buffer.from(telemetryAttachment.body, 'base64').toString('utf8'));
          } catch (error) {
            telemetry = { parseError: error.message };
          }
        }
        telemetryEntries.push(telemetry);
        testCases.push({
          name: [...parents, spec.title].filter(Boolean).join(' › '),
          description: spec.title,
          status: result.status || (test.expectedStatus === 'skipped' ? 'skipped' : 'unknown'),
          duration: result.duration || 0,
          error: stripAnsi(result.error?.message || result.errors?.map((item) => item.message).join('\n') || ''),
          attachments: result.attachments || [],
          telemetry,
        });
      }
    }
    visitSuites(suite.suites, parents);
  }
}

visitSuites(report.suites);

const counts = {
  total: testCases.length,
  passed: testCases.filter((item) => item.status === 'passed').length,
  failed: testCases.filter((item) => ['failed', 'timedOut', 'interrupted'].includes(item.status)).length,
  skipped: testCases.filter((item) => ['skipped', 'expected'].includes(item.status)).length,
};
const duration = testCases.reduce((sum, item) => sum + item.duration, 0);
const executionDate = report.config?.metadata?.executionDate || report.startedAt || new Date().toISOString();
const browser = report.config?.projects?.[0]?.use?.browserName || 'Chromium';

const uniqueMessages = (values) => {
  const countsByValue = new Map();
  for (const value of values.filter(Boolean)) countsByValue.set(value, (countsByValue.get(value) || 0) + 1);
  return [...countsByValue].map(([value, count]) => ({ value, count }));
};
const consoleErrors = uniqueMessages(telemetryEntries.flatMap((item) => item.consoleErrors || []));
const consoleWarnings = uniqueMessages(telemetryEntries.flatMap((item) => item.consoleWarnings || []));
const pageErrors = uniqueMessages(telemetryEntries.flatMap((item) => item.pageErrors || []));
const requestFailures = uniqueMessages(telemetryEntries.flatMap((item) =>
  (item.requestFailures || []).map((failure) => `${failure.method} ${failure.url} — ${failure.error}`),
));
const badResponses = uniqueMessages(telemetryEntries.flatMap((item) =>
  (item.badResponses || []).map((response) => `${response.method} ${response.url} — HTTP ${response.status}`),
));

function screenshotPath(item) {
  const attachment = item.attachments.find((entry) => entry.name === 'failure-screenshot');
  if (!attachment) return '—';
  return attachment.path ? path.relative(root, attachment.path).replace(/\\/g, '/') : 'Attached in Playwright report';
}

function statusLabel(status) {
  return status === 'passed' ? 'Pass' : ['failed', 'timedOut', 'interrupted'].includes(status) ? 'Fail' : 'Skipped';
}

const defectRows = [];
if (testCases.some((item) => item.name.includes('email field') && item.status !== 'passed')) {
  defectRows.push({
    severity: 'Medium',
    issue: 'Email field does not enforce email format',
    steps: 'Open the home page, enter "not-an-email" in the Email field, and inspect its native validity.',
    expected: 'Malformed email values are rejected by input validation.',
    actual: 'Email is a text input and accepts a malformed value as valid.',
  });
}
if (testCases.some((item) => item.name.includes('programmatically associated labels') && item.status !== 'passed')) {
  defectRows.push({
    severity: 'High',
    issue: 'Name, email, and phone inputs are not associated with their visible labels',
    steps: 'Inspect the Name, Email, and Phone fields with a screen reader or query their associated labels.',
    expected: 'Each form field exposes its visible label as its accessible name.',
    actual: 'The label `for` values do not match the corresponding input IDs.',
  });
}
if (testCases.some((item) => item.name.includes('console errors') && item.status !== 'passed')) {
  defectRows.push({
    severity: 'Medium',
    issue: 'Stylesheet resource is served with an unsupported MIME type',
    steps: 'Load the homepage and inspect browser console/network errors.',
    expected: 'Stylesheets load with a CSS MIME type and no browser console errors.',
    actual: 'The demos/style.css resource is refused because the response MIME type is text/html.',
  });
}
if (testCases.some((item) => item.name.includes('mobile viewport') && item.status !== 'passed')) {
  defectRows.push({
    severity: 'Medium',
    issue: 'Page content overflows a 375px mobile viewport horizontally',
    steps: 'Open the homepage at 375×812 and compare document scroll width with viewport width.',
    expected: 'The page fits the viewport without horizontal scrolling.',
    actual: 'The document scroll width exceeds the viewport width.',
  });
}

const recommendations = [
  'Use `type="email"` and provide clear inline validation feedback for malformed email values.',
  'Correct every label `for` attribute so it matches its input ID; verify accessible names with a screen reader.',
  'Serve `resources/demos/style.css` with `text/css` and confirm the resource URL returns a stylesheet rather than HTML.',
  'Recheck small-screen layout at 320px, 375px, and 414px widths after addressing any measured overflow.',
  'No authentication form was found, so authentication testing was skipped rather than inferred.',
];

const lines = [
  '# Test Execution Summary',
  '',
  `- **Application URL:** https://testautomationpractice.blogspot.com/`,
  `- **Execution Date/Time:** ${executionDate}`,
  `- **Browser Used:** ${browser}`,
  `- **Total Test Cases:** ${counts.total}`,
  `- **Passed:** ${counts.passed}`,
  `- **Failed:** ${counts.failed}`,
  `- **Skipped:** ${counts.skipped}`,
  `- **Execution Duration:** ${(duration / 1000).toFixed(2)} seconds (sum of test durations)`,
  '',
  '# Detailed Results',
  '',
  '| Test Name | Description | Status | Execution Time | Error Details | Screenshot Path |',
  '|---|---|---:|---:|---|---|',
];

for (const item of testCases) {
  const error = item.error ? item.error.replace(/\s+/g, ' ').replace(/\|/g, '\\|') : '—';
  lines.push(`| ${item.name} | ${item.description} | ${statusLabel(item.status)} | ${(item.duration / 1000).toFixed(2)}s | ${error} | ${screenshotPath(item)} |`);
}

lines.push('', '# Defects Identified', '');
if (defectRows.length === 0) lines.push('No test-backed defects were identified.');
for (const defect of defectRows) {
  lines.push(`## ${defect.issue}`, '', `- **Severity:** ${defect.severity}`, `- **Reproduction Steps:** ${defect.steps}`, `- **Expected Result:** ${defect.expected}`, `- **Actual Result:** ${defect.actual}`, '');
}

lines.push('# Console Errors', '');
for (const entry of consoleErrors) lines.push(`- ${entry.value} (observed ${entry.count} time(s))`);
for (const entry of pageErrors) lines.push(`- Page exception: ${entry.value} (observed ${entry.count} time(s))`);
if (!consoleErrors.length && !pageErrors.length) lines.push('- No console errors or page exceptions were captured.');
lines.push('', '## Console Warnings', '');
for (const entry of consoleWarnings) lines.push(`- ${entry.value} (observed ${entry.count} time(s))`);
if (!consoleWarnings.length) lines.push('- No browser console warnings were captured.');

lines.push('', '# Network Issues', '');
for (const entry of requestFailures) lines.push(`- Failed request: ${entry.value} (observed ${entry.count} time(s))`);
for (const entry of badResponses) lines.push(`- Non-2xx response: ${entry.value} (observed ${entry.count} time(s))`);
if (!requestFailures.length && !badResponses.length) lines.push('- No failed requests or HTTP responses >= 400 were captured.');

lines.push('', '# Accessibility Findings', '');
if (defectRows.some((item) => item.issue.includes('labels'))) {
  lines.push('- **WCAG 2.2 A, 1.3.1 Info and Relationships / 4.1.2 Name, Role, Value:** visible labels for Name, Email, and Phone are not programmatically associated with their inputs; assistive technology may not announce the labels.');
}
lines.push('- Automated checks covered the primary heading, control labels, and narrow-screen layout only; this is not a full WCAG conformance audit.');

lines.push('', '# Recommendations', '');
for (const recommendation of recommendations) lines.push(`- ${recommendation}`);

fs.mkdirSync(path.dirname(markdownPath), { recursive: true });
fs.writeFileSync(markdownPath, `${lines.join('\n')}\n`, 'utf8');

const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (char) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
}[char]));
const statusClass = (status) => status === 'passed' ? 'pass' : ['failed', 'timedOut', 'interrupted'].includes(status) ? 'fail' : 'skip';
const testRows = testCases.map((item) => `<tr><td>${escapeHtml(item.name)}</td><td>${escapeHtml(item.description)}</td><td class="${statusClass(item.status)}">${statusLabel(item.status)}</td><td>${(item.duration / 1000).toFixed(2)}s</td><td>${escapeHtml(item.error || '—')}</td><td>${escapeHtml(screenshotPath(item))}</td></tr>`).join('\n');
const defectList = defectRows.map((item) => `<li><strong>${escapeHtml(item.severity)} — ${escapeHtml(item.issue)}</strong><p>Steps: ${escapeHtml(item.steps)}</p><p>Expected: ${escapeHtml(item.expected)}</p><p>Actual: ${escapeHtml(item.actual)}</p></li>`).join('\n') || '<li>No test-backed defects were identified.</li>';
const listItems = (items) => items.map((item) => `<li>${escapeHtml(item.value)} <small>(observed ${item.count} time(s))</small></li>`).join('\n') || '<li>None captured.</li>';
const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Playwright E2E Summary</title><style>
body{font:15px/1.5 system-ui,sans-serif;max-width:1200px;margin:2rem auto;padding:0 1rem;color:#1f2937}
h1,h2{color:#111827}.summary{display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:.75rem}
.card{background:#f3f4f6;padding:1rem;border-radius:.5rem}.card strong{display:block;font-size:1.4rem}
table{width:100%;border-collapse:collapse;font-size:.9rem}th,td{text-align:left;padding:.6rem;border-bottom:1px solid #d1d5db;vertical-align:top}
.pass{color:#087443}.fail{color:#b42318}.skip{color:#6b7280}li{margin:.5rem 0}code{overflow-wrap:anywhere}
</style></head><body>
<h1>Playwright E2E Test Summary</h1><p><strong>Application:</strong> <a href="https://testautomationpractice.blogspot.com/">https://testautomationpractice.blogspot.com/</a><br>
<strong>Executed:</strong> ${escapeHtml(executionDate)} · <strong>Browser:</strong> ${escapeHtml(browser)}</p>
<section class="summary">
<div class="card">Total<strong>${counts.total}</strong></div><div class="card">Passed<strong>${counts.passed}</strong></div>
<div class="card">Failed<strong>${counts.failed}</strong></div><div class="card">Skipped<strong>${counts.skipped}</strong></div>
<div class="card">Duration<strong>${(duration / 1000).toFixed(2)}s</strong></div></section>
<h2>Detailed Results</h2><table><thead><tr><th>Test</th><th>Description</th><th>Status</th><th>Time</th><th>Error</th><th>Screenshot</th></tr></thead><tbody>${testRows}</tbody></table>
<h2>Defects Identified</h2><ul>${defectList}</ul>
<h2>Console Errors</h2><ul>${listItems(consoleErrors.concat(pageErrors))}</ul>
<h2>Console Warnings</h2><ul>${listItems(consoleWarnings)}</ul>
<h2>Network Issues</h2><ul>${listItems(requestFailures.concat(badResponses))}</ul>
<h2>Accessibility Findings</h2><p>${defectRows.some((item) => item.issue.includes('labels')) ? 'WCAG 2.2 A: form labels are not programmatically associated with their inputs (1.3.1 Info and Relationships; 4.1.2 Name, Role, Value).' : 'No label association issue detected by this run.'} Automated checks are not a full WCAG conformance audit.</p>
<h2>Recommendations</h2><ul>${recommendations.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>
</body></html>`;
fs.writeFileSync(htmlPath, html, 'utf8');
console.log(`Reports written:\n- ${markdownPath}\n- ${htmlPath}`);
