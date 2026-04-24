# VoiceType Pro

A real-time voice-to-text typing assistant desktop application, designed for accessibility. When active, any spoken words are automatically typed into whatever input field is focused on the screen.

## Features
- Global hotkey to toggle voice typing (`Ctrl+Shift+Space`)
- Auto-typing directly into the active window
- Always on top, translucent window
- Multi-language support

## Setup Instructions

### 1. Install Node.js Dependencies
```bash
npm install
```

### 2. Install Python Dependencies
Ensure you have Python 3.10+ installed.
```bash
pip install -r python/requirements.txt
```
*Note: PyAudio might require system-level dependencies. On macOS, run `brew install portaudio` before `pip install PyAudio`.*

### 3. Run Development Version
```bash
npm start
```

### 4. Build for Production
```bash
npm run build:all
```
