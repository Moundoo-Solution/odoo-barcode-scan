const HISTORY_KEY = "scanHistory";
const CLOSE_POPUP_AFTER_SCAN_KEY = "closePopupAfterScan";

const el = {
  code: document.getElementById("code"),
  send: document.getElementById("send"),
  noEnter: document.getElementById("noEnter"),
  status: document.getElementById("status"),
  list: document.getElementById("list"),
  clear: document.getElementById("clear"),
  openSettings: document.getElementById("open-settings"),
};

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
  chrome.storage.session.get([HISTORY_KEY], (data) => {
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
el.clear.addEventListener("click", () => {
  chrome.storage.session.remove([HISTORY_KEY], loadHistory);
});

el.openSettings.addEventListener("click", () => {
  chrome.runtime.openOptionsPage();
});

loadHistory();
el.code.focus();
