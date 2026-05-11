const CLOSE_POPUP_KEY = "closePopupAfterScan";

function getRadios() {
  return document.querySelectorAll('input[name="afterScan"]');
}

let savedHideTimer;

function showSaved() {
  const elSaved = document.getElementById("saved");
  elSaved.textContent = "Saved.";
  clearTimeout(savedHideTimer);
  savedHideTimer = setTimeout(() => {
    elSaved.textContent = "";
  }, 1600);
}

function load() {
  chrome.storage.local.get({ [CLOSE_POPUP_KEY]: false }, (data) => {
    const close = data[CLOSE_POPUP_KEY] === true;
    for (const input of getRadios()) {
      input.checked = input.value === "close" ? close : !close;
    }
  });
}

function saveClosePreference(closeAfter) {
  chrome.storage.local.set({ [CLOSE_POPUP_KEY]: closeAfter }, showSaved);
}

for (const input of document.querySelectorAll('input[name="afterScan"]')) {
  input.addEventListener("change", () => {
    if (!input.checked) return;
    saveClosePreference(input.value === "close");
  });
}

load();
