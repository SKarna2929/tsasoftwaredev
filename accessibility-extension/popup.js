// ============================================
// POPUP.JS - Accessibility Helper Extension
// Modernized for resilience, autosave, and richer TTS controls
// ============================================

const DEFAULT_STATE = {
  textSize: 100,
  highContrastOn: false,
  dyslexiaFontOn: false,
  letterSpacing: 0,
  lineHeight: 1.5,
  readingGuideOn: false,
  highlightLinksOn: false,
  bigCursorOn: false,
  currentFilter: "none",
  speechRate: 1.0,
  visualAlertsOn: false,
  focusIndicatorOn: false,
  voiceName: "",
};

let state = { ...DEFAULT_STATE };
let voices = [];
let recognition = null;
let isListening = false;
let finalTranscript = "";

const storage = {
  load() {
    return new Promise((resolve) => {
      chrome.storage.sync.get(["a11yState"], (data) => {
        resolve(data.a11yState || {});
      });
    });
  },
  save(nextState) {
    chrome.storage.sync.set({ a11yState: nextState });
  },
};

document.addEventListener("DOMContentLoaded", init);

async function init() {
  await restoreState();
  hydrateTheme();
  bindUI();
  await hydrateVoices();
  renderState();
  applyAllToPage();
}

async function restoreState() {
  const saved = await storage.load();
  state = { ...DEFAULT_STATE, ...saved };
}

function persistState() {
  storage.save(state);
  updateStatus("Settings saved");
}

function updateStatus(message) {
  const status = document.getElementById("a11yStatus");
  if (status) {
    status.textContent = message;
  }
}

function hydrateTheme() {
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "dark") {
    document.body.classList.add("dark-mode");
  }

  document.getElementById("themeToggle").addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");
    const isDark = document.body.classList.contains("dark-mode");
    localStorage.setItem("theme", isDark ? "dark" : "light");
  });
}

function bindUI() {
  bindStepper({
    decreaseId: "decreaseText",
    increaseId: "increaseText",
    key: "textSize",
    min: 50,
    max: 200,
    step: 10,
    displayId: "textSizeDisplay",
    format: (v) => `${v}%`,
    onChange: (v) => injectTextSize(v),
  });

  bindStepper({
    decreaseId: "decreaseSpacing",
    increaseId: "increaseSpacing",
    key: "letterSpacing",
    min: 0,
    max: 10,
    step: 1,
    displayId: "spacingDisplay",
    format: (v) => `${v}px`,
    onChange: (v) => injectLetterSpacing(v),
  });

  bindStepper({
    decreaseId: "decreaseLineHeight",
    increaseId: "increaseLineHeight",
    key: "lineHeight",
    min: 1,
    max: 3,
    step: 0.25,
    displayId: "lineHeightDisplay",
    format: (v) => v.toFixed(2),
    onChange: (v) => injectLineHeight(v),
  });

  bindStepper({
    decreaseId: "decreaseRate",
    increaseId: "increaseRate",
    key: "speechRate",
    min: 0.5,
    max: 2.0,
    step: 0.1,
    displayId: "rateDisplay",
    format: (v) => `${v.toFixed(1)}x`,
  });

  bindToggle("toggleContrast", "highContrastOn", injectHighContrast);
  bindToggle("toggleDyslexia", "dyslexiaFontOn", injectDyslexiaFont);
  bindToggle("toggleReadingGuide", "readingGuideOn", injectReadingGuide);
  bindToggle("toggleHighlightLinks", "highlightLinksOn", injectHighlightLinks);
  bindToggle("toggleBigCursor", "bigCursorOn", injectBigCursor);
  bindToggle("toggleVisualAlerts", "visualAlertsOn", injectVisualAlerts);
  bindToggle("toggleFocusIndicator", "focusIndicatorOn", injectFocusIndicator);

  document.querySelectorAll(".filter-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".filter-btn").forEach((b) => {
        b.classList.remove("active");
      });
      btn.classList.add("active");
      state.currentFilter = btn.id.replace("filter", "").toLowerCase();
      persistState();
      injectColorFilter(state.currentFilter);
    });
  });

  document.getElementById("resetBtn").addEventListener("click", () => {
    state = { ...DEFAULT_STATE };
    renderState();
    persistState();
    injectReset();
  });

  document.getElementById("speakBtn").addEventListener("click", () => {
    const text = document.getElementById("textInput").value.trim();
    if (!text) {
      alert("Please type some text to read aloud.");
      return;
    }
    speakText(text);
  });

  document.getElementById("stopSpeakBtn").addEventListener("click", () => {
    window.speechSynthesis.cancel();
  });

  document.getElementById("speakPageBtn").addEventListener("click", () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (!tabs[0]) return;
      chrome.scripting.executeScript(
        {
          target: { tabId: tabs[0].id },
          func: () => window.getSelection().toString(),
        },
        (results) => {
          if (chrome.runtime.lastError) {
            alert("Unable to read selection: " + chrome.runtime.lastError);
            return;
          }
          const text = results && results[0] && results[0].result;
          if (text && text.trim()) {
            speakText(text.trim());
          } else {
            alert("Please select some text on the page first.");
          }
        },
      );
    });
  });

  document
    .getElementById("startCaptionsBtn")
    .addEventListener("click", startCaptions);
  document
    .getElementById("stopCaptionsBtn")
    .addEventListener("click", stopCaptions);
  document
    .getElementById("clearCaptionsBtn")
    .addEventListener("click", clearCaptions);

  const voiceSelect = document.getElementById("voiceSelect");
  voiceSelect.addEventListener("change", (e) => {
    state.voiceName = e.target.value;
    persistState();
  });
}

function bindToggle(buttonId, key, injector) {
  const btn = document.getElementById(buttonId);
  btn.addEventListener("click", () => {
    state[key] = !state[key];
    renderState();
    persistState();
    if (injector) injector(state[key]);
  });
}

function bindStepper({
  decreaseId,
  increaseId,
  key,
  min,
  max,
  step,
  displayId,
  format,
  onChange,
}) {
  const dec = document.getElementById(decreaseId);
  const inc = document.getElementById(increaseId);

  function update(delta) {
    const next = clamp(state[key] + delta, min, max);
    state[key] = Number(next.toFixed(2));
    renderState();
    persistState();
    if (onChange) onChange(state[key]);
  }

  dec.addEventListener("click", () => update(-step));
  inc.addEventListener("click", () => update(step));

  if (displayId) {
    const display = document.getElementById(displayId);
    display.textContent = format(state[key]);
  }
}

function renderState() {
  document.getElementById("textSizeDisplay").textContent = `${state.textSize}%`;
  document.getElementById("spacingDisplay").textContent =
    `${state.letterSpacing}px`;
  document.getElementById("lineHeightDisplay").textContent =
    state.lineHeight.toFixed(2);
  document.getElementById("rateDisplay").textContent =
    `${state.speechRate.toFixed(1)}x`;

  setToggleUI("toggleContrast", state.highContrastOn);
  setToggleUI("toggleDyslexia", state.dyslexiaFontOn);
  setToggleUI("toggleReadingGuide", state.readingGuideOn);
  setToggleUI("toggleHighlightLinks", state.highlightLinksOn);
  setToggleUI("toggleBigCursor", state.bigCursorOn);
  setToggleUI("toggleVisualAlerts", state.visualAlertsOn);
  setToggleUI("toggleFocusIndicator", state.focusIndicatorOn);

  document.querySelectorAll(".filter-btn").forEach((btn) => {
    const val = btn.id.replace("filter", "").toLowerCase();
    btn.classList.toggle("active", val === state.currentFilter);
  });

  syncVoiceSelect();
}

function setToggleUI(buttonId, active) {
  const btn = document.getElementById(buttonId);
  if (btn) {
    btn.classList.toggle("active", active);
  }
}

function applyAllToPage() {
  injectTextSize(state.textSize);
  injectHighContrast(state.highContrastOn);
  injectDyslexiaFont(state.dyslexiaFontOn);
  injectLetterSpacing(state.letterSpacing);
  injectLineHeight(state.lineHeight);
  injectReadingGuide(state.readingGuideOn);
  injectHighlightLinks(state.highlightLinksOn);
  injectBigCursor(state.bigCursorOn);
  injectColorFilter(state.currentFilter);
  injectVisualAlerts(state.visualAlertsOn);
  injectFocusIndicator(state.focusIndicatorOn);
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

// ============================================
// TEXT TO SPEECH
// ============================================
async function hydrateVoices() {
  voices = window.speechSynthesis.getVoices();
  if (!voices.length) {
    await new Promise((resolve) => {
      const timer = setTimeout(resolve, 400);
      window.speechSynthesis.onvoiceschanged = () => {
        voices = window.speechSynthesis.getVoices();
        clearTimeout(timer);
        resolve();
      };
    });
  }
  syncVoiceSelect();
}

function filteredVoices() {
  const withoutMicrosoft = voices.filter(
    (v) => !v.name.toLowerCase().startsWith("microsoft"),
  );
  const base = withoutMicrosoft.length ? withoutMicrosoft : voices;
  const googleOnly = base.filter((v) =>
    v.name.toLowerCase().includes("google"),
  );

  if (googleOnly.length) return googleOnly;

  const english = base.filter((v) => v.lang.startsWith("en"));
  if (english.length) return english;

  return base;
}

function syncVoiceSelect() {
  const select = document.getElementById("voiceSelect");
  if (!select) return;
  const list = filteredVoices();
  select.innerHTML = "";

  list
    .slice()
    .sort((a, b) => a.name.localeCompare(b.name))
    .forEach((voice) => {
      const option = document.createElement("option");
      option.value = voice.name;
      option.textContent = `${voice.name} (${voice.lang})`;
      select.appendChild(option);
    });

  const preferred = list.find((v) => v.name === state.voiceName) || list[0];
  if (preferred) {
    state.voiceName = preferred.name;
    select.value = preferred.name;
  }
}

function pickVoice() {
  const list = filteredVoices();
  if (!list.length) return null;
  if (!state.voiceName) return list[0];
  return list.find((v) => v.name === state.voiceName) || list[0];
}

function speakText(text) {
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = state.speechRate;
  utterance.pitch = 1.0;
  utterance.volume = 1.0;
  const voice = pickVoice();
  if (voice) utterance.voice = voice;
  window.speechSynthesis.speak(utterance);
}

// ============================================
// INJECTION HELPERS
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
    .catch(function () {
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
