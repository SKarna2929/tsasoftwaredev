// Injected in tab - uses sendMessage only (background stores so popup can show words)
var recognition = null;
var stream = null;
var fullText = "";

chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
  if (msg.action === "startCaptions") {
    startCaptions();
    sendResponse({ ok: true });
    return true;
  }
  if (msg.action === "stopCaptions") {
    stopCaptions();
    sendResponse({ ok: true });
    return true;
  }
});

function startCaptions() {
  var SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    chrome.runtime.sendMessage({ type: "a11yCaptionDenied" });
    return;
  }
  fullText = "";
  chrome.runtime.sendMessage({ type: "a11yCaptionText", text: "" });

  navigator.mediaDevices.getUserMedia({ audio: true })
    .then(function (s) {
      stream = s;
      recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      recognition.onresult = function (e) {
        var interim = "";
        for (var i = e.resultIndex; i < e.results.length; i++) {
          if (e.results[i].isFinal) {
            fullText += e.results[i][0].transcript + " ";
          } else {
            interim += e.results[i][0].transcript;
          }
        }
        var text = fullText + interim;
        chrome.runtime.sendMessage({ type: "a11yCaptionText", text: text });
      };

      recognition.onerror = function (e) {
        if (e.error === "not-allowed") {
          chrome.runtime.sendMessage({ type: "a11yCaptionDenied" });
        }
        stopCaptions();
      };

      recognition.onend = function () {
        if (recognition && stream) {
          try {
            recognition.start();
          } catch (err) {}
        }
      };

      recognition.start();
      chrome.runtime.sendMessage({ type: "a11yCaptionStarted" });
    })
    .catch(function () {
      chrome.runtime.sendMessage({ type: "a11yCaptionDenied" });
    });
}

function stopCaptions() {
  if (recognition) {
    try {
      recognition.stop();
    } catch (e) {}
    recognition = null;
  }
  if (stream) {
    try {
      stream.getTracks().forEach(function (t) { t.stop(); });
    } catch (e) {}
    stream = null;
  }
  fullText = "";
  chrome.runtime.sendMessage({ type: "a11yCaptionText", text: "" });
}
