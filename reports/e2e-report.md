# Test Execution Summary

- **Application URL:** https://testautomationpractice.blogspot.com/
- **Execution Date/Time:** 2026-11-26T15:43:47.468Z
- **Browser Used:** Chromium
- **Total Test Cases:** 10
- **Passed:** 5
- **Failed:** 4
- **Skipped:** 1
- **Execution Duration:** 74.75 seconds (sum of test durations)

# Detailed Results

| Test Name | Description | Status | Execution Time | Error Details | Screenshot Path |
|---|---|---:|---:|---|---|
| testautomationpractice.spec.js › homepage loads with its expected title and primary heading | homepage loads with its expected title and primary heading | Pass | 11.83s | — | — |
| testautomationpractice.spec.js › primary practice navigation opens its linked page | primary practice navigation opens its linked page | Pass | 7.71s | — | — |
| testautomationpractice.spec.js › required name field rejects empty input and accepts a value | required name field rejects empty input and accepts a value | Pass | 4.59s | — | — |
| testautomationpractice.spec.js › email field rejects malformed email input | email field rejects malformed email input | Fail | 11.01s | Error: expect(locator).toHaveAttribute(expected) failed Locator: locator('#email') Expected: "email" Received: "text" Timeout: 5000ms Call log: - Expect "toHaveAttribute" locator('#email') with timeout 5000ms - waiting for locator('#email') 13 × locator resolved to <input id="email" type="text" maxlength="25" class="form-control" placeholder="Enter EMail"/> - unexpected value "text"  | test-results/testautomationpractice-ema-8daea-jects-malformed-email-input/attachments/failure-screenshot-fbf94082e823ecc29992c453f7cca08dc877f263.png |
| testautomationpractice.spec.js › Wikipedia search returns matching results | Wikipedia search returns matching results | Pass | 8.25s | — | — |
| testautomationpractice.spec.js › confirmation dialog handles cancellation and reports the outcome | confirmation dialog handles cancellation and reports the outcome | Pass | 4.99s | — | — |
| testautomationpractice.spec.js › layout fits a narrow mobile viewport without horizontal overflow | layout fits a narrow mobile viewport without horizontal overflow | Fail | 4.42s | Error: expect(received).toBeLessThanOrEqual(expected) Expected: <= 375 Received: 970 | test-results/testautomationpractice-lay-06fe5-without-horizontal-overflow/attachments/failure-screenshot-3025dab1b73641fd6f56b066b9008dce266356df.png |
| testautomationpractice.spec.js › key form controls have programmatically associated labels | key form controls have programmatically associated labels | Fail | 5.70s | Error: expect(received).toEqual(expected) // deep equality - Expected - 3 + Received + 3 Array [ - 1, - 1, - 1, + 0, + 0, + 0, ] | test-results/testautomationpractice-key-ae7db-matically-associated-labels/attachments/failure-screenshot-c388e5ec56f8cad2250d0b52bccc89a00115aaae.png |
| testautomationpractice.spec.js › page renders without browser console errors | page renders without browser console errors | Fail | 11.64s | Error: expect(received).toBe(expected) // Object.is equality Expected: 0 Received: 4 Call Log: - Timeout 5000ms exceeded while waiting on the predicate | test-results/testautomationpractice-pag-f32df-hout-browser-console-errors/attachments/failure-screenshot-754c2aa387bd4aa400fbfde9dd95db6a412517ab.png |
| testautomationpractice.spec.js › authentication workflow is available | authentication workflow is available | Skipped | 4.61s | — | — |

# Defects Identified

## Email field does not enforce email format

- **Severity:** Medium
- **Reproduction Steps:** Open the home page, enter "not-an-email" in the Email field, and inspect its native validity.
- **Expected Result:** Malformed email values are rejected by input validation.
- **Actual Result:** Email is a text input and accepts a malformed value as valid.

## Name, email, and phone inputs are not associated with their visible labels

- **Severity:** High
- **Reproduction Steps:** Inspect the Name, Email, and Phone fields with a screen reader or query their associated labels.
- **Expected Result:** Each form field exposes its visible label as its accessible name.
- **Actual Result:** The label `for` values do not match the corresponding input IDs.

## Stylesheet resource is served with an unsupported MIME type

- **Severity:** Medium
- **Reproduction Steps:** Load the homepage and inspect browser console/network errors.
- **Expected Result:** Stylesheets load with a CSS MIME type and no browser console errors.
- **Actual Result:** The demos/style.css resource is refused because the response MIME type is text/html.

## Page content overflows a 375px mobile viewport horizontally

- **Severity:** Medium
- **Reproduction Steps:** Open the homepage at 375×812 and compare document scroll width with viewport width.
- **Expected Result:** The page fits the viewport without horizontal scrolling.
- **Actual Result:** The document scroll width exceeds the viewport width.

# Console Errors

- Refused to apply style from 'https://testautomationpractice.blogspot.com/resources/demos/style.css' because its MIME type ('text/html') is not a supported stylesheet MIME type, and strict MIME checking is enabled. (observed 36 time(s))

## Console Warnings

- No browser console warnings were captured.

# Network Issues

- Failed request: GET https://testautomationpractice.blogspot.com/resources/demos/style.css — net::ERR_ABORTED (observed 36 time(s))

# Accessibility Findings

- **WCAG 2.2 A, 1.3.1 Info and Relationships / 4.1.2 Name, Role, Value:** visible labels for Name, Email, and Phone are not programmatically associated with their inputs; assistive technology may not announce the labels.
- Automated checks covered the primary heading, control labels, and narrow-screen layout only; this is not a full WCAG conformance audit.

# Recommendations

- Use `type="email"` and provide clear inline validation feedback for malformed email values.
- Correct every label `for` attribute so it matches its input ID; verify accessible names with a screen reader.
- Serve `resources/demos/style.css` with `text/css` and confirm the resource URL returns a stylesheet rather than HTML.
- Recheck small-screen layout at 320px, 375px, and 414px widths after addressing any measured overflow.
- No authentication form was found, so authentication testing was skipped rather than inferred.
