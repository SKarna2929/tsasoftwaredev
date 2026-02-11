# Accessibility Helper – What It Is and What Everything Does

## Purpose of the Extension

**Accessibility Helper** is a Chrome extension that helps make the web easier to use for people with different needs. It lets you:

- **See** pages more clearly (bigger text, high contrast, dyslexia-friendly font, color filters, etc.).
- **Hear** content (text-to-speech in many languages, and live captions of your own speech).
- **Navigate** with clearer focus (screen flash and focus indicator when using the keyboard).

All changes are applied to the **current tab** (the webpage you’re viewing). The extension doesn’t change Chrome itself (like the address bar); it injects styles and scripts into the page. Settings are applied when you change them in the popup; **Reset All** removes them from the page.

---

## Header

- **Logo & title** – “Accessibility” with tagline “Designed for everyone.”
- **Theme toggle (sun/moon)** – Switches the **popup** between light and dark. Your choice is saved so the next time you open the popup it’s the same. This does **not** change the webpage.

---

## Vision (Display Controls)

These affect how the **current webpage** looks.

| Control | What it does |
|--------|----------------|
| **Text Size** | Makes text on the page larger or smaller (50%–200%). Only text is scaled so layout stays reasonable. |
| **High Contrast** | Turns the page into a high-contrast theme: black background, white text, yellow links, cyan focus outlines. Helps when you have trouble with low-contrast or small text. |
| **Dyslexia Font** | Switches page text to a dyslexia-friendly font (OpenDyslexic if available, otherwise a similar fallback). Can make reading easier for some people with dyslexia. |
| **Letter Spacing** | Adds extra space between letters (0–10 px). More spacing can help with readability. |
| **Line Height** | Changes the space between lines of text (1.0–3.0). Higher values can make blocks of text easier to follow. |
| **Reading Guide** | Shows a semi-transparent yellow band that follows your cursor vertically. Acts like a ruler to keep your place on one line. |
| **Highlight Links** | Makes all links very obvious: yellow background, black text, bold, underlined. Helps when links are hard to see. |
| **Big Cursor** | Makes the mouse cursor much larger (about 32px) with a white outline so it’s easier to see. |
| **Reset All** | Removes **all** Vision (and other) changes from the current page and resets the popup’s Vision and Speech settings to defaults. |

---

## Color Blindness

These options simulate or help with color vision differences. They change how **colors look on the whole page** using CSS filters.

| Option | What it does |
|--------|----------------|
| **None** | No color filter. Normal colors. |
| **Protanopia** | Simulates red–green color blindness (red cones missing). Reds and greens look different so you can see how the page might look to someone with this type. |
| **Deuteranopia** | Another form of red–green color blindness (green cones missing). Different simulation. |
| **Tritanopia** | Simulates blue–yellow color blindness. Blues and yellows are shifted. |

Use **None** to turn the filter off.

---

## Text to Speech

This section is for **hearing** text: you type or paste text (or use “Read Selection”), and the extension speaks it.

| Control | What it does |
|--------|----------------|
| **Text area** | Type or paste any text. Click **Play** to hear it read aloud. |
| **Speak in language** | Language the voice will use (e.g. English US, Spanish, French). If you pick a non-English language, the extension can **translate** the text to that language first, then speak it so you hear it in the language you chose. |
| **Voice** | Dropdown of system voices (different accents and tones). “Default voice” uses the browser’s default. |
| **Speed** | How fast the voice speaks (0.5x–2.0x). |
| **Play (▶)** | Reads the text in the box aloud using the chosen language and voice. |
| **Stop (■)** | Stops the current speech. |
| **Read Selection** | Reads the text you **selected on the webpage** (not the text in the box). If the selected text is in another language and you chose a different “Speak in language,” it can translate and then speak in that language. |

---

## Hearing (Live Captions & Visual Alerts)

### Live Captions

- **Purpose:** Show what you’re **saying** as text (speech-to-text) so you can see your words on screen—useful for deaf/hard-of-hearing users or to confirm what was said.
- **Mic (Start):** Starts listening on the **current tab**. You may need to allow the microphone when Chrome asks. Words are sent to the popup and shown in “Your words will appear here…”
- **Stop:** Stops listening.
- **Clear (trash):** Clears the caption text in the popup.
- **“Words not showing? Open Live Captions in a new tab”** – If the popup doesn’t show your words, click this. It opens a **separate tab** that does its own listening and always shows the text there. Use that tab when the popup captions don’t work.

### Visual Alerts (for hearing / attention)

These give **visual** feedback when something “happens” on the page (e.g. focus moving). Helpful if you rely on vision instead of sound.

| Control | What it does |
|--------|----------------|
| **Screen Flash** | When **on**, the **page briefly dims** every time you move focus (e.g. press **Tab**). So when you Tab to the next link or button, you get a quick flash so you know focus moved. |
| **Focus Indicator** | When **on**, the element that currently has **keyboard focus** (link, button, input) gets a **thick yellow ring** around it. So when you Tab through the page, you can clearly see what’s focused. |

**How to see them:** Turn the toggle **on**, then click on the webpage and press **Tab** a few times. You should see the flash and/or the yellow ring.

---

## Quick Info

A short reference for common **keyboard** actions:

- **Tab** – Move focus to the next focusable element (links, buttons, inputs).
- **Enter** – Activate the focused button or link.
- **Esc** – Close dialogs or cancel.
- **Ctrl + / Ctrl -** – Browser zoom (built into Chrome).

This is informational only; the extension doesn’t change how these keys work.

---

## Technical Summary

- **Manifest:** Chrome Extension Manifest V3; needs `activeTab`, `scripting`, `storage`, `tabs`, and host permission for the pages you want to change.
- **How it works:** The popup uses `chrome.scripting.executeScript` to inject CSS (and a small amount of JS for the reading guide and captions) into the **active tab**. So only the **current** tab is modified.
- **Persistence:** Theme (light/dark) and TTS language/voice are stored (e.g. in `localStorage` or Chrome storage). Visual options (Screen Flash, Focus Indicator, Vision settings) are **not** saved across sessions; turn them on again after reopening the popup if you want them.
- **Reset:** “Reset All” clears all injected styles and the reading guide from the current tab and resets the popup’s controls to defaults.

---

## File Overview

| File | Role |
|------|------|
| `manifest.json` | Defines the extension (name, permissions, popup, background script). |
| `popup.html` / `popup.css` / `popup.js` | The popup UI and all the controls; injects into the current tab. |
| `background.js` | Receives live-caption text from the tab and stores it so the popup can show it. |
| `content-captions.js` | Injected into the tab when you start Live Captions; handles microphone and speech recognition and sends text to the background. |
| `captions.html` | Standalone “Live Captions” page opened in a new tab when you use “Open Live Captions in a new tab” so captions always show there if the popup doesn’t. |

---

**In one sentence:** Accessibility Helper is a Chrome extension that changes how the current webpage looks (vision, color, reading aids), speaks text in many languages (text-to-speech and read selection), shows your speech as live captions, and adds screen flash and focus indicator so keyboard use is easier to see.
