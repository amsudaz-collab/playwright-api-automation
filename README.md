# Playwright end-to-end checks

The browser suite in `tests/e2e/testautomationpractice.spec.js` exercises
`https://testautomationpractice.blogspot.com/` using Chromium.

Run the tests and generate the requested reports (the reporting command should
still be run when test assertions fail, because those failures are findings):

```powershell
npm run test:e2e; npm run report:e2e
```

Outputs:

- Markdown report: `reports/e2e-report.md`
- HTML summary: `reports/e2e-summary.html`
- Playwright HTML report and JSON results: `e2e-report/`
- Failure screenshots and per-test artifacts: `test-results/`

The authentication test is skipped when no login form is available. The suite
captures console messages, page errors, failed requests, HTTP error responses,
execution times, and failure screenshots.