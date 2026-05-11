/**
 * Mimics a wedge scanner: fast key stream + Enter.
 * Odoo Barcode listens on window/document for barcode-shaped input.
 */
(function () {
  if (globalThis.__ODOO_BARCODE_SESSION_EXT__) {
    return;
  }
  globalThis.__ODOO_BARCODE_SESSION_EXT__ = true;

  function sleep(ms) {
    return new Promise((r) => setTimeout(r, ms));
  }

  function isEditable(el) {
    if (!el || el === document.body) return false;
    const tag = el.tagName;
    if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true;
    if (el.isContentEditable) return true;
    return false;
  }

  function findBarcodeInput() {
    const candidates = [
      document.querySelector("input.o_barcode_client_action"),
      document.querySelector(".o_barcode_client_action input"),
      document.querySelector(".o_barcode_client input[type='text']"),
      document.querySelector(".o_barcode_client input[type='search']"),
      document.querySelector(".o_barcode_client input:not([type='checkbox'])"),
      document.querySelector("[name='barcode']"),
      document.querySelector("input.o_field_char"),
      document.activeElement,
    ];
    for (const el of candidates) {
      if (el && el.tagName === "INPUT" && !el.disabled && !el.readOnly) {
        return el;
      }
    }
    return null;
  }

  function dispatchKey(target, type, init) {
    const ev = new KeyboardEvent(type, {
      bubbles: true,
      cancelable: true,
      ...init,
    });
    target.dispatchEvent(ev);
  }

  async function simulateScan(text, options) {
    const interKeyMs = options?.interKeyMs ?? 12;
    const suffixEnter = options?.suffixEnter !== false;

    const target =
      findBarcodeInput() ||
      (isEditable(document.activeElement) ? document.activeElement : null) ||
      document.body;

    target.focus?.();

    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      const code =
        ch.length === 1
          ? /^[a-z]$/i.test(ch)
            ? `Key${ch.toUpperCase()}`
            : ch >= "0" && ch <= "9"
              ? `Digit${ch}`
              : ch === " "
                ? "Space"
                : ""
          : "";

      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") {
        const start = target.selectionStart ?? target.value.length;
        const end = target.selectionEnd ?? target.value.length;
        const before = target.value.slice(0, start);
        const after = target.value.slice(end);
        target.value = before + ch + after;
        const pos = start + 1;
        target.setSelectionRange?.(pos, pos);
        target.dispatchEvent(new Event("input", { bubbles: true }));
      }

      dispatchKey(target, "keydown", { key: ch, code: code || undefined, keyCode: ch.charCodeAt(0) });
      dispatchKey(target, "keypress", { key: ch, code: code || undefined, charCode: ch.charCodeAt(0) });
      dispatchKey(target, "keyup", { key: ch, code: code || undefined, keyCode: ch.charCodeAt(0) });

      await sleep(interKeyMs);
    }

    if (suffixEnter) {
      dispatchKey(target, "keydown", { key: "Enter", code: "Enter", keyCode: 13 });
      dispatchKey(target, "keyup", { key: "Enter", code: "Enter", keyCode: 13 });
    }
  }

  chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
    if (msg?.type === "simulateBarcode") {
      simulateScan(String(msg.text || ""), msg.options || {})
        .then(() => sendResponse({ ok: true }))
        .catch((e) => sendResponse({ ok: false, error: String(e?.message || e) }));
      return true;
    }
    return false;
  });
})();
