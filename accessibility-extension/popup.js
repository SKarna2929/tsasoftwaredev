// ============================================
// POPUP.JS - Accessibility Helper Extension
// Uses chrome.scripting.executeScript to modify websites
// ============================================

var textSize = 100;
var highContrastOn = false;
var dyslexiaFontOn = false;
var letterSpacing = 0;
var lineHeight = 1.5;
var readingGuideOn = false;
var highlightLinksOn = false;
var bigCursorOn = false;
var currentFilter = "none";
var speechRate = 1.0;
var visualAlertsOn = false;
var focusIndicatorOn = false;

// Wait for DOM
document.addEventListener("DOMContentLoaded", function () {
  // ========== DARK MODE TOGGLE ==========
  var savedTheme = localStorage.getItem("theme");
  if (savedTheme === "dark") {
    document.body.classList.add("dark-mode");
  }

  document.getElementById("themeToggle").addEventListener("click", function () {
    document.body.classList.toggle("dark-mode");
    var isDark = document.body.classList.contains("dark-mode");
    localStorage.setItem("theme", isDark ? "dark" : "light");
  });

  // ========== TEXT SIZE BUTTONS ==========
  document
    .getElementById("decreaseText")
    .addEventListener("click", function () {
      textSize = Math.max(50, textSize - 10);
      document.getElementById("textSizeDisplay").textContent = textSize + "%";
      injectTextSize(textSize);
    });

  document
    .getElementById("increaseText")
    .addEventListener("click", function () {
      textSize = Math.min(200, textSize + 10);
      document.getElementById("textSizeDisplay").textContent = textSize + "%";
      injectTextSize(textSize);
    });

  // ========== HIGH CONTRAST BUTTON ==========
  document
    .getElementById("toggleContrast")
    .addEventListener("click", function () {
      highContrastOn = !highContrastOn;
      this.classList.toggle("active", highContrastOn);
      injectHighContrast(highContrastOn);
    });

  // ========== DYSLEXIA FONT TOGGLE ==========
  document
    .getElementById("toggleDyslexia")
    .addEventListener("click", function () {
      dyslexiaFontOn = !dyslexiaFontOn;
      this.classList.toggle("active", dyslexiaFontOn);
      injectDyslexiaFont(dyslexiaFontOn);
    });

  // ========== LETTER SPACING ==========
  document
    .getElementById("decreaseSpacing")
    .addEventListener("click", function () {
      letterSpacing = Math.max(0, letterSpacing - 1);
      document.getElementById("spacingDisplay").textContent =
        letterSpacing + "px";
      injectLetterSpacing(letterSpacing);
    });

  document
    .getElementById("increaseSpacing")
    .addEventListener("click", function () {
      letterSpacing = Math.min(10, letterSpacing + 1);
      document.getElementById("spacingDisplay").textContent =
        letterSpacing + "px";
      injectLetterSpacing(letterSpacing);
    });

  // ========== LINE HEIGHT ==========
  document
    .getElementById("decreaseLineHeight")
    .addEventListener("click", function () {
      lineHeight = Math.max(1, lineHeight - 0.25);
      document.getElementById("lineHeightDisplay").textContent =
        lineHeight.toFixed(2);
      injectLineHeight(lineHeight);
    });

  document
    .getElementById("increaseLineHeight")
    .addEventListener("click", function () {
      lineHeight = Math.min(3, lineHeight + 0.25);
      document.getElementById("lineHeightDisplay").textContent =
        lineHeight.toFixed(2);
      injectLineHeight(lineHeight);
    });

  // ========== READING GUIDE TOGGLE ==========
  document
    .getElementById("toggleReadingGuide")
    .addEventListener("click", function () {
      readingGuideOn = !readingGuideOn;
      this.classList.toggle("active", readingGuideOn);
      injectReadingGuide(readingGuideOn);
    });

  // ========== HIGHLIGHT LINKS TOGGLE ==========
  document
    .getElementById("toggleHighlightLinks")
    .addEventListener("click", function () {
      highlightLinksOn = !highlightLinksOn;
      this.classList.toggle("active", highlightLinksOn);
      injectHighlightLinks(highlightLinksOn);
    });

  // ========== BIG CURSOR TOGGLE ==========
  document
    .getElementById("toggleBigCursor")
    .addEventListener("click", function () {
      bigCursorOn = !bigCursorOn;
      this.classList.toggle("active", bigCursorOn);
      injectBigCursor(bigCursorOn);
    });

  // ========== COLOR BLINDNESS FILTERS ==========
  document.querySelectorAll(".filter-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      document.querySelectorAll(".filter-btn").forEach(function (b) {
        b.classList.remove("active");
      });
      this.classList.add("active");
      currentFilter = this.id.replace("filter", "").toLowerCase();
      injectColorFilter(currentFilter);
    });
  });

  // ========== SPEECH RATE ==========
  document
    .getElementById("decreaseRate")
    .addEventListener("click", function () {
      speechRate = Math.max(0.5, speechRate - 0.1);
      document.getElementById("rateDisplay").textContent =
        speechRate.toFixed(1) + "x";
    });

  document
    .getElementById("increaseRate")
    .addEventListener("click", function () {
      speechRate = Math.min(2.0, speechRate + 0.1);
      document.getElementById("rateDisplay").textContent =
        speechRate.toFixed(1) + "x";
    });

  // ========== VISUAL ALERTS TOGGLE ==========
  document
    .getElementById("toggleVisualAlerts")
    .addEventListener("click", function () {
      visualAlertsOn = !visualAlertsOn;
      this.classList.toggle("active", visualAlertsOn);
      injectVisualAlerts(visualAlertsOn);
    });

  // ========== FOCUS INDICATOR TOGGLE ==========
  document
    .getElementById("toggleFocusIndicator")
    .addEventListener("click", function () {
      focusIndicatorOn = !focusIndicatorOn;
      this.classList.toggle("active", focusIndicatorOn);
      injectFocusIndicator(focusIndicatorOn);
    });

  // ========== RESET BUTTON ==========
  document.getElementById("resetBtn").addEventListener("click", function () {
    // Reset all variables
    textSize = 100;
    highContrastOn = false;
    dyslexiaFontOn = false;
    letterSpacing = 0;
    lineHeight = 1.5;
    readingGuideOn = false;
    highlightLinksOn = false;
    bigCursorOn = false;
    currentFilter = "none";
    visualAlertsOn = false;
    focusIndicatorOn = false;

    // Reset displays
    document.getElementById("textSizeDisplay").textContent = "100%";
    document.getElementById("spacingDisplay").textContent = "0px";
    document.getElementById("lineHeightDisplay").textContent = "1.50";

    // Reset all toggle buttons
    document.querySelectorAll(".toggle-btn").forEach(function (btn) {
      btn.classList.remove("active");
    });

    // Reset filter buttons
    document.querySelectorAll(".filter-btn").forEach(function (btn) {
      btn.classList.remove("active");
    });
    document.getElementById("filterNone").classList.add("active");

    injectReset();
  });

  // ========== TEXT-TO-SPEECH ==========
  // Load voices and pick the best one
  var selectedVoice = null;

  function pickBestVoice() {
    var voices = window.speechSynthesis.getVoices();
    if (!voices.length) return;

    // Priority list: natural/premium voices first
    var preferredNames = [
      "Google US English",
      "Google UK English Female",
      "Google UK English Male",
      "Microsoft Zira",
      "Microsoft David",
      "Samantha",
      "Karen",
      "Daniel",
      "Alex",
    ];

    // Try to find a preferred voice
    for (var i = 0; i < preferredNames.length; i++) {
      for (var j = 0; j < voices.length; j++) {
        if (voices[j].name.indexOf(preferredNames[i]) !== -1) {
          selectedVoice = voices[j];
          return;
        }
      }
    }

    // Fallback: pick first English voice that isn't espeak
    for (var k = 0; k < voices.length; k++) {
      if (
        voices[k].lang.indexOf("en") === 0 &&
        voices[k].name.indexOf("espeak") === -1
      ) {
        selectedVoice = voices[k];
        return;
      }
    }

    // Last resort: first available voice
    selectedVoice = voices[0];
  }

  // Voices load asynchronously in Chrome
  window.speechSynthesis.onvoiceschanged = pickBestVoice;
  pickBestVoice();

  function speakText(text) {
    window.speechSynthesis.cancel();
    var utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = speechRate;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }
    window.speechSynthesis.speak(utterance);
  }

  document.getElementById("speakBtn").addEventListener("click", function () {
    var text = document.getElementById("textInput").value.trim();
    if (text === "") {
      alert("Please type some text to read aloud.");
      return;
    }
    speakText(text);
  });

  document
    .getElementById("stopSpeakBtn")
    .addEventListener("click", function () {
      window.speechSynthesis.cancel();
    });

  // ========== READ SELECTED TEXT ==========
  document
    .getElementById("speakPageBtn")
    .addEventListener("click", function () {
      chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.scripting.executeScript(
          {
            target: { tabId: tabs[0].id },
            func: function () {
              return window.getSelection().toString();
            },
          },
          function (results) {
            if (results && results[0] && results[0].result) {
              var text = results[0].result.trim();
              if (text) {
                speakText(text);
              } else {
                alert("Please select some text on the page first.");
              }
            }
          },
        );
      });
    });

  // ========== LIVE CAPTIONS ==========
  document
    .getElementById("startCaptionsBtn")
    .addEventListener("click", startCaptions);
  document
    .getElementById("stopCaptionsBtn")
    .addEventListener("click", stopCaptions);
  document
    .getElementById("clearCaptionsBtn")
    .addEventListener("click", clearCaptions);
});

// ============================================
// INJECT TEXT SIZE INTO WEBSITE
// ============================================
function injectTextSize(size) {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    if (!tabs[0]) return;

    chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      func: function (sizePercent) {
        var scale = sizePercent / 100;
        var root = document.documentElement;
        var body = document.body;

        // Reset case
        if (sizePercent === 100) {
          root.style.removeProperty("font-size");
          body.style.removeProperty("font-size");
          root.removeAttribute("data-a11y-orig-fs");
          body.removeAttribute("data-a11y-orig-fs");

          var el = document.getElementById("a11y-helper-textsize");
          if (el) el.textContent = "";
          return;
        }

        // Store original computed font-sizes on first use
        if (!root.hasAttribute("data-a11y-orig-fs")) {
          root.setAttribute(
            "data-a11y-orig-fs",
            window.getComputedStyle(root).fontSize,
          );
        }
        if (!body.hasAttribute("data-a11y-orig-fs")) {
          body.setAttribute(
            "data-a11y-orig-fs",
            window.getComputedStyle(body).fontSize,
          );
        }

        // Scale root and body font-size from their originals
        // This proportionally scales all text using rem/em units
        // without touching layout dimensions, images, or spacing in px
        var rootOrig = parseFloat(root.getAttribute("data-a11y-orig-fs"));
        var bodyOrig = parseFloat(body.getAttribute("data-a11y-orig-fs"));

        root.style.setProperty(
          "font-size",
          rootOrig * scale + "px",
          "important",
        );
        body.style.setProperty(
          "font-size",
          bodyOrig * scale + "px",
          "important",
        );

        // Also inject a style rule for elements with hardcoded px font-sizes
        var el = document.getElementById("a11y-helper-textsize");
        if (!el) {
          el = document.createElement("style");
          el.id = "a11y-helper-textsize";
          document.head.appendChild(el);
        }

        // Target common text elements that may use px sizing
        // Use rem-based values so they scale from our adjusted root
        // and never compound on nested elements
        el.textContent =
          "p, a, li, td, th, label, span, blockquote, figcaption, " +
          "caption, pre, code, dt, dd, summary, legend { " +
          "  font-size: " +
          scale +
          "em !important; " +
          "}" +
          "h1 { font-size: " +
          2 * scale +
          "em !important; }" +
          "h2 { font-size: " +
          1.5 * scale +
          "em !important; }" +
          "h3 { font-size: " +
          1.17 * scale +
          "em !important; }" +
          "h4 { font-size: " +
          1 * scale +
          "em !important; }" +
          "h5 { font-size: " +
          0.83 * scale +
          "em !important; }" +
          "h6 { font-size: " +
          0.67 * scale +
          "em !important; }";
      },
      args: [size],
    });
  });
}

// ============================================
// INJECT HIGH CONTRAST INTO WEBSITE
// ============================================
function injectHighContrast(enabled) {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    if (!tabs[0]) return;

    chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      func: function (on) {
        var el = document.getElementById("a11y-helper-contrast");
        if (on) {
          if (!el) {
            el = document.createElement("style");
            el.id = "a11y-helper-contrast";
            document.head.appendChild(el);
          }

          el.textContent =
            // Use CSS filter to invert the whole page
            "html { filter: invert(1) hue-rotate(180deg) !important; background: #fff !important; }" +
            // Re-invert images, videos, canvas, svg so they look normal
            "img, video, canvas, svg, picture, [style*='background-image'], " +
            ".img, figure img, iframe { filter: invert(1) hue-rotate(180deg) !important; }" +
            // Boost contrast on text elements
            "p, span, h1, h2, h3, h4, h5, h6, a, li, td, th, label, " +
            "button, input, textarea, select, blockquote, figcaption { " +
            "  contrast: 1.2 !important; }" +
            // Make links more visible with underline
            "a { text-decoration: underline !important; }" +
            // Enhance focus visibility
            "*:focus { outline: 3px solid #0ff !important; outline-offset: 2px !important; }" +
            "*:focus-visible { outline: 3px solid #0ff !important; outline-offset: 2px !important; }";
        } else {
          if (el) el.remove();
        }
      },
      args: [enabled],
    });
  });
}

// ============================================
// RESET WEBSITE
// ============================================
function injectReset() {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    if (!tabs[0]) return;

    chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      func: function () {
        // Remove all accessibility helper styles
        var ids = [
          "a11y-helper-textsize",
          "a11y-helper-contrast",
          "a11y-helper-dyslexia",
          "a11y-helper-spacing",
          "a11y-helper-lineheight",
          "a11y-helper-readingguide",
          "a11y-helper-highlightlinks",
          "a11y-helper-bigcursor",
          "a11y-helper-colorfilter",
          "a11y-helper-visualalerts",
          "a11y-helper-focusindicator",
        ];
        ids.forEach(function (id) {
          var el = document.getElementById(id);
          if (el) el.remove();
        });
        // Remove reading guide element
        var guide = document.getElementById("a11y-reading-guide");
        if (guide) guide.remove();
        // Reset font-size overrides from text size feature
        var root = document.documentElement;
        var body = document.body;
        root.style.removeProperty("font-size");
        body.style.removeProperty("font-size");
        root.removeAttribute("data-a11y-orig-fs");
        body.removeAttribute("data-a11y-orig-fs");
      },
    });
  });
}

// ============================================
// DYSLEXIA-FRIENDLY FONT
// ============================================
function injectDyslexiaFont(enabled) {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    if (!tabs[0]) return;

    chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      func: function (on) {
        var el = document.getElementById("a11y-helper-dyslexia");
        if (on) {
          if (!el) {
            el = document.createElement("style");
            el.id = "a11y-helper-dyslexia";
            document.head.appendChild(el);
          }
          // Use OpenDyslexic or fallback to Comic Sans (commonly recommended for dyslexia)
          el.textContent =
            "@import url('https://fonts.cdnfonts.com/css/opendyslexic');" +
            "* { font-family: 'OpenDyslexic', 'Comic Sans MS', 'Arial', sans-serif !important; }";
        } else {
          if (el) el.remove();
        }
      },
      args: [enabled],
    });
  });
}

// ============================================
// LETTER SPACING
// ============================================
function injectLetterSpacing(spacing) {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    if (!tabs[0]) return;

    chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      func: function (sp) {
        var el = document.getElementById("a11y-helper-spacing");
        if (sp > 0) {
          if (!el) {
            el = document.createElement("style");
            el.id = "a11y-helper-spacing";
            document.head.appendChild(el);
          }
          el.textContent =
            "* { letter-spacing: " +
            sp +
            "px !important; word-spacing: " +
            sp * 2 +
            "px !important; }";
        } else {
          if (el) el.remove();
        }
      },
      args: [spacing],
    });
  });
}

// ============================================
// LINE HEIGHT
// ============================================
function injectLineHeight(height) {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    if (!tabs[0]) return;

    chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      func: function (h) {
        var el = document.getElementById("a11y-helper-lineheight");
        if (h !== 1.5) {
          if (!el) {
            el = document.createElement("style");
            el.id = "a11y-helper-lineheight";
            document.head.appendChild(el);
          }
          el.textContent =
            "p, span, a, li, td, th, div { line-height: " +
            h +
            " !important; }";
        } else {
          if (el) el.remove();
        }
      },
      args: [height],
    });
  });
}

// ============================================
// READING GUIDE (follows cursor)
// ============================================
function injectReadingGuide(enabled) {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    if (!tabs[0]) return;

    chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      func: function (on) {
        var guide = document.getElementById("a11y-reading-guide");
        if (on) {
          if (!guide) {
            guide = document.createElement("div");
            guide.id = "a11y-reading-guide";
            guide.style.cssText =
              "position: fixed; left: 0; right: 0; height: 40px; background: rgba(255, 255, 0, 0.2); pointer-events: none; z-index: 999999; border-top: 2px solid #ff0; border-bottom: 2px solid #ff0; transition: top 0.05s ease;";
            document.body.appendChild(guide);

            document.addEventListener("mousemove", function (e) {
              var g = document.getElementById("a11y-reading-guide");
              if (g) g.style.top = e.clientY - 20 + "px";
            });
          }
        } else {
          if (guide) guide.remove();
        }
      },
      args: [enabled],
    });
  });
}

// ============================================
// HIGHLIGHT LINKS
// ============================================
function injectHighlightLinks(enabled) {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    if (!tabs[0]) return;

    chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      func: function (on) {
        var el = document.getElementById("a11y-helper-highlightlinks");
        if (on) {
          if (!el) {
            el = document.createElement("style");
            el.id = "a11y-helper-highlightlinks";
            document.head.appendChild(el);
          }
          el.textContent =
            "a { background: #ff0 !important; color: #000 !important; padding: 2px 4px !important; text-decoration: underline !important; font-weight: bold !important; }" +
            "a:hover { background: #0ff !important; }";
        } else {
          if (el) el.remove();
        }
      },
      args: [enabled],
    });
  });
}

// ============================================
// BIG CURSOR
// ============================================
function injectBigCursor(enabled) {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    if (!tabs[0]) return;

    chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      func: function (on) {
        var el = document.getElementById("a11y-helper-bigcursor");
        if (on) {
          if (!el) {
            el = document.createElement("style");
            el.id = "a11y-helper-bigcursor";
            document.head.appendChild(el);
          }
          // Large black cursor with white outline for visibility
          el.textContent =
            '* { cursor: url(\'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24"><path fill="white" stroke="black" stroke-width="1" d="M5 3l14 9-8 1-4 8z"/></svg>\') 4 4, auto !important; }';
        } else {
          if (el) el.remove();
        }
      },
      args: [enabled],
    });
  });
}

// ============================================
// COLOR BLINDNESS FILTERS
// ============================================
function injectColorFilter(filter) {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    if (!tabs[0]) return;

    chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      func: function (filterType) {
        var el = document.getElementById("a11y-helper-colorfilter");
        if (filterType !== "none") {
          if (!el) {
            el = document.createElement("style");
            el.id = "a11y-helper-colorfilter";
            document.head.appendChild(el);
          }

          var filters = {
            protanopia: 'url("#protanopia")',
            deuteranopia: 'url("#deuteranopia")',
            tritanopia: 'url("#tritanopia")',
          };

          // Create SVG filters if they don't exist
          var svg = document.getElementById("a11y-color-filters");
          if (!svg) {
            svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            svg.id = "a11y-color-filters";
            svg.style.position = "absolute";
            svg.style.width = "0";
            svg.style.height = "0";
            svg.innerHTML =
              "<defs>" +
              '<filter id="protanopia"><feColorMatrix type="matrix" values="0.567,0.433,0,0,0 0.558,0.442,0,0,0 0,0.242,0.758,0,0 0,0,0,1,0"/></filter>' +
              '<filter id="deuteranopia"><feColorMatrix type="matrix" values="0.625,0.375,0,0,0 0.7,0.3,0,0,0 0,0.3,0.7,0,0 0,0,0,1,0"/></filter>' +
              '<filter id="tritanopia"><feColorMatrix type="matrix" values="0.95,0.05,0,0,0 0,0.433,0.567,0,0 0,0.475,0.525,0,0 0,0,0,1,0"/></filter>' +
              "</defs>";
            document.body.appendChild(svg);
          }

          el.textContent =
            "html { filter: " + filters[filterType] + " !important; }";
        } else {
          if (el) el.remove();
        }
      },
      args: [filter],
    });
  });
}

// ============================================
// VISUAL ALERTS (screen flash)
// ============================================
function injectVisualAlerts(enabled) {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    if (!tabs[0]) return;

    chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      func: function (on) {
        var el = document.getElementById("a11y-helper-visualalerts");
        if (on) {
          if (!el) {
            el = document.createElement("style");
            el.id = "a11y-helper-visualalerts";
            document.head.appendChild(el);
          }
          el.textContent =
            "@keyframes a11y-flash { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }" +
            "html:focus-within { animation: a11y-flash 0.3s ease; }";
        } else {
          if (el) el.remove();
        }
      },
      args: [enabled],
    });
  });
}

// ============================================
// ENHANCED FOCUS INDICATOR
// ============================================
function injectFocusIndicator(enabled) {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    if (!tabs[0]) return;

    chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      func: function (on) {
        var el = document.getElementById("a11y-helper-focusindicator");
        if (on) {
          if (!el) {
            el = document.createElement("style");
            el.id = "a11y-helper-focusindicator";
            document.head.appendChild(el);
          }
          el.textContent =
            "*:focus { outline: 4px solid #ff0 !important; outline-offset: 4px !important; box-shadow: 0 0 0 8px rgba(255,255,0,0.3) !important; }" +
            "*:focus-visible { outline: 4px solid #ff0 !important; outline-offset: 4px !important; box-shadow: 0 0 0 8px rgba(255,255,0,0.3) !important; }";
        } else {
          if (el) el.remove();
        }
      },
      args: [enabled],
    });
  });
}

// ============================================
// LIVE CAPTIONS
// ============================================
var recognition = null;
var isListening = false;
var finalTranscript = "";

function startCaptions() {
  var SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    alert("Speech recognition not supported. Use Chrome.");
    return;
  }
  if (isListening) return;

  // Request microphone permission first
  navigator.mediaDevices
    .getUserMedia({ audio: true })
    .then(function (stream) {
      // Stop the stream immediately - we just needed permission
      stream.getTracks().forEach(function (track) {
        track.stop();
      });

      // Now start speech recognition
      initRecognition();
    })
    .catch(function (err) {
      alert(
        "Microphone access denied. Please allow microphone access and try again.",
      );
    });
}

function initRecognition() {
  var SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

  recognition = new SpeechRecognition();
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.lang = "en-US";

  var display = document.getElementById("captionDisplay");

  recognition.onstart = function () {
    isListening = true;
    var statusEl = document.getElementById("captionStatus");
    statusEl.className = "caption-status listening";
    statusEl.querySelector(".status-text").textContent = "Listening...";
    // Update mic button state
    document.getElementById("startCaptionsBtn").classList.add("active");
  };

  recognition.onresult = function (e) {
    var interim = "";
    for (var i = e.resultIndex; i < e.results.length; i++) {
      if (e.results[i].isFinal) {
        finalTranscript += e.results[i][0].transcript + " ";
      } else {
        interim += e.results[i][0].transcript;
      }
    }
    display.textContent = finalTranscript + interim;
    display.scrollTop = display.scrollHeight;
  };

  recognition.onerror = function (e) {
    if (e.error === "not-allowed") alert("Microphone access denied.");
    stopCaptions();
  };

  recognition.onend = function () {
    if (isListening) {
      try {
        recognition.start();
      } catch (err) {
        stopCaptions();
      }
    }
  };

  recognition.start();
}

function stopCaptions() {
  isListening = false;
  if (recognition) recognition.stop();
  var statusEl = document.getElementById("captionStatus");
  statusEl.className = "caption-status idle";
  statusEl.querySelector(".status-text").textContent = "Ready";
  // Update mic button state
  document.getElementById("startCaptionsBtn").classList.remove("active");
}

function clearCaptions() {
  finalTranscript = "";
  document.getElementById("captionDisplay").innerHTML =
    '<span class="placeholder-text">Your words will appear here...</span>';
}
