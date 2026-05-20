# Odoo Barcode Scan Extension

Chrome/Edge extension that emulates a USB barcode scanner on Odoo Barcode pages. Scan history is saved on your device (`chrome.storage.local`) so you can resend recent codes after restarting the browser; use **Clear history** in the popup when you want to wipe the list.

GitHub repository: https://github.com/Moundoo-Solution/odoo-barcode-scan

## Project Structure

```text
odoo-barcode-scan/
  src/                  # Extension source (load this folder in dev)
    manifest.json
    background.js
    content.js
    popup.{html,css,js}
    settings.{html,css,js}
    icons/
```

## Development

1. Open Edge/Chrome extension page:
   - Edge: `edge://extensions`
   - Chrome: `chrome://extensions`
2. Enable **Developer mode**
3. Click **Load unpacked**
4. Select the `src` folder

## Package for Store (No npm)

Create a zip that contains the contents of `src/` (not the parent folder):

1. Open `src/`
2. Select all files/folders inside `src/`
3. Compress to zip (for example: `odoo-barcode-scan-extension.zip`)
4. Upload that zip to Chrome Web Store / Edge Add-ons

## Store Publishing Docs

- `PRIVACY.md`: privacy policy text
- `STORE_LISTING.md`: ready-to-use listing copy
- `SUBMISSION_CHECKLIST.md`: pre-submit and review checklist
