const HISTORY_KEY = "scanHistory";
const MAX_ITEMS = 100;

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type !== "appendHistory") {
    return;
  }
  const code = typeof message.code === "string" ? message.code : "";
  if (!code) {
    sendResponse({ ok: false });
    return;
  }
  chrome.storage.session.get([HISTORY_KEY], (data) => {
    const prev = Array.isArray(data[HISTORY_KEY]) ? data[HISTORY_KEY] : [];
    const next = [code, ...prev.filter((c) => c !== code)].slice(0, MAX_ITEMS);
    chrome.storage.session.set({ [HISTORY_KEY]: next }, () => {
      sendResponse({ ok: true, history: next });
    });
  });
  return true;
});
