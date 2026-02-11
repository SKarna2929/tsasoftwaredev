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
var ttsLanguage = "en-US";
var ttsVoiceName = "";
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
    speechRate = 1.0;
    ttsLanguage = "en-US";
    ttsVoiceName = "";
    visualAlertsOn = false;
    focusIndicatorOn = false;

    // Reset displays
    document.getElementById("textSizeDisplay").textContent = "100%";
    document.getElementById("spacingDisplay").textContent = "0px";
    document.getElementById("lineHeightDisplay").textContent = "1.50";
    document.getElementById("rateDisplay").textContent = "1.0x";
    var langSelect = document.getElementById("ttsLanguage");
    if (langSelect) {
      langSelect.value = "en-US";
      localStorage.setItem("ttsLanguage", "en-US");
    }
    var voiceSelect = document.getElementById("ttsVoice");
    if (voiceSelect) {
      voiceSelect.value = "";
      localStorage.setItem("ttsVoice", "");
    }

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
  var ttsLangSelect = document.getElementById("ttsLanguage");
  if (ttsLangSelect) {
    var savedLang = localStorage.getItem("ttsLanguage");
    if (savedLang) {
      ttsLangSelect.value = savedLang;
      ttsLanguage = savedLang;
    }
    ttsLangSelect.addEventListener("change", function () {
      ttsLanguage = this.value;
      localStorage.setItem("ttsLanguage", ttsLanguage);
    });
  }

  function populateVoiceList() {
    var voices = window.speechSynthesis.getVoices();
    var sel = document.getElementById("ttsVoice");
    if (!sel) return;
    var saved = localStorage.getItem("ttsVoice") || "";
    sel.innerHTML = '<option value="">Default voice</option>';
    for (var i = 0; i < voices.length; i++) {
      var v = voices[i];
      var label = v.name + (v.lang ? " (" + v.lang + ")" : "");
      var value = v.name + "|" + (v.lang || "");
      var opt = document.createElement("option");
      opt.value = value;
      opt.textContent = label;
      sel.appendChild(opt);
    }
    if (saved && sel.querySelector('option[value="' + saved + '"]')) {
      sel.value = saved;
      ttsVoiceName = saved;
    }
  }
  populateVoiceList();
  if (window.speechSynthesis.onvoiceschanged !== undefined) {
    window.speechSynthesis.onvoiceschanged = populateVoiceList;
  }
  var ttsVoiceSelect = document.getElementById("ttsVoice");
  if (ttsVoiceSelect) {
    ttsVoiceSelect.addEventListener("change", function () {
      ttsVoiceName = this.value;
      localStorage.setItem("ttsVoice", ttsVoiceName);
    });
  }

  function getSelectedVoice() {
    var name = (document.getElementById("ttsVoice") && document.getElementById("ttsVoice").value) || ttsVoiceName;
    if (!name) return null;
    var voices = window.speechSynthesis.getVoices();
    var parts = name.split("|");
    var wantName = parts[0];
    var wantLang = parts[1] || "";
    for (var i = 0; i < voices.length; i++) {
      if (voices[i].name === wantName && (!wantLang || voices[i].lang === wantLang)) return voices[i];
    }
    for (var j = 0; j < voices.length; j++) {
      if (voices[j].name === wantName) return voices[j];
    }
    return null;
  }

  function getLangCode(langValue) {
    if (!langValue) return "en";
    var part = langValue.split("-")[0];
    return part || "en";
  }

  function getVoiceForLang(lang) {
    var voices = window.speechSynthesis.getVoices();
    var code = getLangCode(lang);
    for (var i = 0; i < voices.length; i++) {
      var v = voices[i];
      if (v.lang && (v.lang === lang || v.lang.indexOf(code) === 0)) return v;
    }
    return null;
  }

  function translateThenSpeak(text, lang, doSpeak) {
    var langCode = getLangCode(lang);
    if (langCode === "en") {
      doSpeak(text);
      return;
    }
    fetch("https://libretranslate.com/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        q: text,
        source: "en",
        target: langCode,
      }),
    })
      .then(function (res) { return res.json(); })
      .then(function (data) {
        var translated = data && data.translatedText;
        doSpeak(translated ? translated : text);
      })
      .catch(function () {
        doSpeak(text);
      });
  }

  function doSpeak(text, lang) {
    window.speechSynthesis.cancel();
    var utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = speechRate;
    var voice = getVoiceForLang(lang);
    if (!voice) voice = getSelectedVoice();
    if (voice) utterance.voice = voice;
    window.speechSynthesis.speak(utterance);
  }

  document.getElementById("speakBtn").addEventListener("click", function () {
    var text = document.getElementById("textInput").value.trim();
    if (text === "") {
      alert("Please type some text to read aloud.");
      return;
    }
    var langSelect = document.getElementById("ttsLanguage");
    var lang = (langSelect && langSelect.value) || ttsLanguage || "en-US";
    translateThenSpeak(text, lang, function (textToSpeak) {
      doSpeak(textToSpeak, lang);
    });
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
                var langSelect = document.getElementById("ttsLanguage");
                var lang = (langSelect && langSelect.value) || ttsLanguage || "en-US";
                translateThenSpeak(text, lang, function (textToSpeak) {
                  doSpeak(textToSpeak, lang);
                });
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
        var el = document.getElementById("a11y-helper-textsize");
        if (!el) {
          el = document.createElement("style");
          el.id = "a11y-helper-textsize";
          document.head.appendChild(el);
        }

        // Use a smarter approach: only scale text elements, not containers
        // This preserves layout while making text more readable
        var scale = sizePercent / 100;

        if (sizePercent === 100) {
          el.textContent = "";
          return;
        }

        el.textContent =
          // Scale text elements only - not their containers
          "p, span:not(.icon):not([class*='icon']), " +
          "a, li, td, th, label, " +
          "h1, h2, h3, h4, h5, h6, " +
          "blockquote, figcaption, caption, " +
          "button, input, textarea, select, " +
          ".text, [class*='text'], [class*='title'], [class*='desc'], " +
          "article, section p, main p { " +
          "  font-size: calc(1em * " +
          scale +
          ") !important; " +
          "  line-height: 1.5 !important; " +
          "}" +
          // Ensure minimum tap targets for accessibility
          "a, button, [role='button'] { " +
          "  min-height: 44px; " +
          "  min-width: 44px; " +
          "}";
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
            // Everything: black bg, white text
            "* { background: #000 !important; color: #fff !important; border-color: #fff !important; box-shadow: none !important; text-shadow: none !important; }" +
            // Links: yellow
            "a { color: #ff0 !important; }" +
            "a:hover, a:focus { color: #0ff !important; }" +
            // Buttons: yellow outline
            "button, [role='button'], input[type='submit'], input[type='button'] { color: #ff0 !important; border: 2px solid #ff0 !important; }" +
            // Inputs: white border
            "input, textarea, select { border: 2px solid #fff !important; }" +
            // Focus: cyan outline
            "*:focus { outline: 2px solid #0ff !important; }" +
            // Images: visible
            "img, video, svg { border: 2px solid #ff0 !important; background: transparent !important; }";
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
// LIVE CAPTIONS - mic asked in the TAB (the webpage) so Chrome shows Allow
// Words sent to popup via message so they appear in the box
// ============================================
var isListening = false;
var captionsTabId = null;

var CAPTIONS_MIC_DENIED_MSG =
  "Microphone access denied. Make sure you're on a normal webpage (e.g. google.com), then click the mic again and choose Allow when Chrome asks.";

// When the tab sends us spoken text, show it in the popup
chrome.runtime.onMessage.addListener(function (msg) {
  if (msg.type === "a11yCaptionText") {
    var display = document.getElementById("captionDisplay");
    if (display) {
      display.textContent = msg.text || "";
      display.scrollTop = display.scrollHeight;
    }
  }
  if (msg.type === "a11yCaptionStarted") {
    isListening = true;
    var statusEl = document.getElementById("captionStatus");
    if (statusEl) {
      statusEl.className = "caption-status listening";
      var st = statusEl.querySelector(".status-text");
      if (st) st.textContent = "Listening...";
    }
    var btn = document.getElementById("startCaptionsBtn");
    if (btn) btn.classList.add("active");
  }
  if (msg.type === "a11yCaptionDenied") {
    isListening = false;
    alert(CAPTIONS_MIC_DENIED_MSG);
    var statusEl = document.getElementById("captionStatus");
    if (statusEl) {
      statusEl.className = "caption-status idle";
      var st = statusEl.querySelector(".status-text");
      if (st) st.textContent = "Ready";
    }
    document.getElementById("startCaptionsBtn").classList.remove("active");
  }
});

function startCaptions() {
  if (typeof window.SpeechRecognition === "undefined" && typeof window.webkitSpeechRecognition === "undefined") {
    alert("Speech recognition not supported. Use Chrome.");
    return;
  }
  if (isListening) return;

  var display = document.getElementById("captionDisplay");
  if (display) {
    display.textContent = "";
    display.innerHTML = "";
  }

  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    var tab = tabs[0];
    if (!tab || !tab.id) {
      alert("Open a webpage first, then try again.");
      return;
    }
    var url = tab.url || "";
    if (url.indexOf("chrome://") === 0 || url.indexOf("chrome-extension://") === 0) {
      alert("Open a normal website (e.g. google.com) in this tab, then click the mic again.");
      return;
    }
    captionsTabId = tab.id;
    chrome.scripting.executeScript(
      { target: { tabId: tab.id }, func: runLiveCaptionsInPage },
      function () {
        if (chrome.runtime.lastError) {
          alert("Cannot use captions on this page. Try a normal website like google.com.");
        }
      }
    );
  });
}

function runLiveCaptionsInPage() {
  var SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    chrome.runtime.sendMessage({ type: "a11yCaptionDenied" });
    return;
  }
  navigator.mediaDevices.getUserMedia({ audio: true })
    .then(function (stream) {
      stream.getTracks().forEach(function (t) { t.stop(); });
      var recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";
      var fullText = "";
      recognition.onresult = function (e) {
        var interim = "";
        for (var i = e.resultIndex; i < e.results.length; i++) {
          if (e.results[i].isFinal) {
            fullText += e.results[i][0].transcript + " ";
          } else {
            interim += e.results[i][0].transcript;
          }
        }
        chrome.runtime.sendMessage({ type: "a11yCaptionText", text: fullText + interim });
      };
      recognition.onerror = function (e) {
        if (e.error === "not-allowed") chrome.runtime.sendMessage({ type: "a11yCaptionDenied" });
      };
      recognition.onend = function () {
        if (window.__a11yListening) {
          try { recognition.start(); } catch (err) {}
        }
      };
      window.__a11yListening = true;
      window.__a11yRecognition = recognition;
      recognition.start();
      chrome.runtime.sendMessage({ type: "a11yCaptionStarted" });
    })
    .catch(function () {
      chrome.runtime.sendMessage({ type: "a11yCaptionDenied" });
    });
}

function stopCaptions() {
  isListening = false;
  if (captionsTabId) {
    try {
      chrome.scripting.executeScript({
        target: { tabId: captionsTabId },
        func: function () {
          window.__a11yListening = false;
          if (window.__a11yRecognition) {
            try { window.__a11yRecognition.stop(); } catch (e) {}
            window.__a11yRecognition = null;
          }
        },
      });
    } catch (err) {}
    captionsTabId = null;
  }
  var statusEl = document.getElementById("captionStatus");
  if (statusEl) {
    statusEl.className = "caption-status idle";
    var st = statusEl.querySelector(".status-text");
    if (st) st.textContent = "Ready";
  }
  var display = document.getElementById("captionDisplay");
  if (display) {
    display.innerHTML = "<span class=\"placeholder-text\">Your words will appear here...</span>";
  }
  var btn = document.getElementById("startCaptionsBtn");
  if (btn) btn.classList.remove("active");
}

function clearCaptions() {
  finalTranscript = "";
  var display = document.getElementById("captionDisplay");
  if (display) {
    display.innerHTML = "<span class=\"placeholder-text\">Your words will appear here...</span>";
  }
}
