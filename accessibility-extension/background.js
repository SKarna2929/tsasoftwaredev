// Background receives caption messages from the tab and stores so popup can show words
var CAPTION_KEY = "a11yLiveCaptionText";

chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
  if (msg.type === "a11yCaptionText" && msg.text !== undefined) {
    chrome.storage.local.set({ [CAPTION_KEY]: msg.text });
  }
});
