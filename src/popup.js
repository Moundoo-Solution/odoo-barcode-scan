const HISTORY_KEY = "scanHistory";
const CLOSE_POPUP_AFTER_SCAN_KEY = "closePopupAfterScan";
const BARCODE_TYPE_KEY = "preferredBarcodeType";

/** @type {Record<string, { label: string, format: string, placeholder: string, odooNote: string, validate: (text: string) => boolean, encode: (text: string) => string | null }>} */
const BARCODE_TYPES = {
  code128: {
    label: "Code 128",
    format: "CODE128",
    placeholder: "e.g. WH-STOCK-001",
    odooNote:
      "Odoo: warehouse locations, packages, pickings, internal references, and most Inventory/Barcode labels. Default choice for logistics.",
    validate(text) {
      return text.length > 0 && /^[\x20-\x7E]+$/.test(text);
    },
    encode(text) {
      return text;
    },
  },
  ean13: {
    label: "EAN-13",
    format: "EAN13",
    placeholder: "e.g. 5901234123457 (12 or 13 digits)",
    odooNote:
      "Odoo: product barcode on product form, POS, and sales catalog (GTIN). Use 12 digits (checksum auto) or 13 digits with valid check digit.",
    validate(text) {
      const d = digitsOnly(text);
      if (d.length === 12) return true;
      if (d.length === 13) return eanChecksumValid(d);
      return false;
    },
    encode(text) {
      const d = digitsOnly(text);
      if (d.length === 12 || (d.length === 13 && eanChecksumValid(d))) return d;
      return null;
    },
  },
  ean8: {
    label: "EAN-8",
    format: "EAN8",
    placeholder: "e.g. 9638507 (7 or 8 digits)",
    odooNote: "Odoo: small retail products where a short GTIN is used (less common than EAN-13).",
    validate(text) {
      const d = digitsOnly(text);
      if (d.length === 7) return true;
      if (d.length === 8) return ean8ChecksumValid(d);
      return false;
    },
    encode(text) {
      const d = digitsOnly(text);
      if (d.length === 7 || (d.length === 8 && ean8ChecksumValid(d))) return d;
      return null;
    },
  },
  code39: {
    label: "Code 39",
    format: "CODE39",
    placeholder: "e.g. LOT-001",
    odooNote:
      "Odoo: legacy or custom printed labels, some internal lot/serial stickers. Charset: A–Z, 0–9, and - . $ / + % space.",
    validate(text) {
      return text.length > 0 && /^[0-9A-Z\-. $/+%]+$/i.test(text);
    },
    encode(text) {
      return text.toUpperCase();
    },
  },
  gs1128: {
    label: "GS1-128",
    format: "CODE128",
    placeholder: "e.g. (01)09501101530006",
    odooNote:
      "Odoo: GS1 logistics (SSCC, GTIN, batch/expiry application identifiers) on stock moves and traceability. Encoded as Code 128; preview uses the text you enter.",
    validate(text) {
      return text.length > 0 && /^[\x20-\x7E]+$/.test(text);
    },
    encode(text) {
      return text;
    },
  },
  qr: {
    label: "QR Code",
    format: "QRCODE",
    placeholder: "e.g. SN-2024-00042",
    odooNote:
      "Odoo: serial numbers, URLs, or dense traceability on worksheets and custom reports (when QR is configured on labels).",
    validate(text) {
      return text.length > 0 && text.length <= 800;
    },
    encode(text) {
      return text;
    },
  },
};

const el = {
  code: document.getElementById("code"),
  send: document.getElementById("send"),
  noEnter: document.getElementById("noEnter"),
  status: document.getElementById("status"),
  list: document.getElementById("list"),
  clear: document.getElementById("clear"),
  openSettings: document.getElementById("open-settings"),
  barcodeType: document.getElementById("barcode-type"),
  previewPanel: document.getElementById("preview-panel"),
  previewSvg: document.getElementById("barcode-preview"),
  qrPreview: document.getElementById("qr-preview"),
  typeNote: document.getElementById("type-note"),
};

function digitsOnly(text) {
  return text.replace(/\D/g, "");
}

/** EAN-13 / EAN-8 check digit (body excludes check digit). */
function eanChecksumValid(digits) {
  const body = digits.slice(0, -1);
  const check = Number(digits[digits.length - 1]);
  if (!/^\d+$/.test(body) || Number.isNaN(check)) return false;
  let sum = 0;
  for (let i = body.length - 1; i >= 0; i--) {
    const posFromRight = body.length - i;
    sum += Number(body[i]) * (posFromRight % 2 === 1 ? 3 : 1);
  }
  return (10 - (sum % 10)) % 10 === check;
}

function ean8ChecksumValid(digits) {
  return digits.length === 8 && eanChecksumValid(digits);
}

function getTypeConfig() {
  const key = el.barcodeType.value;
  return BARCODE_TYPES[key] || BARCODE_TYPES.code128;
}

function clearPreview() {
  el.previewPanel.hidden = true;
  el.previewSvg.hidden = false;
  el.qrPreview.hidden = true;
  while (el.previewSvg.firstChild) {
    el.previewSvg.removeChild(el.previewSvg.firstChild);
  }
  el.previewSvg.removeAttribute("viewBox");
  el.previewSvg.removeAttribute("width");
  el.previewSvg.removeAttribute("height");
  el.qrPreview.innerHTML = "";
}

function renderQrPreview(text) {
  el.previewSvg.hidden = true;
  el.qrPreview.hidden = false;
  el.qrPreview.innerHTML = "";
  new QRCode(el.qrPreview, {
    text,
    width: 112,
    height: 112,
    correctLevel: QRCode.CorrectLevel.M,
  });
  el.previewPanel.hidden = false;
}

function renderLinearPreview(cfg, payload) {
  el.qrPreview.hidden = true;
  el.previewSvg.hidden = false;
  JsBarcode(el.previewSvg, payload, {
    format: cfg.format,
    displayValue: true,
    fontSize: 11,
    height: 44,
    width: 1.4,
    margin: 6,
    lineColor: "#1a1a1a",
    background: "#ffffff",
  });
  el.previewPanel.hidden = false;
}

function renderPreview() {
  const cfg = getTypeConfig();
  el.typeNote.textContent = cfg.odooNote;
  el.code.placeholder = cfg.placeholder;

  const raw = el.code.value;
  const text = raw.trim();
  if (!text || !cfg.validate(text)) {
    clearPreview();
    return;
  }
  const payload = cfg.encode(text);
  if (!payload) {
    clearPreview();
    return;
  }
  try {
    clearPreview();
    if (cfg.format === "QRCODE") {
      renderQrPreview(payload);
    } else {
      renderLinearPreview(cfg, payload);
    }
  } catch {
    clearPreview();
  }
}

function populateTypeSelect(selected) {
  el.barcodeType.innerHTML = "";
  for (const [key, cfg] of Object.entries(BARCODE_TYPES)) {
    const opt = document.createElement("option");
    opt.value = key;
    opt.textContent = cfg.label;
    el.barcodeType.appendChild(opt);
  }
  if (selected && BARCODE_TYPES[selected]) {
    el.barcodeType.value = selected;
  }
  renderPreview();
}

function loadBarcodeTypePreference() {
  chrome.storage.local.get({ [BARCODE_TYPE_KEY]: "code128" }, (data) => {
    const key = data[BARCODE_TYPE_KEY];
    populateTypeSelect(BARCODE_TYPES[key] ? key : "code128");
  });
}

function saveBarcodeTypePreference() {
  chrome.storage.local.set({ [BARCODE_TYPE_KEY]: el.barcodeType.value });
}

function setStatus(text, ok) {
  el.status.textContent = text || "";
  el.status.classList.toggle("ok", Boolean(ok && text));
}

async function getActiveTabId() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab?.id;
}

async function sendToActiveTab(message) {
  const tabId = await getActiveTabId();
  if (!tabId) {
    throw new Error("No active tab found.");
  }
  try {
    return await chrome.tabs.sendMessage(tabId, message);
  } catch {
    await chrome.scripting.executeScript({ target: { tabId }, files: ["content.js"] });
    return await chrome.tabs.sendMessage(tabId, message);
  }
}

async function injectAndScan(text, options) {
  const res = await sendToActiveTab({ type: "simulateBarcode", text, options });
  if (!res?.ok) {
    throw new Error(res?.error || "Send failed (open an Odoo page over http or https).");
  }
}

function loadHistory() {
  chrome.storage.local.get([HISTORY_KEY], (data) => {
    const items = Array.isArray(data[HISTORY_KEY]) ? data[HISTORY_KEY] : [];
    el.list.innerHTML = "";
    for (const item of items) {
      const li = document.createElement("li");
      const span = document.createElement("span");
      span.textContent = item;
      const btn = document.createElement("button");
      btn.type = "button";
      btn.textContent = "Scan again";
      btn.addEventListener("click", () => onScan(item));
      li.append(span, btn);
      el.list.appendChild(li);
    }
  });
}

function pushHistory(code) {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage({ type: "appendHistory", code }, () => {
      loadHistory();
      resolve();
    });
  });
}

async function onScan(text) {
  const raw = typeof text === "string" ? text : el.code.value;
  const code = raw.trim();
  if (!code) {
    setStatus("Enter a code before sending.");
    return;
  }
  setStatus("");
  try {
    await injectAndScan(code, { suffixEnter: !el.noEnter.checked });
    await pushHistory(code);
    setStatus("Sent to the Odoo tab.", true);
    chrome.storage.local.get({ [CLOSE_POPUP_AFTER_SCAN_KEY]: false }, (prefs) => {
      if (prefs[CLOSE_POPUP_AFTER_SCAN_KEY]) {
        window.close();
      }
    });
  } catch (e) {
    setStatus(e.message || String(e));
  }
}

el.send.addEventListener("click", () => onScan());
el.code.addEventListener("keydown", (ev) => {
  if (ev.key === "Enter") {
    ev.preventDefault();
    onScan();
  }
});
el.code.addEventListener("input", renderPreview);
el.barcodeType.addEventListener("change", () => {
  saveBarcodeTypePreference();
  renderPreview();
});
el.clear.addEventListener("click", () => {
  chrome.storage.local.remove([HISTORY_KEY], loadHistory);
});

el.openSettings.addEventListener("click", () => {
  chrome.runtime.openOptionsPage();
});

loadHistory();
loadBarcodeTypePreference();
el.code.focus();
