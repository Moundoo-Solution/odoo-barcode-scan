# Chrome Web Store Listing Draft

Use this content when creating the listing for Chrome Web Store (and adapt for Edge Add-ons).

## Extension Name

Odoo Barcode Scanner

## Summary (Short Description)

Emulate USB barcode scanner input in Odoo and keep per-session scan history for quick re-scan.

## Description (Long)

Odoo Barcode Scanner helps Odoo developers and testers emulate a hardware barcode scanner directly in the browser.

### What it does

- Sends barcode values to the active Odoo tab as fast keyboard input (scanner-style) with optional Enter suffix.
- Stores scan history for the current browser session so you can quickly scan the same values again.
- Provides simple settings to keep the popup open or close it after successful scans.

### Typical use cases

- Test Odoo Barcode workflows without physical scanner hardware.
- Reproduce barcode edge cases in development and QA environments.
- Speed up regression tests by reusing recently scanned values.

### Privacy

- No analytics
- No remote API calls
- No data collection
- Session history is local to your browser session and cleared when the browser closes.

## Category

Developer Tools

## Single Purpose Statement

This extension has a single purpose: emulate barcode scanner input for Odoo barcode workflows in the active browser tab.

## Permissions Justification

- `activeTab`: required to interact with the currently selected Odoo tab.
- `scripting`: required to inject script and emulate scanner-like key events.
- `storage`: required to store user settings and temporary session scan history.
- host permissions (`http://*/*`, `https://*/*`): required so developers can test on localhost, staging, and production Odoo domains.

## Support URL

- https://github.com/Moundoo-Solution/odoo-barcode-scan

## Recommended Store Assets

- App icon: 128x128
- Small promo tile: 440x280 (optional but recommended)
- Screenshots: at least 3
  1. Popup with scan input + history
  2. Settings page
  3. Odoo barcode screen receiving simulated scan
