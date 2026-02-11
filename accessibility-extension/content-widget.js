// ============================================
// A.E.G.I.S. — Floating Widget Content Script
// Injects into every webpage via Shadow DOM
// ============================================

(function () {
  "use strict";
  if (document.getElementById("aegis-widget-root")) return;

  // ==========================================
  // 1. CREATE HOST + SHADOW DOM
  // ==========================================
  const host = document.createElement("div");
  host.id = "aegis-widget-root";
  document.body.appendChild(host);

  const shadow = host.attachShadow({ mode: "open" });

  // ==========================================
  // 2. SHADOW DOM CSS (fully scoped)
  // ==========================================
  // Load fonts via <link> (more reliable in Shadow DOM than @import)
  const fontLink = document.createElement("link");
  fontLink.rel = "stylesheet";
  fontLink.href =
    "https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700;800;900&family=Rajdhani:wght@300;400;500;600;700&family=Share+Tech+Mono&display=swap";
  shadow.appendChild(fontLink);

  const STYLE = `
:host {
  all: initial;
  display: block;
  --arc-200: #7fddff; --arc-300: #4dcfff; --arc-400: #1ac2ff;
  --arc-500: #00b4ff; --arc-600: #0099e6;
  --gold-400: #ffd700;
  --hud-red: #ff3333; --hud-red-glow: rgba(255,51,51,0.4);
  --hud-green: #00ff88; --hud-green-glow: rgba(0,255,136,0.35);
  --hud-orange: #ff9500;
  --text-primary: #c8e6ff; --text-secondary: #7ab8e0; --text-muted: #3d6b8a;
  --border: rgba(0,180,255,0.18); --border-hover: rgba(0,180,255,0.5);
  --glow-arc: rgba(0,180,255,0.5); --glow-arc-strong: rgba(0,180,255,0.8);
  --glow-gold: rgba(255,215,0,0.4);
  --bg-card: rgba(0,180,255,0.04); --bg-card-hover: rgba(0,180,255,0.08);
  --transition: 0.2s cubic-bezier(0.4,0,0.2,1);
  --transition-bounce: 0.35s cubic-bezier(0.34,1.56,0.64,1);
  --hud-clip: polygon(12px 0%,calc(100% - 12px) 0%,100% 12px,100% calc(100% - 12px),calc(100% - 12px) 100%,12px 100%,0% calc(100% - 12px),0% 12px);
}

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

/* === FAB BUTTON === */
.aegis-fab {
  width: 56px; height: 56px; border-radius: 50%;
  border: 2px solid var(--arc-500); background: radial-gradient(circle, rgba(0,180,255,0.3) 0%, rgba(0,30,60,0.95) 70%);
  cursor: pointer; position: relative;
  box-shadow: 0 0 20px var(--glow-arc), 0 4px 20px rgba(0,0,0,0.5);
  animation: fabPulse 3s ease-in-out infinite;
  display: flex; align-items: center; justify-content: center;
  transition: all 0.3s ease; z-index: 10;
}
.aegis-fab:hover {
  transform: scale(1.1);
  box-shadow: 0 0 35px var(--glow-arc-strong), 0 4px 30px rgba(0,0,0,0.6);
}
.aegis-fab::before {
  content: ''; position: absolute; inset: 4px;
  border: 1px dashed rgba(0,180,255,0.4); border-radius: 50%;
  animation: fabSpin 10s linear infinite;
}
.aegis-fab::after {
  content: ''; width: 18px; height: 18px;
  background: radial-gradient(circle, var(--arc-300), var(--arc-500));
  border-radius: 50%; box-shadow: 0 0 14px var(--glow-arc-strong);
}
.aegis-fab.open { border-color: var(--hud-green); box-shadow: 0 0 25px var(--hud-green-glow), 0 4px 20px rgba(0,0,0,0.5); animation: none; }
.aegis-fab.open::after { background: radial-gradient(circle, #66ffbb, var(--hud-green)); box-shadow: 0 0 14px var(--hud-green-glow); }

@keyframes fabPulse {
  0%,100% { box-shadow: 0 0 20px var(--glow-arc), 0 4px 20px rgba(0,0,0,0.5); }
  50% { box-shadow: 0 0 35px var(--glow-arc-strong), 0 4px 25px rgba(0,0,0,0.5); }
}
@keyframes fabSpin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

/* === PANEL === */
.aegis-panel {
  position: absolute; bottom: 66px; right: 0;
  width: 400px; max-height: 520px;
  background: linear-gradient(145deg, rgba(2,8,16,0.97), rgba(4,16,30,0.97));
  border: 1px solid var(--border);
  clip-path: var(--hud-clip);
  box-shadow: 0 0 40px rgba(0,180,255,0.15), 0 8px 40px rgba(0,0,0,0.6);
  backdrop-filter: blur(16px);
  overflow: hidden;
  transform: scale(0.9) translateY(10px); opacity: 0;
  pointer-events: none;
  transition: transform 0.35s cubic-bezier(0.34,1.56,0.64,1), opacity 0.25s ease;
  display: flex; flex-direction: column;
}
.aegis-panel.open {
  transform: scale(1) translateY(0); opacity: 1;
  pointer-events: all;
}

/* Scanline overlay */
.aegis-panel::before {
  content: ''; position: absolute; top: 0; left: 0; right: 0; bottom: 0;
  background: repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,180,255,0.012) 2px, rgba(0,180,255,0.012) 4px);
  pointer-events: none; z-index: 100;
}

/* Corner accents */
.aegis-panel::after {
  content: ''; position: absolute; top: 4px; left: 4px;
  width: 30px; height: 30px;
  border-top: 2px solid var(--arc-500); border-left: 2px solid var(--arc-500);
  pointer-events: none; opacity: 0.4;
}

/* === PANEL HEADER === */
.panel-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 12px 16px; position: relative;
  border-bottom: 1px solid var(--border);
  background: rgba(0,180,255,0.03); flex-shrink: 0;
}
.panel-header::after {
  content: ''; position: absolute; bottom: -1px; left: 0; right: 0; height: 1px;
  background: linear-gradient(90deg, transparent, var(--arc-500) 30%, var(--arc-300) 50%, var(--arc-500) 70%, transparent);
  box-shadow: 0 0 6px var(--glow-arc);
}
.header-left { display: flex; align-items: center; gap: 10px; }
.mini-reactor {
  width: 30px; height: 30px; border: 2px solid var(--arc-500); border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  background: radial-gradient(circle, rgba(0,180,255,0.25), transparent 70%);
  box-shadow: 0 0 12px var(--glow-arc); position: relative;
}
.mini-reactor::before {
  content: ''; position: absolute; inset: 3px;
  border: 1px dashed rgba(0,180,255,0.3); border-radius: 50%;
  animation: fabSpin 12s linear infinite;
}
.mini-reactor::after {
  content: ''; width: 8px; height: 8px;
  background: radial-gradient(circle, var(--arc-300), var(--arc-500));
  border-radius: 50%; box-shadow: 0 0 8px var(--glow-arc-strong);
}
.header-title {
  font-family: 'Orbitron', sans-serif; font-size: 12px; font-weight: 800;
  letter-spacing: 2px; color: var(--arc-300); text-shadow: 0 0 8px var(--glow-arc);
}
.header-sub {
  font-family: 'Share Tech Mono', monospace; font-size: 8px;
  color: var(--text-muted); letter-spacing: 2px; margin-top: 1px;
}
.active-badge {
  display: inline-flex; align-items: center; gap: 4px;
  padding: 2px 8px; font-family: 'Share Tech Mono', monospace;
  font-size: 8px; letter-spacing: 1px;
  border: 1px solid var(--hud-green); color: var(--hud-green);
  background: rgba(0,255,136,0.05);
  clip-path: polygon(4px 0,calc(100% - 4px) 0,100% 4px,100% calc(100% - 4px),calc(100% - 4px) 100%,4px 100%,0 calc(100% - 4px),0 4px);
}
.active-badge .dot {
  width: 4px; height: 4px; border-radius: 50%;
  background: var(--hud-green); box-shadow: 0 0 4px var(--hud-green-glow);
  animation: blink 1.5s ease-in-out infinite;
}
@keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.3} }

/* === NAV TABS === */
.nav-tabs {
  display: flex; gap: 1px; padding: 4px 6px;
  background: rgba(0,180,255,0.02);
  border-bottom: 1px solid var(--border); flex-shrink: 0;
}
.nav-tab {
  flex: 1; display: flex; flex-direction: column; align-items: center; gap: 1px;
  padding: 6px 2px; border: none; background: transparent;
  cursor: pointer; color: var(--text-muted);
  font-family: 'Rajdhani', sans-serif; font-size: 8px; font-weight: 700;
  text-transform: uppercase; letter-spacing: 0.5px;
  transition: all var(--transition);
}
.nav-tab .tab-icon { font-size: 14px; transition: transform var(--transition-bounce); }
.nav-tab:hover { color: var(--arc-300); background: rgba(0,180,255,0.04); }
.nav-tab:hover .tab-icon { transform: scale(1.1); }
.nav-tab.active {
  color: var(--arc-200);
  background: linear-gradient(135deg, rgba(0,180,255,0.15), rgba(0,122,204,0.1));
  box-shadow: inset 0 0 10px rgba(0,180,255,0.06);
  border-bottom: 2px solid var(--arc-400);
}

/* === SCROLL BODY === */
.panel-body { flex: 1; overflow-y: auto; padding: 10px 12px 16px; }
.panel-body::-webkit-scrollbar { width: 3px; }
.panel-body::-webkit-scrollbar-track { background: transparent; }
.panel-body::-webkit-scrollbar-thumb { background: var(--arc-600); border-radius: 2px; }

/* === TAB PANELS === */
.tab-panel { display: none; animation: panelIn 0.3s ease; }
.tab-panel.active { display: block; }
@keyframes panelIn { 0%{opacity:0;transform:translateY(4px)} 100%{opacity:1;transform:translateY(0)} }

/* === FEATURE RIBBON === */
.feature-ribbon {
  display: flex; align-items: center; gap: 6px;
  padding: 5px 10px; margin-bottom: 10px;
  background: rgba(0,180,255,0.03);
  border: 1px solid var(--border);
  border-left: 2px solid var(--arc-500);
  font-family: 'Share Tech Mono', monospace;
  font-size: 9px; letter-spacing: 0.5px; color: var(--text-muted);
}
.feature-ribbon .ribbon-icon { font-size: 12px; }

/* === CARD === */
.card {
  background: var(--bg-card); border: 1px solid var(--border);
  clip-path: var(--hud-clip);
  padding: 12px; margin-bottom: 10px;
  transition: all var(--transition); position: relative;
}
.card::before {
  content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px;
  background: linear-gradient(90deg, var(--arc-500), transparent 60%);
  opacity: 0; transition: opacity var(--transition);
}
.card:hover { background: var(--bg-card-hover); border-color: var(--border-hover); }
.card:hover::before { opacity: 0.7; }

.card-header { display: flex; align-items: center; gap: 8px; margin-bottom: 10px; }
.card-icon {
  width: 26px; height: 26px; display: flex; align-items: center; justify-content: center;
  font-size: 12px; border: 1px solid var(--border); background: rgba(0,180,255,0.05);
  clip-path: polygon(4px 0,calc(100% - 4px) 0,100% 4px,100% calc(100% - 4px),calc(100% - 4px) 100%,4px 100%,0 calc(100% - 4px),0 4px);
}
.card-header h2 {
  font-family: 'Orbitron', sans-serif; font-size: 9px; font-weight: 700;
  letter-spacing: 1.5px; text-transform: uppercase; color: var(--arc-200);
}
.card-header .feature-count {
  margin-left: auto; font-family: 'Share Tech Mono', monospace;
  font-size: 8px; letter-spacing: 1px; color: var(--text-muted);
  padding: 1px 6px; border: 1px solid var(--border);
}
.card-content { display: flex; flex-direction: column; gap: 6px; }

/* === CONTROL ROW === */
.control-row { display: flex; align-items: center; justify-content: space-between; padding: 3px 0; }
.control-label {
  font-family: 'Rajdhani', sans-serif; font-size: 12px; font-weight: 600;
  color: var(--text-secondary); display: flex; align-items: center; gap: 5px;
  text-transform: uppercase; letter-spacing: 0.5px;
}
.control-label .label-icon { font-size: 12px; }

/* === SECTION LABEL === */
.section-label {
  font-family: 'Orbitron', sans-serif; font-size: 8px; font-weight: 700;
  color: var(--text-muted); text-transform: uppercase;
  letter-spacing: 2px; margin-bottom: 6px; display: flex; align-items: center; gap: 6px;
}
.section-label::before { content: '//'; color: var(--arc-500); font-family: 'Share Tech Mono', monospace; }

/* === SIZE CONTROL === */
.size-control {
  display: flex; align-items: center; gap: 1px;
  background: rgba(0,180,255,0.05); border: 1px solid var(--border); padding: 2px;
  clip-path: polygon(6px 0,calc(100% - 6px) 0,100% 6px,100% calc(100% - 6px),calc(100% - 6px) 100%,6px 100%,0 calc(100% - 6px),0 6px);
  transition: all var(--transition);
}
.size-control:hover { border-color: var(--arc-400); }
.size-btn {
  width: 24px; height: 24px; border: none; background: transparent;
  color: var(--arc-400); font-size: 14px; font-weight: 700; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  font-family: 'Orbitron', sans-serif; transition: all var(--transition);
}
.size-btn:hover { color: var(--arc-200); text-shadow: 0 0 6px var(--glow-arc); background: rgba(0,180,255,0.08); }
.size-btn:active { transform: scale(0.85); }
.size-value {
  min-width: 42px; text-align: center; font-family: 'Orbitron', sans-serif;
  font-size: 10px; font-weight: 700; color: var(--arc-300);
  text-shadow: 0 0 5px var(--glow-arc);
}

/* === TOGGLE === */
.toggle-btn { background: none; border: none; cursor: pointer; padding: 0; }
.toggle-track {
  display: block; width: 38px; height: 19px;
  background: rgba(0,180,255,0.08); border: 1px solid var(--border);
  position: relative; transition: all 0.3s ease;
  clip-path: polygon(3px 0,calc(100% - 3px) 0,100% 3px,100% calc(100% - 3px),calc(100% - 3px) 100%,3px 100%,0 calc(100% - 3px),0 3px);
}
.toggle-thumb {
  position: absolute; top: 2px; left: 2px; width: 13px; height: 13px;
  background: var(--text-muted);
  transition: all 0.3s cubic-bezier(0.34,1.56,0.64,1);
  clip-path: polygon(2px 0,calc(100% - 2px) 0,100% 2px,100% calc(100% - 2px),calc(100% - 2px) 100%,2px 100%,0 calc(100% - 2px),0 2px);
}
.toggle-btn.active .toggle-track {
  background: rgba(0,255,136,0.12); border-color: var(--hud-green);
  box-shadow: 0 0 10px var(--hud-green-glow);
}
.toggle-btn.active .toggle-thumb {
  left: 21px; background: var(--hud-green);
  box-shadow: 0 0 6px var(--hud-green-glow);
}

/* === FILTER GRID === */
.filter-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 5px; }
.filter-btn {
  display: flex; flex-direction: column; align-items: center; gap: 4px;
  padding: 8px 4px; background: rgba(0,180,255,0.03);
  border: 1px solid var(--border); clip-path: var(--hud-clip);
  color: var(--text-muted); font-family: 'Rajdhani', sans-serif;
  font-size: 9px; font-weight: 700; text-transform: uppercase;
  cursor: pointer; transition: all var(--transition);
}
.filter-btn:hover { border-color: var(--arc-400); background: rgba(0,180,255,0.06); }
.filter-btn.active { border-color: var(--gold-400); color: var(--gold-400); background: rgba(255,215,0,0.05); box-shadow: 0 0 12px var(--glow-gold); }
.filter-preview {
  width: 24px; height: 24px; border-radius: 50%;
  background: conic-gradient(from 0deg, #ef4444 0deg 60deg, #f97316 60deg 120deg, #eab308 120deg 180deg, #22c55e 180deg 240deg, #3b82f6 240deg 300deg, #8b5cf6 300deg 360deg);
  border: 1px solid var(--border); transition: transform var(--transition-bounce);
}
.filter-btn:hover .filter-preview { transform: scale(1.1) rotate(20deg); }

/* SVG filters for previews */
.filter-preview.protanopia { filter: url("#aegis-protanopia"); }
.filter-preview.deuteranopia { filter: url("#aegis-deuteranopia"); }
.filter-preview.tritanopia { filter: url("#aegis-tritanopia"); }

/* === TEXT INPUT === */
.text-input {
  width: 100%; min-height: 56px; padding: 8px 10px;
  background: rgba(0,180,255,0.04); border: 1px solid var(--border);
  clip-path: var(--hud-clip); color: var(--text-primary);
  font-family: 'Rajdhani', sans-serif; font-size: 12px; resize: none;
  transition: all var(--transition); line-height: 1.5;
}
.text-input:focus { outline: none; border-color: var(--arc-400); box-shadow: 0 0 12px rgba(0,180,255,0.1); }
.text-input::placeholder { color: var(--text-muted); }

/* === SELECT === */
.tts-language-select {
  width: 100%; padding: 6px 24px 6px 8px;
  background: rgba(0,180,255,0.05); border: 1px solid var(--border);
  color: var(--text-primary); font-family: 'Rajdhani', sans-serif;
  font-size: 11px; font-weight: 600; cursor: pointer;
  appearance: none; transition: all var(--transition);
  background-image: url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%2300b4ff' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E");
  background-repeat: no-repeat; background-position: right 6px center;
  clip-path: polygon(4px 0,calc(100% - 4px) 0,100% 4px,100% calc(100% - 4px),calc(100% - 4px) 100%,4px 100%,0 calc(100% - 4px),0 4px);
}
.tts-language-select option { background: #04101e; color: var(--text-primary); }
.tts-language-select:hover, .tts-language-select:focus { outline: none; border-color: var(--arc-400); }

/* === PLAY / STOP / MIC BUTTONS === */
.play-btn {
  width: 38px; height: 38px; border: none; border-radius: 50%;
  background: radial-gradient(circle, rgba(0,180,255,0.2), rgba(0,180,255,0.05) 70%);
  border: 2px solid var(--arc-500); color: var(--arc-200);
  cursor: pointer; display: flex; align-items: center; justify-content: center;
  transition: all var(--transition); box-shadow: 0 0 12px rgba(0,180,255,0.15);
  position: relative;
}
.play-btn::after {
  content: ''; position: absolute; inset: 2px;
  border: 1px dashed rgba(0,180,255,0.3); border-radius: 50%;
  animation: fabSpin 8s linear infinite;
}
.play-btn:hover { box-shadow: 0 0 20px var(--glow-arc); transform: scale(1.08); }
.play-btn:active { transform: scale(0.92); }

.stop-btn {
  width: 30px; height: 30px; border: none;
  background: rgba(255,51,51,0.05); border: 1px solid rgba(255,51,51,0.2);
  color: var(--hud-red); cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: all var(--transition);
  clip-path: polygon(4px 0,calc(100% - 4px) 0,100% 4px,100% calc(100% - 4px),calc(100% - 4px) 100%,4px 100%,0 calc(100% - 4px),0 4px);
}
.stop-btn:hover { background: rgba(255,51,51,0.12); border-color: rgba(255,51,51,0.5); }

.audio-controls { display: flex; align-items: center; gap: 6px; margin-top: 4px; }

/* === CAPTION CONTROLS === */
.caption-controls { display: flex; align-items: center; gap: 6px; }
.mic-btn {
  width: 38px; height: 38px; border: none; border-radius: 50%;
  background: radial-gradient(circle, rgba(0,255,136,0.08), transparent 70%);
  border: 2px solid var(--border); color: var(--text-primary);
  cursor: pointer; display: flex; align-items: center; justify-content: center;
  transition: all var(--transition);
}
.mic-btn:hover { border-color: var(--hud-green); box-shadow: 0 0 15px var(--hud-green-glow); }
.mic-btn.active {
  background: radial-gradient(circle, rgba(0,255,136,0.2), transparent 70%);
  border-color: var(--hud-green); color: var(--hud-green);
  box-shadow: 0 0 18px var(--hud-green-glow);
  animation: micPulse 2s ease-in-out infinite;
}
@keyframes micPulse {
  0%,100% { box-shadow: 0 0 18px var(--hud-green-glow); }
  50% { box-shadow: 0 0 30px var(--hud-green-glow); }
}
.control-btn {
  width: 30px; height: 30px; border: none;
  background: rgba(0,180,255,0.05); border: 1px solid var(--border);
  color: var(--text-muted); cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: all var(--transition);
  clip-path: polygon(4px 0,calc(100% - 4px) 0,100% 4px,100% calc(100% - 4px),calc(100% - 4px) 100%,4px 100%,0 calc(100% - 4px),0 4px);
}
.control-btn:hover { color: var(--arc-300); border-color: var(--arc-400); }
.control-btn.stop-cap:hover { color: var(--hud-red); border-color: rgba(255,51,51,0.4); }

.caption-status {
  display: flex; align-items: center; gap: 8px;
  padding: 6px 10px; background: rgba(0,180,255,0.03);
  border: 1px solid var(--border); clip-path: var(--hud-clip);
}
.status-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--text-muted); }
.caption-status.listening { border-color: rgba(0,255,136,0.3); background: rgba(0,255,136,0.03); }
.caption-status.listening .status-dot {
  background: var(--hud-green); box-shadow: 0 0 8px var(--hud-green-glow);
  animation: blink 1.2s ease-in-out infinite;
}
.status-text { font-family: 'Share Tech Mono', monospace; font-size: 10px; color: var(--text-muted); letter-spacing: 0.5px; }
.caption-status.listening .status-text { color: var(--hud-green); }

.caption-display {
  min-height: 50px; max-height: 80px; padding: 8px 10px;
  background: rgba(0,180,255,0.02); border: 1px solid var(--border);
  clip-path: var(--hud-clip); overflow-y: auto; font-size: 12px; line-height: 1.6;
  color: var(--text-primary);
}
.caption-display::-webkit-scrollbar { width: 2px; }
.caption-display::-webkit-scrollbar-thumb { background: var(--arc-600); }
.placeholder-text {
  font-family: 'Share Tech Mono', monospace; color: var(--text-muted);
  font-size: 10px; letter-spacing: 0.5px;
}
.hint-text { font-family: 'Share Tech Mono', monospace; color: var(--text-muted); font-size: 9px; }
.hint-text a { color: var(--arc-400); text-decoration: none; font-weight: 600; }
.hint-text a:hover { color: var(--arc-200); text-decoration: underline; }

/* === RESET === */
.reset-btn {
  display: flex; align-items: center; justify-content: center; gap: 6px;
  width: 100%; padding: 8px; background: rgba(255,51,51,0.05);
  border: 1px solid rgba(255,51,51,0.2); clip-path: var(--hud-clip);
  color: var(--hud-red); font-family: 'Orbitron', sans-serif;
  font-size: 9px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase;
  cursor: pointer; transition: all var(--transition); margin-top: 4px;
}
.reset-btn:hover {
  background: rgba(255,51,51,0.1); border-color: rgba(255,51,51,0.5);
  box-shadow: 0 0 12px var(--hud-red-glow); text-shadow: 0 0 6px var(--hud-red-glow);
}
.reset-icon { font-size: 12px; }

/* === SHORTCUTS === */
.shortcuts-list { display: flex; flex-direction: column; gap: 2px; }
.shortcut-item { display: flex; align-items: center; justify-content: space-between; padding: 4px 0; border-bottom: 1px solid rgba(0,180,255,0.06); }
.shortcut-item:last-child { border-bottom: none; }
.shortcut-key {
  display: inline-flex; padding: 2px 8px; background: rgba(0,180,255,0.06);
  border: 1px solid var(--border); font-family: 'Orbitron', sans-serif;
  font-size: 8px; font-weight: 700; color: var(--arc-300);
}
.shortcut-desc { font-family: 'Share Tech Mono', monospace; font-size: 9px; color: var(--text-muted); }

/* === TOAST === */
.aegis-toast {
  position: absolute; bottom: 70px; left: 50%; transform: translateX(-50%) translateY(10px);
  padding: 6px 16px; background: rgba(0,30,60,0.92); backdrop-filter: blur(10px);
  border: 1px solid var(--arc-500); clip-path: var(--hud-clip);
  font-family: 'Share Tech Mono', monospace; font-size: 10px; letter-spacing: 0.5px;
  color: var(--arc-200); box-shadow: 0 0 16px var(--glow-arc);
  opacity: 0; transition: all 0.35s cubic-bezier(0.34,1.56,0.64,1);
  display: flex; align-items: center; gap: 6px; white-space: nowrap; z-index: 200;
  pointer-events: none;
}
.aegis-toast.show { opacity: 1; transform: translateX(-50%) translateY(0); }
.toast-icon { font-size: 12px; }

/* === FOOTER === */
.panel-footer {
  text-align: center; padding: 8px 0 6px; flex-shrink: 0;
  border-top: 1px solid var(--border);
  font-family: 'Share Tech Mono', monospace; font-size: 8px;
  color: var(--text-muted); letter-spacing: 1.5px;
}
.panel-footer .brand {
  font-family: 'Orbitron', sans-serif; font-weight: 800;
  color: var(--arc-400); text-shadow: 0 0 6px var(--glow-arc);
}

/* === FOCUS === */
button:focus-visible { outline: 1px solid var(--arc-400); outline-offset: 2px; }

/* Drag handle */
.drag-handle {
  position: absolute; top: 0; left: 50%; transform: translateX(-50%);
  width: 40px; height: 4px; background: var(--border); border-radius: 2px;
  cursor: grab; opacity: 0; transition: opacity 0.2s;
}
.panel-header:hover .drag-handle { opacity: 1; }
`;

  // ==========================================
  // 3. BUILD THE HTML
  // ==========================================
  const HTML = `
<svg style="position:absolute;width:0;height:0;pointer-events:none">
  <defs>
    <filter id="aegis-protanopia"><feColorMatrix type="matrix" values="0.567,0.433,0,0,0 0.558,0.442,0,0,0 0,0.242,0.758,0,0 0,0,0,1,0"/></filter>
    <filter id="aegis-deuteranopia"><feColorMatrix type="matrix" values="0.625,0.375,0,0,0 0.7,0.3,0,0,0 0,0.3,0.7,0,0 0,0,0,1,0"/></filter>
    <filter id="aegis-tritanopia"><feColorMatrix type="matrix" values="0.95,0.05,0,0,0 0,0.433,0.567,0,0 0,0.475,0.525,0,0 0,0,0,1,0"/></filter>
  </defs>
</svg>

<!-- FAB -->
<button class="aegis-fab" id="aegisFab" title="A.E.G.I.S. Accessibility"></button>

<!-- PANEL -->
<div class="aegis-panel" id="aegisPanel">
  <div class="panel-header">
    <div class="header-left">
      <div class="mini-reactor"></div>
      <div>
        <div class="header-title">A.E.G.I.S.</div>
        <div class="header-sub">ACCESSIBILITY INTELLIGENCE</div>
      </div>
    </div>
    <div class="active-badge"><span class="dot"></span><span id="activeCount">0</span> ACTIVE</div>
  </div>

  <nav class="nav-tabs">
    <button class="nav-tab active" data-tab="vision"><span class="tab-icon">👁️</span>Vision</button>
    <button class="nav-tab" data-tab="color"><span class="tab-icon">🎨</span>Color</button>
    <button class="nav-tab" data-tab="speech"><span class="tab-icon">🔊</span>Speech</button>
    <button class="nav-tab" data-tab="hearing"><span class="tab-icon">🎙️</span>Hearing</button>
    <button class="nav-tab" data-tab="more"><span class="tab-icon">⚙️</span>More</button>
  </nav>

  <div class="panel-body">
    <!-- VISION -->
    <section class="tab-panel active" id="panel-vision">
      <div class="feature-ribbon"><span class="ribbon-icon">🛡️</span>Visual modules — real-time DOM injection</div>

      <div class="card">
        <div class="card-header"><div class="card-icon">🔤</div><h2>Text Engine</h2><span class="feature-count">3 CTRL</span></div>
        <div class="card-content">
          <div class="control-row"><span class="control-label"><span class="label-icon">📏</span> Font Size</span>
            <div class="size-control"><button class="size-btn" id="decreaseText">−</button><span class="size-value" id="textSizeValue">100%</span><button class="size-btn" id="increaseText">+</button></div></div>
          <div class="control-row"><span class="control-label"><span class="label-icon">↔️</span> Letter Spacing</span>
            <div class="size-control"><button class="size-btn" id="decreaseSpacing">−</button><span class="size-value" id="spacingValue">0px</span><button class="size-btn" id="increaseSpacing">+</button></div></div>
          <div class="control-row"><span class="control-label"><span class="label-icon">📐</span> Line Height</span>
            <div class="size-control"><button class="size-btn" id="decreaseLineHeight">−</button><span class="size-value" id="lineHeightValue">1.50</span><button class="size-btn" id="increaseLineHeight">+</button></div></div>
        </div>
      </div>

      <div class="card">
        <div class="card-header"><div class="card-icon">🧠</div><h2>Reading Assist</h2><span class="feature-count">3 CTRL</span></div>
        <div class="card-content">
          <div class="control-row"><span class="control-label"><span class="label-icon">🅰️</span> Dyslexia Font</span>
            <button class="toggle-btn" id="dyslexiaFont"><span class="toggle-track"><span class="toggle-thumb"></span></span></button></div>
          <div class="control-row"><span class="control-label"><span class="label-icon">📖</span> Reading Guide</span>
            <button class="toggle-btn" id="readingGuide"><span class="toggle-track"><span class="toggle-thumb"></span></span></button></div>
          <div class="control-row"><span class="control-label"><span class="label-icon">🔗</span> Highlight Links</span>
            <button class="toggle-btn" id="highlightLinks"><span class="toggle-track"><span class="toggle-thumb"></span></span></button></div>
        </div>
      </div>

      <div class="card">
        <div class="card-header"><div class="card-icon">💡</div><h2>Display Mods</h2><span class="feature-count">2 CTRL</span></div>
        <div class="card-content">
          <div class="control-row"><span class="control-label"><span class="label-icon">🌗</span> High Contrast</span>
            <button class="toggle-btn" id="highContrast"><span class="toggle-track"><span class="toggle-thumb"></span></span></button></div>
          <div class="control-row"><span class="control-label"><span class="label-icon">🖱️</span> Big Cursor</span>
            <button class="toggle-btn" id="bigCursor"><span class="toggle-track"><span class="toggle-thumb"></span></span></button></div>
        </div>
      </div>
    </section>

    <!-- COLOR -->
    <section class="tab-panel" id="panel-color">
      <div class="feature-ribbon"><span class="ribbon-icon">🎯</span>Color vision correction — SVG filter engine</div>
      <div class="card">
        <div class="card-header"><div class="card-icon">🌈</div><h2>Color V.I.S.O.R.</h2><span class="feature-count">3 MODES</span></div>
        <div class="card-content">
          <div class="section-label">Select Correction Filter</div>
          <div class="filter-grid">
            <button class="filter-btn" id="filterProtanopia" data-filter="protanopia"><span class="filter-preview protanopia"></span>Protanopia</button>
            <button class="filter-btn" id="filterDeuteranopia" data-filter="deuteranopia"><span class="filter-preview deuteranopia"></span>Deuteranopia</button>
            <button class="filter-btn" id="filterTritanopia" data-filter="tritanopia"><span class="filter-preview tritanopia"></span>Tritanopia</button>
            <button class="filter-btn" id="filterNone" data-filter="none"><span class="filter-preview"></span>No Filter</button>
          </div>
        </div>
      </div>
    </section>

    <!-- SPEECH -->
    <section class="tab-panel" id="panel-speech">
      <div class="feature-ribbon"><span class="ribbon-icon">🗣️</span>Text-to-Speech — 22 languages with translation</div>
      <div class="card">
        <div class="card-header"><div class="card-icon">📡</div><h2>Voice Synth</h2><span class="feature-count">22 LANG</span></div>
        <div class="card-content">
          <div class="section-label">Language</div>
          <select class="tts-language-select" id="ttsLanguage">
            <option value="en">English</option><option value="es">Español</option>
            <option value="fr">Français</option><option value="de">Deutsch</option>
            <option value="it">Italiano</option><option value="pt">Português</option>
            <option value="ru">Русский</option><option value="ja">日本語</option>
            <option value="ko">한국어</option><option value="zh">中文</option>
            <option value="ar">العربية</option><option value="hi">हिन्दी</option>
            <option value="bn">বাংলা</option><option value="nl">Nederlands</option>
            <option value="pl">Polski</option><option value="sv">Svenska</option>
            <option value="tr">Türkçe</option><option value="vi">Tiếng Việt</option>
            <option value="th">ไทย</option><option value="uk">Українська</option>
            <option value="el">Ελληνικά</option><option value="he">עברית</option>
          </select>
          <div class="section-label" style="margin-top:6px">Input</div>
          <textarea class="text-input" id="ttsText" placeholder="// Enter text for voice synthesis..."></textarea>
          <div class="section-label" style="margin-top:6px">Speed</div>
          <div class="control-row"><span class="control-label"><span class="label-icon">⚡</span> Rate</span>
            <div class="size-control"><button class="size-btn" id="decreaseRate">−</button><span class="size-value" id="rateValue">1.0x</span><button class="size-btn" id="increaseRate">+</button></div></div>
          <div class="audio-controls">
            <button class="play-btn" id="playTTS"><span style="font-size:16px">▶</span></button>
            <button class="stop-btn" id="stopTTS"><span style="font-size:12px">■</span></button>
          </div>
        </div>
      </div>
    </section>

    <!-- HEARING -->
    <section class="tab-panel" id="panel-hearing">
      <div class="feature-ribbon"><span class="ribbon-icon">📡</span>Hearing — real-time speech recognition &amp; alerts</div>
      <div class="card">
        <div class="card-header"><div class="card-icon">🎙️</div><h2>Live Transcribe</h2><span class="feature-count">REAL-TIME</span></div>
        <div class="card-content">
          <div class="caption-controls">
            <button class="mic-btn" id="startCaptions"><span style="font-size:16px">🎤</span></button>
            <button class="control-btn stop-cap" id="stopCaptions"><span style="font-size:12px">■</span></button>
            <button class="control-btn" id="clearCaptions"><span style="font-size:12px">🗑️</span></button>
          </div>
          <div class="caption-status" id="captionStatus"><span class="status-dot"></span><span class="status-text">STANDBY — Awaiting Activation</span></div>
          <div class="caption-display" id="captionDisplay"><span class="placeholder-text">> Transcript will render here...</span></div>
          <p class="hint-text" style="margin-top:4px">For persistent captions, <a id="openCaptionsTab" href="#">open dedicated HUD</a>.</p>
        </div>
      </div>
      <div class="card">
        <div class="card-header"><div class="card-icon">🔔</div><h2>Alert Systems</h2><span class="feature-count">2 CTRL</span></div>
        <div class="card-content">
          <div class="control-row"><span class="control-label"><span class="label-icon">💡</span> Visual Alerts</span>
            <button class="toggle-btn" id="visualAlerts"><span class="toggle-track"><span class="toggle-thumb"></span></span></button></div>
          <div class="control-row"><span class="control-label"><span class="label-icon">🎯</span> Focus Indicator</span>
            <button class="toggle-btn" id="focusIndicator"><span class="toggle-track"><span class="toggle-thumb"></span></span></button></div>
        </div>
      </div>
    </section>

    <!-- MORE -->
    <section class="tab-panel" id="panel-more">
      <div class="feature-ribbon"><span class="ribbon-icon">🔧</span>System config &amp; shortcuts</div>
      <div class="card">
        <div class="card-header"><div class="card-icon">⌨️</div><h2>Quick Commands</h2></div>
        <div class="card-content">
          <div class="shortcuts-list">
            <div class="shortcut-item"><span class="shortcut-key">ALT + H</span><span class="shortcut-desc">Toggle High Contrast</span></div>
            <div class="shortcut-item"><span class="shortcut-key">ALT + D</span><span class="shortcut-desc">Toggle Dyslexia Font</span></div>
            <div class="shortcut-item"><span class="shortcut-key">ALT + R</span><span class="shortcut-desc">Toggle Reading Guide</span></div>
            <div class="shortcut-item"><span class="shortcut-key">ALT + C</span><span class="shortcut-desc">Start / Stop Captions</span></div>
          </div>
        </div>
      </div>
      <div class="card">
        <div class="card-header"><div class="card-icon">📋</div><h2>About A.E.G.I.S.</h2></div>
        <div class="card-content">
          <p style="font-family:'Share Tech Mono',monospace;font-size:10px;color:var(--text-muted);line-height:1.6;letter-spacing:0.3px">
            A.E.G.I.S. — the <b style="color:var(--arc-300)">Adaptive Experience &amp; Guidance Intelligence System</b> —
            is an advanced accessibility toolkit breaking digital barriers.
            Empowering users with hearing &amp; visual disabilities through DOM injection,
            real-time speech synthesis, live transcription, and color correction.
          </p>
        </div>
      </div>
      <button class="reset-btn" id="resetAll"><span class="reset-icon">⟲</span>SYSTEM RESET — DEACTIVATE ALL</button>
    </section>
  </div>

  <div class="panel-footer">Powered by <span class="brand">A.E.G.I.S.</span></div>
</div>

<!-- Toast -->
<div class="aegis-toast" id="aegisToast"><span class="toast-icon">⚡</span><span id="toastMessage">Module activated</span></div>
`;

  // ==========================================
  // 4. INJECT INTO SHADOW DOM
  // ==========================================
  const styleEl = document.createElement("style");
  styleEl.textContent = STYLE;
  shadow.appendChild(styleEl);

  const wrapper = document.createElement("div");
  wrapper.innerHTML = HTML;
  shadow.appendChild(wrapper);

  // Helper to query inside shadow
  const $ = (sel) => shadow.querySelector(sel);
  const $$ = (sel) => shadow.querySelectorAll(sel);

  // ==========================================
  // 5. FAB TOGGLE
  // ==========================================
  const fab = $("#aegisFab");
  const panel = $("#aegisPanel");
  let panelOpen = false;

  fab.addEventListener("click", (e) => {
    e.stopPropagation();
    panelOpen = !panelOpen;
    panel.classList.toggle("open", panelOpen);
    fab.classList.toggle("open", panelOpen);
  });

  // Close panel when clicking outside
  document.addEventListener("click", (e) => {
    if (panelOpen && !host.contains(e.target)) {
      panelOpen = false;
      panel.classList.remove("open");
      fab.classList.remove("open");
    }
  });

  // Prevent clicks inside panel from closing it
  panel.addEventListener("click", (e) => e.stopPropagation());

  // ==========================================
  // 6. TAB NAVIGATION
  // ==========================================
  const navTabs = $$(".nav-tab");
  const tabPanels = $$(".tab-panel");

  navTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const target = tab.dataset.tab;
      navTabs.forEach((t) => t.classList.remove("active"));
      tabPanels.forEach((p) => p.classList.remove("active"));
      tab.classList.add("active");
      const p = $(`#panel-${target}`);
      if (p) p.classList.add("active");
    });
  });

  // ==========================================
  // 7. STATE
  // ==========================================
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
  };

  // ==========================================
  // 8. TOAST
  // ==========================================
  let toastTimeout;
  function showToast(message, icon) {
    const toast = $("#aegisToast");
    const msg = $("#toastMessage");
    const ic = toast.querySelector(".toast-icon");
    msg.textContent = message;
    if (icon) ic.textContent = icon;
    toast.classList.add("show");
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => toast.classList.remove("show"), 2400);
  }

  // ==========================================
  // 9. ACTIVE COUNTER
  // ==========================================
  function updateActiveCount() {
    let count = 0;
    Object.values(toggleStates).forEach((v) => {
      if (v) count++;
    });
    if (textSize !== 100) count++;
    if (letterSpacing !== 0) count++;
    if (lineHeight !== 1.5) count++;
    if (activeFilters.size > 0) count++;
    $("#activeCount").textContent = count;
  }

  // ==========================================
  // 10. DIRECT DOM INJECTION (no executeScript needed — we ARE in the page)
  // ==========================================

  function applyTextSize(size) {
    document.documentElement.style.fontSize = size + "%";
  }

  function applyLetterSpacing(px) {
    const els = document.querySelectorAll(
      "body *:not(#aegis-widget-root):not(#aegis-widget-root *)",
    );
    els.forEach((el) => {
      el.style.letterSpacing = px === 0 ? "" : px + "px";
    });
  }

  function applyLineHeight(val) {
    document
      .querySelectorAll(
        "p, li, span, div, td, th, a, label, h1, h2, h3, h4, h5, h6",
      )
      .forEach((el) => {
        if (!host.contains(el)) el.style.lineHeight = val;
      });
  }

  function applyHighContrast(enable) {
    if (enable) {
      document.documentElement.style.filter = "invert(1) hue-rotate(180deg)";
    } else {
      document.documentElement.style.filter = "";
    }
  }

  function applyDyslexiaFont(enable) {
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
        s.textContent = `*:not(#aegis-widget-root):not(#aegis-widget-root *) { font-family: 'OpenDyslexic', sans-serif !important; }`;
        document.head.appendChild(s);
      }
    } else {
      const s = document.getElementById(id);
      if (s) s.remove();
      const l = document.getElementById(id + "-link");
      if (l) l.remove();
    }
  }

  function applyReadingGuide(enable) {
    const id = "a11y-reading-guide";
    if (enable) {
      if (!document.getElementById(id)) {
        const guide = document.createElement("div");
        guide.id = id;
        guide.style.cssText =
          "position:fixed;left:0;right:0;height:40px;pointer-events:none;border-top:2px solid rgba(0,180,255,0.5);border-bottom:2px solid rgba(0,180,255,0.5);background:rgba(0,180,255,0.06);z-index:2147483646;transition:top 0.05s ease;";
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

  function applyHighlightLinks(enable) {
    const id = "a11y-highlight-links";
    if (enable) {
      if (!document.getElementById(id)) {
        const s = document.createElement("style");
        s.id = id;
        s.textContent = `a:not(#aegis-widget-root a) { outline: 2px solid #00b4ff !important; outline-offset: 2px !important; background-color: rgba(0,180,255,0.08) !important; text-decoration: underline !important; }
          a:not(#aegis-widget-root a):hover { background-color: rgba(0,180,255,0.15) !important; }`;
        document.head.appendChild(s);
      }
    } else {
      const s = document.getElementById(id);
      if (s) s.remove();
    }
  }

  function applyBigCursor(enable) {
    const id = "a11y-big-cursor";
    if (enable) {
      if (!document.getElementById(id)) {
        const s = document.createElement("style");
        s.id = id;
        s.textContent = `*:not(#aegis-widget-root):not(#aegis-widget-root *) { cursor: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48'%3E%3Cpath d='M4 4l16 40 6-16 16-6z' fill='%2300b4ff' stroke='%23fff' stroke-width='2'/%3E%3C/svg%3E") 4 4, auto !important; }`;
        document.head.appendChild(s);
      }
    } else {
      const s = document.getElementById(id);
      if (s) s.remove();
    }
  }

  function applyColorFilter(filterType) {
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
    svg.innerHTML =
      '<defs><filter id="a11y-cf"><feColorMatrix type="matrix" values="' +
      matrices[filterType] +
      '"/></filter></defs>';
    document.body.appendChild(svg);
    const s = document.createElement("style");
    s.id = id;
    s.textContent = "html { filter: url(#a11y-cf) !important; }";
    document.head.appendChild(s);
  }

  function applyVisualAlerts(enable) {
    const id = "a11y-visual-alerts";
    if (enable) {
      if (!document.getElementById(id)) {
        const s = document.createElement("style");
        s.id = id;
        s.textContent = `@keyframes a11yFlash{0%,100%{box-shadow:inset 0 0 0 0 transparent}50%{box-shadow:inset 0 0 60px rgba(0,180,255,0.3)}}:focus{animation:a11yFlash .5s ease}button:active,a:active{animation:a11yFlash .3s ease}`;
        document.head.appendChild(s);
      }
    } else {
      const s = document.getElementById(id);
      if (s) s.remove();
    }
  }

  function applyFocusIndicator(enable) {
    const id = "a11y-focus-indicator";
    if (enable) {
      if (!document.getElementById(id)) {
        const s = document.createElement("style");
        s.id = id;
        s.textContent = `*:focus{outline:3px solid #00b4ff !important;outline-offset:3px !important;box-shadow:0 0 12px rgba(0,180,255,0.4) !important}*:focus:not(:focus-visible){outline:none !important;box-shadow:none !important}*:focus-visible{outline:3px solid #00b4ff !important;outline-offset:3px !important;box-shadow:0 0 12px rgba(0,180,255,0.4) !important}`;
        document.head.appendChild(s);
      }
    } else {
      const s = document.getElementById(id);
      if (s) s.remove();
    }
  }

  // ==========================================
  // 11. EVENT HANDLERS
  // ==========================================

  // Text Size
  $("#increaseText").addEventListener("click", () => {
    textSize = Math.min(textSize + 10, 200);
    $("#textSizeValue").textContent = textSize + "%";
    applyTextSize(textSize);
    showToast("Font matrix: " + textSize + "%", "🔤");
    updateActiveCount();
  });
  $("#decreaseText").addEventListener("click", () => {
    textSize = Math.max(textSize - 10, 50);
    $("#textSizeValue").textContent = textSize + "%";
    applyTextSize(textSize);
    showToast("Font matrix: " + textSize + "%", "🔤");
    updateActiveCount();
  });

  // Letter Spacing
  $("#increaseSpacing").addEventListener("click", () => {
    letterSpacing = Math.min(letterSpacing + 1, 10);
    $("#spacingValue").textContent = letterSpacing + "px";
    applyLetterSpacing(letterSpacing);
    showToast("Spacing vector: " + letterSpacing + "px", "↔️");
    updateActiveCount();
  });
  $("#decreaseSpacing").addEventListener("click", () => {
    letterSpacing = Math.max(letterSpacing - 1, 0);
    $("#spacingValue").textContent = letterSpacing + "px";
    applyLetterSpacing(letterSpacing);
    showToast("Spacing vector: " + letterSpacing + "px", "↔️");
    updateActiveCount();
  });

  // Line Height
  $("#increaseLineHeight").addEventListener("click", () => {
    lineHeight = Math.min(lineHeight + 0.25, 3.0);
    $("#lineHeightValue").textContent = lineHeight.toFixed(2);
    applyLineHeight(lineHeight);
    showToast("Line spacing: " + lineHeight.toFixed(2), "📐");
    updateActiveCount();
  });
  $("#decreaseLineHeight").addEventListener("click", () => {
    lineHeight = Math.max(lineHeight - 0.25, 1.0);
    $("#lineHeightValue").textContent = lineHeight.toFixed(2);
    applyLineHeight(lineHeight);
    showToast("Line spacing: " + lineHeight.toFixed(2), "📐");
    updateActiveCount();
  });

  // Toggle controls
  function setupToggle(id, applyFn, onMsg, offMsg, icon) {
    const btn = $("#" + id);
    btn.addEventListener("click", () => {
      toggleStates[id] = !toggleStates[id];
      btn.classList.toggle("active", toggleStates[id]);
      applyFn(toggleStates[id]);
      showToast(toggleStates[id] ? onMsg : offMsg, icon);
      updateActiveCount();
    });
  }

  setupToggle(
    "highContrast",
    applyHighContrast,
    "High contrast: ENGAGED",
    "High contrast: DISENGAGED",
    "🌗",
  );
  setupToggle(
    "dyslexiaFont",
    applyDyslexiaFont,
    "Dyslexia font: LOADED",
    "Dyslexia font: REMOVED",
    "🅰️",
  );
  setupToggle(
    "readingGuide",
    applyReadingGuide,
    "Reading guide: TRACKING",
    "Reading guide: OFFLINE",
    "📖",
  );
  setupToggle(
    "highlightLinks",
    applyHighlightLinks,
    "Link scanner: ACTIVE",
    "Link scanner: OFFLINE",
    "🔗",
  );
  setupToggle(
    "bigCursor",
    applyBigCursor,
    "Cursor enhancer: DEPLOYED",
    "Cursor enhancer: RETRACTED",
    "🖱️",
  );
  setupToggle(
    "visualAlerts",
    applyVisualAlerts,
    "Visual alerts: ARMED",
    "Visual alerts: DISARMED",
    "💡",
  );
  setupToggle(
    "focusIndicator",
    applyFocusIndicator,
    "Focus beacon: LOCKED",
    "Focus beacon: UNLOCKED",
    "🎯",
  );

  // Color Filters
  $$(".filter-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const filter = btn.dataset.filter;
      $$(".filter-btn").forEach((b) => b.classList.remove("active"));
      if (filter === "none") {
        activeFilters.clear();
        applyColorFilter("none");
        showToast("Color filters: CLEARED", "🌈");
      } else {
        btn.classList.add("active");
        activeFilters.clear();
        activeFilters.add(filter);
        applyColorFilter(filter);
        const names = {
          protanopia: "Protanopia correction",
          deuteranopia: "Deuteranopia correction",
          tritanopia: "Tritanopia correction",
        };
        showToast(names[filter] + ": ONLINE", "🎨");
      }
      updateActiveCount();
    });
  });

  // ==========================================
  // 12. TEXT-TO-SPEECH
  // ==========================================
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
        "https://api.mymemory.translated.net/get?q=" +
          encodeURIComponent(text) +
          "&langpair=en|" +
          targetLang,
      );
      const data = await res.json();
      if (data.responseData && data.responseData.translatedText)
        return data.responseData.translatedText;
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

  $("#playTTS").addEventListener("click", async () => {
    const text = $("#ttsText").value.trim();
    if (!text) {
      showToast("Input stream empty — enter text", "⚠️");
      return;
    }
    speechSynthesis.cancel();
    const lang = $("#ttsLanguage").value;
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

  $("#stopTTS").addEventListener("click", () => {
    speechSynthesis.cancel();
    showToast("Voice synth: TERMINATED", "⏹️");
  });

  $("#increaseRate").addEventListener("click", () => {
    speechRate = Math.min(speechRate + 0.25, 3.0);
    $("#rateValue").textContent = speechRate.toFixed(1) + "x";
    showToast("Synth rate: " + speechRate.toFixed(1) + "x", "⚡");
  });
  $("#decreaseRate").addEventListener("click", () => {
    speechRate = Math.max(speechRate - 0.25, 0.25);
    $("#rateValue").textContent = speechRate.toFixed(1) + "x";
    showToast("Synth rate: " + speechRate.toFixed(1) + "x", "⚡");
  });

  if (speechSynthesis.onvoiceschanged !== undefined) {
    speechSynthesis.onvoiceschanged = () => speechSynthesis.getVoices();
  }

  // ==========================================
  // 13. LIVE CAPTIONS (SpeechRecognition directly in page)
  // ==========================================
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;
  let recognition = null;
  let captionActive = false;
  let fullCaptionText = "";

  function updateCaptionDisplay(text, interim) {
    const display = $("#captionDisplay");
    if (!text && !interim) {
      display.innerHTML =
        '<span class="placeholder-text">> Transcript will render here...</span>';
      return;
    }
    let html = '<span style="color:var(--text-primary)">' + text + "</span>";
    if (interim)
      html += '<span style="color:var(--text-muted)">' + interim + "</span>";
    display.innerHTML = html;
    display.scrollTop = display.scrollHeight;
  }

  function startCaptionRecognition() {
    if (!SpeechRecognition) {
      showToast("SpeechRecognition not supported", "❌");
      return;
    }
    if (recognition) {
      recognition.stop();
      recognition = null;
    }
    fullCaptionText = "";
    recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event) => {
      let interim = "";
      let finalText = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalText += event.results[i][0].transcript + " ";
        } else {
          interim += event.results[i][0].transcript;
        }
      }
      if (finalText) fullCaptionText += finalText;
      updateCaptionDisplay(fullCaptionText, interim);
      // Also store in chrome.storage for the captions tab
      try {
        chrome.storage.local.set({ a11yLiveCaptionText: fullCaptionText });
      } catch (e) {}
    };

    recognition.onerror = (event) => {
      if (event.error !== "no-speech")
        console.error("Recognition error:", event.error);
    };

    recognition.onend = () => {
      if (captionActive) {
        try {
          recognition.start();
        } catch (e) {
          captionActive = false;
          setCaptionUI(false);
        }
      }
    };

    recognition.start();
  }

  function setCaptionUI(active) {
    const micBtn = $("#startCaptions");
    const status = $("#captionStatus");
    if (active) {
      micBtn.classList.add("active");
      status.classList.add("listening");
      status.querySelector(".status-text").textContent =
        "LIVE — Transcription Active";
    } else {
      micBtn.classList.remove("active");
      status.classList.remove("listening");
      status.querySelector(".status-text").textContent =
        "STANDBY — Awaiting Activation";
    }
  }

  $("#startCaptions").addEventListener("click", () => {
    if (captionActive) return;
    captionActive = true;
    setCaptionUI(true);
    updateCaptionDisplay("", "");
    $("#captionDisplay").innerHTML =
      '<span class="placeholder-text">> Listening for audio input...</span>';
    try {
      chrome.storage.local.set({ a11yLiveCaptionText: "" });
    } catch (e) {}
    startCaptionRecognition();
    showToast("Live transcribe: ONLINE", "🎙️");
  });

  $("#stopCaptions").addEventListener("click", () => {
    captionActive = false;
    if (recognition) {
      recognition.stop();
      recognition = null;
    }
    setCaptionUI(false);
    showToast("Live transcribe: OFFLINE", "⏹️");
  });

  $("#clearCaptions").addEventListener("click", () => {
    fullCaptionText = "";
    updateCaptionDisplay("", "");
    try {
      chrome.storage.local.set({ a11yLiveCaptionText: "" });
    } catch (e) {}
    showToast("Transcript buffer: CLEARED", "🗑️");
  });

  // Open captions tab
  $("#openCaptionsTab").addEventListener("click", (e) => {
    e.preventDefault();
    chrome.runtime.sendMessage({ type: "aegisOpenCaptionsTab" });
  });

  // ==========================================
  // 14. RESET ALL
  // ==========================================
  $("#resetAll").addEventListener("click", () => {
    textSize = 100;
    letterSpacing = 0;
    lineHeight = 1.5;
    speechRate = 1.0;
    activeFilters.clear();
    Object.keys(toggleStates).forEach((k) => {
      toggleStates[k] = false;
    });

    // Reset UI
    $("#textSizeValue").textContent = "100%";
    $("#spacingValue").textContent = "0px";
    $("#lineHeightValue").textContent = "1.50";
    $("#rateValue").textContent = "1.0x";
    $$(".toggle-btn").forEach((b) => b.classList.remove("active"));
    $$(".filter-btn").forEach((b) => b.classList.remove("active"));

    // Captions
    captionActive = false;
    if (recognition) {
      recognition.stop();
      recognition = null;
    }
    setCaptionUI(false);
    fullCaptionText = "";
    updateCaptionDisplay("", "");
    speechSynthesis.cancel();

    // Remove all injected page styles
    document.documentElement.style.fontSize = "";
    document
      .querySelectorAll(
        "body *:not(#aegis-widget-root):not(#aegis-widget-root *)",
      )
      .forEach((el) => {
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

    updateActiveCount();
    showToast("SYSTEM RESET — All modules offline", "⟲");
  });

  // ==========================================
  // 15. KEYBOARD SHORTCUTS
  // ==========================================
  document.addEventListener("keydown", (e) => {
    if (!e.altKey) return;
    switch (e.key.toLowerCase()) {
      case "h":
        e.preventDefault();
        $("#highContrast").click();
        break;
      case "d":
        e.preventDefault();
        $("#dyslexiaFont").click();
        break;
      case "r":
        e.preventDefault();
        $("#readingGuide").click();
        break;
      case "c":
        e.preventDefault();
        if (captionActive) {
          $("#stopCaptions").click();
        } else {
          $("#startCaptions").click();
        }
        break;
    }
  });

  // Initialize
  updateActiveCount();
})();
