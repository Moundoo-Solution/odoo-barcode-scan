# Submission Checklist

## Pre-submit

- [ ] Extension works from `src/` via Load unpacked.
- [ ] Zip package is created from the contents of `src/` (not the parent folder).
- [ ] Version in `src/manifest.json` is updated.
- [ ] Icons (16/48/128 png) are present and render correctly.
- [ ] Privacy policy is reviewed (`PRIVACY.md`).
- [ ] No console errors in popup/settings/content script during normal usage.

## Store Listing

- [ ] Name and short description are filled.
- [ ] Long description explains single purpose (Odoo barcode scan emulation).
- [ ] Category set to Developer Tools.
- [ ] At least 3 screenshots uploaded.
- [ ] Support URL added.
- [ ] Privacy practices answered consistently with `PRIVACY.md`.

## Permissions Review Readiness

- [ ] Justification for `activeTab`, `scripting`, `storage` is prepared.
- [ ] Justification for host permissions is clear (localhost/staging/production Odoo).
- [ ] Description clearly states no data is collected or sent externally.

## Publish

- [ ] Upload the prepared extension zip.
- [ ] Save draft and verify listing preview.
- [ ] Submit for review.

## If Rejected

- [ ] Read reviewer note carefully and map it to permission/description mismatch.
- [ ] Update manifest/listing copy/screenshots accordingly.
- [ ] Increase manifest version before re-submit.
