// ============================================
// A.E.G.I.S. — Adaptive Experience & Guidance
// Intelligence System — Core Runtime
// ============================================

document.addEventListener("DOMContentLoaded", () => {
  // === HUD CLOCK ===
  function updateHUDClock() {
    const el = document.getElementById("hudTime");
    if (el) {
      const now = new Date();
      el.textContent = now.toTimeString().split(" ")[0];
    }
  }
  updateHUDClock();
  setInterval(updateHUDClock, 1000);

  // === TAB NAVIGATION ===
  const tabs = document.querySelectorAll(".nav-tab");
  const panels = document.querySelectorAll(".tab-panel");

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const target = tab.dataset.tab;
      tabs.forEach((t) => {
        t.classList.remove("active");
        t.setAttribute("aria-selected", "false");
      });
      panels.forEach((p) => p.classList.remove("active"));
      tab.classList.add("active");
      tab.setAttribute("aria-selected", "true");
      const panel = document.getElementById(`panel-${target}`);
      if (panel) panel.classList.add("active");
    });
  });

  // === STATE ===
  let masterEnabled = true; // Master power switch
  let textSize = 100;
  let letterSpacing = 0;
  let lineHeight = 1.5;
  let speechRate = 1.0;
  let activeFilters = new Set();

  const toggleStates = {
    highContrast: false,
    dyslexiaFont: false,
    readingGuide: false,
    highlightLinks: false,
    bigCursor: false,
    visualAlerts: false,
    focusIndicator: false,
    selectionReader: false,
  };

  // === TOAST SYSTEM ===
  let toastTimeout;
  function showToast(message, icon = "⚡") {
    const toast = document.getElementById("toast");
    const msg = document.getElementById("toastMessage");
    const ic = toast.querySelector(".toast-icon");
    msg.textContent = message;
    ic.textContent = icon;
    toast.classList.add("show");
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => toast.classList.remove("show"), 2600);
  }

  // === MASTER SWITCH CONTROL ===
  function setMasterState(enabled) {
    masterEnabled = enabled;
    const panels = document.querySelectorAll(
      ".tab-panel, .nav-tabs, .stat-bar",
    );
    const masterSwitch = document.getElementById("masterSwitch");
    document.body.classList.toggle("power-off", !enabled);

    if (enabled) {
      panels.forEach((el) => {
        el.style.filter = "";
        el.style.pointerEvents = "";
        el.style.opacity = "";
      });
    } else {
      panels.forEach((el) => {
        el.style.filter = "blur(4px)";
        el.style.pointerEvents = "none";
        el.style.opacity = "0.5";
      });

      // Halt all active effects on the page
      executeInTab(() => {
        document.documentElement.style.fontSize = "";
        document.documentElement.style.filter = "";
        document.querySelectorAll("*").forEach((el) => {
          el.style.letterSpacing = "";
          el.style.lineHeight = "";
          el.style.filter = "";
        });
        [
          "a11y-high-contrast",
          "a11y-dyslexia-font",
          "a11y-dyslexia-font-link",
          "a11y-reading-guide",
          "a11y-highlight-links",
          "a11y-big-cursor",
          "a11y-color-filter",
          "a11y-svg-filters",
          "a11y-visual-alerts",
          "a11y-focus-indicator",
        ].forEach((id) => {
          const el = document.getElementById(id);
          if (el) el.remove();
        });
      });
    }
  }

  // === ACTIVE COUNTER ===
  function updateActiveCount() {
    let count = 0;
    Object.values(toggleStates).forEach((v) => {
      if (v) count++;
    });
    if (textSize !== 100) count++;
    if (letterSpacing !== 0) count++;
    if (lineHeight !== 1.5) count++;
    if (activeFilters.size > 0) count++;
    document.getElementById("activeCount").textContent = count;
  }

  // === HELPER: EXECUTE IN TAB ===
  function executeInTab(func, args = []) {
    console.log("executeInTab called with", func.name, args);
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      console.log("Found tabs:", tabs);
      if (tabs[0]) {
        console.log("Executing script in tab", tabs[0].id);
        chrome.scripting.executeScript({
          target: { tabId: tabs[0].id },
          func: func,
          args: args,
        });
      }
    });
  }

  // ========== TRANSLATE PAGE (Google Translate) ==========
  var translateBtn = document.getElementById("translatePageBtn");
  if (translateBtn) {
    translateBtn.addEventListener("click", function () {
      var langSelect = document.getElementById("pageTranslateLang");
      var targetLang = langSelect ? langSelect.value : "en";
      chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        if (!tabs[0] || !tabs[0].url) return;
        var originalUrl = tabs[0].url;
        var translateUrl =
          "https://translate.google.com/translate?sl=auto&tl=" +
          encodeURIComponent(targetLang) +
          "&u=" +
          encodeURIComponent(originalUrl);
        chrome.tabs.create({ url: translateUrl });
      });
    });
  }

  // =======================================================
  // INJECTION FUNCTIONS (run inside the target page)
  // =======================================================

  function injectTextSize(size) {
    document.documentElement.style.fontSize = size + "%";
  }

  function injectLetterSpacing(px) {
    document.querySelectorAll("*").forEach((el) => {
      el.style.letterSpacing = px === 0 ? "" : px + "px";
    });
  }

  function injectLineHeight(val) {
    document
      .querySelectorAll(
        "p, li, span, div, td, th, a, label, h1, h2, h3, h4, h5, h6",
      )
      .forEach((el) => {
        el.style.lineHeight = val;
      });
  }

  function injectHighContrast(enable) {
    console.log("HIGH CONTRAST:", enable);
    if (enable) {
      document.documentElement.style.setProperty(
        "filter",
        "invert(1) hue-rotate(180deg)",
        "important",
      );
      console.log("Applied invert filter to html element");
    } else {
      document.documentElement.style.removeProperty("filter");
      console.log("Removed invert filter");
    }
  }

  function injectDyslexiaFont(enable) {
    const id = "a11y-dyslexia-font";
    if (enable) {
      if (!document.getElementById(id)) {
        const link = document.createElement("link");
        link.id = id + "-link";
        link.rel = "stylesheet";
        link.href =
          "https://fonts.googleapis.com/css2?family=OpenDyslexic&display=swap";
        document.head.appendChild(link);
        const s = document.createElement("style");
        s.id = id;
        s.textContent = `* { font-family: 'OpenDyslexic', sans-serif !important; }`;
        document.head.appendChild(s);
      }
    } else {
      const s = document.getElementById(id);
      if (s) s.remove();
      const l = document.getElementById(id + "-link");
      if (l) l.remove();
    }
  }

  function injectReadingGuide(enable) {
    const id = "a11y-reading-guide";
    if (enable) {
      if (!document.getElementById(id)) {
        const guide = document.createElement("div");
        guide.id = id;
        guide.style.cssText = `position:fixed;left:0;right:0;height:40px;pointer-events:none;
          border-top:2px solid rgba(0,180,255,0.5);border-bottom:2px solid rgba(0,180,255,0.5);
          background:rgba(0,180,255,0.06);z-index:99999;transition:top 0.05s ease;`;
        document.body.appendChild(guide);
        document.addEventListener("mousemove", function a11yGuideMove(e) {
          const g = document.getElementById(id);
          if (g) g.style.top = e.clientY - 20 + "px";
        });
      }
    } else {
      const g = document.getElementById(id);
      if (g) g.remove();
    }
  }

  function injectHighlightLinks(enable) {
    const id = "a11y-highlight-links";
    if (enable) {
      if (!document.getElementById(id)) {
        const s = document.createElement("style");
        s.id = id;
        s.textContent = `
          a { outline: 2px solid #00b4ff !important; outline-offset: 2px !important;
              background-color: rgba(0,180,255,0.08) !important;
              text-decoration: underline !important; }
          a:hover { background-color: rgba(0,180,255,0.15) !important; }
        `;
        document.head.appendChild(s);
      }
    } else {
      const s = document.getElementById(id);
      if (s) s.remove();
    }
  }

  function injectBigCursor(enable) {
    const id = "a11y-big-cursor";
    if (enable) {
      if (!document.getElementById(id)) {
        const s = document.createElement("style");
        s.id = id;
        s.textContent = `* { cursor: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48'%3E%3Cpath d='M4 4l16 40 6-16 16-6z' fill='%2300b4ff' stroke='%23fff' stroke-width='2'/%3E%3C/svg%3E") 4 4, auto !important; }`;
        document.head.appendChild(s);
      }
    } else {
      const s = document.getElementById(id);
      if (s) s.remove();
    }
  }

  function injectColorFilter(filterType) {
    const id = "a11y-color-filter";
    let existing = document.getElementById(id);
    if (existing) existing.remove();
    let existingSvg = document.getElementById("a11y-svg-filters");
    if (existingSvg) existingSvg.remove();

    if (filterType === "none") return;

    const matrices = {
      protanopia:
        "0.567,0.433,0,0,0 0.558,0.442,0,0,0 0,0.242,0.758,0,0 0,0,0,1,0",
      deuteranopia: "0.625,0.375,0,0,0 0.7,0.3,0,0,0 0,0.3,0.7,0,0 0,0,0,1,0",
      tritanopia:
        "0.95,0.05,0,0,0 0,0.433,0.567,0,0 0,0.475,0.525,0,0 0,0,0,1,0",
    };

    if (!matrices[filterType]) return;

    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.id = "a11y-svg-filters";
    svg.setAttribute("style", "position:absolute;width:0;height:0");
    svg.innerHTML = `<defs><filter id="a11y-cf"><feColorMatrix type="matrix" values="${matrices[filterType]}"/></filter></defs>`;
    document.body.appendChild(svg);

    const s = document.createElement("style");
    s.id = id;
    s.textContent = `html { filter: url(#a11y-cf) !important; }`;
    document.head.appendChild(s);
  }

  function injectVisualAlerts(enable) {
    const id = "a11y-visual-alerts";
    if (enable) {
      if (!document.getElementById(id)) {
        const s = document.createElement("style");
        s.id = id;
        s.textContent = `
          @keyframes a11yFlash { 0%,100% { box-shadow: inset 0 0 0 0 transparent; } 50% { box-shadow: inset 0 0 60px rgba(0,180,255,0.3); } }
          :focus { animation: a11yFlash 0.5s ease; }
          button:active, a:active { animation: a11yFlash 0.3s ease; }
        `;
        document.head.appendChild(s);
      }
    } else {
      const s = document.getElementById(id);
      if (s) s.remove();
    }
  }

  function injectFocusIndicator(enable) {
    const id = "a11y-focus-indicator";
    if (enable) {
      if (!document.getElementById(id)) {
        const s = document.createElement("style");
        s.id = id;
        s.textContent = `
          *:focus { outline: 3px solid #00b4ff !important; outline-offset: 3px !important;
                    box-shadow: 0 0 12px rgba(0,180,255,0.4) !important; }
          *:focus:not(:focus-visible) { outline: none !important; box-shadow: none !important; }
          *:focus-visible { outline: 3px solid #00b4ff !important; outline-offset: 3px !important;
                            box-shadow: 0 0 12px rgba(0,180,255,0.4) !important; }
        `;
        document.head.appendChild(s);
      }
    } else {
      const s = document.getElementById(id);
      if (s) s.remove();
    }
  }

  function injectSelectionReader(enable, langCode, langMap) {
    const id = "a11y-selection-reader";

    if (enable) {
      window.aegisSelectionLang = langCode || "en";
      window.aegisSelectionLangMap = langMap || {};
      if (window.aegisSelectionHandler) return; // Already enabled

      window.aegisSelectionHandler = async function () {
        const selectedText = window.getSelection().toString().trim();
        if (selectedText.length > 0 && selectedText.length < 500) {
          try {
            // Translate if needed
            const lang = window.aegisSelectionLang || "en";
            let textToSpeak = selectedText;

            if (lang !== "en") {
              const response = await fetch(
                `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${lang}&dt=t&q=${encodeURIComponent(selectedText)}`,
              );
              const data = await response.json();
              if (data && data[0] && data[0][0] && data[0][0][0]) {
                textToSpeak = data[0][0][0];
              }
            }

            // Speak it
            const utter = new SpeechSynthesisUtterance(textToSpeak);
            const map = window.aegisSelectionLangMap || {};
            utter.lang = map[lang] || "en-US";
            utter.rate = 1.0;

            const voices = speechSynthesis.getVoices();
            const voice =
              voices.find((v) => v.lang === utter.lang) ||
              voices.find((v) => v.lang.startsWith(lang));
            if (voice) utter.voice = voice;

            speechSynthesis.cancel();
            speechSynthesis.speak(utter);
          } catch (e) {
            console.error("Selection reader error:", e);
          }
        }
      };

      document.addEventListener("mouseup", window.aegisSelectionHandler);
      document.addEventListener("touchend", window.aegisSelectionHandler);
    } else {
      if (window.aegisSelectionHandler) {
        document.removeEventListener("mouseup", window.aegisSelectionHandler);
        document.removeEventListener("touchend", window.aegisSelectionHandler);
        delete window.aegisSelectionHandler;
        delete window.aegisSelectionLang;
        delete window.aegisSelectionLangMap;
      }
      speechSynthesis.cancel();
    }
  }

  // =======================================================
  // EVENT HANDLERS
  // =======================================================

  // Text Size
  document.getElementById("increaseText").addEventListener("click", () => {
    textSize = Math.min(textSize + 10, 200);
    document.getElementById("textSizeValue").textContent = textSize + "%";
    executeInTab(injectTextSize, [textSize]);
    showToast(`Font matrix: ${textSize}%`, "🔤");
    updateActiveCount();
  });

  document.getElementById("decreaseText").addEventListener("click", () => {
    textSize = Math.max(textSize - 10, 50);
    document.getElementById("textSizeValue").textContent = textSize + "%";
    executeInTab(injectTextSize, [textSize]);
    showToast(`Font matrix: ${textSize}%`, "🔤");
    updateActiveCount();
  });

  // Letter Spacing
  document.getElementById("increaseSpacing").addEventListener("click", () => {
    letterSpacing = Math.min(letterSpacing + 1, 10);
    document.getElementById("spacingValue").textContent = letterSpacing + "px";
    executeInTab(injectLetterSpacing, [letterSpacing]);
    showToast(`Spacing vector: ${letterSpacing}px`, "↔️");
    updateActiveCount();
  });

  document.getElementById("decreaseSpacing").addEventListener("click", () => {
    letterSpacing = Math.max(letterSpacing - 1, 0);
    document.getElementById("spacingValue").textContent = letterSpacing + "px";
    executeInTab(injectLetterSpacing, [letterSpacing]);
    showToast(`Spacing vector: ${letterSpacing}px`, "↔️");
    updateActiveCount();
  });

  // Line Height
  document
    .getElementById("increaseLineHeight")
    .addEventListener("click", () => {
      lineHeight = Math.min(lineHeight + 0.25, 3.0);
      document.getElementById("lineHeightValue").textContent =
        lineHeight.toFixed(2);
      executeInTab(injectLineHeight, [lineHeight]);
      showToast(`Line spacing: ${lineHeight.toFixed(2)}`, "📐");
      updateActiveCount();
    });

  document
    .getElementById("decreaseLineHeight")
    .addEventListener("click", () => {
      lineHeight = Math.max(lineHeight - 0.25, 1.0);
      document.getElementById("lineHeightValue").textContent =
        lineHeight.toFixed(2);
      executeInTab(injectLineHeight, [lineHeight]);
      showToast(`Line spacing: ${lineHeight.toFixed(2)}`, "📐");
      updateActiveCount();
    });

  // Toggle controls
  function setupToggle(id, injectFn, onMsg, offMsg, icon) {
    const btn = document.getElementById(id);
    console.log("Setting up toggle for", id, "button:", btn);
    btn.addEventListener("click", () => {
      toggleStates[id] = !toggleStates[id];
      btn.classList.toggle("active", toggleStates[id]);
      console.log("Toggling", id, "to", toggleStates[id]);
      executeInTab(injectFn, [toggleStates[id]]);
      showToast(toggleStates[id] ? onMsg : offMsg, icon);
      updateActiveCount();
    });
  }

  setupToggle(
    "highContrast",
    injectHighContrast,
    "High contrast: ENGAGED",
    "High contrast: DISENGAGED",
    "🌗",
  );
  setupToggle(
    "dyslexiaFont",
    injectDyslexiaFont,
    "Dyslexia font: LOADED",
    "Dyslexia font: REMOVED",
    "🅰️",
  );
  setupToggle(
    "readingGuide",
    injectReadingGuide,
    "Reading guide: TRACKING",
    "Reading guide: OFFLINE",
    "📖",
  );
  setupToggle(
    "highlightLinks",
    injectHighlightLinks,
    "Link scanner: ACTIVE",
    "Link scanner: OFFLINE",
    "🔗",
  );
  setupToggle(
    "bigCursor",
    injectBigCursor,
    "Cursor enhancer: DEPLOYED",
    "Cursor enhancer: RETRACTED",
    "🖱️",
  );
  setupToggle(
    "visualAlerts",
    injectVisualAlerts,
    "Visual alerts: ARMED",
    "Visual alerts: DISARMED",
    "💡",
  );
  setupToggle(
    "focusIndicator",
    injectFocusIndicator,
    "Focus beacon: LOCKED",
    "Focus beacon: UNLOCKED",
    "🎯",
  );

  // === MASTER SWITCH ===
  document.getElementById("masterSwitch").addEventListener("click", () => {
    masterEnabled = !masterEnabled;
    const btn = document.getElementById("masterSwitch");
    btn.classList.toggle("active", masterEnabled);
    document.body.classList.toggle("power-off", !masterEnabled);

    const panels = document.querySelectorAll(
      ".tab-panel, .nav-tabs, .stat-bar",
    );

    if (masterEnabled) {
      panels.forEach((el) => {
        el.style.filter = "";
        el.style.pointerEvents = "";
        el.style.opacity = "";
      });
      showToast("SYSTEM POWER: ONLINE", "⚡");
    } else {
      panels.forEach((el) => {
        el.style.filter = "blur(4px)";
        el.style.pointerEvents = "none";
        el.style.opacity = "0.5";
      });

      // Halt all active effects on the page
      executeInTab(() => {
        document.documentElement.style.fontSize = "";
        document.documentElement.style.filter = "";
        document.querySelectorAll("*").forEach((el) => {
          el.style.letterSpacing = "";
          el.style.lineHeight = "";
          el.style.filter = "";
        });
        [
          "a11y-high-contrast",
          "a11y-dyslexia-font",
          "a11y-dyslexia-font-link",
          "a11y-reading-guide",
          "a11y-highlight-links",
          "a11y-big-cursor",
          "a11y-color-filter",
          "a11y-svg-filters",
          "a11y-visual-alerts",
          "a11y-focus-indicator",
        ].forEach((id) => {
          const el = document.getElementById(id);
          if (el) el.remove();
        });
      });

      showToast("SYSTEM POWER: OFFLINE — All modules halted", "⏸️");
    }
  });

  // === SELECTION READER ===
  setupToggle(
    "selectionReader",
    (enable) => {
      const lang = document.getElementById("ttsLanguage").value;
      executeInTab(injectSelectionReader, [enable, lang, langMap]);
    },
    "Selection reader: ACTIVE — Highlight text to hear it",
    "Selection reader: OFFLINE",
    "✨",
  );

  // Update selection reader language when TTS language changes
  document.getElementById("ttsLanguage").addEventListener("change", () => {
    if (toggleStates.selectionReader) {
      const lang = document.getElementById("ttsLanguage").value;
      executeInTab(injectSelectionReader, [true, lang, langMap]);
    }
  });

  // Color Filters
  document.querySelectorAll(".filter-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const filter = btn.dataset.filter;
      document
        .querySelectorAll(".filter-btn")
        .forEach((b) => b.classList.remove("active"));

      if (filter === "none") {
        activeFilters.clear();
        executeInTab(injectColorFilter, ["none"]);
        showToast("Color filters: CLEARED", "🌈");
      } else {
        btn.classList.add("active");
        activeFilters.clear();
        activeFilters.add(filter);
        executeInTab(injectColorFilter, [filter]);
        const names = {
          protanopia: "Protanopia correction",
          deuteranopia: "Deuteranopia correction",
          tritanopia: "Tritanopia correction",
        };
        showToast(`${names[filter]}: ONLINE`, "🎨");
      }
      updateActiveCount();
    });
  });

  // =======================================================
  // TEXT-TO-SPEECH
  // =======================================================
  const langMap = {
    en: "en-US",
    es: "es-ES",
    fr: "fr-FR",
    de: "de-DE",
    it: "it-IT",
    pt: "pt-BR",
    ru: "ru-RU",
    ja: "ja-JP",
    ko: "ko-KR",
    zh: "zh-CN",
    ar: "ar-SA",
    hi: "hi-IN",
    bn: "bn-BD",
    nl: "nl-NL",
    pl: "pl-PL",
    sv: "sv-SE",
    tr: "tr-TR",
    vi: "vi-VN",
    th: "th-TH",
    uk: "uk-UA",
    el: "el-GR",
    he: "he-IL",
  };

  async function translateText(text, targetLang) {
    if (targetLang === "en") return text;
    try {
      const res = await fetch(
        `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|${targetLang}`,
      );
      const data = await res.json();
      if (data.responseData && data.responseData.translatedText) {
        return data.responseData.translatedText;
      }
    } catch (e) {
      console.warn("Translation error:", e);
    }
    return text;
  }

  function findVoice(langCode) {
    const voices = speechSynthesis.getVoices();
    let voice = voices.find((v) => v.lang === langCode);
    if (!voice)
      voice = voices.find((v) => v.lang.startsWith(langCode.split("-")[0]));
    return voice || null;
  }

  document.getElementById("playTTS").addEventListener("click", async () => {
    const text = document.getElementById("ttsText").value.trim();
    if (!text) {
      showToast("Input stream empty — enter text", "⚠️");
      return;
    }

    speechSynthesis.cancel();
    const lang = document.getElementById("ttsLanguage").value;
    showToast("Translating & synthesizing...", "📡");

    const translated = await translateText(text, lang);
    const utter = new SpeechSynthesisUtterance(translated);
    utter.rate = speechRate;
    utter.lang = langMap[lang] || "en-US";

    const voice = findVoice(utter.lang);
    if (voice) utter.voice = voice;

    utter.onstart = () => showToast("Voice synth: TRANSMITTING", "🔊");
    utter.onend = () => showToast("Transmission complete", "✅");
    utter.onerror = () => showToast("Synth error detected", "❌");

    speechSynthesis.speak(utter);
  });

  document.getElementById("stopTTS").addEventListener("click", () => {
    speechSynthesis.cancel();
    showToast("Voice synth: TERMINATED", "⏹️");
  });

  // Speech Rate
  document.getElementById("increaseRate").addEventListener("click", () => {
    speechRate = Math.min(speechRate + 0.25, 3.0);
    document.getElementById("rateValue").textContent =
      speechRate.toFixed(1) + "x";
    showToast(`Synth rate: ${speechRate.toFixed(1)}x`, "⚡");
  });

  document.getElementById("decreaseRate").addEventListener("click", () => {
    speechRate = Math.max(speechRate - 0.25, 0.25);
    document.getElementById("rateValue").textContent =
      speechRate.toFixed(1) + "x";
    showToast(`Synth rate: ${speechRate.toFixed(1)}x`, "⚡");
  });

  // Pre-load voices
  if (speechSynthesis.onvoiceschanged !== undefined) {
    speechSynthesis.onvoiceschanged = () => speechSynthesis.getVoices();
  }

  // =======================================================
  // LIVE CAPTIONS
  // =======================================================
  let captionInterval = null;
  let captionActive = false;

  function startCaptionPolling() {
    captionInterval = setInterval(() => {
      chrome.storage.local.get("a11yLiveCaptionText", (data) => {
        if (data.a11yLiveCaptionText) {
          const display = document.getElementById("captionDisplay");
          display.innerHTML = "";
          const span = document.createElement("span");
          span.textContent = data.a11yLiveCaptionText;
          span.style.color = "var(--text-primary)";
          display.appendChild(span);
          display.scrollTop = display.scrollHeight;
        }
      });
    }, 500);
  }

  document.getElementById("startCaptions").addEventListener("click", () => {
    if (captionActive) return;
    captionActive = true;
    const micBtn = document.getElementById("startCaptions");
    micBtn.classList.add("active");

    const status = document.getElementById("captionStatus");
    status.classList.add("listening");
    status.querySelector(".status-text").textContent =
      "LIVE — Transcription Active";

    document.getElementById("captionDisplay").innerHTML =
      '<span class="placeholder-text">> Listening for audio input...</span>';

    chrome.storage.local.set({ a11yLiveCaptionText: "" });

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.scripting.executeScript({
          target: { tabId: tabs[0].id },
          files: ["content-captions.js"],
        });
      }
    });

    startCaptionPolling();
    showToast("Live transcribe: ONLINE", "🎙️");
  });

  document.getElementById("stopCaptions").addEventListener("click", () => {
    captionActive = false;
    clearInterval(captionInterval);

    document.getElementById("startCaptions").classList.remove("active");
    const status = document.getElementById("captionStatus");
    status.classList.remove("listening");
    status.querySelector(".status-text").textContent =
      "STANDBY — Awaiting Activation";

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.scripting.executeScript({
          target: { tabId: tabs[0].id },
          func: () => {
            if (window._a11yCaptionRecognition) {
              window._a11yCaptionRecognition.stop();
              window._a11yCaptionRecognition = null;
            }
          },
        });
      }
    });

    showToast("Live transcribe: OFFLINE", "⏹️");
  });

  document.getElementById("clearCaptions").addEventListener("click", () => {
    document.getElementById("captionDisplay").innerHTML =
      '<span class="placeholder-text">> Transcript will render here...</span>';
    chrome.storage.local.set({ a11yLiveCaptionText: "" });
    showToast("Transcript buffer: CLEARED", "🗑️");
  });

  // Open captions tab
  document.getElementById("openCaptionsTab").addEventListener("click", (e) => {
    e.preventDefault();
    chrome.tabs.create({ url: chrome.runtime.getURL("captions.html") });
  });

  // =======================================================
  // RESET ALL
  // =======================================================
  document.getElementById("resetAll").addEventListener("click", () => {
    // Reset state
    textSize = 100;
    letterSpacing = 0;
    lineHeight = 1.5;
    speechRate = 1.0;
    activeFilters.clear();

    Object.keys(toggleStates).forEach((key) => {
      toggleStates[key] = false;
    });

    // Reset UI
    document.getElementById("textSizeValue").textContent = "100%";
    document.getElementById("spacingValue").textContent = "0px";
    document.getElementById("lineHeightValue").textContent = "1.5";
    document.getElementById("rateValue").textContent = "1.0x";
    document
      .querySelectorAll(".toggle-btn")
      .forEach((btn) => btn.classList.remove("active"));
    document
      .querySelectorAll(".filter-btn")
      .forEach((btn) => btn.classList.remove("active"));

    // Clear captions
    captionActive = false;
    clearInterval(captionInterval);
    document.getElementById("startCaptions").classList.remove("active");
    const capStatus = document.getElementById("captionStatus");
    capStatus.classList.remove("listening");
    capStatus.querySelector(".status-text").textContent =
      "STANDBY — Awaiting Activation";
    document.getElementById("captionDisplay").innerHTML =
      '<span class="placeholder-text">> Transcript will render here...</span>';

    // Stop TTS
    speechSynthesis.cancel();

    // Remove all injected
    executeInTab(() => {
      document.documentElement.style.fontSize = "";
      document.querySelectorAll("*").forEach((el) => {
        el.style.letterSpacing = "";
        el.style.lineHeight = "";
      });
      [
        "a11y-high-contrast",
        "a11y-dyslexia-font",
        "a11y-dyslexia-font-link",
        "a11y-reading-guide",
        "a11y-highlight-links",
        "a11y-big-cursor",
        "a11y-color-filter",
        "a11y-svg-filters",
        "a11y-visual-alerts",
        "a11y-focus-indicator",
      ].forEach((id) => {
        const el = document.getElementById(id);
        if (el) el.remove();
      });
    });

    updateActiveCount();
    showToast("SYSTEM RESET — All modules offline", "⟲");
  });

  // Initialize
  updateActiveCount();
});
