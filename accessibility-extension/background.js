// Background service worker for A.E.G.I.S.
var CAPTION_KEY = "a11yLiveCaptionText";

chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
  // Store caption text from content-captions.js
  if (msg.type === "a11yCaptionText" && msg.text !== undefined) {
    chrome.storage.local.set({ [CAPTION_KEY]: msg.text });
  }

  // Open dedicated captions tab (requested from content-widget.js)
  if (msg.type === "aegisOpenCaptionsTab") {
    chrome.tabs.create({ url: chrome.runtime.getURL("captions.html") });
  }
});
