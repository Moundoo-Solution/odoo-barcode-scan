# Privacy Policy

Last updated: 2026-05-11

## Overview

Odoo Barcode Scanner is a browser extension used to emulate barcode scanner input on Odoo pages for development and testing workflows.

## Data Collection

This extension does **not** collect, transmit, sell, or share personal data with the developer or any third party.

## Data Storage

The extension stores limited local data inside your browser:

- **Session scan history** (`chrome.storage.session`): scanned barcode values during the current browser session only. This data is cleared when the browser is closed.
- **User preferences** (`chrome.storage.local`): extension settings such as whether the popup auto-closes after scanning.

This data stays on the user's device and is not sent to external servers.

## Network Access

The extension does not call external APIs or remote servers.

## Permissions

- `activeTab`: interact with the currently active tab when the user clicks the extension.
- `scripting`: inject the content script when needed to emulate scan input.
- `storage`: save local settings and session history.
- host permissions (`http://*/*`, `https://*/*`): enable operation on Odoo pages hosted on local/staging/production domains selected by the user.

## Contact

If you have privacy questions, contact the publisher email configured in the extension store listing or open an issue on:

- https://github.com/Moundoo-Solution/odoo-barcode-scan
